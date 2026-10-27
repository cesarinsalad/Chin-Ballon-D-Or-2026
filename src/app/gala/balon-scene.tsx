"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import type { CeremonyCategory, RankedResult } from "@/lib/event";
import { Monogram } from "@/components/monogram";
import { mainLogo } from "@/components/logos";

const mainLogoImage = mainLogo();
const EASE = [0.16, 1, 0.3, 1] as const;

export type BalonTally = {
  nomineeId: number;
  name: string;
  photoUrl: string | null;
  position: number;
  points: number;
  firsts: number;
  appearances: number;
  stats: string[];
};

export function buildBalonTallyList(category: CeremonyCategory): BalonTally[] {
  const ballots = Math.max(category.ballotsCount, 1);
  const tallyMap = new Map<number, (typeof category.tallies)[number]>();
  for (const t of category.tallies) {
    tallyMap.set(t.nomineeId, t);
  }

  const list: BalonTally[] = category.nominees.map((nominee) => {
    const t = tallyMap.get(nominee.id);
    const rankedT = t && "points" in t ? (t as RankedResult) : null;
    const points = rankedT?.points ?? 0;
    const firsts = rankedT?.firsts ?? 0;
    const appearances = rankedT?.appearances ?? 0;
    const position = t?.position ?? 99;

    return {
      nomineeId: nominee.id,
      name: nominee.memberName ?? nominee.authorName ?? "—",
      photoUrl: nominee.photoUrl,
      position,
      points,
      firsts,
      appearances,
      stats: [
        firsts > 0 ? `${firsts} ${firsts === 1 ? "primer puesto" : "primeros puestos"}` : null,
        appearances > 0 ? `${Math.round((appearances / ballots) * 100)}% de apoyo` : null,
      ].filter(Boolean) as string[],
    };
  });

  // Ordenar por puntos desc, primeros puestos desc, nombre asc
  list.sort((a, b) => b.points - a.points || b.firsts - a.firsts || a.name.localeCompare(b.name));

  // Normalizar posiciones para los que no tenían votos
  let currentPos = 1;
  list.forEach((entry, i) => {
    if (i > 0) {
      const prev = list[i - 1];
      if (prev.points !== entry.points || prev.firsts !== entry.firsts) {
        currentPos = i + 1;
      }
    }
    entry.position = currentPos;
  });

  return list;
}

/* ----------------------------------------------------
 * 1. Intro del Chin Ballon d'Or
 * ---------------------------------------------------- */
export function BalonIntro({
  category,
  voters,
}: {
  category: CeremonyCategory;
  voters: number;
}) {
  return (
    <motion.section
      key="intro-balon"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.4 }}
      className="relative z-10 flex flex-1 flex-col items-center justify-center gap-6 px-6 py-20 text-center"
    >
      <motion.p
        className="caps-line relative font-caps text-[10px] tracking-[0.25em] text-foil-bright uppercase"
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        ✦ El Gran Premio Final · {voters} Votantes ✦
      </motion.p>

      <motion.div
        className="relative"
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, ease: EASE, delay: 0.2 }}
      >
        <Image
          src={mainLogoImage}
          alt={category.title}
          className="h-auto w-[min(80vw,360px)]"
          priority
        />
      </motion.div>

      <motion.p
        className="max-w-[44ch] text-[15px] leading-relaxed text-ivory/80 italic"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        El galardón supremo del chin. Todos los nominados a la noche definitiva:
      </motion.p>

      {/* Rejilla de los 7 nominados */}
      <motion.div
        className="mt-2 flex max-w-[450px] flex-wrap justify-center gap-3"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE, delay: 0.7 }}
      >
        {category.nominees.map((nominee) => (
          <div key={nominee.id} className="flex flex-col items-center gap-1">
            <Monogram
              name={nominee.memberName ?? "—"}
              photoUrl={nominee.photoUrl}
              size={46}
            />
            <span className="font-caps text-[9px] tracking-wider text-ivory/70">
              {nominee.memberName}
            </span>
          </div>
        ))}
      </motion.div>

      <motion.p
        className="caps-line-tight relative font-caps text-[10px] tracking-[0.2em] text-ivory/50 uppercase"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        Pulsa avanzar para iniciar la revelación del podio
      </motion.p>
    </motion.section>
  );
}

/* ----------------------------------------------------
 * 2. Cuenta atrás: Revelación de puestos 7º a 4º
 * ---------------------------------------------------- */
export function BalonCountdown({
  stepTally,
  revealedSoFar,
  isRemainingThree,
  top3Names,
}: {
  stepTally: BalonTally;
  revealedSoFar: BalonTally[];
  isRemainingThree: boolean;
  top3Names: string[];
}) {
  return (
    <motion.section
      key={`countdown-${stepTally.position}-${stepTally.nomineeId}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35 }}
      className="relative z-10 flex flex-1 flex-col items-center justify-center gap-5 px-6 py-16 text-center"
    >
      <p className="caps-line font-caps text-[10px] tracking-[0.25em] text-foil-bright uppercase">
        Cuenta Atrás · Chin Ballon d&apos;Or
      </p>

      {/* Placa del puesto revelado */}
      <motion.article
        className="paper relative w-full max-w-[420px] border-2 border-ink bg-ivory p-5 text-ink shadow-2xl"
        initial={{ opacity: 0, scale: 0.88, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 18 }}
      >
        <span
          className="pointer-events-none absolute inset-0 border border-ink/40"
          style={{ margin: 4 }}
          aria-hidden="true"
        />

        <div className="flex items-center justify-between border-b border-dashed border-ink/40 pb-2">
          <span className="font-caps text-[11px] font-bold tracking-widest text-foil-ink uppercase">
            {stepTally.position}º PUESTO
          </span>
          <span className="font-caps text-[10px] tracking-wider text-ink-faint uppercase">
            TOP 5 CHINPARLEY
          </span>
        </div>

        <div className="my-3 flex items-center justify-center gap-4">
          <Monogram name={stepTally.name} photoUrl={stepTally.photoUrl} size={54} />
          <div className="text-left">
            <span className="block font-caps text-[9px] tracking-widest text-ink-soft uppercase">
              Clasificación Oficial
            </span>
            <p
              className="font-display text-[24px] font-bold uppercase leading-tight text-ink tracking-wide"
            >
              {stepTally.name}
            </p>
          </div>
        </div>

        {stepTally.stats.length > 0 ? (
          <p className="tabular border-t border-dashed border-ink/30 pt-2 text-[11px] tracking-[0.05em] text-ink-soft">
            {stepTally.stats.join(" · ")}
          </p>
        ) : null}
      </motion.article>

      {/* Si se reveló el 4º puesto: Momento de máxima tensión -> ¡Quedan 3! */}
      {isRemainingThree ? (
        <motion.div
          className="relative w-full max-w-[420px] border border-foil/60 bg-foil/15 p-4 text-center shadow-lg"
          initial={{ opacity: 0, scale: 0.9, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 16, delay: 0.4 }}
        >
          <p className="font-caps text-[10px] font-bold tracking-[0.25em] text-foil-bright uppercase">
            ✦ ¡SOLO QUEDAN 3 FINALISTAS! ✦
          </p>
          <h3 className="mt-1 font-display text-[19px] font-bold text-ivory">
            {top3Names.join(" · ")}
          </h3>
          <p className="mt-1 text-[12px] italic text-ivory/75">
            El podio está definido, pero el ganador permanece en absoluto secreto.
          </p>
        </motion.div>
      ) : null}

      {/* Historial de puestos ya revelados */}
      {revealedSoFar.length > 1 ? (
        <div className="mt-1 flex w-full max-w-[420px] flex-col gap-1 text-left">
          <span className="font-caps text-[9px] tracking-wider text-ivory/50 uppercase">
            Puestos revelados:
          </span>
          <div className="flex flex-wrap gap-2">
            {revealedSoFar.map((t) => (
              <span
                key={t.nomineeId}
                className="border border-ivory/25 bg-stage-lift px-2.5 py-1 font-caps text-[10px] text-ivory/75"
              >
                <strong className="text-foil-bright">{t.position}º</strong> {t.name}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </motion.section>
  );
}

/* ----------------------------------------------------
 * 3. El Video de David (Revelación del Ganador)
 * ---------------------------------------------------- */
export function BalonVideoReveal({
  muted = false,
  onEnded,
}: {
  muted?: boolean;
  onEnded?: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [ended, setEnded] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = muted;
    const promise = video.play();
    if (promise !== undefined) {
      promise.catch(() => {
        video.muted = true;
        video.play().catch(() => { });
      });
    }
  }, [muted]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = muted;
    }
  }, [muted]);

  const handleReplay = () => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = 0;
    video.play();
    setEnded(false);
  };

  return (
    <motion.section
      key="balon-video-reveal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.4 }}
      className="relative z-10 flex flex-1 flex-col items-center justify-center gap-5 px-4 py-16 text-center"
    >
      {/* Luz cenital de foco dorado */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <motion.div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 50% 30%, rgba(200, 164, 92, 0.2) 0%, rgba(18, 16, 12, 0) 70%)",
          }}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <motion.p
        className="caps-line relative font-caps text-[10px] tracking-[0.25em] text-foil-bright uppercase"
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
      >
        ✦ COMUNICADO OFICIAL DEL JURADO ✦
      </motion.p>

      <motion.div
        className="relative flex flex-col items-center gap-1"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: EASE, delay: 0.15 }}
      >
        <h2
          className="font-display font-bold uppercase text-ivory tracking-wide"
          style={{ fontSize: "clamp(1.7rem, 7vw, 2.7rem)" }}
        >
          El Ganador del Balón d&apos;Or
        </h2>
        <p className="max-w-[42ch] text-[14px] leading-relaxed text-ivory/80 italic">
          Sir Richard Brito abre el sobre oficial y desvela el ganador definitivo de la noche
        </p>
      </motion.div>

      {/* Pantalla del Video */}
      <motion.div
        className="relative w-full max-w-[400px] overflow-hidden border-2 border-foil/70 bg-black shadow-2xl"
        initial={{ opacity: 0, y: 25, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 180, damping: 18, delay: 0.3 }}
      >
        <span
          className="pointer-events-none absolute inset-0 z-20 border border-foil/30"
          style={{ margin: 3 }}
          aria-hidden="true"
        />

        <div className="absolute left-3 top-3 z-20 flex items-center gap-2 rounded border border-foil/40 bg-stage/85 px-2.5 py-1 text-[9px] font-caps tracking-widest text-foil-bright backdrop-blur-sm">
          <span className="h-2 w-2 rounded-full bg-foil-bright animate-ping" />
          <span>REVELACIÓN EN DIRECTO</span>
        </div>

        <video
          ref={videoRef}
          src="/video/video-david.mp4"
          playsInline
          autoPlay
          controls
          className="max-h-[55vh] w-full object-contain bg-black"
          onEnded={() => {
            setEnded(true);
            onEnded?.();
          }}
        />

        {ended ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-stage/85 p-4 backdrop-blur-xs"
          >
            <p className="font-display text-[18px] font-bold text-foil-bright">
              ¡El misterio ha sido desvelado!
            </p>
            <button
              type="button"
              onClick={handleReplay}
              className="plate-press flex items-center gap-2 border border-ivory/40 bg-ivory px-3.5 py-2 font-caps text-[11px] font-bold text-ink hover:bg-ivory-deep"
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
              </svg>
              <span>Repetir revelación</span>
            </button>
          </motion.div>
        ) : null}
      </motion.div>

      <motion.p
        className="caps-line-tight relative font-caps text-[10px] tracking-[0.2em] text-ivory/60 uppercase"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        Pulsa avanzar para proclamar el Podio Final del Chin Ballon d&apos;Or
      </motion.p>
    </motion.section>
  );
}

/* ----------------------------------------------------
 * 4. El Gran Podio Final (1º, 2º, 3º)
 * ---------------------------------------------------- */
export function BalonFinalPodium({
  first,
  second,
  third,
}: {
  first: BalonTally;
  second: BalonTally | null;
  third: BalonTally | null;
}) {
  return (
    <motion.section
      key="balon-final-podium"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="relative z-10 flex flex-1 flex-col items-center justify-center gap-6 px-6 py-16 text-center"
    >
      <motion.p
        className="caps-line font-caps text-[10px] tracking-[0.25em] text-foil-bright uppercase"
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
      >
        ✦ El Cuadro de Honor Definitivo ✦
      </motion.p>

      {/* 1er Lugar: El Campeón del Chin Ballon d'Or */}
      <motion.article
        className="paper relative w-full max-w-[440px] border-2 border-foil bg-ivory px-6 py-6 text-ink shadow-2xl"
        initial={{ opacity: 0, scale: 0.85, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 180, damping: 16, delay: 0.2 }}
      >
        <span
          className="pointer-events-none absolute inset-0 border border-foil/50"
          style={{ margin: 4 }}
          aria-hidden="true"
        />

        <div className="flex items-center justify-center gap-2">
          <span className="font-caps text-[11px] font-bold tracking-[0.25em] text-foil uppercase">
            ✦ GANADOR DEL CHIN BALLON D&apos;OR 2026 ✦
          </span>
        </div>

        <div className="mt-3 flex items-center justify-center gap-4">
          <Monogram name={first.name} photoUrl={first.photoUrl} size={68} foil />
          <div className="text-left">
            <span className="block font-caps text-[10px] tracking-widest text-foil-ink uppercase">
              1º Lugar Absoluto
            </span>
            <p
              className="font-display font-bold uppercase leading-none text-foil tracking-wide"
              style={{ fontSize: "clamp(1.8rem, 7.5vw, 2.7rem)" }}
            >
              {first.name}
            </p>
          </div>
        </div>

        {first.stats.length > 0 ? (
          <p className="tabular mt-3.5 border-t border-dashed border-foil/30 pt-2 text-[12px] tracking-[0.05em] text-ink-soft">
            {first.stats.join(" · ")}
          </p>
        ) : null}

        <div className="mt-3 flex justify-center">
          <Image
            src={mainLogoImage}
            alt=""
            aria-hidden="true"
            className="h-auto w-[min(45vw,180px)]"
          />
        </div>
      </motion.article>

      {/* 2º y 3º Puesto */}
      <div className="grid w-full max-w-[440px] grid-cols-2 gap-3">
        {second ? (
          <motion.div
            className="border border-ivory/30 bg-stage-lift/90 p-3 text-left shadow-md"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.6 }}
          >
            <span className="font-caps text-[9px] tracking-wider text-ivory/50 uppercase">
              2º Puesto · Plata
            </span>
            <div className="mt-1 flex items-center gap-2">
              <Monogram name={second.name} photoUrl={second.photoUrl} size={36} />
              <p className="font-display text-[15px] font-bold uppercase text-ivory">
                {second.name}
              </p>
            </div>
            {second.stats.length > 0 ? (
              <p className="tabular mt-1 text-[11px] text-ivory/60">
                {second.stats.join(" · ")}
              </p>
            ) : null}
          </motion.div>
        ) : null}

        {third ? (
          <motion.div
            className="border border-ivory/30 bg-stage-lift/90 p-3 text-left shadow-md"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.75 }}
          >
            <span className="font-caps text-[9px] tracking-wider text-ivory/50 uppercase">
              3º Puesto · Bronce
            </span>
            <div className="mt-1 flex items-center gap-2">
              <Monogram name={third.name} photoUrl={third.photoUrl} size={36} />
              <p className="font-display text-[15px] font-bold uppercase text-ivory">
                {third.name}
              </p>
            </div>
            {third.stats.length > 0 ? (
              <p className="tabular mt-1 text-[11px] text-ivory/60">
                {third.stats.join(" · ")}
              </p>
            ) : null}
          </motion.div>
        ) : null}
      </div>

      <motion.p
        className="caps-line-tight relative font-caps text-[9px] tracking-[0.25em] text-ivory/50 uppercase"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        Fin del recuento de la gala · Pulsa avanzar para cerrar el telón
      </motion.p>
    </motion.section>
  );
}

export type BalonStep =
  | {
    type: "countdown";
    current: BalonTally;
    revealed: BalonTally[];
    isRemainingThree: boolean;
    top3Names: string[];
  }
  | {
    type: "video";
  }
  | {
    type: "podium";
    first: BalonTally;
    second: BalonTally | null;
    third: BalonTally | null;
  };

export function buildBalonSteps(category: CeremonyCategory): BalonStep[] {
  const list = buildBalonTallyList(category);
  // En el reveal solo se muestra el top 5
  const top5 = list.slice(0, 5);
  const top3 = top5.slice(0, 3);
  // Nombres de los 3 finalistas en orden alfabético para preservar el absoluto secreto
  const top3Names = top3.map((t) => t.name).sort((a, b) => a.localeCompare(b));

  // Puestos del top 5 que no están en el top 3 (5º y 4º en cuenta atrás)
  const countdownList = top5.slice(3).reverse();
  const steps: BalonStep[] = [];

  for (let i = 0; i < countdownList.length; i++) {
    steps.push({
      type: "countdown",
      current: countdownList[i],
      revealed: countdownList.slice(0, i + 1),
      isRemainingThree: i === countdownList.length - 1,
      top3Names,
    });
  }

  steps.push({
    type: "video",
  });

  steps.push({
    type: "podium",
    first: top3[0] ?? list[0],
    second: top3[1] ?? null,
    third: top3[2] ?? null,
  });

  return steps;
}

export function BalonReveal({
  category,
  stepIndex,
  muted,
  onVideoEnded,
}: {
  category: CeremonyCategory;
  stepIndex: number;
  muted: boolean;
  onVideoEnded?: () => void;
}) {
  const steps = buildBalonSteps(category);
  const currentStep = steps[stepIndex] ?? steps[steps.length - 1];

  if (!currentStep) return null;

  if (currentStep.type === "countdown") {
    return (
      <BalonCountdown
        key={`countdown-${currentStep.current.nomineeId}-${stepIndex}`}
        stepTally={currentStep.current}
        revealedSoFar={currentStep.revealed}
        isRemainingThree={currentStep.isRemainingThree}
        top3Names={currentStep.top3Names}
      />
    );
  }

  if (currentStep.type === "video") {
    return (
      <BalonVideoReveal
        key="balon-video-reveal"
        muted={muted}
        onEnded={onVideoEnded}
      />
    );
  }

  return (
    <BalonFinalPodium
      key="balon-final-podium"
      first={currentStep.first}
      second={currentStep.second}
      third={currentStep.third}
    />
  );
}

