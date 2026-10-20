import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { members } from "@/db/schema";
import {
  VOTER_COOKIE,
  VOTER_MAX_AGE,
  cookieOptions,
  safeEqual,
  signSession,
} from "@/lib/auth";
import { getSettings } from "@/lib/event";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const enterSchema = z.object({
  code: z.string().min(1).max(64),
  memberId: z.number().int().positive(),
});

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(VOTER_COOKIE, "", { ...cookieOptions(0), maxAge: 0 });
  return response;
}

export async function POST(request: Request) {
  const ip = clientIp(request);
  if (!rateLimit(`enter:${ip}`, 15, 10 * 60 * 1000)) {
    return NextResponse.json(
      { error: "Demasiados intentos. Espera un momento." },
      { status: 429 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = enterSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
  }

  const settings = await getSettings();
  if (!settings.groupCode || !safeEqual(parsed.data.code, settings.groupCode)) {
    return NextResponse.json({ error: "Código incorrecto." }, { status: 401 });
  }

  const member = (
    await db().select().from(members).where(eq(members.id, parsed.data.memberId))
  )[0];
  if (!member) {
    return NextResponse.json({ error: "Ese nombre no está en la lista." }, { status: 404 });
  }

  const token = await signSession(
    { memberId: member.id, name: member.name, typ: "voter" },
    VOTER_MAX_AGE,
  );
  const response = NextResponse.json({ ok: true });
  response.cookies.set(VOTER_COOKIE, token, cookieOptions(VOTER_MAX_AGE));
  return response;
}
