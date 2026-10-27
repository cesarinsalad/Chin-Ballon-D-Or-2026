"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image, { type StaticImageData } from "next/image";
import type { CeremonyCategory } from "@/lib/event";
import { ChatBubble } from "@/components/chat-bubble";
import { MediaFrame } from "@/components/media-frame";
import { Monogram } from "@/components/monogram";

type Entry = {
  key: string;
  name: string;
  photoUrl: string | null;
  messageText: string | null;
  messageAt: string | null;
  mediaUrl: string | null;
  mediaType: string | null;
  isMember: boolean;
  stats: string[];
};

type Group = {
  position: number;
  label: string;
  exAequo: boolean;
  entries: Entry[];
};

const EASE = [0.16, 1, 0.3, 1] as const;

/* ---------- Ornamentos ---------- */

function Ghost({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 48" className={className} aria-hidden="true">
      <path
        d="M20 2 C9 2 4 10 4 20 V44 L9.5 39.5 L15 44 L20 39.5 L25 44 L30.5 39.5 L36 44 V20 C36 10 31 2 20 2 Z"
        fill="currentColor"
      />
      <ellipse cx="14.5" cy="19" rx="2.6" ry="3.6" fill="#12100c" />
      <ellipse cx="25.5" cy="19" rx="2.6" ry="3.6" fill="#12100c" />
      <ellipse cx="20" cy="29" rx="3.2" ry="2.2" fill="#12100c" />
    </svg>
  );
}

const DRIFTERS = [
  { left: "6%", top: "18%", size: 34, dur: 7.5, delay: 0 },
  { left: "84%", top: "14%", size: 26, dur: 9, delay: 1.2 },
  { left: "12%", top: "68%", size: 22, dur: 8.2, delay: 0.6 },
  { left: "78%", top: "62%", size: 38, dur: 10, delay: 2 },
  { left: "46%", top: "8%", size: 18, dur: 6.8, delay: 1.6 },
  { left: "90%", top: "40%", size: 20, dur: 7.8, delay: 0.3 },
  { left: "2%", top: "44%", size: 24, dur: 9.4, delay: 2.4 },
];

export function HauntedBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      {/* niebla */}
      <motion.div
        className="absolute inset-x-[-20%] bottom-[-10%] h-[45%]"
        style={{
          background:
            "radial-gradient(ellipse at 50% 100%, rgba(239,230,210,0.10), rgba(239,230,210,0) 65%)",
        }}
        animate={{ x: ["-4%", "4%", "-4%"] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      {DRIFTERS.map((g, i) => (
        <motion.span
          key={i}
          className="absolute block text-ivory"
          style={{ left: g.left, top: g.top, width: g.size }}
          initial={{ opacity: 0, y: 20 }}
          animate={{
            opacity: [0, 0.16, 0.08, 0.16, 0],
            y: [20, -14, 6, -18, 20],
            x: [0, 10, -8, 6, 0],
            rotate: [-6, 6, -4, 5, -6],
          }}
          transition={{ duration: g.dur, delay: g.delay, repeat: Infinity, ease: "easeInOut" }}
        >
          <Ghost className="h-auto w-full" />
        </motion.span>
      ))}
    </div>
  );
}

/* ---------- Intro: nominados ---------- */

export function OlivadaIntro({
  category,
  logo,
  number,
  voters,
}: {
  category: CeremonyCategory;
  logo: StaticImageData | null;
  number: number;
  voters: number;
}) {
  return (
    <motion.section
      key="intro-olivada"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, filter: "blur(6px)" }}
      transition={{ duration: 0.4 }}
      className="relative z-10 flex flex-1 flex-col items-center justify-center gap-6 px-8 py-20 text-center"
    >
      <HauntedBackdrop />


      <motion.h2
        className="relative"
        initial={{ opacity: 0, scale: 0.6, filter: "blur(14px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        transition={{ duration: 1.1, ease: EASE, delay: 0.2 }}
      >
        <motion.span
          className="block"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1.3 }}
        >
          {logo ? (
            <Image src={logo} alt={category.title} className="h-auto w-[min(52vw,240px)]" />
          ) : (
            <span
              className="font-display font-bold uppercase text-ivory"
              style={{ fontSize: "clamp(1.7rem, 7.5vw, 2.6rem)", letterSpacing: "0.05em" }}
            >
              {category.title}
            </span>
          )}
        </motion.span>
      </motion.h2>

      {category.tagline ? (
        <motion.p
          className="relative max-w-[44ch] text-[14px] leading-relaxed text-ivory/70 italic"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
        >
          {category.tagline}
        </motion.p>
      ) : null}

      <motion.p
        className="caps-line-tight relative font-caps text-[10px] text-ivory/60"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        Los nominados
      </motion.p>

      <div className="relative flex w-full max-w-[430px] flex-col gap-3 text-left">
        {category.nominees.map((nominee, i) => (
          <motion.div
            key={nominee.id}
            initial={{ opacity: 0, x: i % 2 === 0 ? -60 : 60, rotate: i % 2 === 0 ? -4 : 4, filter: "blur(8px)" }}
            animate={{ opacity: 1, x: 0, rotate: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.8, ease: EASE, delay: 1.4 + i * 0.28 }}
          >
            <motion.div
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 3.2 + (i % 3) * 0.6, repeat: Infinity, ease: "easeInOut", delay: 2.4 + i * 0.3 }}
            >
              <ChatBubble
                author={nominee.memberName ?? nominee.authorName ?? "Anónimo"}
                at={nominee.messageAt}
                text={nominee.messageText}
                compact
              >
                {nominee.mediaUrl ? (
                  <MediaFrame url={nominee.mediaUrl} type={nominee.mediaType} compact />
                ) : null}
              </ChatBubble>
            </motion.div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}

/* ---------- Reveal: podio ---------- */

const BAR_HEIGHT: Record<number, number> = { 1: 132, 2: 96, 3: 70 };
const VISUAL_ORDER = [2, 1, 3];

function GhostBurst() {
  const rays = Array.from({ length: 10 }, (_, i) => (i / 10) * Math.PI * 2);
  return (
    <div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center" aria-hidden="true">
      <motion.div
        className="absolute inset-0 bg-ivory"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.55, 0] }}
        transition={{ duration: 0.9, ease: "easeOut" }}
      />
      {rays.map((angle, i) => (
        <motion.span
          key={i}
          className="absolute block w-10 text-ivory"
          initial={{ x: 0, y: 0, scale: 0.2, opacity: 0 }}
          animate={{
            x: Math.cos(angle) * 220,
            y: Math.sin(angle) * 260,
            scale: [0.2, 1.2, 0.9],
            opacity: [0, 0.9, 0],
            rotate: (i % 2 ? 1 : -1) * 30,
          }}
          transition={{ duration: 1.8, ease: EASE, delay: 0.05 * i }}
        >
          <Ghost className="h-auto w-full" />
        </motion.span>
      ))}
    </div>
  );
}

export function OlivadaReveal({
  groups,
  stepIndex,
  envelopeOpen,
}: {
  groups: Group[];
  stepIndex: number;
  envelopeOpen: boolean;
}) {
  const current = groups[stepIndex] ?? null;
  const revealedPositions = new Set(groups.slice(0, stepIndex + 1).map((g) => g.position));
  const winnerPending = current?.position === 1 && !envelopeOpen;
  const winnerShown = revealedPositions.has(1) && envelopeOpen;
  const byPosition = new Map(groups.map((g) => [g.position, g]));
  const columns = VISUAL_ORDER.filter((p) => byPosition.has(p));

  return (
    <motion.section
      key="reveal-olivada"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="relative z-10 flex flex-1 flex-col items-center justify-center gap-6 px-6 py-20 text-center"
    >
      <HauntedBackdrop />
      {winnerShown ? <GhostBurst key="burst" /> : null}

      <motion.p
        className="caps-line relative font-caps text-[10px] text-foil-bright"
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
      >
        El podio de la Olivada
      </motion.p>

      {/* Podio */}
      <div className="relative flex w-full max-w-[440px] items-end justify-center gap-2">
        {columns.map((position) => {
          const g = byPosition.get(position)!;
          const revealed = revealedPositions.has(position) && (position !== 1 || envelopeOpen);
          const isWinner = position === 1;
          const active = current?.position === position;
          return (
            <div key={position} className="flex flex-1 flex-col items-center gap-2">
              {/* Placa del nombre */}
              <div className="flex min-h-[88px] w-full flex-col items-center justify-end gap-1.5">
                <AnimatePresence initial={false}>
                  {revealed ? (
                    <motion.div
                      key="name"
                      className="flex flex-col items-center gap-1.5"
                      initial={{ opacity: 0, y: 24, scale: isWinner ? 0.4 : 0.8 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={
                        isWinner
                          ? { type: "spring", stiffness: 220, damping: 14, delay: 0.25 }
                          : { duration: 0.6, ease: EASE, delay: 0.35 }
                      }
                    >
                      <div className="flex -space-x-2">
                        {g.entries.map((e) => (
                          <Monogram key={e.key} name={e.name} photoUrl={e.photoUrl} size={isWinner ? 52 : 40} foil={isWinner} />
                        ))}
                      </div>
                      {g.entries.map((e) => (
                        <span
                          key={e.key}
                          className={`font-display font-bold uppercase leading-tight ${isWinner ? "text-foil-bright text-[15px]" : "text-ivory text-[12px]"
                            }`}
                          style={{ letterSpacing: "0.04em" }}
                        >
                          {e.name}
                        </span>
                      ))}
                    </motion.div>
                  ) : (
                    <motion.span
                      key="mystery"
                      className={`block w-9 ${isWinner && winnerPending ? "text-foil-bright" : "text-ivory/25"}`}
                      initial={{ opacity: 0 }}
                      animate={
                        isWinner && winnerPending
                          ? { opacity: 1, y: [0, -8, 0], scale: [1, 1.08, 1], transition: { duration: 1.1, repeat: Infinity, ease: "easeInOut" } }
                          : { opacity: 1, y: [0, -4, 0], transition: { duration: 3, repeat: Infinity, ease: "easeInOut" } }
                      }
                      exit={{ opacity: 0, scale: 1.8, filter: "blur(6px)", transition: { duration: 0.25 } }}
                    >
                      <Ghost className="h-auto w-full" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>

              {/* Escalón */}
              <motion.div
                className={`relative flex w-full items-start justify-center border pt-2 ${isWinner && revealed
                    ? "border-foil-bright bg-foil/25"
                    : active
                      ? "border-ivory/60 bg-stage-lift"
                      : "border-ivory/25 bg-stage-lift/70"
                  }`}
                initial={{ height: 0 }}
                animate={{ height: revealedPositions.has(position) ? BAR_HEIGHT[position] ?? 60 : 14 }}
                transition={{ duration: 0.9, ease: EASE }}
              >
                <span
                  className={`font-display text-[22px] font-bold ${isWinner && revealed ? "text-foil-bright" : "text-ivory/60"
                    }`}
                >
                  {position}
                </span>
                {isWinner && revealed ? (
                  <motion.span
                    className="pointer-events-none absolute inset-0"
                    style={{ boxShadow: "0 0 40px rgba(200,164,92,0.45)" }}
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 2.4, repeat: Infinity }}
                  />
                ) : null}
              </motion.div>
            </div>
          );
        })}
      </div>

      {/* Detalle del paso actual */}
      <div className="relative w-full max-w-[440px]">
        <AnimatePresence initial={false}>
          {current && winnerPending ? (
            <motion.p
              key="pending"
              className="caps-line font-caps text-[11px] text-ivory/75"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.4, 1, 0.4], transition: { duration: 1.6, repeat: Infinity } }}
              exit={{ opacity: 0, transition: { duration: 0.25 } }}
            >
              Y la olivada del año es…
            </motion.p>
          ) : current ? (
            <motion.div
              key={`detail-${current.position}`}
              className="flex flex-col gap-3"
              initial={{ opacity: 0, y: 30, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -16, transition: { duration: 0.25 } }}
              transition={{ duration: 0.6, ease: EASE, delay: current.position === 1 ? 0.3 : 0.4 }}
            >
              <p className="caps-line font-caps text-[10px] text-foil-bright">
                {current.label}
                {current.exAequo ? " · empate" : ""}
              </p>
              {current.entries.map((e) => (
                <div key={e.key} className="flex flex-col gap-2 text-left">
                  {e.messageText || e.mediaUrl ? (
                    <ChatBubble author={e.name} at={e.messageAt} text={e.messageText} compact>
                      {e.mediaUrl ? <MediaFrame url={e.mediaUrl} type={e.mediaType} compact /> : null}
                    </ChatBubble>
                  ) : null}
                  <p className="tabular text-center text-[12px] tracking-[0.05em] text-ivory/60">
                    {e.stats.join(" · ")}
                  </p>
                </div>
              ))}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </motion.section>
  );
}
