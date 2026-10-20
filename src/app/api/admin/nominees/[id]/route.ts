import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { nominees } from "@/db/schema";
import { deleteNominee, movePodiumNominee } from "@/lib/admin-ops";
import { requireAdmin, sameOriginGuard } from "@/lib/http";

const updateSchema = z.object({
  authorName: z.string().min(1).max(40).optional(),
  messageText: z.string().min(1).max(2000).optional(),
  messageAt: z.string().max(40).nullable().optional(),
  move: z.enum(["up", "down"]).optional(),
});

export async function PATCH(
  request: Request,
  ctx: RouteContext<"/api/admin/nominees/[id]">,
) {
  if (!sameOriginGuard(request)) {
    return NextResponse.json({ error: "Origen no permitido." }, { status: 403 });
  }
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  const { id } = await ctx.params;
  const nomineeId = Number(id);
  if (!Number.isInteger(nomineeId)) {
    return NextResponse.json({ error: "Id inválido." }, { status: 400 });
  }
  const body = await request.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
  }

  if (parsed.data.move) {
    const error = await movePodiumNominee(nomineeId, parsed.data.move);
    if (error) return NextResponse.json({ error }, { status: 409 });
    return NextResponse.json({ ok: true });
  }

  const patch = Object.fromEntries(
    Object.entries(parsed.data).filter(([key]) => key !== "move"),
  );
  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "Nada que actualizar." }, { status: 400 });
  }
  const nominee = (
    await db().select().from(nominees).where(eq(nominees.id, nomineeId))
  )[0];
  if (!nominee) {
    return NextResponse.json({ error: "Nominado no encontrado." }, { status: 404 });
  }
  await db().update(nominees).set(patch).where(eq(nominees.id, nomineeId));
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  request: Request,
  ctx: RouteContext<"/api/admin/nominees/[id]">,
) {
  if (!sameOriginGuard(request)) {
    return NextResponse.json({ error: "Origen no permitido." }, { status: 403 });
  }
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  const { id } = await ctx.params;
  const nomineeId = Number(id);
  if (!Number.isInteger(nomineeId)) {
    return NextResponse.json({ error: "Id inválido." }, { status: 400 });
  }
  const error = await deleteNominee(nomineeId);
  if (error) return NextResponse.json({ error }, { status: 409 });
  return NextResponse.json({ ok: true });
}
