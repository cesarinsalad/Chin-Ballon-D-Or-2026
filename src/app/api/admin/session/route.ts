import { NextResponse } from "next/server";
import { z } from "zod";
import {
  ADMIN_COOKIE,
  ADMIN_MAX_AGE,
  cookieOptions,
  safeEqual,
  signSession,
} from "@/lib/auth";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const loginSchema = z.object({ password: z.string().min(1).max(128) });

export async function POST(request: Request) {
  const ip = clientIp(request);
  if (!rateLimit(`admin:${ip}`, 10, 10 * 60 * 1000)) {
    return NextResponse.json(
      { error: "Demasiados intentos. Espera un momento." },
      { status: 429 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
  }

  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword || !safeEqual(parsed.data.password, adminPassword)) {
    return NextResponse.json({ error: "Contraseña incorrecta." }, { status: 401 });
  }

  const token = await signSession({ memberId: 0, name: "Capitán", typ: "admin" }, ADMIN_MAX_AGE);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, token, cookieOptions(ADMIN_MAX_AGE));
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, "", { ...cookieOptions(0), maxAge: 0 });
  return response;
}
