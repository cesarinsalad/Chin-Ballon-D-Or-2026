"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Coupon } from "@/components/coupon";

export function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (response.ok) {
        router.refresh();
        return;
      }
      if (response.status === 429) {
        setError("Demasiados intentos. Espera un momento.");
      } else {
        setError("Contraseña incorrecta. La oficina permanece cerrada.");
      }
    } catch {
      setError("La oficina no respondió. Revisa tu conexión.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <h1 className="font-display text-[22px] font-bold uppercase tracking-[0.05em] text-ink">
        Oficina del capitán
      </h1>
      <p className="text-[13px] leading-relaxed text-ink-soft">
        Solo el capitán dirige la gala. Introduce la contraseña de la oficina.
      </p>
      {error ? (
        <p role="alert" className="border-y border-ink px-3 py-2 text-[12px] italic text-ink-soft">
          {error}
        </p>
      ) : null}
      <input
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") submit();
        }}
        placeholder="••••••••"
        autoComplete="current-password"
        className="tabular w-full border border-ink bg-ivory-deep/60 px-4 py-3 text-center font-caps text-[16px] tracking-[0.3em] text-ink placeholder:text-ink-faint/50 focus:border-foil"
        aria-label="Contraseña de la oficina"
      />
      <Coupon
        action={() => password && submit()}
        disabled={!password || submitting}
        label={submitting ? "Abriendo la oficina…" : "Entrar a la oficina"}
        className="self-center"
      />
    </div>
  );
}
