export const MEDIA_MIME_TYPES = [
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/webp",
  "video/mp4",
  "video/webm",
  "video/quicktime",
] as const;

export const MAX_DATA_URL_LENGTH = 3_200_000;
export const MAX_BLOB_SIZE_BYTES = 60 * 1024 * 1024;

export function isAllowedMediaType(type: string): boolean {
  return (MEDIA_MIME_TYPES as readonly string[]).includes(type);
}

export function validateMedia(
  url: string | null,
  type: string | null,
): string | null {
  if (!url && !type) return null;
  if (!url || !type) return "La media necesita URL y tipo a la vez.";
  if (!isAllowedMediaType(type)) {
    return "Tipo de archivo no admitido.";
  }
  if (url.startsWith("data:")) {
    if (!url.startsWith(`data:${type};base64,`)) {
      return "La media incrustada no coincide con su tipo.";
    }
    if (url.length > MAX_DATA_URL_LENGTH) {
      return "El archivo es demasiado grande para incrustarlo (máximo ~3 MB).";
    }
    return null;
  }
  if (!/^https:\/\/\S{1,2000}$/.test(url)) {
    return "La URL de la media no es válida.";
  }
  return null;
}

export function isBlobUrl(url: string | undefined | null): boolean {
  if (!url) return false;
  return url.startsWith("https://") && !url.startsWith("data:");
}

export function blobConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}
