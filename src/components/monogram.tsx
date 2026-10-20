export function Monogram({
  name,
  photoUrl,
  size = 56,
  foil = false,
}: {
  name: string;
  photoUrl?: string | null;
  size?: number;
  foil?: boolean;
}) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
  const ring = foil ? "border-foil" : "border-ink";
  const innerRing = foil ? "border-foil/70" : "border-ink/60";

  if (photoUrl) {
    return (
      <span
        className="relative inline-flex items-center justify-center rounded-full border border-ink bg-ivory-deep"
        style={{ width: size, height: size }}
      >
        <img
          src={photoUrl}
          alt={name}
          className="rounded-full object-cover"
          style={{ width: size - 8, height: size - 8 }}
        />
        <span
          className={`pointer-events-none absolute inset-0 rounded-full border ${innerRing}`}
          style={{ margin: 2.5 }}
          aria-hidden="true"
        />
      </span>
    );
  }

  return (
    <span
      className={`relative inline-flex items-center justify-center rounded-full border ${ring} bg-ivory`}
      style={{ width: size, height: size }}
    >
      <span
        className={`font-caps text-ink ${foil ? "text-foil-ink" : ""}`}
        style={{ fontSize: Math.max(12, size * 0.34), letterSpacing: "0.06em" }}
      >
        {initials}
      </span>
      <span
        className={`pointer-events-none absolute inset-0 rounded-full border ${innerRing}`}
        style={{ margin: 2.5 }}
        aria-hidden="true"
      />
    </span>
  );
}

export function rankLabel(rank: number): string {
  if (rank === 1) return "1er";
  if (rank === 2) return "2e";
  return "3e";
}
