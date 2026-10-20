"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Monogram } from "@/components/monogram";
import { Coupon } from "@/components/coupon";
import { DiamondDivider } from "@/components/ornaments";

type MemberOption = {
  id: number;
  name: string;
  photoUrl: string | null;
};

export function EnterForm({ members }: { members: MemberOption[] }) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [memberId, setMemberId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit(selectedId: number) {
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, memberId: selectedId }),
      });
      if (response.ok) {
        router.push("/votar");
        router.refresh();
        return;
      }
      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      if (response.status === 401) {
        setError("Código incorrecto. Pídelo de nuevo al capitán de la soirée.");
      } else if (response.status === 429) {
        setError("Demasiados intentos. Espera un momento antes de volver a tocar.");
      } else {
        setError(data?.error ?? "No se pudo abrir la puerta. Inténtalo de nuevo.");
      }
    } catch {
      setError("La portería no respondió. Comprueba tu conexión e inténtalo otra vez.");
    } finally {
      setSubmitting(false);
    }
  }

  const codeReady = code.trim().length > 0;

  return (
    <div className="mx-auto flex w-full max-w-[560px] flex-1 flex-col gap-8 py-6">
      <header className="flex flex-col items-center gap-4 text-center">
        <h1
          className="font-display font-bold uppercase text-foil"
          style={{ fontSize: "clamp(1.9rem, 8vw, 2.8rem)", letterSpacing: "0.06em" }}
        >
          Entrer à la soirée
        </h1>
        <p className="max-w-[40ch] text-[14px] leading-relaxed text-ink-soft">
          Presenta el código de invitación y firma el registro de la peña para
          recibir tu papeleta.
        </p>
      </header>

      <section className="flex flex-col gap-3" aria-label="Código de invitación">
        <label
          htmlFor="gala-code"
          className="caps-line font-caps text-[11px] text-ink"
        >
          Code de la soirée
        </label>
        <input
          id="gala-code"
          value={code}
          onChange={(event) => setCode(event.target.value)}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          placeholder="••••••"
          className="tabular w-full border border-ink bg-ivory-deep/60 px-4 py-3.5 text-center font-caps text-[18px] tracking-[0.35em] text-ink uppercase placeholder:text-ink-faint/60 focus:border-foil"
        />
      </section>

      <DiamondDivider className="text-ink-faint" />

      <section className="flex flex-1 flex-col gap-4" aria-label="Registro de la peña">
        <p className="caps-line font-caps text-[11px] text-ink">Registre de la peña</p>
        {error ? (
          <p
            role="alert"
            className="rule-double-b border-t border-b border-ink px-4 py-3 text-center text-[13px] italic text-ink-soft"
          >
            {error}
          </p>
        ) : null}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {members.map((member) => {
            const selected = memberId === member.id;
            return (
              <button
                key={member.id}
                type="button"
                disabled={!codeReady || submitting}
                onClick={() => setMemberId(member.id)}
                aria-pressed={selected}
                className={`plate-press flex flex-col items-center gap-2.5 border bg-ivory px-3 py-5 transition-[transform,box-shadow,background-color] duration-150 active:translate-y-px disabled:opacity-40 ${
                  selected ? "border-foil bg-ivory-deep" : "border-ink/60"
                }`}
              >
                <Monogram
                  name={member.name}
                  photoUrl={member.photoUrl}
                  size={52}
                  foil={selected}
                />
                <span className="font-caps text-[13px] tracking-[0.08em] text-ink">
                  {member.name}
                </span>
              </button>
            );
          })}
        </div>
        <p className="text-center text-[12px] italic text-ink-faint">
          Cada asistente firma una sola vez. Sin cambios de identidad.
        </p>
      </section>

      <Coupon
        action={() => memberId && submit(memberId)}
        disabled={memberId === null || !codeReady || submitting}
        label={submitting ? "Abriendo la puerta…" : "Firmar et recevoir ta papeleta"}
        className="max-w-[420px] self-center"
      />
    </div>
  );
}
