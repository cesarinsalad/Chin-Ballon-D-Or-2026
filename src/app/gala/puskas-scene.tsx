"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image, { type StaticImageData } from "next/image";
import type { CeremonyCategory } from "@/lib/event";
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

/* ---------- Piezas de chat ---------- */

function TypingDots({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 ${className}`} aria-label="escribiendo">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="block h-1.5 w-1.5 rounded-full bg-current"
          animate={{ y: [0, -4, 0], opacity: [0.35, 1, 0.35] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
        />
      ))}
    </span>
  );
}

function ReadTicks({ delay = 0, gold = false }: { delay?: number; gold?: boolean }) {
  return (
    <svg viewBox="0 0 18 10" className="h-2.5 w-4" aria-hidden="true">
      {[0, 5].map((dx, i) => (
        <motion.path
          key={i}
          d={`M${1 + dx} 5.5 L${4 + dx} 8.5 L${11 + dx} 1.5`}
          fill="none"
          stroke={gold ? "#8f6f2e" : "#6e6557"}
          strokeWidth="1.4"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.3, delay: delay + i * 0.15 }}
        />
      ))}
    </svg>
  );
}

function Bubble({
  author,
  at,
  text,
  mediaUrl,
  mediaType,
  side = "left",
  gold = false,
  ticksDelay = 0,
  children,
}: {
  author: string;
  at: string | null;
  text: string | null;
  mediaUrl?: string | null;
  mediaType?: string | null;
  side?: "left" | "right";
  gold?: boolean;
  ticksDelay?: number;
  children?: React.ReactNode;
}) {
  return (
    <figure
      className={`relative max-w-[88%] border bg-ivory px-4 py-3 text-left ${gold ? "border-foil" : "border-ink"
        } ${side === "right" ? "self-end" : "self-start"}`}
    >
      <span
        className={`pointer-events-none absolute inset-0 border ${gold ? "border-foil/60" : "border-ink/40"}`}
        style={{ margin: 3 }}
        aria-hidden="true"
      />
      {/* colita del bocadillo */}
      <span
        className={`absolute top-3 h-3 w-3 rotate-45 border bg-ivory ${gold ? "border-foil" : "border-ink"
          } ${side === "right" ? "-right-[7px] border-b-0 border-l-0" : "-left-[7px] border-t-0 border-r-0"}`}
        aria-hidden="true"
      />
      <figcaption className={`caps-line-tight font-caps text-[11px] ${gold ? "text-foil-ink" : "text-ink-soft"}`}>
        {author}
      </figcaption>
      {text ? <blockquote className="mt-1.5 font-body text-[14px] leading-snug text-ink">{text}</blockquote> : null}
      {mediaUrl ? (
        <div className="mt-2">
          <MediaFrame url={mediaUrl} type={mediaType ?? null} compact />
        </div>
      ) : null}
      <span className="mt-1.5 flex items-center justify-end gap-1.5">
        {at ? <span className="text-[10px] italic text-ink-faint">{at}</span> : null}
        <ReadTicks delay={ticksDelay} gold={gold} />
      </span>
      {children}
    </figure>
  );
}

function SystemPill({ children, gold = false }: { children: React.ReactNode; gold?: boolean }) {
  return (
    <span
      className={`caps-line-tight self-center border px-3 py-1 font-caps text-[9px] tracking-[0.2em] uppercase ${gold ? "border-foil-bright text-foil-bright" : "border-ivory/30 text-ivory/60"
        }`}
    >
      {children}
    </span>
  );
}

function ChatHeader({ title, subtitle }: { title: string; subtitle: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 border-b border-ivory/15 px-4 py-3 text-left">
      <span className="flex h-9 w-9 items-center justify-center rounded-full border border-foil-bright font-display text-[13px] font-bold text-foil-bright">
        CP
      </span>
      <span className="flex flex-col">
        <span className="font-display text-[14px] font-bold tracking-wide text-ivory">{title}</span>
        <span className="text-[11px] text-ivory/55">{subtitle}</span>
      </span>
    </div>
  );
}

/* ---------- Intro: nominados ---------- */

export function PuskasIntro({
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
  const base = 1.5;
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="relative z-10 flex flex-1 flex-col items-center justify-center gap-5 px-6 py-20 text-center"
    >

      <motion.h2
        initial={{ opacity: 0, y: 30, scale: 0.85 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 160, damping: 16, delay: 0.2 }}
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
      </motion.h2>

      {category.tagline ? (
        <motion.p
          className="max-w-[44ch] text-[14px] leading-relaxed text-ivory/70 italic"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          {category.tagline}
        </motion.p>
      ) : null}

      {/* Ventana de chat */}
      <motion.div
        className="w-full max-w-[440px] border border-ivory/25 bg-stage-lift/80 backdrop-blur-sm"
        initial={{ opacity: 0, y: 40, scaleY: 0.6 }}
        animate={{ opacity: 1, y: 0, scaleY: 1 }}
        transition={{ duration: 0.7, ease: EASE, delay: 1 }}
        style={{ transformOrigin: "bottom" }}
      >
        <ChatHeader title="Chinparley" subtitle="Los nominados" />
        <div className="flex flex-col gap-3 px-4 py-4">
          {category.nominees.map((nominee, i) => {
            const t = base + i * 1.1;
            return (
              <div key={nominee.id} className="flex flex-col">
                {/* escribiendo… */}
                <motion.span
                  className="self-start border border-ivory/20 px-3 py-2 text-ivory/70"
                  initial={{ opacity: 0, height: "auto" }}
                  animate={{ opacity: [0, 1, 1, 0], height: ["auto", "auto", "auto", 0], paddingTop: [8, 8, 8, 0], paddingBottom: [8, 8, 8, 0], borderWidth: [1, 1, 1, 0] }}
                  transition={{ duration: 0.9, delay: t - 0.9, times: [0, 0.15, 0.85, 1] }}
                >
                  <TypingDots />
                </motion.span>
                <motion.div
                  className="flex flex-col"
                  initial={{ opacity: 0, scale: 0.6, x: -20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20, delay: t }}
                  style={{ transformOrigin: "left bottom" }}
                >
                  <Bubble
                    author={nominee.memberName ?? nominee.authorName ?? "Anónimo"}
                    at={nominee.messageAt}
                    text={nominee.messageText}
                    mediaUrl={nominee.mediaUrl}
                    mediaType={nominee.mediaType}
                    ticksDelay={t + 0.4}
                  />
                </motion.div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </motion.section>
  );
}

/* ---------- Reveal: el hilo del podio ---------- */

const REACTIONS = ["❤", "🔥", "😂", "👏", "⚽", "🐐", "❤", "🔥", "😂", "👏", "🏆", "💯"];

function ReactionBurst() {
  return (
    <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden" aria-hidden="true">
      <motion.div
        className="absolute inset-0 bg-ivory"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.4, 0] }}
        transition={{ duration: 0.8 }}
      />
      {REACTIONS.map((r, i) => (
        <motion.span
          key={i}
          className="absolute bottom-[-40px] block text-[28px]"
          style={{ left: `${6 + ((i * 37) % 88)}%` }}
          initial={{ y: 0, opacity: 0, scale: 0.6 }}
          animate={{
            y: -(500 + ((i * 53) % 300)),
            x: [0, (i % 2 ? 1 : -1) * 24, 0],
            opacity: [0, 1, 1, 0],
            scale: [0.6, 1.2, 1],
          }}
          transition={{ duration: 2.6, delay: 0.1 + i * 0.09, ease: "easeOut" }}
        >
          {r}
        </motion.span>
      ))}
    </div>
  );
}

export function PuskasReveal({
  groups,
  stepIndex,
  envelopeOpen,
}: {
  groups: Group[];
  stepIndex: number;
  envelopeOpen: boolean;
}) {
  const current = groups[stepIndex] ?? null;
  const winnerPending = current?.position === 1 && !envelopeOpen;
  const winnerShown = current?.position === 1 && envelopeOpen;
  const shown = groups.slice(0, stepIndex + 1).filter((g) => g.position !== 1);
  const winner = groups.find((g) => g.position === 1) ?? null;

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="relative z-10 flex flex-1 flex-col items-center justify-center gap-5 px-6 py-20 text-center"
    >
      {winnerShown ? <ReactionBurst /> : null}

      <p className="caps-line font-caps text-[10px] text-foil-bright">El mejor mensaje del año</p>

      <div className="w-full max-w-[440px] border border-ivory/25 bg-stage-lift/80 backdrop-blur-sm">
        <ChatHeader
          title="Chinparley"
          subtitle={
            winnerPending ? (
              <span className="inline-flex items-center gap-1.5 text-foil-bright">
                el comité está escribiendo <TypingDots />
              </span>
            ) : (
              "Recuento oficial"
            )
          }
        />

        <motion.div layout className="flex flex-col gap-3 px-4 py-4">
          <AnimatePresence initial={false}>
            {shown.map((g) => (
              <motion.div
                key={`pos-${g.position}`}
                layout
                className="flex flex-col gap-2"
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: g === current ? 1 : 0.55, y: 0, scale: g === current ? 1 : 0.94 }}
                transition={{ type: "spring", stiffness: 240, damping: 22 }}
                style={{ transformOrigin: "left center" }}
              >
                <SystemPill>
                  {g.label}
                  {g.exAequo ? " · empate" : ""}
                </SystemPill>
                {g.entries.map((e) => (
                  <div key={e.key} className="flex items-end gap-2">
                    {e.isMember ? <Monogram name={e.name} photoUrl={e.photoUrl} size={30} /> : null}
                    <Bubble
                      author={e.name}
                      at={e.messageAt}
                      text={g === current ? e.messageText : truncate(e.messageText)}
                      mediaUrl={g === current ? e.mediaUrl : null}
                      mediaType={e.mediaType}
                      ticksDelay={0.5}
                    />
                  </div>
                ))}
                {g === current ? (
                  <motion.p
                    className="tabular text-[11px] tracking-[0.05em] text-ivory/55"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    {g.entries[0]?.stats.join(" · ")}
                  </motion.p>
                ) : null}
              </motion.div>
            ))}

            {winnerPending ? (
              <motion.div
                key="pending"
                layout
                className="flex flex-col items-start gap-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <SystemPill gold>Primer premio</SystemPill>
                <motion.span
                  className="border border-foil-bright/60 px-4 py-3 text-foil-bright"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                >
                  <TypingDots />
                </motion.span>
                <p className="caps-line self-center font-caps text-[11px] text-ivory/75">
                  Y el mensaje del año es…
                </p>
              </motion.div>
            ) : null}

            {winnerShown && winner ? (
              <motion.div
                key="winner"
                layout
                className="flex flex-col gap-2"
                initial={{ opacity: 0, scale: 0.3, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 13, delay: 0.2 }}
              >
                <SystemPill gold>📌 Mensaje fijado · Primer premio{winner.exAequo ? " · empate" : ""}</SystemPill>
                {winner.entries.map((e) => (
                  <div key={e.key} className="flex flex-col gap-2">
                    <div className="flex items-center justify-center gap-3">
                      {e.isMember ? <Monogram name={e.name} photoUrl={e.photoUrl} size={50} foil /> : null}
                      <span
                        className="font-display font-bold uppercase text-foil-bright"
                        style={{ fontSize: "clamp(1.2rem, 5.5vw, 1.7rem)", letterSpacing: "0.03em" }}
                      >
                        {e.name}
                      </span>
                    </div>
                    <motion.div
                      className="relative flex flex-col"
                      animate={{ boxShadow: ["0 0 0px rgba(200,164,92,0)", "0 0 36px rgba(200,164,92,0.45)", "0 0 0px rgba(200,164,92,0)"] }}
                      transition={{ duration: 2.4, repeat: Infinity, delay: 1 }}
                    >
                      <Bubble
                        author={e.name}
                        at={e.messageAt}
                        text={e.messageText}
                        mediaUrl={e.mediaUrl}
                        mediaType={e.mediaType}
                        gold
                        ticksDelay={0.9}
                      >
                        <span className="absolute -bottom-3 right-3 flex gap-0.5">
                          {["❤", "🔥", "😂", "🏆"].map((r, i) => (
                            <motion.span
                              key={r}
                              className="flex h-6 w-6 items-center justify-center rounded-full border border-foil bg-ivory text-[12px]"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", stiffness: 400, damping: 12, delay: 1.2 + i * 0.12 }}
                            >
                              {r}
                            </motion.span>
                          ))}
                        </span>
                      </Bubble>
                    </motion.div>
                    <p className="tabular mt-3 text-[11px] tracking-[0.05em] text-ivory/60">{e.stats.join(" · ")}</p>
                  </div>
                ))}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.section>
  );
}

function truncate(text: string | null, max = 70): string | null {
  if (!text) return text;
  return text.length > max ? `${text.slice(0, max).trimEnd()}…` : text;
}
