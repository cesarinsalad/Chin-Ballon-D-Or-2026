import type { ReactNode } from "react";

export function BallVignette({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 64"
      className={className}
      role="img"
      aria-label="Balón entre laureles"
    >
      <g fill="none" stroke="currentColor" strokeWidth="1.4">
        <circle cx="60" cy="32" r="13" />
        <circle cx="60" cy="32" r="10.5" strokeWidth="0.9" />
        <path d="M60 24.5 L66 29 L63.8 36 L56.2 36 L54 29 Z" strokeWidth="0.9" />
        <path d="M60 21.5 L60 24.5 M66.8 27.4 L69.6 26 M65.8 37.2 L68.2 39.6 M54.2 37.2 L51.8 39.6 M53.2 27.4 L50.4 26" strokeWidth="0.9" />
        <g className="laurel" strokeWidth="1.1">
          <path d="M44 34 C34 30 28 22 26 13" />
          <path d="M40.6 31.4 C36.8 30.2 34.1 28.5 32.3 26.6 C35.6 27.1 38.4 28.4 40.6 31.4 Z" />
          <path d="M36.6 25.9 C33.6 24.1 31.8 22 30.8 19.8 C33.7 21 35.6 22.9 36.6 25.9 Z" />
          <path d="M33.4 19.5 C31.4 17.3 30.4 15 30.2 12.8 C32.4 14.6 33.4 16.7 33.4 19.5 Z" />
          <path d="M43 38.5 C38 38.8 33.3 37.5 29.6 34.9 C33.9 35.2 38 36.5 43 38.5 Z" />
          <path d="M40.1 44 C36 45.1 32.2 44.7 28.8 42.9 C32.7 42.6 36.4 43 40.1 44 Z" />
          <path d="M36.9 49.1 C33.6 51 30.3 51.3 27 50 C30.4 49 33.6 49.3 36.9 49.1 Z" />
          <path d="M76 34 C86 30 92 22 94 13" />
          <path d="M79.4 31.4 C83.2 30.2 85.9 28.5 87.7 26.6 C84.4 27.1 81.6 28.4 79.4 31.4 Z" />
          <path d="M83.4 25.9 C86.4 24.1 88.2 22 89.2 19.8 C86.3 21 84.4 22.9 83.4 25.9 Z" />
          <path d="M86.6 19.5 C88.6 17.3 89.6 15 89.8 12.8 C87.6 14.6 86.6 16.7 86.6 19.5 Z" />
          <path d="M77 38.5 C82 38.8 86.7 37.5 90.4 34.9 C86.1 35.2 82 36.5 77 38.5 Z" />
          <path d="M79.9 44 C84 45.1 87.8 44.7 91.2 42.9 C87.3 42.6 83.6 43 79.9 44 Z" />
          <path d="M83.1 49.1 C86.4 51 89.7 51.3 93 50 C89.6 49 86.4 49.3 83.1 49.1 Z" />
        </g>
        <path d="M30 57 Q35 53.5 40 57 M80 57 Q85 53.5 90 57" strokeWidth="0.9" />
      </g>
    </svg>
  );
}

export function RuleFrame({
  children,
  className = "",
  innerClassName = "",
}: {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
}) {
  return (
    <div className={`border border-ink ${className}`}>
      <div className={`border border-ink/70 m-[5px] ${innerClassName}`}>{children}</div>
    </div>
  );
}

export function DiamondDivider({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`} aria-hidden="true">
      <span className="h-px flex-1 bg-ink/40" />
      <svg viewBox="0 0 10 10" className="h-2.5 w-2.5 shrink-0">
        <rect x="2.2" y="2.2" width="5.6" height="5.6" fill="currentColor" />
      </svg>
      <span className="h-px flex-1 bg-ink/40" />
    </div>
  );
}

export function Scissors({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <circle cx="6" cy="6.5" r="2.6" />
        <circle cx="6" cy="17.5" r="2.6" />
        <path d="M8.2 8.2 L20 18.5 M8.2 15.8 L20 5.5" />
      </g>
    </svg>
  );
}
