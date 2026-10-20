import { NextResponse } from "next/server";
import { z } from "zod";
import { submitBallot } from "@/lib/ballots";
import { requireVoter, sameOriginGuard } from "@/lib/http";

const pickSchema = z.object({
  nomineeId: z.number().int().positive(),
  rank: z.number().int().min(1).max(3).nullable(),
});

const ballotSchema = z.object({
  categoryKey: z.string().min(1).max(32),
  picks: z.array(pickSchema).min(1).max(10),
});

export async function POST(request: Request) {
  if (!sameOriginGuard(request)) {
    return NextResponse.json({ error: "Origen no permitido." }, { status: 403 });
  }
  const voter = await requireVoter();
  if (!voter) {
    return NextResponse.json({ error: "No has entrado a la gala." }, { status: 401 });
  }
  const body = await request.json().catch(() => null);
  const parsed = ballotSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Papeleta inválida." }, { status: 400 });
  }
  const result = await submitBallot(voter.memberId, parsed.data);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ ok: true }, { status: 201 });
}
