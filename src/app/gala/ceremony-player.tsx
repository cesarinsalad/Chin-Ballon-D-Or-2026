"use client";

import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import Link from "next/link";
import type { CeremonyCategory } from "@/lib/event";
import { BallVignette } from "@/components/ornaments";
import { ChatBubble } from "@/components/chat-bubble";
import { Monogram } from "@/components/monogram";
import { Coupon, CouponLink } from "@/components/coupon";
import { GoldConfetti } from "@/components/gold-confetti";
import { initAudio, playDrumroll } from "@/components/drumroll";

type PodiumEntry = {
  key: string;
  name: string;
  photoUrl: string | null;
  messageText: string | null;
  messageAt: string | null;
  isMember: boolean;
  stats: string[];
};

type RevealGroup = {
  position: number;
  label: string;
  exAequo: boolean;
  entries: PodiumEntry[];
};

function positionLabel(position: number): string {
  if (position === 1) return "1er prix";
  return `${position}e place`;
}

function buildGroups(category: CeremonyCategory): RevealGroup[] {
  const ballots = Math.max(category.ballotsCount, 1);
  const groups = new Map<number, RevealGroup>();

  if (category.kind === "ranked") {
    for (const tally of category.podium) {
      if (!("points" in tally)) continue;
      const entry: PodiumEntry = {
        key: `n${tally.nomineeId}`,
        name: tally.nominee.memberName ?? tally.nominee.authorName ?? "—",
        photoUrl: tally.nominee.photoUrl,
        messageText: tally.nominee.messageText,
        messageAt: tally.nominee.messageAt,
        isMember: tally.nominee.memberId !== null,
        stats: [
          `${tally.points} puntos`,
          `${tally.firsts} primeros puestos`,
          `${Math.round((tally.appearances / ballots) * 100)}% de las papeletas`,
        ],
      };
      const group = groups.get(tally.position) ?? {
        position: tally.position,
        label: positionLabel(tally.position),
        exAequo: false,
        entries: [],
      };
      group.entries.push(entry);
      groups.set(tally.position, group);
    }
  } else if (category.kind === "pick5") {
    for (const tally of category.podium) {
      if (!("votes" in tally)) continue;
      const entry: PodiumEntry = {
        key: `n${tally.nomineeId}`,
        name: tally.nominee.memberName ?? "—",
        photoUrl: tally.nominee.photoUrl,
        messageText: null,
        messageAt: null,
        isMember: true,
        stats: [
          `${tally.votes} votos`,
          `${Math.round((tally.votes / ballots) * 100)}% de las papeletas`,
        ],
      };
      const group = groups.get(tally.position) ?? {
        position: tally.position,
        label: positionLabel(tally.position),
        exAequo: false,
        entries: [],
      };
      group.entries.push(entry);
      groups.set(tally.position, group);
    }
  } else {
    for (const entry of category.podium) {
      if (!("rankPosition" in entry)) continue;
      const podiumEntry: PodiumEntry = {
        key: `n${entry.id}`,
        name: entry.memberName ?? entry.authorName ?? "—",
        photoUrl: entry.photoUrl,
        messageText: null,
        messageAt: null,
        isMember: entry.memberId !== null,
        stats: ["par décision du comité"],
      };
      const group = groups.get(entry.rankPosition) ?? {
        position: entry.rankPosition,
        label: positionLabel(entry.rankPosition),
        exAequo: false,
        entries: [],
      };
      group.entries.push(podiumEntry);
      groups.set(entry.rankPosition, group);
    }
  }

  return [...groups.values()]
    .map((group) => ({ ...group, exAequo: group.entries.length > 1 }))
    .sort((a, b) => b.position - a.position);
}

const fade = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.32, ease: [0.16, 1, 0.3, 1] as const },
};

function Envelope({ open }: { open: boolean }) {
  return (
    <span className="relative inline-block w-52 max-w-[72vw]" aria-hidden="true">
      <span className="block pb-[64%]" />
      <span className="absolute inset-0 block border border-ivory/40 bg-stage-lift" />
      <motion.span
        className="absolute inset-x-0 top-0 block h-[52%] origin-top bg-[#241f16]"
        style={{
          clipPath: "polygon(0 0, 100% 0, 50% 100%)",
          borderBottom: "1px solid rgba(239,230,210,0.4)",
        }}
        animate={open ? { rotateX: -168 } : { rotateX: 0 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      />
      {!open ? (
        <span className="absolute top-[46%] left-1/2 block h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-foil-bright bg-foil" />
      ) : null}
    </span>
  );
}

function SoundToggle({ muted, onToggle }: { muted: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onToggle();
      }}
      aria-label={muted ? "Activar el sonido" : "Silenciar la ceremonia"}
      className="flex h-10 w-10 items-center justify-center border border-ivory/30 text-ivory/70 transition-colors hover:text-ivory"
    >
      {muted ? (
        <svg viewBox="0 0 24 24" className="h-4.5 w-4.5">
          <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <path d="M4 9.5 H8 L13 5.5 V18.5 L8 14.5 H4 Z" />
            <path d="M16.5 9.5 L21 14.5 M21 9.5 L16.5 14.5" />
          </g>
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="h-4.5 w-4.5">
          <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <path d="M4 9.5 H8 L13 5.5 V18.5 L8 14.5 H4 Z" />
            <path d="M16.5 9 A4.4 4.4 0 0 1 16.5 15" />
            <path d="M18.8 7 A7.4 7.4 0 0 1 18.8 17" />
          </g>
        </svg>
      )}
    </button>
  );
}

export function CeremonyPlayer({
  categories,
  turnout,
}: {
  categories: CeremonyCategory[];
  turnout: { totalMembers: number; votersPerCategory: Record<string, number> };
}) {
  const [sceneIndex, setSceneIndex] = useState(-1);
  const [phase, setPhase] = useState<"overture" | "intro" | "reveal" | "curtain">("overture");
  const [stepIndex, setStepIndex] = useState(0);
  const [envelopeOpen, setEnvelopeOpen] = useState(false);
  const [muted, setMuted] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const muteRef = useRef(false);

  const scenes = useMemo(
    () =>
      categories.map((category) => ({
        category,
        groups: buildGroups(category),
      })),
    [categories],
  );

  const scene = sceneIndex >= 0 && sceneIndex < scenes.length ? scenes[sceneIndex] : null;
  const isBalonScene = scene?.category.key === "balon";
  const group = scene && phase === "reveal" ? scene.groups[stepIndex] : null;
  const isWinnerStep = group !== null && group.position === 1;
  const noVotes =
    scene !== null && phase === "reveal" && scene.category.kind !== "ceremonial"
      ? scene.category.ballotsCount === 0
      : false;

  function advance() {
    if (phase === "overture") {
      initAudio();
      muteRef.current = muted;
      setSceneIndex(0);
      setPhase("intro");
      return;
    }
    if (phase === "intro") {
      setPhase("reveal");
      setStepIndex(0);
      setEnvelopeOpen(false);
      return;
    }
    if (phase === "reveal" && scene) {
      if (isWinnerStep && !envelopeOpen && !noVotes) {
        playDrumroll(muted);
        setEnvelopeOpen(true);
        if (isBalonScene) setConfetti(true);
        return;
      }
      if (stepIndex + 1 < scene.groups.length) {
        setStepIndex(stepIndex + 1);
        setEnvelopeOpen(false);
        return;
      }
      if (sceneIndex + 1 < scenes.length) {
        setSceneIndex(sceneIndex + 1);
        setPhase("intro");
        setStepIndex(0);
        setEnvelopeOpen(false);
        return;
      }
      setPhase("curtain");
    }
  }

  const toggleMute = () => {
    setMuted((value) => {
      muteRef.current = !value;
      return !value;
    });
    if (!muted) initAudio();
  };

  const voters = scene ? turnout.votersPerCategory[scene.category.key] ?? 0 : 0;

  return (
    <MotionConfig reducedMotion="user">
      <main
        className="stage spotlight vignette-stage relative flex min-h-dvh flex-col overflow-hidden text-ivory"
        onClick={phase === "curtain" ? undefined : advance}
      >
      <GoldConfetti active={confetti} />

      <header className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-4 py-4">
        <span className="flex items-center gap-2" aria-label={`Escena ${Math.max(sceneIndex + 1, 0)} de ${scenes.length}`}>
          {scenes.map((item, index) => (
            <span
              key={item.category.key}
              className={`block h-1.5 w-1.5 rotate-45 border ${
                index < sceneIndex
                  ? "border-foil bg-foil"
                  : index === sceneIndex
                    ? "border-foil-bright bg-foil-bright"
                    : "border-ivory/40"
              }`}
            />
          ))}
        </span>
        <div className="flex items-center gap-3" onClick={(event) => event.stopPropagation()}>
          <SoundToggle muted={muted} onToggle={toggleMute} />
          <Link
            href="/"
            className="caps-line-tight font-caps text-[9px] text-ivory/60 underline decoration-ivory/40 underline-offset-4 transition-colors hover:text-ivory"
          >
            Sortir
          </Link>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {phase === "overture" ? (
          <motion.section
            key="overture"
            {...fade}
            className="relative z-10 flex flex-1 flex-col items-center justify-center gap-7 px-8 text-center"
          >
            <BallVignette className="h-16 w-32 text-foil-bright" />
            <h1
              className="font-display font-bold uppercase text-foil-bright"
              style={{
                fontSize: "clamp(2.4rem, 11vw, 4.2rem)",
                lineHeight: 1.04,
                letterSpacing: "0.05em",
                textShadow: "0 1px 0 rgba(18,16,12,0.8)",
              }}
            >
              Chin
              <br />
              Ballon d&apos;Or
            </h1>
            <p className="caps-line font-caps text-[10px] text-ivory/80">
              Première Cérémonie · Saison 2026
            </p>
            <p className="max-w-[40ch] text-[14px] leading-relaxed text-ivory/70 italic">
              Toca el escenario para alzar el rideau. La salle garde le silence —
              silencia el móvil y déjate llevar.
            </p>
          </motion.section>
        ) : null}

        {phase === "intro" && scene ? (
          <motion.section
            key={`intro-${scene.category.key}`}
            {...fade}
            className="relative z-10 flex flex-1 flex-col items-center justify-center gap-6 px-8 py-20 text-center"
          >
            <p className="caps-line font-caps text-[10px] text-foil-bright">
              Numéro {sceneIndex + 1} · {voters} votants
            </p>
            <h2
              className="font-display font-bold uppercase text-ivory"
              style={{ fontSize: "clamp(1.7rem, 7.5vw, 2.6rem)", letterSpacing: "0.05em" }}
            >
              {scene.category.title}
            </h2>
            {scene.category.tagline ? (
              <p className="max-w-[44ch] text-[14px] leading-relaxed text-ivory/70 italic">
                {scene.category.tagline}
              </p>
            ) : null}
            {scene.category.kind !== "ceremonial" ? (
              <p className="caps-line-tight font-caps text-[10px] text-ivory/60">
                Les nominés
              </p>
            ) : (
              <p className="caps-line-tight font-caps text-[10px] text-ivory/60">
                Prix du comité · sans votation
              </p>
            )}
            {scene.category.key === "puskas" || scene.category.key === "olivada" ? (
              <div className="flex w-full max-w-[430px] flex-col gap-2.5 text-left">
                {scene.category.nominees.map((nominee) => (
                  <ChatBubble
                    key={nominee.id}
                    author={nominee.memberName ?? nominee.authorName ?? "Anónimo"}
                    at={nominee.messageAt}
                    text={nominee.messageText ?? ""}
                    compact
                  />
                ))}
              </div>
            ) : (
              <div className="flex max-w-[430px] flex-wrap justify-center gap-3">
                {scene.category.nominees.map((nominee) => (
                  <Monogram
                    key={nominee.id}
                    name={nominee.memberName ?? "Peña"}
                    photoUrl={nominee.photoUrl}
                    size={44}
                  />
                ))}
              </div>
            )}
          </motion.section>
        ) : null}

        {phase === "reveal" && scene && !noVotes ? (
          <motion.section
            key={`reveal-${scene.category.key}-${stepIndex}-${envelopeOpen ? "open" : "shut"}`}
            {...fade}
            className="relative z-10 flex flex-1 flex-col items-center justify-center gap-7 px-8 py-20 text-center"
          >
            {group ? (
              <>
                {isWinnerStep && !envelopeOpen ? (
                  <>
                    <p className="caps-line font-caps text-[11px] text-ivory/70">
                      Et le lauréat est…
                    </p>
                    <Envelope open={false} />
                  </>
                ) : (
                  <>
                    <p className="caps-line font-caps text-[10px] text-foil-bright">
                      {group.label}
                      {group.exAequo ? " · ex æquo" : ""}
                    </p>
                    {group.entries.map((entry) => (
                      <motion.article
                        key={entry.key}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className="paper relative w-full max-w-[440px] border border-ink px-6 py-5 text-ink"
                    >
                        <span
                          className="pointer-events-none absolute inset-0 border border-ink/50"
                          style={{ margin: 3 }}
                          aria-hidden="true"
                        />
                        <div className="flex items-center justify-center gap-4">
                          {entry.isMember ? (
                            <Monogram
                              name={entry.name}
                              photoUrl={entry.photoUrl}
                              size={54}
                              foil={isWinnerStep}
                            />
                          ) : null}
                          <p
                            className={`font-display font-bold uppercase leading-tight ${
                              isWinnerStep ? "text-foil" : "text-ink"
                            }`}
                            style={{ fontSize: "clamp(1.35rem, 6vw, 2rem)", letterSpacing: "0.03em" }}
                          >
                            {entry.name}
                          </p>
                        </div>
                        {entry.messageText ? (
                          <div className="mt-4">
                            <ChatBubble
                              author={entry.name}
                              at={entry.messageAt}
                              text={entry.messageText}
                              compact
                            />
                          </div>
                        ) : null}
                        <p className="tabular mt-4 text-[12px] tracking-[0.05em] text-ink-soft">
                          {entry.stats.join(" · ")}
                        </p>
                      </motion.article>
                    ))}
                    {isWinnerStep && isBalonScene && envelopeOpen ? (
                      <BallVignette className="h-12 w-24 text-foil" />
                    ) : null}
                  </>
                )}
              </>
            ) : (
              <p className="text-[15px] italic text-ivory/70">
                Esta categoría no reúne votos esta saison. El premio queda en el
                vestíbulo.
              </p>
            )}
          </motion.section>
        ) : null}

        {phase === "reveal" && noVotes ? (
          <motion.section
            key={`novotes-${scene?.category.key}`}
            {...fade}
            className="relative z-10 flex flex-1 flex-col items-center justify-center gap-6 px-8 text-center"
          >
            <p className="caps-line font-caps text-[10px] text-ivory/70">
              {scene?.category.title}
            </p>
            <p className="max-w-[40ch] text-[15px] leading-relaxed text-ivory/70 italic">
              Ninguna papeleta llegó al cajón para esta categoría. El premio
              aguarda la prochaine saison.
            </p>
          </motion.section>
        ) : null}

        {phase === "curtain" ? (
          <motion.section
            key="curtain"
            {...fade}
            className="relative z-10 flex flex-1 flex-col items-center justify-center gap-7 px-8 py-16 text-center"
          >
            <p className="caps-line font-caps text-[10px] text-foil-bright">Rideau</p>
            <h2
              className="font-display font-bold uppercase text-ivory"
              style={{ fontSize: "clamp(1.9rem, 8.5vw, 3rem)", letterSpacing: "0.05em" }}
            >
              Fin de la
              <br />
              Première Cérémonie
            </h2>
            <p className="max-w-[42ch] text-[14px] leading-relaxed text-ivory/70 italic">
              Merci à toute la peña. Los sobres viajan al archivo y las cifras,
              al acta oficial.
            </p>
            <div className="flex w-full max-w-[420px] flex-col gap-3">
              <CouponLink
                href="/acta"
                label="Acte Officiel — les chiffres"
                sub="Cifras anónimas de la votación"
              />
              <Coupon
                action={() => {
                  setConfetti(false);
                  setSceneIndex(-1);
                  setPhase("overture");
                  setStepIndex(0);
                  setEnvelopeOpen(false);
                }}
                label="Revoir la cérémonie"
                invert={false}
              />
            </div>
            <p className="caps-line-tight font-caps text-[9px] text-ivory/50">
              Chin Ballon d&apos;Or · à l&apos;année prochaine
            </p>
          </motion.section>
        ) : null}
      </AnimatePresence>

      {phase !== "curtain" ? (
        <footer className="relative z-10 flex flex-col items-center gap-2 px-6 pb-7">
          <Coupon action={advance} label="Continuer" invert={false} className="max-w-[300px]" />
          <p className="text-[10px] tracking-[0.25em] text-ivory/45 uppercase">
            Toca el escenario para avanzar
          </p>
        </footer>
      ) : null}
      </main>
    </MotionConfig>
  );
}
