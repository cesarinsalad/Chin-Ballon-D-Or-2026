import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { requireAdmin, sameOriginGuard } from "@/lib/http";

const updateSchema = z.object({
  title: z.string().min(1).max(60).optional(),
  tagline: z.string().max(120).nullable().optional(),
});

export async function PATCH(
  request: Request,
  ctx: RouteContext<"/api/admin/categories/[id]">,
) {
  if (!sameOriginGuard(request)) {
    return NextResponse.json({ error: "Origen no permitido." }, { status: 403 });
  }
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  const { id } = await ctx.params;
  const categoryId = Number(id);
  if (!Number.isInteger(categoryId)) {
    return NextResponse.json({ error: "Id inválido." }, { status: 400 });
  }
  const body = await request.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
  }
  const category = (
    await db().select().from(categories).where(eq(categories.id, categoryId))
  )[0];
  if (!category) {
    return NextResponse.json({ error: "Categoría no encontrada." }, { status: 404 });
  }
  await db().update(categories).set(parsed.data).where(eq(categories.id, categoryId));
  return NextResponse.json({ ok: true });
}
