import { NextResponse } from "next/server";
import { z } from "zod";
import { voidBallot } from "@/lib/admin-ops";
import { requireAdmin, sameOriginGuard } from "@/lib/http";

const schema = z.object({
  voterId: z.number().int().min(1),
  categoryId: z.number().int().min(1),
});

export async function DELETE(request: Request) {
  if (!sameOriginGuard(request)) {
    return NextResponse.json({ error: "Origen no permitido." }, { status: 403 });
  }
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
  }
  const error = await voidBallot(parsed.data.voterId, parsed.data.categoryId);
  if (error) {
    return NextResponse.json({ error }, { status: 409 });
  }
  return NextResponse.json({ ok: true });
}
