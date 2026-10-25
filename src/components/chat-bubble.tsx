import type { ReactNode } from "react";

export function ChatBubble({
  author,
  at,
  text,
  compact = false,
  className = "",
  children,
}: {
  author: string;
  at?: string | null;
  text?: string | null;
  compact?: boolean;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <figure
      className={`relative border border-ink bg-ivory ${
        compact ? "px-4 py-3" : "px-5 py-4"
      } ${className}`}
    >
      <span
        className="pointer-events-none absolute inset-0 border border-ink/45"
        style={{ margin: 3 }}
        aria-hidden="true"
      />
      <figcaption className="flex items-baseline justify-between gap-3 pr-9">
        <span className="caps-line-tight font-caps text-[11px] text-ink-soft">
          {author}
        </span>
        {at ? <span className="text-[11px] italic text-ink-faint">{at}</span> : null}
      </figcaption>
      {text ? (
        <blockquote
          className={`mt-2 font-body text-ink ${
            compact ? "text-[14px] leading-snug" : "text-[15px] leading-relaxed"
          }`}
        >
          {text}
        </blockquote>
      ) : null}
      {children}
    </figure>
  );
}
