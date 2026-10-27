"use client";

import { motion } from "framer-motion";
import Image, { type StaticImageData } from "next/image";
import type { CeremonyCategory } from "@/lib/event";
import { Monogram } from "@/components/monogram";

type Entry = { key: string; name: string; photoUrl: string | null; isMember: boolean };
type Group = { position: number; label: string; exAequo: boolean; entries: Entry[] };

const EASE = [0.16, 1, 0.3, 1] as const;
const BAR: Record<number, number> = { 1: 128, 2: 94, 3: 68 };
const ORDER = [2, 1, 3];
// Orden de aparición: 3º, 2º y por último 1º
const DELAY: Record<number, number> = { 3: 0.9, 2: 1.5, 1: 2.2 };

function Trophy({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
        <path d="M9 5 H23 V12 A7 7 0 0 1 9 12 Z" />
        <path d="M9 7 H5 A4 4 0 0 0 9 14 M23 7 H27 A4 4 0 0 1 23 14" />
        <path d="M16 19 V24 M11 27 H21 M12.5 24 H19.5 V27" />
      </g>
    </svg>
  );
}

export function CoachScene({
  category,
  groups,
  logo,
  number,
}: {
  category: CeremonyCategory;
  groups: Group[];
  logo: StaticImageData | null;
  number: number;
}) {
  const byPos = new Map(groups.map((g) => [g.position, g]));
  const podium = ORDER.filter((p) => byPos.has(p));
  const rest = groups.filter((g) => g.position > 3).sort((a, b) => a.position - b.position);

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4 }}
      className="relative z-10 flex flex-1 flex-col items-center justify-center gap-5 px-6 py-20 text-center"
    >
      <motion.p
        className="caps-line font-caps text-[10px] text-foil-bright"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >Premio del comité
      </motion.p>

      <motion.h2
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
      >
        {logo ? (
          <Image src={logo} alt={category.title} className="h-auto w-[min(46vw,210px)]" />
        ) : (
          <span
            className="font-display font-bold uppercase text-ivory"
            style={{ fontSize: "clamp(1.7rem, 7.5vw, 2.6rem)", letterSpacing: "0.05em" }}
          >
            {category.title}
          </span>
        )}
      </motion.h2>

      {category.tagline ? (
        <motion.p
          className="max-w-[44ch] text-[14px] leading-relaxed text-ivory/70 italic"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {category.tagline}
        </motion.p>
      ) : null}

      {/* Podio */}
      <div className="flex w-full max-w-[420px] items-end justify-center gap-2 pt-2">
        {podium.map((pos) => {
          const g = byPos.get(pos)!;
          const first = pos === 1;
          const d = DELAY[pos] ?? 1;
          return (
            <div key={pos} className="flex flex-1 flex-col items-center gap-2">
              <motion.div
                className="flex flex-col items-center gap-1.5"
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={
                  first
                    ? { type: "spring", stiffness: 220, damping: 13, delay: d + 0.5 }
                    : { duration: 0.6, ease: EASE, delay: d + 0.4 }
                }
              >
                {first ? (
                  <motion.span
                    className="block w-7 text-foil-bright"
                    animate={{ rotate: [-6, 6, -6], y: [0, -3, 0] }}
                    transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut", delay: d + 1 }}
                  >
                    <Trophy className="h-auto w-full" />
                  </motion.span>
                ) : null}
                <div className="flex -space-x-2">
                  {g.entries.map((e) =>
                    e.isMember ? (
                      <Monogram key={e.key} name={e.name} photoUrl={e.photoUrl} size={first ? 56 : 42} foil={first} />
                    ) : null,
                  )}
                </div>
                {g.entries.map((e) => (
                  <span
                    key={e.key}
                    className={`font-display font-bold uppercase leading-tight ${first ? "text-[15px] text-foil-bright" : "text-[12px] text-ivory"
                      }`}
                    style={{ letterSpacing: "0.04em" }}
                  >
                    {e.name}
                  </span>
                ))}
              </motion.div>

              <motion.div
                className={`relative flex w-full items-start justify-center overflow-hidden border pt-2 ${first ? "border-foil-bright bg-foil/25" : "border-ivory/30 bg-stage-lift/80"
                  }`}
                initial={{ height: 0 }}
                animate={{ height: BAR[pos] }}
                transition={{ duration: 0.9, ease: EASE, delay: d }}
              >
                <span className={`font-display text-[22px] font-bold ${first ? "text-foil-bright" : "text-ivory/60"}`}>
                  {pos}
                </span>
                {first ? (
                  <motion.span
                    className="pointer-events-none absolute inset-y-0 -left-full w-full"
                    style={{
                      background:
                        "linear-gradient(100deg, transparent, rgba(239,230,210,0.3), transparent)",
                    }}
                    animate={{ x: ["0%", "200%"] }}
                    transition={{ duration: 1.4, repeat: Infinity, repeatDelay: 2.5, delay: d + 1.2 }}
                  />
                ) : null}
              </motion.div>
            </div>
          );
        })}
      </div>

      {/* Resto de la clasificación */}
      {rest.length > 0 ? (
        <div className="flex w-full max-w-[420px] flex-col gap-1.5">
          {rest.map((g, i) =>
            g.entries.map((e) => (
              <motion.div
                key={e.key}
                className="flex items-center justify-between border border-ivory/20 px-4 py-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, ease: EASE, delay: 3 + i * 0.15 }}
              >
                <span className="font-display text-[14px] font-bold text-ivory/50">{g.position}º</span>
                <span className="caps-line-tight font-caps text-[11px] text-ivory/80">{e.name}</span>
              </motion.div>
            )),
          )}
        </div>
      ) : null}
    </motion.section>
  );
}
