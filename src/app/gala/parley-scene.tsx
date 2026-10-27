"use client";

import { motion } from "framer-motion";
import Image, { type StaticImageData } from "next/image";
import type { CeremonyCategory } from "@/lib/event";
import { Monogram } from "@/components/monogram";

type Entry = {
  key: string;
  name: string;
  photoUrl: string | null;
  isMember: boolean;
};

type Group = {
  position: number;
  label: string;
  exAequo: boolean;
  entries: Entry[];
};

const EASE = [0.16, 1, 0.3, 1] as const;

function Crown({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M3 18 L5 7 L9.5 12 L12 4 L14.5 12 L19 7 L21 18 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="5" cy="6" r="1.2" fill="currentColor" />
      <circle cx="12" cy="3" r="1.2" fill="currentColor" />
      <circle cx="19" cy="6" r="1.2" fill="currentColor" />
      <line x1="3" y1="20" x2="21" y2="20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function CasinoChip({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.6" strokeDasharray="3 2" />
      <circle cx="12" cy="12" r="5" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    </svg>
  );
}

function Barcode({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 28" className={className} aria-hidden="true">
      <rect x="0" y="0" width="3" height="28" fill="currentColor" />
      <rect x="5" y="0" width="1.5" height="28" fill="currentColor" />
      <rect x="9" y="0" width="4" height="28" fill="currentColor" />
      <rect x="16" y="0" width="2" height="28" fill="currentColor" />
      <rect x="20" y="0" width="1" height="28" fill="currentColor" />
      <rect x="23" y="0" width="5" height="28" fill="currentColor" />
      <rect x="31" y="0" width="2" height="28" fill="currentColor" />
      <rect x="35" y="0" width="3.5" height="28" fill="currentColor" />
      <rect x="41" y="0" width="1.5" height="28" fill="currentColor" />
      <rect x="45" y="0" width="4" height="28" fill="currentColor" />
      <rect x="52" y="0" width="2" height="28" fill="currentColor" />
      <rect x="56" y="0" width="1" height="28" fill="currentColor" />
      <rect x="60" y="0" width="5" height="28" fill="currentColor" />
      <rect x="68" y="0" width="2" height="28" fill="currentColor" />
      <rect x="73" y="0" width="3" height="28" fill="currentColor" />
      <rect x="78" y="0" width="1.5" height="28" fill="currentColor" />
      <rect x="82" y="0" width="4" height="28" fill="currentColor" />
      <rect x="89" y="0" width="2" height="28" fill="currentColor" />
      <rect x="94" y="0" width="5" height="28" fill="currentColor" />
      <rect x="101" y="0" width="1.5" height="28" fill="currentColor" />
      <rect x="105" y="0" width="3" height="28" fill="currentColor" />
      <rect x="111" y="0" width="2" height="28" fill="currentColor" />
      <rect x="115" y="0" width="4" height="28" fill="currentColor" />
    </svg>
  );
}

export function ParleyScene({
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
  const first = byPos.get(1)?.entries[0] ?? null;
  const second = byPos.get(2)?.entries[0] ?? null;
  const third = byPos.get(3)?.entries[0] ?? null;
  const fourth = byPos.get(4)?.entries[0] ?? null;
  const fifth = byPos.get(5)?.entries[0] ?? null;

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.4 }}
      className="relative z-10 flex flex-1 flex-col items-center justify-center gap-6 px-4 py-20 text-center"
    >
      {/* Fondo tenue de chispas y fichas de apuestas */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <motion.div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 50% 35%, rgba(200, 164, 92, 0.12) 0%, rgba(18, 16, 12, 0) 70%)",
          }}
          animate={{ scale: [1, 1.08, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        {[
          { left: "10%", top: "25%", delay: 0 },
          { left: "86%", top: "30%", delay: 1.5 },
          { left: "18%", top: "72%", delay: 0.8 },
          { left: "82%", top: "68%", delay: 2.2 },
        ].map((pos, i) => (
          <motion.span
            key={i}
            className="absolute block text-foil-bright/35"
            style={{ left: pos.left, top: pos.top, width: 22 }}
            animate={{ y: [0, -10, 0], rotate: [0, 90, 180] }}
            transition={{ duration: 7, delay: pos.delay, repeat: Infinity, ease: "linear" }}
          >
            <CasinoChip className="h-auto w-full" />
          </motion.span>
        ))}
      </div>

      <motion.p
        className="caps-line relative font-caps text-[10px] tracking-[0.25em] text-foil-bright uppercase"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        Quiniela Oficial del Mundial
      </motion.p>

      <motion.div
        className="relative"
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: EASE, delay: 0.15 }}
      >
        {logo ? (
          <Image src={logo} alt={category.title} className="h-auto w-[min(70vw,310px)]" priority />
        ) : (
          <span
            className="font-display font-bold uppercase text-ivory"
            style={{ fontSize: "clamp(1.7rem, 7.5vw, 2.6rem)", letterSpacing: "0.05em" }}
          >
            {category.title}
          </span>
        )}
      </motion.div>

      {category.tagline ? (
        <motion.p
          className="relative max-w-[44ch] text-[14px] leading-relaxed text-ivory/70 italic"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {category.tagline}
        </motion.p>
      ) : null}

      {/* Boleto de Apuestas / Ticket Oficial de Quiniela */}
      <motion.article
        className="paper relative w-full max-w-[430px] border-2 border-ink bg-ivory p-5 text-ink shadow-2xl"
        initial={{ opacity: 0, y: 40, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 180, damping: 18, delay: 0.6 }}
      >
        {/* Doble filete de imprenta interior */}
        <span
          className="pointer-events-none absolute inset-0 border border-ink/40"
          style={{ margin: 4 }}
          aria-hidden="true"
        />

        {/* Cabecera del Boleto */}
        <div className="flex items-center justify-between border-b border-dashed border-ink/40 pb-2.5 text-left">
          <div className="flex flex-col">
            <span className="font-caps text-[9px] tracking-[0.2em] text-ink-soft uppercase">
              Casa de Apuestas ChinParley
            </span>
            <span className="font-display text-[12px] font-bold text-ink">
              BOLETO DE QUINIELA MUNDIALISTA
            </span>
          </div>
          <div className="text-right font-caps text-[9px] tracking-wider text-ink-faint">
            <span className="block text-foil font-bold">★ ACERTO TOTAL</span>
            <span>TICKET #2026-CHIN</span>
          </div>
        </div>

        {/* 1er Lugar: El Campeón Mr. Parley */}
        {first ? (
          <div className="relative my-4 flex flex-col items-center justify-center border border-foil/60 bg-foil/10 px-4 py-4 text-center">
            {/* Sello de caucho estampado "PARLEY COBRADO" */}
            <motion.div
              className="pointer-events-none absolute -right-2 -top-3 z-20 flex rotate-[-12deg] flex-col items-center justify-center border-2 border-foil-ink bg-ivory px-3 py-1 shadow-md"
              initial={{ scale: 2.8, opacity: 0, rotate: -35 }}
              animate={{ scale: 1, opacity: 1, rotate: -12 }}
              transition={{ type: "spring", stiffness: 280, damping: 14, delay: 1.6 }}
            >
              <span className="font-caps text-[8px] font-bold tracking-[0.2em] text-foil uppercase">
                ✦ TICKET GANADOR ✦
              </span>
              <span className="font-display text-[11px] font-bold tracking-wider text-foil-ink">
                PARLEY COBRADO
              </span>
            </motion.div>

            <motion.div
              className="flex items-center gap-1.5 text-foil-bright"
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <Crown className="h-5 w-5" />
              <span className="font-caps text-[10px] font-bold tracking-[0.25em] text-foil uppercase">
                Campeón de la Quiniela
              </span>
              <Crown className="h-5 w-5" />
            </motion.div>

            <div className="mt-2 flex items-center justify-center gap-3">
              {first.isMember ? (
                <Monogram name={first.name} photoUrl={first.photoUrl} size={58} foil />
              ) : null}
              <div className="text-left">
                <span className="block font-caps text-[10px] tracking-widest text-foil-ink uppercase">
                  1º Premio Absoluto
                </span>
                <p
                  className="font-display text-[26px] font-bold uppercase leading-none text-foil tracking-wide"
                >
                  {first.name}
                </p>
              </div>
            </div>

            <div className="mt-2.5 flex items-center gap-2 border-t border-foil/30 pt-1.5 font-caps text-[10px] text-ink-soft">
              <span className="font-bold text-foil">Cuota combinada:</span>
              <span className="font-display text-[12px] font-bold text-ink">¡Pleno Acertado!</span>
              <span className="text-foil-bright">✦ 100% efectividad</span>
            </div>
          </div>
        ) : null}

        {/* 2º y 3º Lugar: Podio de Apuestas */}
        <div className="grid grid-cols-2 gap-2 border-t border-dashed border-ink/40 pt-3">
          {second ? (
            <motion.div
              className="flex items-center gap-2.5 border border-ink/25 bg-ivory-deep/40 p-2 text-left"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, ease: EASE, delay: 1.1 }}
            >
              {second.isMember ? (
                <Monogram name={second.name} photoUrl={second.photoUrl} size={38} />
              ) : null}
              <div className="flex flex-col">
                <span className="font-caps text-[9px] tracking-wider text-ink-faint">
                  2º PUESTO · PLATA
                </span>
                <span className="font-display text-[14px] font-bold uppercase text-ink">
                  {second.name}
                </span>
                <span className="font-caps text-[8px] text-foil font-bold">Cobrado en caja</span>
              </div>
            </motion.div>
          ) : null}

          {third ? (
            <motion.div
              className="flex items-center gap-2.5 border border-ink/25 bg-ivory-deep/40 p-2 text-left"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, ease: EASE, delay: 1.25 }}
            >
              {third.isMember ? (
                <Monogram name={third.name} photoUrl={third.photoUrl} size={38} />
              ) : null}
              <div className="flex flex-col">
                <span className="font-caps text-[9px] tracking-wider text-ink-faint">
                  3º PUESTO · BRONCE
                </span>
                <span className="font-display text-[14px] font-bold uppercase text-ink">
                  {third.name}
                </span>
                <span className="font-caps text-[8px] text-foil font-bold">Cobrado en caja</span>
              </div>
            </motion.div>
          ) : null}
        </div>

        {/* 4º y 5º Lugar: Cuadro de Honor */}
        {fourth || fifth ? (
          <motion.div
            className="mt-2.5 flex items-center justify-between border-t border-ink/20 pt-2 px-1 text-[11px] text-ink-faint font-caps"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
          >
            <span className="tracking-wider">Menciones de Honor:</span>
            <div className="flex gap-3 text-ink font-semibold">
              {fourth ? <span>4º {fourth.name}</span> : null}
              {fifth ? <span>5º {fifth.name}</span> : null}
            </div>
          </motion.div>
        ) : null}

        {/* Pie del ticket: Código de Barras y Serial */}
        <div className="mt-3 flex items-center justify-between border-t border-dashed border-ink/30 pt-2 text-ink-faint">
          <Barcode className="h-5 w-28 text-ink/75" />
          <span className="font-caps text-[8px] tracking-[0.2em] uppercase">
            Comité ChinParley · 2026
          </span>
        </div>
      </motion.article>

      {/* Leyenda inferior */}
      <motion.p
        className="caps-line-tight relative font-caps text-[9px] tracking-[0.25em] text-ivory/50 uppercase"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
      >
        Premio del comité · Resultados finales de la quiniela
      </motion.p>
    </motion.section>
  );
}
