import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { members } from "@/db/schema";
import { syncAutoNominees } from "@/lib/admin-ops";
import { requireAdmin, sameOriginGuard } from "@/lib/http";

const createSchema = z.object({ name: z.string().min(1).max(40) });

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
  const existing = (
    await db().select().from(members).where(eq(members.name, parsed.data.name))
  )[0];
  if (existing) {
    return NextResponse.json({ error: "Ya existe ese nombre." }, { status: 409 });
  }
  await db().insert(members).values({ name: parsed.data.name });
  await syncAutoNominees();
  return NextResponse.json({ ok: true }, { status: 201 });
}
