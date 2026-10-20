"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import { ChatBubble } from "@/components/chat-bubble";
import { Coupon, CouponLink } from "@/components/coupon";
import { BallVignette, DiamondDivider } from "@/components/ornaments";
import { Monogram, rankLabel } from "@/components/monogram";

function CheckMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 12 12" className={className} aria-hidden="true">
      <path
        d="M2 6.4 L4.8 9 L10 3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type Nominee = {
  id: number;
  memberId: number | null;
  memberName: string | null;
  photoUrl: string | null;
  authorName: string | null;
  messageText: string | null;
  messageAt: string | null;
};

type Category = {
  id: number;
  key: string;
  title: string;
  tagline: string | null;
  kind: "ranked" | "pick5" | "ceremonial";
  nominees: Nominee[];
};

const CATEGORY_BLURB: Record<string, string> = {
  balon: "Elige tu top 3. El 1er puesto vale 5 puntos, el 2º vale 3 y el 3º vale 1. Autovoto permitido.",
  puskas: "Los cuatro mensajes nominados por el capitán. Ránkealos: 5, 3 y 1 punto.",
  olivada: "Fantasmas y fastameadas del año. Ránkealos: 5, 3 y 1 punto.",
  mejor5: "Marca a los cinco que forman el equipo ideal del año. Un punto por aparición.",
};

function SealDot({ filled }: { filled: boolean }) {
  return (
    <span
      className={`inline-block h-3 w-3 rounded-full border ${
        filled ? "border-foil bg-foil" : "border-ink/50 bg-transparent"
      }`}
      aria-hidden="true"
    />
  );
}

function EmbossSeal({ label }: { label: string }) {
  return (
    <span className="flex items-center gap-3">
      <span
        className="emboss-seal inline-flex h-12 w-12 items-center justify-center bg-ivory"
        aria-hidden="true"
      >
        <span className="font-caps text-[15px] tracking-[0.06em] text-ink/70">CB</span>
      </span>
      <span className="caps-line-tight font-caps text-[10px] text-ink-soft">{label}</span>
    </span>
  );
}

export function BallotWizard(props: {
  categories: Category[];
  initialVotedKeys: string[];
  voterName: string;
  votingClosed?: boolean;
}) {
  return (
    <MotionConfig reducedMotion="user">
      <BallotWizardInner {...props} />
    </MotionConfig>
  );
}

function BallotWizardInner({
  categories,
  initialVotedKeys,
  voterName,
  votingClosed = false,
}: {
  categories: Category[];
  initialVotedKeys: string[];
  voterName: string;
  votingClosed?: boolean;
}) {
  const [votedKeys, setVotedKeys] = useState<string[]>(initialVotedKeys);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [ranks, setRanks] = useState<Record<number, number>>({});
  const [picks, setPicks] = useState<Set<number>>(new Set());

  const votable = categories.filter((c) => c.kind === "ranked" || c.kind === "pick5");
  const current = useMemo(() => {
    return votable.find((c) => !votedKeys.includes(c.key)) ?? null;
  }, [votable, votedKeys]);

  const stepIndex = current ? votable.indexOf(current) : votable.length;
  const allDone = stepIndex >= votable.length;

  function resetDraft() {
    setRanks({});
    setPicks(new Set());
    setConfirming(false);
    setError(null);
  }

  function toggleRank(nomineeId: number) {
    setError(null);
    setConfirming(false);
    setRanks((previous) => {
      const next = { ...previous };
      if (next[nomineeId] !== undefined) {
        delete next[nomineeId];
        return next;
      }
      const used = new Set(Object.values(next));
      for (let rank = 1; rank <= 3; rank += 1) {
        if (!used.has(rank)) {
          next[nomineeId] = rank;
          return next;
        }
      }
      return next;
    });
  }

  function togglePick(nomineeId: number, max: number) {
    setError(null);
    setConfirming(false);
    setPicks((previous) => {
      const next = new Set(previous);
      if (next.has(nomineeId)) {
        next.delete(nomineeId);
        return next;
      }
      if (next.size >= max) {
        setError(`Tu equipo ya tiene ${max} nombres. Libera una plaza para cambiarlo.`);
        return previous;
      }
      next.add(nomineeId);
      return next;
    });
  }

  const rankedCount = Object.keys(ranks).length;
  const pickMax = Math.min(5, current?.nominees.length ?? 5);
  const pickCount = picks.size;
  const canSeal =
    current?.kind === "ranked" ? rankedCount === 3 : pickCount === pickMax;

  async function seal() {
    if (!current || !canSeal) return;
    setSubmitting(true);
    setError(null);
    const picksPayload =
      current.kind === "ranked"
        ? Object.entries(ranks).map(([nomineeId, rank]) => ({
            nomineeId: Number(nomineeId),
            rank,
          }))
        : [...picks].map((nomineeId) => ({ nomineeId, rank: null }));

    try {
      const response = await fetch("/api/ballot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryKey: current.key, picks: picksPayload }),
      });
      if (response.ok || response.status === 409) {
        setVotedKeys((keys) => [...keys, current.key]);
        resetDraft();
        return;
      }
      if (response.status === 403) {
        setError("La votación se cerró mientras sellabas. El cajón ya viaja al teatro.");
        return;
      }
      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(data?.error ?? "El sello no cuajó. Inténtalo de nuevo.");
    } catch {
      setError("La mesa no respondió. Comprueba tu conexión y vuelve a sellar.");
    } finally {
      setSubmitting(false);
    }
  }

  if (votingClosed && !allDone) {
    return (
      <div className="mx-auto flex w-full max-w-[520px] flex-1 flex-col items-center justify-center gap-6 p-8 text-center">
        <BallVignette className="h-14 w-28 text-ink-soft" />
        <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-ink">
          La votación se cerró
        </h1>
        <p className="max-w-[40ch] text-[15px] leading-relaxed text-ink-soft">
          Tu papeleta incompleta se queda en el vestíbulo. La cérémonie decidirá el
          resto con los votos sellados.
        </p>
        <CouponLink label="Volver a la portada" href="/" invert={false} className="max-w-[380px]" />
      </div>
    );
  }

  if (!current) {
    return (
      <div className="mx-auto flex w-full max-w-[520px] flex-1 flex-col items-center justify-center gap-6 p-8 text-center">
        <EmbossSeal label="Papeleta sellada" />
        <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-ink">
          Papelette complète
        </h1>
        <p className="max-w-[42ch] text-[15px] leading-relaxed text-ink-soft">
          {voterName}, tus cuatro categorías viajan selladas en el cajón del
          teatro. Que ruede el rideau.
        </p>
        <CouponLink label="Volver a la portada" href="/" invert={false} className="max-w-[380px]" />
      </div>
    );
  }

  const isMessageCategory = current.key === "puskas" || current.key === "olivada";

  return (
    <div className="mx-auto flex w-full max-w-[560px] flex-1 flex-col gap-7 px-5 py-6 sm:px-8">
      <header className="flex flex-col items-center gap-4 text-center">
        <div className="flex items-center gap-2" aria-label={`Categorías selladas: ${votedKeys.length} de ${votable.length}`}>
          {votable.map((category) => (
            <SealDot key={category.key} filled={votedKeys.includes(category.key)} />
          ))}
        </div>
        <h1
          className="font-display font-bold uppercase text-ink"
          style={{ fontSize: "clamp(1.6rem, 7vw, 2.3rem)", letterSpacing: "0.05em" }}
        >
          {current.title}
        </h1>
        {current.tagline ? (
          <p className="max-w-[46ch] text-[14px] italic leading-relaxed text-ink-soft">
            {current.tagline}
          </p>
        ) : null}
        <p className="max-w-[48ch] text-[13px] leading-relaxed text-ink-soft">
          {CATEGORY_BLURB[current.key] ?? ""}
        </p>
      </header>

      <DiamondDivider className="text-ink-faint" />

      {error ? (
        <p
          role="alert"
          className="rule-double-b border-t border-b border-ink px-4 py-3 text-center text-[13px] italic text-ink-soft"
        >
          {error}
        </p>
      ) : null}

      {isMessageCategory ? (
        <div className="flex flex-col gap-4">
          {current.nominees.map((nominee) => {
            const rank = ranks[nominee.id];
            return (
              <button
                key={nominee.id}
                type="button"
                onClick={() => toggleRank(nominee.id)}
                aria-pressed={rank !== undefined}
                className={`relative text-left transition-transform duration-150 ${
                  rank !== undefined ? "scale-[1.01]" : ""
                }`}
              >
                <span
                  className={`absolute -top-2.5 -right-2 z-10 flex h-9 w-9 items-center justify-center border ${
                    rank !== undefined
                      ? "border-foil bg-ivory"
                      : "border-dashed border-ink/50 bg-transparent"
                  }`}
                  aria-hidden="true"
                >
                  <span
                    className={`font-caps text-[13px] tracking-[0.06em] ${
                      rank !== undefined ? "text-foil-ink" : "text-ink-faint"
                    }`}
                  >
                    {rank !== undefined ? rankLabel(rank) : "—"}
                  </span>
                </span>
                <ChatBubble
                  author={nominee.authorName ?? "Anónimo"}
                  at={nominee.messageAt}
                  text={nominee.messageText ?? ""}
                  compact
                  className="pr-9"
                />
              </button>
            );
          })}
        </div>
      ) : (
        <div className={`grid gap-3 ${current.kind === "pick5" ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2 sm:grid-cols-3"}`}>
          {current.nominees.map((nominee) => {
            const rank = ranks[nominee.id];
            const picked = picks.has(nominee.id);
            const active = rank !== undefined || picked;
            return (
              <button
                key={nominee.id}
                type="button"
                onClick={() =>
                  current.kind === "ranked"
                    ? toggleRank(nominee.id)
                    : togglePick(nominee.id, pickMax)
                }
                aria-pressed={active}
                className={`plate-press relative flex flex-col items-center gap-2.5 border bg-ivory px-3 py-5 transition-[transform,box-shadow,background-color] duration-150 active:translate-y-px ${
                  active ? "border-foil bg-ivory-deep" : "border-ink/60"
                }`}
              >
                <span
                  className={`absolute top-2 right-2 flex h-8 w-8 items-center justify-center border ${
                    active ? "border-foil bg-ivory" : "border-dashed border-ink/45"
                  }`}
                  aria-hidden="true"
                >
                  <span
                    className={`font-caps text-[12px] tracking-[0.06em] ${
                      active ? "text-foil-ink" : "text-ink-faint"
                    }`}
                  >
                    {current.kind === "ranked"
                      ? rank !== undefined
                        ? rankLabel(rank)
                        : "—"
                      : picked
                        ? <CheckMark className="h-3.5 w-3.5" />
                        : "—"}
                  </span>
                </span>
                <Monogram
                  name={nominee.memberName ?? "Peña"}
                  photoUrl={nominee.photoUrl}
                  size={52}
                  foil={active}
                />
                <span className="font-caps text-[13px] tracking-[0.08em] text-ink">
                  {nominee.memberName}
                </span>
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-auto flex flex-col gap-3 pt-4">
        <p className="text-center text-[12px] italic text-ink-faint">
          {current.kind === "ranked"
            ? `${rankedCount} de 3 plazas asignadas`
            : `${pickCount} de ${pickMax} nombres marcados`}
        </p>
        <AnimatePresence mode="wait" initial={false}>
          {confirming ? (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="flex flex-col gap-2"
            >
              <p className="text-center text-[13px] italic text-ink-soft">
                El sello es para siempre. ¿Sellamos esta categoría?
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Coupon
                  action={() => setConfirming(false)}
                  label="Revisar"
                  invert={false}
                  disabled={submitting}
                />
                <Coupon
                  action={() => seal()}
                  label={submitting ? "Sellando…" : "Sí, sellar"}
                  disabled={submitting}
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="seal"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
            >
              <Coupon
                action={() => setConfirming(true)}
                disabled={!canSeal || submitting}
                label={`Sellar «${current.title}»`}
                className="max-w-[420px] self-center"
              />
            </motion.div>
          )}
        </AnimatePresence>
        <p className="text-center text-[11px] italic text-ink-faint">
          {voterName} · papeleta ciega y blindada · sin ediciones tras el sello
        </p>
      </div>
    </div>
  );
}
