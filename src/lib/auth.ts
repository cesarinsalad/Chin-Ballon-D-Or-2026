import { createHash, timingSafeEqual } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";

export const VOTER_COOKIE = "chin_voter";
export const ADMIN_COOKIE = "chin_admin";

export type SessionPayload = {
  memberId: number;
  name: string;
  typ: "voter" | "admin";
};

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("Falta AUTH_SECRET en el entorno.");
  return new TextEncoder().encode(secret);
}

export function safeEqual(a: string, b: string): boolean {
  const hashA = createHash("sha256").update(a).digest();
  const hashB = createHash("sha256").update(b).digest();
  return timingSafeEqual(hashA, hashB);
}

export async function signSession(
  payload: SessionPayload,
  maxAgeSeconds: number,
): Promise<string> {
  return new SignJWT({ typ: payload.typ, name: payload.name })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(payload.memberId))
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + maxAgeSeconds)
    .sign(getSecret());
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (payload.typ !== "voter" && payload.typ !== "admin") return null;
    const memberId = Number(payload.sub);
    if (!Number.isInteger(memberId)) return null;
    return { memberId, name: String(payload.name ?? ""), typ: payload.typ };
  } catch {
    return null;
  }
}

export function cookieOptions(maxAgeSeconds: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: maxAgeSeconds,
  };
}

export const VOTER_MAX_AGE = 60 * 60 * 24 * 30;
export const ADMIN_MAX_AGE = 60 * 60 * 12;
