import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { ballotPicks, ballots, categories, members, nominees, settings } from "@/db/schema";
import type { Member, Nominee } from "@/db/schema";
import { tallyPick5, tallyRanked, type Pick5Tally, type RankedTally } from "./scoring";

export type CategoryKind = "ranked" | "pick5" | "ceremonial";

export type PublicNominee = {
  id: number;
  memberId: number | null;
  memberName: string | null;
  photoUrl: string | null;
  authorName: string | null;
  messageText: string | null;
  messageAt: string | null;
  rankPosition: number | null;
};

export type PublicCategory = {
  id: number;
  key: string;
  title: string;
  tagline: string | null;
  kind: CategoryKind;
  position: number;
  autoNominees: boolean;
  nominees: PublicNominee[];
};

export type EventSettings = {
  groupCode: string;
  votingOpen: boolean;
  revealActive: boolean;
};

export const VOTE_ORDER = ["balon", "puskas", "olivada", "mejor5"] as const;

export async function getSettings(): Promise<EventSettings> {
  const row = (await db().select().from(settings).where(eq(settings.id, 1)))[0];
  if (!row) {
    return { groupCode: "", votingOpen: false, revealActive: false };
  }
  return {
    groupCode: row.groupCode,
    votingOpen: row.votingOpen,
    revealActive: row.revealActive,
  };
}

export async function getMembers(): Promise<PublicMemberRow[]> {
  return db().select().from(members).orderBy(asc(members.position), asc(members.id));
}

export type PublicMemberRow = {
  id: number;
  name: string;
  photoUrl: string | null;
  position: number;
};

type CategoryRow = typeof categories.$inferSelect;

function toPublicNominee(nominee: Nominee, memberById: Map<number, Member>): PublicNominee {
  const member = nominee.memberId ? memberById.get(nominee.memberId) : undefined;
  return {
    id: nominee.id,
    memberId: nominee.memberId,
    memberName: member?.name ?? nominee.authorName ?? null,
    photoUrl: member?.photoUrl ?? null,
    authorName: nominee.authorName,
    messageText: nominee.messageText,
    messageAt: nominee.messageAt,
    rankPosition: nominee.rankPosition,
  };
}

function toPublicCategory(
  category: CategoryRow,
  categoryNominees: Nominee[],
  memberById: Map<number, Member>,
): PublicCategory {
  return {
    id: category.id,
    key: category.key,
    title: category.title,
    tagline: category.tagline,
    kind: category.kind as CategoryKind,
    position: category.position,
    autoNominees: category.autoNominees,
    nominees: categoryNominees
      .map((nominee) => toPublicNominee(nominee, memberById))
      .sort((a, b) => (a.rankPosition ?? Infinity) - (b.rankPosition ?? Infinity)),
  };
}

export async function getAllCategories(): Promise<PublicCategory[]> {
  const [categoryRows, nomineeRows, memberRows] = await Promise.all([
    db().select().from(categories).orderBy(asc(categories.position)),
    db().select().from(nominees).orderBy(asc(nominees.position)),
    db().select().from(members),
  ]);
  const memberById = new Map(memberRows.map((m) => [m.id, m]));
  return categoryRows.map((category) =>
    toPublicCategory(
      category,
      nomineeRows.filter((n) => n.categoryId === category.id),
      memberById,
    ),
  );
}

export async function getBallotData(voterId: number) {
  const [settings, allCategories, ballotRows] = await Promise.all([
    getSettings(),
    getAllCategories(),
    db()
      .select({ categoryId: ballots.categoryId })
      .from(ballots)
      .where(eq(ballots.voterId, voterId)),
  ]);
  const votedCategoryIds = new Set(ballotRows.map((row) => row.categoryId));
  const votable = VOTE_ORDER.map((key) => allCategories.find((c) => c.key === key))
    .filter((c): c is PublicCategory => Boolean(c))
    .filter((c) => c.kind === "ranked" || c.kind === "pick5");
  return {
    settings,
    categories: votable,
    votedKeys: votable
      .filter((c) => votedCategoryIds.has(c.id))
      .map((c) => c.key),
  };
}

export type RankedResult = RankedTally & {
  nominee: PublicNominee;
};

export type Pick5Result = Pick5Tally & {
  nominee: PublicNominee;
};

export type CeremonyCategory = {
  key: string;
  title: string;
  tagline: string | null;
  kind: CategoryKind;
  ballotsCount: number;
  nominees: PublicNominee[];
  podium: Array<
    RankedResult | Pick5Result | (PublicNominee & { rankPosition: number })
  >;
  tallies: Array<RankedResult | Pick5Result>;
};

export async function getCeremonyData(): Promise<{
  settings: EventSettings;
  categories: CeremonyCategory[];
  turnout: { totalMembers: number; votersPerCategory: Record<string, number> };
}> {
  const [settings, allCategories, memberRows, ballotRows, pickRows] = await Promise.all([
    getSettings(),
    getAllCategories(),
    db().select({ id: members.id }).from(members),
    db().select().from(ballots),
    db()
      .select({
        ballotId: ballotPicks.ballotId,
        nomineeId: ballotPicks.nomineeId,
        rank: ballotPicks.rank,
        categoryId: ballots.categoryId,
      })
      .from(ballotPicks)
      .innerJoin(ballots, eq(ballots.id, ballotPicks.ballotId)),
  ]);

  const ballotsByCategory = new Map<number, number>();
  for (const ballot of ballotRows) {
    ballotsByCategory.set(ballot.categoryId, (ballotsByCategory.get(ballot.categoryId) ?? 0) + 1);
  }

  const ceremonyCategories: CeremonyCategory[] = allCategories
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((category) => {
      const picks = pickRows.filter((pick) => pick.categoryId === category.id);
      const ballotsCount = ballotsByCategory.get(category.id) ?? 0;
      const nomineeById = new Map(category.nominees.map((n) => [n.id, n]));

      if (category.kind === "ranked") {
        const tallies = tallyRanked(
          picks
            .filter((pick) => pick.rank !== null)
            .map((pick) => ({ nomineeId: pick.nomineeId, rank: pick.rank as number })),
        ).map((tally) => ({ ...tally, nominee: nomineeById.get(tally.nomineeId)! }));
        const podiumKeys = new Set([1, 2, 3]);
        const podium = tallies.filter((tally) => podiumKeys.has(tally.position));
        return {
          key: category.key,
          title: category.title,
          tagline: category.tagline,
          kind: category.kind,
          ballotsCount,
          nominees: category.nominees,
          podium,
          tallies,
        };
      }

      if (category.kind === "pick5") {
        const tallies = tallyPick5(picks).map((tally) => ({
          ...tally,
          nominee: nomineeById.get(tally.nomineeId)!,
        }));
        const podium = tallies.filter((tally) => tally.inTeam);
        return {
          key: category.key,
          title: category.title,
          tagline: category.tagline,
          kind: category.kind,
          ballotsCount,
          nominees: category.nominees,
          podium,
          tallies,
        };
      }

      const podium = category.nominees
        .filter((nominee) => nominee.rankPosition !== null)
        .slice()
        .sort((a, b) => (a.rankPosition ?? 0) - (b.rankPosition ?? 0))
        .map((nominee) => ({ ...nominee, rankPosition: nominee.rankPosition as number }));
      return {
        key: category.key,
        title: category.title,
        tagline: category.tagline,
        kind: category.kind,
        ballotsCount,
        nominees: category.nominees,
        podium,
        tallies: [],
      };
    });

  const votersPerCategory: Record<string, number> = {};
  for (const category of ceremonyCategories) {
    votersPerCategory[category.key] = category.ballotsCount;
  }

  return {
    settings,
    categories: ceremonyCategories,
    turnout: { totalMembers: memberRows.length, votersPerCategory },
  };
}

export async function getVoterProgress(voterId: number): Promise<string[]> {
  const rows = await db()
    .select({ key: categories.key })
    .from(ballots)
    .innerJoin(categories, eq(categories.id, ballots.categoryId))
    .where(eq(ballots.voterId, voterId));
  return rows.map((row) => row.key);
}
