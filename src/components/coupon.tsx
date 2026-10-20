import Link from "next/link";
import type { ReactNode } from "react";
import { Scissors } from "./ornaments";

export function CouponArrow({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <path d="M4 12 H19" />
        <path d="M13.5 6.5 L19 12 L13.5 17.5" />
      </g>
    </svg>
  );
}

function CouponInner({
  label,
  sub,
  invert,
}: {
  label: string;
  sub?: string;
  invert: boolean;
}) {
  return (
    <span className="flex items-stretch">
      <span
        className="relative flex w-11 items-center justify-center"
        aria-hidden="true"
      >
        <span
          className="absolute inset-y-2 left-1/2 -ml-px border-l border-dashed"
          style={{ borderColor: invert ? "rgba(239,230,210,0.55)" : "rgba(28,24,19,0.5)" }}
        />
        <Scissors
          className={`relative h-4 w-4 -translate-y-3 ${
            invert ? "text-ivory/80" : "text-ink-soft"
          }`}
        />
      </span>
      <span className="flex flex-1 items-center justify-between gap-4 py-4 pr-5 pl-4">
        <span className="flex flex-col items-start gap-1">
          <span
            className={`caps-line font-caps text-[13px] leading-tight ${
              invert ? "text-ivory" : "text-ink"
            }`}
          >
            {label}
          </span>
          {sub ? (
            <span
              className={`text-[13px] italic leading-snug ${
                invert ? "text-ivory/80" : "text-ink-soft"
              }`}
            >
              {sub}
            </span>
          ) : null}
        </span>
        <CouponArrow className={`h-5 w-5 shrink-0 ${invert ? "text-foil-bright" : "text-foil"}`} />
      </span>
    </span>
  );
}

export function CouponLink({
  href,
  label,
  sub,
  invert = true,
  className = "",
}: {
  href: string;
  label: string;
  sub?: string;
  invert?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`plate-press group block border transition-[transform,box-shadow] duration-150 active:translate-y-px ${
        invert ? "border-ink bg-ink" : "border-ink bg-ivory"
      } ${className}`}
    >
      <CouponInner label={label} sub={sub} invert={invert} />
    </Link>
  );
}

export function Coupon({
  action,
  label,
  sub,
  invert = true,
  className = "",
  disabled = false,
  children,
}: {
  action?: () => void;
  label?: string;
  sub?: string;
  invert?: boolean;
  className?: string;
  disabled?: boolean;
  children?: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={action}
      disabled={disabled}
      className={`plate-press block w-full border text-left transition-[transform,box-shadow] duration-150 active:translate-y-px disabled:opacity-40 disabled:shadow-none disabled:active:translate-y-0 ${
        invert ? "border-ink bg-ink" : "border-ink bg-ivory"
      } ${className}`}
    >
      {children ?? <CouponInner label={label ?? ""} sub={sub} invert={invert} />}
    </button>
  );
}
