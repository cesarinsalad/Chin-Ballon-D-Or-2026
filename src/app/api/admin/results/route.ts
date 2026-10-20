import { NextResponse } from "next/server";
import { getCeremonyData } from "@/lib/event";
import { requireAdmin, sameOriginGuard } from "@/lib/http";

export async function GET(request: Request) {
  if (!sameOriginGuard(request)) {
    return NextResponse.json({ error: "Origen no permitido." }, { status: 403 });
  }
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  const data = await getCeremonyData();
  return NextResponse.json(data);
}
