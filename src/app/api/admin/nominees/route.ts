import { NextResponse } from "next/server";
import { z } from "zod";
import { addMessageNominee, addPodiumNominee } from "@/lib/admin-ops";
import { requireAdmin, sameOriginGuard } from "@/lib/http";

const createSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("message"),
    categoryKey: z.string().min(1).max(32),
    authorName: z.string().min(1).max(40),
    messageText: z.string().min(1).max(2000),
    messageAt: z.string().max(40).nullable().optional(),
  }),
  z.object({
    type: z.literal("podium"),
    categoryKey: z.string().min(1).max(32),
    memberId: z.number().int().positive(),
    rankPosition: z.number().int().min(1).max(10),
  }),
]);

export async function POST(request: Request) {
  if (!sameOriginGuard(request)) {
    return NextResponse.json({ error: "Origen no permitido." }, { status: 403 });
  }
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  const body = await request.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
  }
  const data = parsed.data;
  const error =
    data.type === "message"
      ? await addMessageNominee({
          categoryKey: data.categoryKey,
          authorName: data.authorName,
          messageText: data.messageText,
          messageAt: data.messageAt ?? null,
        })
      : await addPodiumNominee({
          categoryKey: data.categoryKey,
          memberId: data.memberId,
          rankPosition: data.rankPosition,
        });
  if (error) {
    return NextResponse.json({ error }, { status: 409 });
  }
  return NextResponse.json({ ok: true }, { status: 201 });
}
