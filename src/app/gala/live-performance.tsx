"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const EASE = [0.16, 1, 0.3, 1] as const;

export function LivePerformanceIntro({
  number,
}: {
  number: number;
}) {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.4 }}
      className="relative z-10 flex flex-1 flex-col items-center justify-center gap-6 px-6 py-20 text-center"
    >
      {/* Luz cenital de foco */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <motion.div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 50% 32%, rgba(200, 164, 92, 0.18) 0%, rgba(18, 16, 12, 0) 70%)",
          }}
          animate={{ scale: [1, 1.06, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <motion.p
        className="caps-line relative font-caps text-[10px] tracking-[0.25em] text-foil-bright uppercase"
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        ✦ Acto Especial ✦
      </motion.p>

      {/* Cartel de teatro / Cartelera de concierto */}
      <motion.div
        className="paper relative w-full max-w-[420px] border-2 border-ink bg-ivory p-6 text-ink shadow-2xl"
        initial={{ opacity: 0, scale: 0.92, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 180, damping: 18, delay: 0.2 }}
      >
        {/* Doble filete interior */}
        <span
          className="pointer-events-none absolute inset-0 border border-ink/40"
          style={{ margin: 4 }}
          aria-hidden="true"
        />

        <div className="flex items-center justify-between border-b border-dashed border-ink/40 pb-2 text-left">
          <span className="font-caps text-[9px] tracking-[0.2em] text-ink-soft uppercase">
            Teatro Chin Ballon d&apos;Or
          </span>
          <span className="font-caps text-[9px] tracking-wider text-foil font-bold">
            SHOW EN DIRECTO
          </span>
        </div>

        {/* Icono de micrófono */}
        <div className="my-3 flex justify-center text-foil">
          <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="22" />
            <line x1="8" y1="22" x2="16" y2="22" />
          </svg>
        </div>

        <p className="font-caps text-[10px] tracking-[0.25em] text-foil-ink uppercase">
          Actuación Estelar
        </p>

        <h2
          className="font-display font-bold uppercase text-ink tracking-wide mt-1"
          style={{ fontSize: "clamp(1.9rem, 7.5vw, 2.6rem)" }}
        >
          Xavier de Jesús
        </h2>

        <div className="my-3 border-y border-dashed border-ink/30 py-2">
          <p className="font-display text-[15px] italic text-foil-ink font-semibold">
            &ldquo;Sinfonía en Eructo Mayor&rdquo;
          </p>
          <p className="font-caps text-[9px] tracking-wider text-ink-soft mt-0.5 uppercase">
            Pieza acústica experimental · Estreno exclusivo
          </p>
        </div>

        <p className="font-body text-[13px] leading-relaxed text-ink-soft italic px-2">
          Antes de revelar el codiciado Chin Ballon d&apos;Or, la sala hace una pausa de rigor para deleitar a la platea. Se ruega silencio y máxima compostura.
        </p>

        <div className="mt-4 flex items-center justify-between border-t border-dashed border-ink/40 pt-2 font-caps text-[9px] text-ink-faint">
          <span>FUNCIÓN ÚNICA</span>
          <span className="text-foil font-bold">A CONTINUACIÓN EN PANTALLA</span>
        </div>
      </motion.div>

      <motion.p
        className="caps-line-tight relative font-caps text-[10px] tracking-[0.2em] text-ivory/60 uppercase"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        Pulsa avanzar para dar paso a la actuación en vivo
      </motion.p>
    </motion.section>
  );
}

export function LivePerformanceScene({
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
      promise
        .catch(() => {
          // Si el navegador requiere interacción para reproducir con sonido, intentamos muted como fallback
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.4 }}
      className="relative z-10 flex flex-1 flex-col items-center justify-center gap-5 px-4 py-16 text-center"
    >
      {/* Luz cenital de escenario */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <motion.div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 50% 30%, rgba(200, 164, 92, 0.15) 0%, rgba(18, 16, 12, 0) 70%)",
          }}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <motion.p
        className="caps-line relative font-caps text-[10px] tracking-[0.25em] text-foil-bright uppercase"
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        ✦ Espectáculo de Gala · Transmisión en Vivo ✦
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
          Presentación en Vivo
        </h2>
        <p className="max-w-[42ch] text-[14px] leading-relaxed text-ivory/75 italic">
          Actuación acústica de gala: <strong className="text-foil-bright not-italic">Xavier de Jesús</strong> en directo antes del Balón d&apos;Or
        </p>
      </motion.div>

      {/* Pantalla de transmisión en directo */}
      <motion.div
        className="relative w-full max-w-[380px] overflow-hidden border-2 border-ivory/30 bg-black shadow-2xl"
        initial={{ opacity: 0, y: 30, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 180, damping: 18, delay: 0.3 }}
      >
        {/* Doble filete interior */}
        <span
          className="pointer-events-none absolute inset-0 z-20 border border-ivory/20"
          style={{ margin: 3 }}
          aria-hidden="true"
        />

        {/* Indicador EN VIVO */}
        <div className="absolute left-3 top-3 z-20 flex items-center gap-2 rounded border border-ivory/20 bg-stage/85 px-2.5 py-1 text-[9px] font-caps tracking-widest text-ivory backdrop-blur-sm">
          <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
          <span>EN DIRECTO</span>
        </div>

        {/* Video Player */}
        <video
          ref={videoRef}
          src="/video/xavier-eructo.mp4"
          playsInline
          autoPlay
          controls
          className="max-h-[55vh] w-full object-contain bg-black"
          onEnded={() => {
            setEnded(true);
            onEnded?.();
          }}
        />

        {/* Overlay al terminar la actuación */}
        {ended ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-stage/80 p-4 backdrop-blur-xs"
          >
            <p className="font-display text-[17px] font-bold text-foil-bright">
              ¡La sala se rinde en aplausos!
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
              <span>Repetir actuación</span>
            </button>
          </motion.div>
        ) : null}
      </motion.div>

      {/* Pie de escena */}
      <motion.p
        className="caps-line-tight relative font-caps text-[10px] tracking-[0.2em] text-ivory/60 uppercase"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        A continuación: El Chin Ballon d&apos;Or ✦ El gran premio
      </motion.p>
    </motion.section>
  );
}
