import { NextResponse } from "next/server";
import { getAdminData } from "@/lib/admin-ops";
import { requireAdmin, sameOriginGuard } from "@/lib/http";

export async function GET(request: Request) {
  if (!sameOriginGuard(request)) {
    return NextResponse.json({ error: "Origen no permitido." }, { status: 403 });
  }
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  const data = await getAdminData();
  return NextResponse.json(data);
}
