import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { members } from "@/db/schema";
import { deleteMember, syncAutoNominees } from "@/lib/admin-ops";
import { requireAdmin, sameOriginGuard } from "@/lib/http";

const photoSchema = z
  .string()
  .regex(/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/)
  .max(600_000)
  .nullable();

const updateSchema = z.object({
  name: z.string().min(1).max(40).optional(),
  photoUrl: photoSchema.optional(),
  position: z.number().int().min(0).optional(),
});

export async function PATCH(
  request: Request,
  ctx: RouteContext<"/api/admin/members/[id]">,
) {
  if (!sameOriginGuard(request)) {
    return NextResponse.json({ error: "Origen no permitido." }, { status: 403 });
  }
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  const { id } = await ctx.params;
  const memberId = Number(id);
  if (!Number.isInteger(memberId)) {
    return NextResponse.json({ error: "Id inválido." }, { status: 400 });
  }
  const body = await request.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
  }
  const member = (
    await db().select().from(members).where(eq(members.id, memberId))
  )[0];
  if (!member) {
    return NextResponse.json({ error: "Miembro no encontrado." }, { status: 404 });
  }
  if (parsed.data.name !== undefined && parsed.data.name !== member.name) {
    const clash = (
      await db().select().from(members).where(eq(members.name, parsed.data.name))
    )[0];
    if (clash) {
      return NextResponse.json({ error: "Ya existe ese nombre." }, { status: 409 });
    }
  }
  await db()
    .update(members)
    .set(parsed.data)
    .where(eq(members.id, memberId));
  await syncAutoNominees();
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  request: Request,
  ctx: RouteContext<"/api/admin/members/[id]">,
) {
  if (!sameOriginGuard(request)) {
    return NextResponse.json({ error: "Origen no permitido." }, { status: 403 });
  }
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  const { id } = await ctx.params;
  const memberId = Number(id);
  if (!Number.isInteger(memberId)) {
    return NextResponse.json({ error: "Id inválido." }, { status: 400 });
  }
  const error = await deleteMember(memberId);
  if (error) {
    return NextResponse.json({ error }, { status: 409 });
  }
  return NextResponse.json({ ok: true });
}
