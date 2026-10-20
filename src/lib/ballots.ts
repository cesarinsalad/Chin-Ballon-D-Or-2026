import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { ballotPicks, ballots, categories, nominees } from "@/db/schema";
import { getSettings } from "./event";

export type BallotSubmission = {
  categoryKey: string;
  picks: Array<{ nomineeId: number; rank: number | null }>;
};

export type SubmitResult =
  | { ok: true }
  | { ok: false; status: number; error: string };

export async function submitBallot(
  voterId: number,
  submission: BallotSubmission,
): Promise<SubmitResult> {
  const settings = await getSettings();
  if (!settings.votingOpen) {
    return { ok: false, status: 403, error: "La votación está cerrada." };
  }

  const category = (
    await db().select().from(categories).where(eq(categories.key, submission.categoryKey))
  )[0];
  if (!category || (category.kind !== "ranked" && category.kind !== "pick5")) {
    return { ok: false, status: 404, error: "Categoría no encontrada." };
  }

  const categoryNominees = await db()
    .select({ id: nominees.id })
    .from(nominees)
    .where(eq(nominees.categoryId, category.id));
  const validNomineeIds = new Set(categoryNominees.map((nominee) => nominee.id));

  const distinctIds = new Set(submission.picks.map((pick) => pick.nomineeId));
  if (distinctIds.size !== submission.picks.length) {
    return { ok: false, status: 400, error: "Hay nominados repetidos en tu selección." };
  }
  for (const pick of submission.picks) {
    if (!validNomineeIds.has(pick.nomineeId)) {
      return { ok: false, status: 400, error: "Nominado inválido para esta categoría." };
    }
  }

  if (category.kind === "ranked") {
    if (submission.picks.length !== 3) {
      return { ok: false, status: 400, error: "Debes elegir exactamente un top 3." };
    }
    const ranks = new Set(submission.picks.map((pick) => pick.rank));
    if (ranks.size !== 3 || !ranks.has(1) || !ranks.has(2) || !ranks.has(3)) {
      return { ok: false, status: 400, error: "El top 3 necesita un 1º, un 2º y un 3º." };
    }
  } else {
    const required = Math.min(5, validNomineeIds.size);
    if (submission.picks.length !== required) {
      return {
        ok: false,
        status: 400,
        error: `Debes marcar exactamente ${required} nominados.`,
      };
    }
    if (submission.picks.some((pick) => pick.rank !== null)) {
      return { ok: false, status: 400, error: "Esta categoría no usa posiciones." };
    }
  }

  const existing = (
    await db()
      .select({ id: ballots.id })
      .from(ballots)
      .where(and(eq(ballots.voterId, voterId), eq(ballots.categoryId, category.id)))
  )[0];
  if (existing) {
    return {
      ok: false,
      status: 409,
      error: "Ya sellaste tu voto en esta categoría.",
    };
  }

  await db().transaction(async (tx) => {
    const inserted = await tx
      .insert(ballots)
      .values({ voterId, categoryId: category.id })
      .returning({ id: ballots.id });
    const ballotId = inserted[0].id;
    await tx.insert(ballotPicks).values(
      submission.picks.map((pick) => ({
        ballotId,
        nomineeId: pick.nomineeId,
        rank: category.kind === "ranked" ? pick.rank : null,
      })),
    );
  });

  return { ok: true };
}

export async function hasPicksForNominees(nomineeIds: number[]): Promise<boolean> {
  if (nomineeIds.length === 0) return false;
  const rows = await db()
    .select({ id: ballotPicks.id })
    .from(ballotPicks)
    .where(inArray(ballotPicks.nomineeId, nomineeIds))
    .limit(1);
  return rows.length > 0;
}
