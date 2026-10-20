import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE, VOTER_COOKIE, verifySession } from "./auth";

export function jsonError(status: number, error: string) {
  return NextResponse.json({ error }, { status });
}

export async function requireVoter(): Promise<
  { memberId: number; name: string } | null
> {
  const store = await cookies();
  const token = store.get(VOTER_COOKIE)?.value;
  if (!token) return null;
  const payload = await verifySession(token);
  if (!payload || payload.typ !== "voter") return null;
  return { memberId: payload.memberId, name: payload.name };
}

export async function requireAdmin(): Promise<boolean> {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE)?.value;
  if (!token) return false;
  const payload = await verifySession(token);
  return payload?.typ === "admin";
}

export function sameOriginGuard(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    const originUrl = new URL(origin);
    const host = request.headers.get("host");
    return !host || originUrl.host === host;
  } catch {
    return false;
  }
}
