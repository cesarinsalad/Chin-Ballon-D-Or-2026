import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { del } from "@vercel/blob";
import { db } from "@/db";
import { nominees } from "@/db/schema";
import { deleteNominee, movePodiumNominee } from "@/lib/admin-ops";
import { requireAdmin, sameOriginGuard } from "@/lib/http";
import { isBlobUrl, validateMedia } from "@/lib/media";

const updateSchema = z.object({
  authorName: z.string().min(1).max(40).optional(),
  messageText: z.string().max(2000).nullable().optional(),
  messageAt: z.string().max(40).nullable().optional(),
  mediaUrl: z.string().max(3_200_000).nullable().optional(),
  mediaType: z.string().max(80).nullable().optional(),
  move: z.enum(["up", "down"]).optional(),
});

export async function PATCH(
  request: Request,
  ctx: RouteContext<"/api/admin/nominees/[id]">,
) {
  if (!sameOriginGuard(request)) {
    return NextResponse.json({ error: "Origen no permitido." }, { status: 403 });
  }
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  const { id } = await ctx.params;
  const nomineeId = Number(id);
  if (!Number.isInteger(nomineeId)) {
    return NextResponse.json({ error: "Id inválido." }, { status: 400 });
  }
  const body = await request.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
  }

  if (parsed.data.move) {
    const error = await movePodiumNominee(nomineeId, parsed.data.move);
    if (error) return NextResponse.json({ error }, { status: 409 });
    return NextResponse.json({ ok: true });
  }

  const patch = Object.fromEntries(
    Object.entries(parsed.data).filter(([key]) => key !== "move"),
  );
  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "Nada que actualizar." }, { status: 400 });
  }
  const nominee = (
    await db().select().from(nominees).where(eq(nominees.id, nomineeId))
  )[0];
  if (!nominee) {
    return NextResponse.json({ error: "Nominado no encontrado." }, { status: 404 });
  }

  const nextUrl = patch.mediaUrl !== undefined ? patch.mediaUrl : nominee.mediaUrl;
  const nextType = patch.mediaType !== undefined ? patch.mediaType : nominee.mediaType;

  if (patch.mediaUrl !== undefined || patch.mediaType !== undefined) {
    if (nominee.memberId !== null) {
      return NextResponse.json(
        { error: "Los nominados de persona no llevan media." },
        { status: 400 },
      );
    }
    const mediaError = validateMedia(nextUrl, nextType);
    if (mediaError) {
      return NextResponse.json({ error: mediaError }, { status: 400 });
    }
  }

  if (patch.messageText !== undefined || patch.mediaUrl !== undefined) {
    const nextText =
      patch.messageText !== undefined ? patch.messageText : nominee.messageText;
    if (!nextText && !nextUrl) {
      return NextResponse.json(
        { error: "El mensaje necesita texto o media adjunta." },
        { status: 400 },
      );
    }
  }

  await db().update(nominees).set(patch).where(eq(nominees.id, nomineeId));
  if (isBlobUrl(nominee.mediaUrl) && nominee.mediaUrl !== nextUrl) {
    await del(nominee.mediaUrl as string).catch(() => undefined);
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  request: Request,
  ctx: RouteContext<"/api/admin/nominees/[id]">,
) {
  if (!sameOriginGuard(request)) {
    return NextResponse.json({ error: "Origen no permitido." }, { status: 403 });
  }
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  const { id } = await ctx.params;
  const nomineeId = Number(id);
  if (!Number.isInteger(nomineeId)) {
    return NextResponse.json({ error: "Id inválido." }, { status: 400 });
  }
  const error = await deleteNominee(nomineeId);
  if (error) return NextResponse.json({ error }, { status: 409 });
  return NextResponse.json({ ok: true });
}
