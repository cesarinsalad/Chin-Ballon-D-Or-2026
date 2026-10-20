import { cookies } from "next/headers";
import { ADMIN_COOKIE, VOTER_COOKIE, verifySession } from "./auth";

export async function getVoterSession(): Promise<{ memberId: number; name: string } | null> {
  const store = await cookies();
  const token = store.get(VOTER_COOKIE)?.value;
  if (!token) return null;
  const payload = await verifySession(token);
  if (!payload || payload.typ !== "voter") return null;
  return { memberId: payload.memberId, name: payload.name };
}

export async function isAdminSession(): Promise<boolean> {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE)?.value;
  if (!token) return false;
  const payload = await verifySession(token);
  return payload?.typ === "admin";
}
