import { NextResponse } from "next/server";
import { z } from "zod";
import { updateSettings } from "@/lib/admin-ops";
import { requireAdmin, sameOriginGuard } from "@/lib/http";

const stateSchema = z.object({
  groupCode: z.string().min(4).max(32).optional(),
  votingOpen: z.boolean().optional(),
  revealActive: z.boolean().optional(),
});

export async function PATCH(request: Request) {
  if (!sameOriginGuard(request)) {
    return NextResponse.json({ error: "Origen no permitido." }, { status: 403 });
  }
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  const body = await request.json().catch(() => null);
  const parsed = stateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
  }
  await updateSettings(parsed.data);
  return NextResponse.json({ ok: true });
}
