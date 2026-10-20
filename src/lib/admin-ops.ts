import { and, asc, eq, inArray, max } from "drizzle-orm";
import { db } from "@/db";
import { ballots, ballotPicks, categories, members, nominees, settings } from "@/db/schema";

export async function syncAutoNominees() {
  const [memberRows, autoCategories] = await Promise.all([
    db().select({ id: members.id }).from(members).orderBy(asc(members.position), asc(members.id)),
    db().select().from(categories).where(eq(categories.autoNominees, true)),
  ]);

  for (const category of autoCategories) {
    const existing = await db()
      .select()
      .from(nominees)
      .where(eq(nominees.categoryId, category.id));
    const existingMemberIds = new Set(
      existing.map((n) => n.memberId).filter((id): id is number => id !== null),
    );
    const missing = memberRows.filter((m) => !existingMemberIds.has(m.id));
    if (missing.length > 0) {
      await db().insert(nominees).values(
        missing.map((m, index) => ({
          categoryId: category.id,
          memberId: m.id,
          position: existing.length + index,
        })),
      );
    }
    const stale = existing
      .filter((n) => n.memberId !== null && !memberRows.some((m) => m.id === n.memberId))
      .map((n) => n.id);
    if (stale.length > 0) {
      await db().delete(nominees).where(inArray(nominees.id, stale));
    }
  }
}

export async function memberHasActivity(memberId: number): Promise<string | null> {
  const voted = (
    await db().select({ id: ballots.id }).from(ballots).where(eq(ballots.voterId, memberId)).limit(1)
  )[0];
  if (voted) return "Ya emitió votos. No se puede eliminar.";

  const memberNominees = await db()
    .select({ id: nominees.id })
    .from(nominees)
    .where(eq(nominees.memberId, memberId));
  const nomineeIds = memberNominees.map((n) => n.id);
  if (nomineeIds.length > 0) {
    const picked = (
      await db()
        .select({ id: ballotPicks.id })
        .from(ballotPicks)
        .where(inArray(ballotPicks.nomineeId, nomineeIds))
        .limit(1)
    )[0];
    if (picked) return "Ya recibió votos. No se puede eliminar.";
  }
  return null;
}

export async function deleteMember(memberId: number): Promise<string | null> {
  const guard = await memberHasActivity(memberId);
  if (guard) return guard;
  await db().delete(members).where(eq(members.id, memberId));
  await syncAutoNominees();
  return null;
}

export async function deleteNominee(nomineeId: number): Promise<string | null> {
  const nominee = (
    await db().select().from(nominees).where(eq(nominees.id, nomineeId))
  )[0];
  if (!nominee) return null;
  const hasVotes = (
    await db()
      .select({ id: ballotPicks.id })
      .from(ballotPicks)
      .where(eq(ballotPicks.nomineeId, nomineeId))
      .limit(1)
  )[0];
  if (hasVotes) return "Ya recibió votos. No se puede eliminar.";
  await db().delete(nominees).where(eq(nominees.id, nomineeId));
  return null;
}

export async function addMessageNominee(input: {
  categoryKey: string;
  authorName: string;
  messageText: string;
  messageAt: string | null;
}): Promise<string | null> {
  const category = (
    await db().select().from(categories).where(eq(categories.key, input.categoryKey))
  )[0];
  if (!category) return "Categoría no encontrada.";
  const [{ value: maxPosition }] = await db()
    .select({ value: max(nominees.position) })
    .from(nominees)
    .where(eq(nominees.categoryId, category.id));
  await db().insert(nominees).values({
    categoryId: category.id,
    authorName: input.authorName,
    messageText: input.messageText,
    messageAt: input.messageAt,
    position: (maxPosition ?? -1) + 1,
  });
  return null;
}

export async function addPodiumNominee(input: {
  categoryKey: string;
  memberId: number;
  rankPosition: number;
}): Promise<string | null> {
  const category = (
    await db().select().from(categories).where(eq(categories.key, input.categoryKey))
  )[0];
  if (!category) return "Categoría no encontrada.";
  const member = (
    await db().select().from(members).where(eq(members.id, input.memberId))
  )[0];
  if (!member) return "Miembro no encontrado.";
  const already = (
    await db()
      .select({ id: nominees.id })
      .from(nominees)
      .where(
        and(eq(nominees.categoryId, category.id), eq(nominees.memberId, input.memberId)),
      )
  )[0];
  if (already) return "Ese miembro ya está en el podio.";
  await db().insert(nominees).values({
    categoryId: category.id,
    memberId: input.memberId,
    authorName: member.name,
    rankPosition: input.rankPosition,
    position: input.rankPosition,
  });
  await normalizePodium(category.id);
  return null;
}

export async function movePodiumNominee(
  nomineeId: number,
  direction: "up" | "down",
): Promise<string | null> {
  const nominee = (
    await db().select().from(nominees).where(eq(nominees.id, nomineeId))
  )[0];
  if (!nominee || nominee.rankPosition === null) return "Nominado no encontrado.";

  const rows = await db()
    .select()
    .from(nominees)
    .where(eq(nominees.categoryId, nominee.categoryId));
  const podium = rows
    .filter((row) => row.rankPosition !== null)
    .sort((a, b) => (a.rankPosition ?? 0) - (b.rankPosition ?? 0));

  const index = podium.findIndex((row) => row.id === nomineeId);
  const target = direction === "up" ? index - 1 : index + 1;
  if (target < 0 || target >= podium.length) return null;

  const reordered = [...podium];
  [reordered[index], reordered[target]] = [reordered[target], reordered[index]];

  for (const [position, row] of reordered.entries()) {
    await db()
      .update(nominees)
      .set({ rankPosition: position + 1, position: position + 1 })
      .where(eq(nominees.id, row.id));
  }
  return null;
}

async function normalizePodium(categoryId: number) {
  const rows = await db()
    .select()
    .from(nominees)
    .where(eq(nominees.categoryId, categoryId));
  const podium = rows
    .filter((row) => row.rankPosition !== null)
    .sort((a, b) => (a.rankPosition ?? 0) - (b.rankPosition ?? 0));
  for (const [index, row] of podium.entries()) {
    if (row.rankPosition !== index + 1 || row.position !== index + 1) {
      await db()
        .update(nominees)
        .set({ rankPosition: index + 1, position: index + 1 })
        .where(eq(nominees.id, row.id));
    }
  }
}

export async function updateSettings(input: {
  groupCode?: string;
  votingOpen?: boolean;
  revealActive?: boolean;
}) {
  const patch: Record<string, unknown> = { updatedAt: new Date() };
  if (input.groupCode !== undefined) patch.groupCode = input.groupCode;
  if (input.votingOpen !== undefined) patch.votingOpen = input.votingOpen;
  if (input.revealActive !== undefined) patch.revealActive = input.revealActive;
  const existing = (
    await db().select({ id: settings.id }).from(settings).where(eq(settings.id, 1))
  )[0];
  if (existing) {
    await db().update(settings).set(patch).where(eq(settings.id, 1));
  } else {
    await db().insert(settings).values({ id: 1, groupCode: "CHIN2026", ...patch });
  }
}

export async function getAdminData() {
  const [settingsRows, memberRows, categoryRows, nomineeRows, ballotRows] =
    await Promise.all([
      db().select().from(settings).where(eq(settings.id, 1)),
      db().select().from(members).orderBy(asc(members.position), asc(members.id)),
      db().select().from(categories).orderBy(asc(categories.position)),
      db().select().from(nominees).orderBy(asc(nominees.position)),
      db().select().from(ballots),
    ]);

  const ballotsPerVoter = new Map<number, Set<number>>();
  for (const ballot of ballotRows) {
    const set = ballotsPerVoter.get(ballot.voterId) ?? new Set<number>();
    set.add(ballot.categoryId);
    ballotsPerVoter.set(ballot.voterId, set);
  }

  return {
    settings:
      settingsRows[0] ?? { groupCode: "", votingOpen: false, revealActive: false },
    members: memberRows.map((member) => ({
      id: member.id,
      name: member.name,
      photoUrl: member.photoUrl,
      position: member.position,
      votedCategoryIds: [...(ballotsPerVoter.get(member.id) ?? [])],
    })),
    categories: categoryRows.map((category) => ({
      id: category.id,
      key: category.key,
      title: category.title,
      tagline: category.tagline,
      kind: category.kind,
      position: category.position,
      autoNominees: category.autoNominees,
      nominees: nomineeRows
        .filter((nominee) => nominee.categoryId === category.id)
        .map((nominee) => ({
          id: nominee.id,
          memberId: nominee.memberId,
          authorName: nominee.authorName,
          messageText: nominee.messageText,
          messageAt: nominee.messageAt,
          rankPosition: nominee.rankPosition,
        })),
    })),
    turnout: {
      totalBallots: ballotRows.length,
    },
  };
}
