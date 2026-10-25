export function MediaFrame({
  url,
  type,
  compact = false,
}: {
  url: string;
  type: string | null;
  compact?: boolean;
}) {
  const inner = compact ? "max-h-[170px]" : "max-h-[300px]";
  const isVideo = type?.startsWith("video/");
  return (
    <figure
      className="relative mt-3 border border-ink bg-stage"
      data-media-frame=""
    >
      <span
        className="pointer-events-none absolute inset-0 border border-ink/45 z-10"
        style={{ margin: 3 }}
        aria-hidden="true"
      />
      {isVideo ? (
        <video
          src={url}
          controls
          preload={compact ? "none" : "metadata"}
          playsInline
          className={`block w-full ${inner} object-contain bg-black`}
        />
      ) : (
        <img
          src={url}
          alt="Media nominada"
          loading="lazy"
          className={`block w-full ${inner} object-contain`}
        />
      )}
    </figure>
  );
}
