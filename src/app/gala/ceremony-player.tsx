"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import type { CeremonyCategory } from "@/lib/event";
import { ChatBubble } from "@/components/chat-bubble";
import { MediaFrame } from "@/components/media-frame";
import { Monogram } from "@/components/monogram";
import { Coupon, CouponLink } from "@/components/coupon";
import { GoldConfetti } from "@/components/gold-confetti";
import { initAudio, playDrumroll } from "@/components/drumroll";
import { CATEGORY_LOGOS, mainLogo } from "@/components/logos";
import { CeremonyAudioLoop } from "@/lib/ceremony-music";
import { OlivadaIntro, OlivadaReveal } from "./olivada-scene";
import { PuskasIntro, PuskasReveal } from "./puskas-scene";
import { TeamReveal } from "./team-scene";
import { CoachScene } from "./coach-scene";
import { ParleyScene } from "./parley-scene";
import { LivePerformanceIntro, LivePerformanceScene } from "./live-performance";
import { BalonIntro, BalonReveal, buildBalonSteps } from "./balon-scene";

// Premios ya otorgados (sin votación): se muestra el podio directamente, sin reveal
function isDirectScene(key: string | undefined): boolean {
  return key === "entrenadores" || key === "entrenador" || key === "parley";
}

const mainLogoImage = mainLogo();

type PodiumEntry = {
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

type RevealGroup = {
  position: number;
  label: string;
  exAequo: boolean;
  entries: PodiumEntry[];
};

function positionLabel(position: number): string {
  if (position === 1) return "Primer premio";
  return `${position}º puesto`;
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
        mediaUrl: tally.nominee.mediaUrl,
        mediaType: tally.nominee.mediaType,
        isMember: tally.nominee.memberId !== null,
        stats: [
          tally.firsts > 0
            ? `${tally.firsts} ${tally.firsts === 1 ? "primer puesto" : "primeros puestos"}`
            : null,
          `${Math.round((tally.appearances / ballots) * 100)}% de las papeletas`,
        ].filter(Boolean) as string[],
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
        mediaUrl: tally.nominee.mediaUrl,
        mediaType: tally.nominee.mediaType,
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
        mediaUrl: entry.mediaUrl,
        mediaType: entry.mediaType,
        isMember: entry.memberId !== null,
        stats: ["por decisión del comité"],
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
  preview = false,
}: {
  categories: CeremonyCategory[];
  turnout: { totalMembers: number; votersPerCategory: Record<string, number> };
  preview?: boolean;
}) {
  const [sceneIndex, setSceneIndex] = useState(-1);
  const [phase, setPhase] = useState<"overture" | "intro" | "reveal" | "curtain">("overture");
  const [stepIndex, setStepIndex] = useState(0);
  const [envelopeOpen, setEnvelopeOpen] = useState(false);
  const [muted, setMuted] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const muteRef = useRef(false);

  const scenes = useMemo(
    () => {
      const list = categories.map((category) => {
        let groups = buildGroups(category);
        if (category.key === "mejor5") {
          groups = [{ position: 1, label: "El equipo del año", exAequo: false, entries: [] }];
        } else if (category.key === "balon") {
          const balonSteps = buildBalonSteps(category);
          groups = balonSteps.map((step, idx) => ({
            position: step.type === "podium" ? 1 : idx + 2,
            label:
              step.type === "countdown"
                ? `${step.current.position}º puesto`
                : step.type === "video"
                  ? "Sobre oficial"
                  : "Podio definitivo",
            exAequo: false,
            entries: [],
          }));
        }
        return {
          category,
          groups,
          isInterlude: false,
        };
      });

      // Insertamos la presentación en vivo justo antes del Chin Ballon d'Or
      const balonIndex = list.findIndex((item) => item.category.key === "balon");
      const interludeItem = {
        category: {
          key: "interlude",
          title: "Presentación en Vivo",
          tagline: "Actuación estelar antes del gran premio",
          kind: "ceremonial" as const,
          ballotsCount: 0,
          nominees: [],
          podium: [],
          tallies: [],
        },
        groups: [],
        isInterlude: true,
      };

      if (balonIndex >= 0) {
        list.splice(balonIndex, 0, interludeItem);
      } else {
        list.push(interludeItem);
      }

      return list;
    },
    [categories],
  );

  const scene = sceneIndex >= 0 && sceneIndex < scenes.length ? scenes[sceneIndex] : null;
  const sceneLogo = scene ? CATEGORY_LOGOS[scene.category.key] ?? null : null;
  const isBalonScene = scene?.category.key === "balon";
  const isOlivadaScene = scene?.category.key === "olivada";
  const isPuskasScene = scene?.category.key === "puskas";
  const isTeamScene = scene?.category.key === "mejor5";
  const isCoachScene = scene?.category.key === "entrenadores" || scene?.category.key === "entrenador";
  const isParleyScene = scene?.category.key === "parley";
  const isInterludeScene = scene?.isInterlude || scene?.category.key === "interlude";
  const isDirect = isDirectScene(scene?.category.key);
  const isCustomScene = isOlivadaScene || isPuskasScene || isTeamScene || isCoachScene || isParleyScene || isInterludeScene || isBalonScene;
  const group = scene && phase === "reveal" ? (scene.groups[stepIndex] ?? null) : null;
  const isWinnerStep = !isBalonScene && group ? group.position === 1 : false;
  const noVotes =
    scene !== null && phase === "reveal" && scene.category.kind !== "ceremonial" && !isTeamScene && !isInterludeScene && !isBalonScene
      ? scene.category.ballotsCount === 0
      : false;

  const isBalonPodium =
    isBalonScene &&
    phase === "reveal" &&
    scene !== null &&
    buildBalonSteps(scene.category)[stepIndex]?.type === "podium";
  const showConfetti = confetti || Boolean(isBalonPodium);

  const olivadaTrackRef = useRef<CeremonyAudioLoop | null>(null);

  useEffect(() => {
    olivadaTrackRef.current = new CeremonyAudioLoop({
      src: "/audio/ghostbusters-song.mp3",
      startTime: 15,
      endTime: 60,
      targetVolume: 0.75,
      fadeInDuration: 1.5,
      fadeOutDuration: 1.2,
    });

    return () => {
      olivadaTrackRef.current?.destroy();
      olivadaTrackRef.current = null;
    };
  }, []);

  const isOlivadaSection =
    scene?.category.key === "olivada" && (phase === "intro" || phase === "reveal");

  useEffect(() => {
    const track = olivadaTrackRef.current;
    if (!track) return;

    if (isOlivadaSection && !muted) {
      track.start();
    } else {
      track.stop();
    }
  }, [isOlivadaSection, muted]);

  const advance = useCallback(() => {
    if (phase === "overture") {
      initAudio();
      muteRef.current = muted;
      setSceneIndex(0);
      setPhase("intro");
      return;
    }
    if (phase === "intro") {
      if (isDirect) {
        if (sceneIndex + 1 < scenes.length) {
          setSceneIndex(sceneIndex + 1);
          setPhase("intro");
        } else {
          setPhase("curtain");
        }
        setStepIndex(0);
        setEnvelopeOpen(false);
        return;
      }
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
  }, [phase, muted, scene, isWinnerStep, envelopeOpen, noVotes, isBalonScene, isDirect, stepIndex, sceneIndex, scenes.length]);

  const regresar = useCallback(() => {
    if (phase === "overture") {
      return;
    }
    if (phase === "intro") {
      if (sceneIndex <= 0) {
        setSceneIndex(-1);
        setPhase("overture");
        setEnvelopeOpen(false);
        setConfetti(false);
        return;
      }
      const prevIdx = sceneIndex - 1;
      const prevScene = scenes[prevIdx];
      setSceneIndex(prevIdx);
      if (isDirectScene(prevScene?.category.key)) {
        setPhase("intro");
        setStepIndex(0);
        setEnvelopeOpen(false);
        setConfetti(false);
        return;
      }
      setPhase("reveal");
      if (prevScene && prevScene.groups.length > 0) {
        const lastStep = prevScene.groups.length - 1;
        setStepIndex(lastStep);
        const isWinner = prevScene.groups[lastStep]?.position === 1;
        setEnvelopeOpen(isWinner);
        setConfetti(isWinner && prevScene.category.key === "balon");
      } else {
        setStepIndex(0);
        setEnvelopeOpen(false);
        setConfetti(false);
      }
      return;
    }
    if (phase === "reveal" && scene) {
      if (isWinnerStep && envelopeOpen) {
        setEnvelopeOpen(false);
        setConfetti(false);
        return;
      }
      if (stepIndex > 0) {
        setStepIndex(stepIndex - 1);
        setEnvelopeOpen(false);
        setConfetti(false);
        return;
      }
      setPhase("intro");
      setEnvelopeOpen(false);
      setConfetti(false);
      return;
    }
    if (phase === "curtain") {
      if (scenes.length > 0) {
        const lastIdx = scenes.length - 1;
        const lastScene = scenes[lastIdx];
        setSceneIndex(lastIdx);
        if (isDirectScene(lastScene.category.key)) {
          setPhase("intro");
          setStepIndex(0);
          setEnvelopeOpen(false);
          setConfetti(false);
          return;
        }
        setPhase("reveal");
        if (lastScene.groups.length > 0) {
          const lastStep = lastScene.groups.length - 1;
          setStepIndex(lastStep);
          const isWinner = lastScene.groups[lastStep]?.position === 1;
          setEnvelopeOpen(isWinner);
          setConfetti(isWinner && lastScene.category.key === "balon");
        } else {
          setStepIndex(0);
          setEnvelopeOpen(false);
          setConfetti(false);
        }
      } else {
        setSceneIndex(-1);
        setPhase("overture");
      }
    }
  }, [phase, sceneIndex, scenes, scene, isWinnerStep, envelopeOpen, stepIndex]);

  const canGoBack = phase !== "overture";
  const canGoForward = phase !== "curtain";

  let advanceLabel = "Continuar";
  if (phase === "overture") {
    advanceLabel = "Alzar el telón";
  } else if (phase === "intro") {
    advanceLabel = isBalonScene
      ? "Iniciar cuenta atrás ▶"
      : isInterludeScene
        ? "Ver actuación en directo ▶"
        : isDirect
          ? sceneIndex + 1 < scenes.length
            ? "Siguiente categoría"
            : "Ver telón final"
          : "Ver resultados";
  } else if (phase === "reveal") {
    if (isBalonScene && scene) {
      const steps = buildBalonSteps(scene.category);
      const currentStep = steps[stepIndex];
      if (currentStep?.type === "countdown") {
        advanceLabel = currentStep.isRemainingThree
          ? "Ver anuncio del ganador (Video) ▶"
          : "Siguiente puesto ▶";
      } else if (currentStep?.type === "video") {
        advanceLabel = "Ver podio definitivo ▶";
      } else if (currentStep?.type === "podium") {
        advanceLabel = "Ver telón final ✦";
      } else {
        advanceLabel = "Continuar ▶";
      }
    } else if (isInterludeScene) {
      advanceLabel = "Ir al Balón d'Or ✦";
    } else if (isWinnerStep && !envelopeOpen && !noVotes) {
      advanceLabel = "Abrir sobre ✦";
    } else if (stepIndex + 1 < (scene?.groups.length ?? 0)) {
      advanceLabel = "Siguiente puesto";
    } else if (sceneIndex + 1 < scenes.length) {
      advanceLabel = "Siguiente categoría";
    } else {
      advanceLabel = "Ver telón final";
    }
  }

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.key === "ArrowRight" || e.key === " " || e.key === "Enter") {
        if (canGoForward) {
          e.preventDefault();
          advance();
        }
      } else if (e.key === "ArrowLeft") {
        if (canGoBack) {
          e.preventDefault();
          regresar();
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [advance, regresar, canGoBack, canGoForward]);

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
      <main className="stage spotlight vignette-stage relative flex min-h-dvh flex-col overflow-hidden text-ivory">
        <GoldConfetti active={showConfetti} />

        {/* Flechas de navegación laterales flotantes */}
        {canGoBack ? (
          <button
            type="button"
            onClick={regresar}
            aria-label="Regresar escena anterior"
            title="Regresar (Flecha izquierda)"
            className="group fixed left-3 sm:left-6 top-1/2 -translate-y-1/2 z-30 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center border border-ivory/30 bg-stage/85 text-ivory/80 backdrop-blur-md shadow-2xl transition-all duration-200 hover:scale-105 hover:border-foil-bright hover:text-foil-bright hover:bg-stage-lift active:scale-95"
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        ) : null}

        {canGoForward ? (
          <button
            type="button"
            onClick={advance}
            aria-label="Avanzar siguiente escena"
            title="Avanzar (Flecha derecha o Espacio)"
            className="group fixed right-3 sm:right-6 top-1/2 -translate-y-1/2 z-30 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center border border-ivory/30 bg-stage/85 text-ivory/80 backdrop-blur-md shadow-2xl transition-all duration-200 hover:scale-105 hover:border-foil-bright hover:text-foil-bright hover:bg-stage-lift active:scale-95"
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        ) : null}

        <header className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-4 py-4">
          <span className="flex items-center gap-2" aria-label={`Escena ${Math.max(sceneIndex + 1, 0)} de ${scenes.length}`}>
            {scenes.map((item, index) => (
              <span
                key={item.category.key}
                className={`block h-1.5 w-1.5 rotate-45 border ${index < sceneIndex
                  ? "border-foil bg-foil"
                  : index === sceneIndex
                    ? "border-foil-bright bg-foil-bright"
                    : "border-ivory/40"
                  }`}
              />
            ))}
          </span>
          <div className="flex items-center gap-3" onClick={(event) => event.stopPropagation()}>
            {preview ? (
              <p
                aria-label="Vista previa — solo visible para el capitán"
                className="caps-line-tight border border-ivory/40 px-2 py-1 font-caps text-[9px] tracking-[0.2em] text-foil-bright uppercase"
              >
                Vista previa
              </p>
            ) : null}
            <SoundToggle muted={muted} onToggle={toggleMute} />
            <Link
              href="/"
              className="caps-line-tight font-caps text-[9px] text-ivory/60 underline decoration-ivory/40 underline-offset-4 transition-colors hover:text-ivory"
            >
              Salir
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
              <h1>
                <Image
                  src={mainLogoImage}
                  alt="El Chin Ballon d'Or"
                  className="h-auto w-[min(72vw,340px)]"
                  priority
                />
              </h1>
              <p className="caps-line font-caps text-[10px] text-ivory/80">
                Primera Edición · Temporada 2025/2026
              </p>
              <p className="max-w-[40ch] text-[14px] leading-relaxed text-ivory/70 italic">
                La ceremonia está por empezar
              </p>
            </motion.section>
          ) : null}

          {phase === "intro" && scene && isOlivadaScene ? (
            <OlivadaIntro
              key="intro-olivada"
              category={scene.category}
              logo={sceneLogo?.src ?? null}
              number={sceneIndex + 1}
              voters={voters}
            />
          ) : null}

          {phase === "reveal" && scene && isOlivadaScene && !noVotes ? (
            <OlivadaReveal
              key="reveal-olivada"
              groups={scene.groups}
              stepIndex={stepIndex}
              envelopeOpen={envelopeOpen}
            />
          ) : null}

          {phase === "intro" && scene && isPuskasScene ? (
            <PuskasIntro
              key="intro-puskas"
              category={scene.category}
              logo={sceneLogo?.src ?? null}
              number={sceneIndex + 1}
              voters={voters}
            />
          ) : null}

          {phase === "reveal" && scene && isPuskasScene && !noVotes ? (
            <PuskasReveal
              key="reveal-puskas"
              groups={scene.groups}
              stepIndex={stepIndex}
              envelopeOpen={envelopeOpen}
            />
          ) : null}

          {phase === "reveal" && scene && isTeamScene ? (
            <TeamReveal key="reveal-team" open={envelopeOpen} />
          ) : null}

          {phase === "reveal" && scene && isInterludeScene ? (
            <LivePerformanceScene
              key="reveal-interlude"
              muted={muted}
            />
          ) : null}

          {phase === "intro" && scene && isCoachScene ? (
            <CoachScene
              key="intro-coach"
              category={scene.category}
              groups={scene.groups}
              logo={sceneLogo?.src ?? null}
              number={sceneIndex + 1}
            />
          ) : null}

          {phase === "intro" && scene && isParleyScene ? (
            <ParleyScene
              key="intro-parley"
              category={scene.category}
              groups={scene.groups}
              logo={sceneLogo?.src ?? null}
              number={sceneIndex + 1}
            />
          ) : null}

          {phase === "intro" && scene && isInterludeScene ? (
            <LivePerformanceIntro
              key="intro-interlude"
              number={sceneIndex + 1}
            />
          ) : null}

          {phase === "intro" && scene && isBalonScene ? (
            <BalonIntro
              key="intro-balon"
              category={scene.category}
              voters={voters}
            />
          ) : null}

          {phase === "reveal" && scene && isBalonScene ? (
            <BalonReveal
              key="reveal-balon"
              category={scene.category}
              stepIndex={stepIndex}
              muted={muted}
            />
          ) : null}

          {phase === "intro" && scene && !isOlivadaScene && !isPuskasScene && !isCoachScene && !isParleyScene && !isInterludeScene && !isBalonScene ? (
            <motion.section
              key={`intro-${scene.category.key}`}
              {...fade}
              className="relative z-10 flex flex-1 flex-col items-center justify-center gap-6 px-8 py-20 text-center"
            >
              <h2>
                {sceneLogo ? (
                  <Image
                    src={sceneLogo.src}
                    alt={scene.category.title}
                    className={`h-auto ${sceneLogo.wide ? "w-[min(80vw,360px)]" : "w-[min(52vw,240px)]"
                      }`}
                  />
                ) : (
                  <span
                    className="font-display font-bold uppercase text-ivory"
                    style={{ fontSize: "clamp(1.7rem, 7.5vw, 2.6rem)", letterSpacing: "0.05em" }}
                  >
                    {scene.category.title}
                  </span>
                )}
              </h2>
              {scene.category.tagline ? (
                <p className="max-w-[44ch] text-[14px] leading-relaxed text-ivory/70 italic">
                  {scene.category.tagline}
                </p>
              ) : null}
              {scene.category.kind !== "ceremonial" ? (
                <p className="caps-line-tight font-caps text-[10px] text-ivory/60">
                  Los nominados
                </p>
              ) : (
                <p className="caps-line-tight font-caps text-[10px] text-ivory/60">
                  Premio del comité · sin votación
                </p>
              )}
              {scene.category.key === "puskas" || scene.category.key === "olivada" ? (
                <div className="flex w-full max-w-[430px] flex-col gap-2.5 text-left">
                  {scene.category.nominees.map((nominee) => (
                    <ChatBubble
                      key={nominee.id}
                      author={nominee.memberName ?? nominee.authorName ?? "Anónimo"}
                      at={nominee.messageAt}
                      text={nominee.messageText}
                      compact
                    >
                      {nominee.mediaUrl ? (
                        <MediaFrame url={nominee.mediaUrl} type={nominee.mediaType} compact />
                      ) : null}
                    </ChatBubble>
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

          {phase === "reveal" && scene && !noVotes && !isCustomScene ? (
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
                        Y el ganador es…
                      </p>
                      <Envelope open={false} />
                    </>
                  ) : (
                    <>
                      <p className="caps-line font-caps text-[10px] text-foil-bright">
                        {group.label}
                        {group.exAequo ? " · empate" : ""}
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
                              className={`font-display font-bold uppercase leading-tight ${isWinnerStep ? "text-foil" : "text-ink"
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
                          {entry.mediaUrl ? (
                            <div className="mt-4">
                              <MediaFrame url={entry.mediaUrl} type={entry.mediaType} />
                            </div>
                          ) : null}
                          <p className="tabular mt-4 text-[12px] tracking-[0.05em] text-ink-soft">
                            {entry.stats.join(" · ")}
                          </p>
                        </motion.article>
                      ))}
                      {isWinnerStep && isBalonScene && envelopeOpen ? (
                        <Image
                          src={mainLogoImage}
                          alt=""
                          aria-hidden="true"
                          className="h-auto w-[min(42vw,170px)]"
                        />
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
              <p className="caps-line font-caps text-[10px] text-foil-bright">Telón</p>
              <h2
                className="font-display font-bold uppercase text-ivory"
                style={{ fontSize: "clamp(1.9rem, 8.5vw, 3rem)", letterSpacing: "0.05em" }}
              >
                Fin de la
                <br />
                Primera Ceremonia
              </h2>
              <p className="max-w-[42ch] text-[14px] leading-relaxed text-ivory/70 italic">
                Gracias a toda la peña. Los sobres viajan al archivo y las cifras,
                al acta oficial.
              </p>
              <div className="flex w-full max-w-[420px] flex-col gap-3">
                <CouponLink
                  href="/acta"
                  label="Acta oficial — las cifras"
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
                  label="Ver la ceremonia otra vez"
                  invert={false}
                />
              </div>
              <p className="caps-line-tight font-caps text-[9px] text-ivory/50">
                Chin Ballon d&apos;Or · hasta el año que viene
              </p>
            </motion.section>
          ) : null}
        </AnimatePresence>

        {phase !== "curtain" ? (
          <footer className="relative z-10 flex flex-col items-center gap-3 px-6 pb-7">
            <div className="flex w-full max-w-[440px] items-center justify-center gap-3">
              {canGoBack ? (
                <button
                  type="button"
                  onClick={regresar}
                  className="plate-press flex flex-1 items-center justify-center gap-2 border border-ivory/35 bg-stage-lift/90 px-4 py-3.5 font-caps text-[12px] tracking-wider text-ivory transition-all hover:border-foil-bright hover:text-foil-bright active:translate-y-px"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                  <span>Regresar</span>
                </button>
              ) : null}

              <button
                type="button"
                onClick={advance}
                className={`plate-press flex flex-1 items-center justify-center gap-2 border px-4 py-3.5 font-caps text-[12px] tracking-wider transition-all active:translate-y-px ${(isWinnerStep && !envelopeOpen) || (isBalonScene && phase === "reveal")
                  ? "border-foil bg-foil/25 text-foil-bright hover:bg-foil/35 shadow-lg shadow-foil/10"
                  : "border-ink bg-ivory text-ink hover:bg-ivory-deep"
                  }`}
              >
                <span>{advanceLabel}</span>
                <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>

            <p className="caps-line-tight font-caps text-[10px] tracking-[0.2em] text-ivory/50 uppercase">
              Usa los botones de flecha o el teclado (← / →)
            </p>
          </footer>
        ) : (
          <footer className="relative z-10 flex justify-center px-6 pb-7">
            <button
              type="button"
              onClick={regresar}
              className="flex items-center gap-2 font-caps text-[11px] text-ivory/60 hover:text-ivory tracking-wider uppercase transition-colors"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              <span>Regresar a la última escena</span>
            </button>
          </footer>
        )}
      </main>
    </MotionConfig>
  );
}
