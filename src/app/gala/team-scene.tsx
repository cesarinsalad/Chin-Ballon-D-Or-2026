"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import teamPhoto from "@/assets/resultado-equipo-del-ano.jpeg";

const EASE = [0.16, 1, 0.3, 1] as const;

// Coordenadas de cada cara en la foto (viewBox = tamaño real de la imagen)
const W = teamPhoto.width;
const H = teamPhoto.height;
const SPOTS = [
  { x: 0.496, y: 0.8, delay: 0.6 }, // portero
  { x: 0.265, y: 0.52, delay: 1.4 }, // izquierda
  { x: 0.745, y: 0.52, delay: 1.4 }, // derecha
  { x: 0.496, y: 0.615, delay: 2.2 }, // centro
  { x: 0.496, y: 0.42, delay: 3.0 }, // delantero
];
const FULL_REVEAL = 3.9;

export function TeamReveal({ open }: { open: boolean }) {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="relative z-10 flex flex-1 flex-col items-center justify-center gap-5 px-6 py-20 text-center"
    >
      <div
        className="relative w-full max-w-[420px] overflow-hidden border border-ivory/25"
        style={{ aspectRatio: `${W} / ${H}` }}
      >
        {/* Foto con Ken Burns */}
        <motion.div
          className="absolute inset-0"
          animate={
            open
              ? { scale: [1.12, 1], filter: ["blur(0px)", "blur(0px)"] }
              : { scale: 1.15, filter: "blur(18px) brightness(0.35)" }
          }
          transition={{ duration: open ? 5 : 0.6, ease: EASE }}
        >
          <Image
            src={teamPhoto}
            alt={open ? "El equipo del año" : ""}
            fill
            sizes="420px"
            className="object-cover"
            priority
          />
        </motion.div>

        {/* Máscara de focos: se abre un círculo por jugador */}
        <AnimatePresence>
          {open ? (
            <motion.svg
              key="mask"
              viewBox={`0 0 ${W} ${H}`}
              className="pointer-events-none absolute inset-0 h-full w-full"
              initial={{ opacity: 1 }}
              animate={{ opacity: [1, 1, 0] }}
              transition={{ duration: FULL_REVEAL + 0.9, times: [0, FULL_REVEAL / (FULL_REVEAL + 0.9), 1] }}
              aria-hidden="true"
            >
              <defs>
                <mask id="team-spots">
                  <rect width={W} height={H} fill="white" />
                  {SPOTS.map((s, i) => (
                    <motion.circle
                      key={i}
                      cx={s.x * W}
                      cy={s.y * H}
                      fill="black"
                      initial={{ r: 0 }}
                      animate={{ r: W * 0.13 }}
                      transition={{ type: "spring", stiffness: 120, damping: 14, delay: s.delay }}
                    />
                  ))}
                </mask>
              </defs>
              <rect width={W} height={H} fill="#12100c" fillOpacity="0.92" mask="url(#team-spots)" />
              {/* anillo dorado que acompaña cada foco */}
              {SPOTS.map((s, i) => (
                <motion.circle
                  key={`ring-${i}`}
                  cx={s.x * W}
                  cy={s.y * H}
                  fill="none"
                  stroke="#c8a45c"
                  strokeWidth="3"
                  initial={{ r: 0, opacity: 0 }}
                  animate={{ r: [0, W * 0.13, W * 0.17], opacity: [0, 1, 0] }}
                  transition={{ duration: 1.1, ease: "easeOut", delay: s.delay }}
                />
              ))}
            </motion.svg>
          ) : null}
        </AnimatePresence>

        {/* Destello dorado que barre la foto al final */}
        {open ? (
          <motion.span
            className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2"
            style={{
              background:
                "linear-gradient(100deg, rgba(200,164,92,0) 0%, rgba(239,230,210,0.35) 50%, rgba(200,164,92,0) 100%)",
            }}
            initial={{ x: "0%" }}
            animate={{ x: "400%" }}
            transition={{ duration: 1.2, ease: "easeInOut", delay: FULL_REVEAL + 0.4 }}
            aria-hidden="true"
          />
        ) : null}

        {/* Estado previo al sobre */}
        <AnimatePresence>
          {!open ? (
            <motion.div
              key="pending"
              className="absolute inset-0 flex flex-col items-center justify-center gap-4"
              exit={{ opacity: 0 }}
            >
              <motion.span
                className="caps-line font-caps text-[11px] text-ivory/80"
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.6, repeat: Infinity }}
              >
                Y el equipo del año es…
              </motion.span>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Marco de doble filete */}
        <span
          className="pointer-events-none absolute inset-0 border border-ivory/30"
          style={{ margin: 4 }}
          aria-hidden="true"
        />
      </div>

      {open ? (
        <motion.p
          className="caps-line font-caps text-[10px] text-foil-bright"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: FULL_REVEAL + 0.6 }}
        >
          El cinco ideal de la temporada
        </motion.p>
      ) : null}
    </motion.section>
  );
}
