import { NextResponse } from "next/server";
import { handleUpload } from "@vercel/blob/client";
import { blobConfigured, MAX_BLOB_SIZE_BYTES, MEDIA_MIME_TYPES } from "@/lib/media";
import { requireAdmin, sameOriginGuard } from "@/lib/http";

export async function POST(request: Request) {
  if (!sameOriginGuard(request)) {
    return NextResponse.json({ error: "Origen no permitido." }, { status: 403 });
  }
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  if (!blobConfigured()) {
    return NextResponse.json(
      { error: "Almacenamiento de ficheros no configurado." },
      { status: 501 },
    );
  }
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Cuerpo inválido." }, { status: 400 });
  }
  let result: Awaited<ReturnType<typeof handleUpload>>;
  try {
    result = await handleUpload({
      body: body,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: [...MEDIA_MIME_TYPES],
        maximumSizeInBytes: MAX_BLOB_SIZE_BYTES,
        addRandomSuffix: true,
      }),
      onUploadCompleted: async () => {},
    });
  } catch (uploadError) {
    const message = uploadError instanceof Error ? uploadError.message : "";
    console.error("[admin/media] handleUpload falló:", uploadError);
    if (/token|credential|denied|unauthorized|forbidden/i.test(message)) {
      return NextResponse.json(
        {
          error:
            "El almacén de ficheros rechazó la petición: token ausente o inválido.",
        },
        { status: 503 },
      );
    }
    return NextResponse.json(
      { error: "El almacén de ficheros falló al preparar la subida." },
      { status: 500 },
    );
  }
  return new Response(JSON.stringify(result), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}
