"use client";

import { useEffect, useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import { Coupon, CouponLink } from "@/components/coupon";
import { Monogram } from "@/components/monogram";
import { DiamondDivider } from "@/components/ornaments";

type AdminData = {
  settings: { groupCode: string; votingOpen: boolean; revealActive: boolean };
  members: Array<{
    id: number;
    name: string;
    photoUrl: string | null;
    position: number;
    votedCategoryIds: number[];
  }>;
  categories: Array<{
    id: number;
    key: string;
    title: string;
    tagline: string | null;
    kind: string;
    position: number;
    autoNominees: boolean;
    nominees: Array<{
      id: number;
      memberId: number | null;
      authorName: string | null;
      messageText: string | null;
      messageAt: string | null;
      mediaUrl: string | null;
      mediaType: string | null;
      rankPosition: number | null;
    }>;
  }>;
  turnout: { totalBallots: number };
  blobEnabled: boolean;
};

type Results = {
  categories: Array<{
    key: string;
    title: string;
    kind: string;
    ballotsCount: number;
    podium: Array<{
      nomineeId?: number;
      id?: number;
      position: number;
      points?: number;
      firsts?: number;
      votes?: number;
      tied?: boolean;
      rankPosition?: number;
      nominee?: { memberName: string | null; authorName: string | null };
      memberName?: string | null;
      authorName?: string | null;
    }>;
  }>;
};

const KIND_LABEL: Record<string, string> = {
  ranked: "Votada · top 3 (5-3-1)",
  pick5: "Votada · marca 5",
  ceremonial: "Ceremonial · podio fijo",
};

function Chevron({ direction }: { direction: "up" | "down" }) {
  return (
    <svg
      viewBox="0 0 12 12"
      className="h-3 w-3"
      style={{ transform: direction === "down" ? "rotate(180deg)" : undefined }}
      aria-hidden="true"
    >
      <path
        d="M2 7.5 L6 3.5 L10 7.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

async function resizePhoto(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const side = Math.min(bitmap.width, bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("canvas");
  context.drawImage(
    bitmap,
    (bitmap.width - side) / 2,
    (bitmap.height - side) / 2,
    side,
    side,
    0,
    0,
    256,
    256,
  );
  return canvas.toDataURL("image/jpeg", 0.82);
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") resolve(result);
      else reject(new Error("lectura"));
    };
    reader.onerror = () => reject(new Error("lectura"));
    reader.readAsDataURL(file);
  });
}

function mediaPathname(nomineeId: number, file: File): string {
  const extension = (file.name.split(".").pop() ?? "bin")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  return `nominees/mensaje-${nomineeId}-${Date.now()}.${extension || "bin"}`;
}

function createStallWatchdog(onStall: () => void) {
  let lastProgressAt = Date.now();
  const interval = setInterval(() => {
    if (Date.now() - lastProgressAt > 30_000) onStall();
  }, 1_000);
  return {
    tick() {
      lastProgressAt = Date.now();
    },
    stop() {
      clearInterval(interval);
    },
  };
}

export function AdminPanel() {
  const [data, setData] = useState<AdminData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [tab, setTab] = useState<"etat" | "pena" | "categories" | "votants" | "resultats">(
    "etat",
  );
  const [results, setResults] = useState<Results | null>(null);
  const [codeDraft, setCodeDraft] = useState<string | null>(null);
  const [confirmReveal, setConfirmReveal] = useState(false);
  const [confirmVoting, setConfirmVoting] = useState(false);
  const [voidTarget, setVoidTarget] = useState<{
    voterId: number;
    categoryId: number;
    memberName: string;
    categoryTitle: string;
  } | null>(null);
  const [newMemberName, setNewMemberName] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [uploadPct, setUploadPct] = useState<{ nomineeId: number; pct: number } | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const photoTargetRef = useRef<number | null>(null);
  const mediaInputRef = useRef<HTMLInputElement>(null);
  const mediaTargetRef = useRef<number | null>(null);
  const messageBannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/admin/data", { cache: "no-store" })
      .then(async (response) => {
        if (response.status === 401) {
          window.location.reload();
          return;
        }
        const payload = (await response.json()) as AdminData;
        if (!active) return;
        setData(payload);
        setCodeDraft(payload.settings.groupCode);
      })
      .catch(() => {
        if (active) setError("No se pudo leer la oficina. Revisa tu conexión.");
      });
    return () => {
      active = false;
    };
  }, [reloadKey]);

  useEffect(() => {
    if (error) {
      messageBannerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [error]);

  async function call(
    path: string,
    method: "POST" | "PATCH" | "DELETE",
    body?: unknown,
  ): Promise<string | null> {
    try {
      const response = await fetch(path, {
        method,
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      if (response.status === 401) {
        window.location.reload();
        return "Sesión caducada.";
      }
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        return payload?.error ?? "La mesa rechazó la orden.";
      }
      return null;
    } catch {
      return "La mesa no respondió. Revisa tu conexión.";
    }
  }

  async function withNotice(action: () => Promise<string | null>, message: string) {
    setError(null);
    setNotice(null);
    const failure = await action();
    if (failure) {
      setError(failure);
    } else {
      setNotice(message);
      setReloadKey((key) => key + 1);
    }
  }

  async function loadResults() {
    try {
      const response = await fetch("/api/admin/results", { cache: "no-store" });
      if (response.ok) {
        setResults((await response.json()) as Results);
      }
    } catch {
      setError("No se pudieron leer los resultados.");
    }
  }

  async function uploadPhoto(memberId: number, file: File) {
    try {
      const dataUrl = await resizePhoto(file);
      const failure = await call(`/api/admin/members/${memberId}`, "PATCH", {
        photoUrl: dataUrl,
      });
      if (failure) setError(failure);
      else setReloadKey((key) => key + 1);
    } catch {
      setError("La foto no se pudo estampar. Prueba otra imagen.");
    }
  }

  async function uploadMedia(nomineeId: number, file: File) {
    setError(null);
    try {
      if (data?.blobEnabled) {
        const abortController = new AbortController();
        const watchdog = createStallWatchdog(() => abortController.abort());
        let lastPct = 0;
        try {
          setUploadPct({ nomineeId, pct: 0 });
          const blob = await upload(mediaPathname(nomineeId, file), file, {
            access: "public",
            handleUploadUrl: "/api/admin/media",
            contentType: file.type,
            abortSignal: abortController.signal,
            onUploadProgress: (event) => {
              watchdog.tick();
              if (event && event.total > 0) {
                lastPct = Math.min(99, Math.round((event.loaded / event.total) * 100));
              } else {
                lastPct = Math.min(99, lastPct + 2);
              }
              setUploadPct({ nomineeId, pct: lastPct });
            },
          });
          const failure = await call(`/api/admin/nominees/${nomineeId}`, "PATCH", {
            mediaUrl: blob.url,
            mediaType: file.type,
          });
          if (failure) setError(failure);
          else await refreshDone();
          return;
        } catch (uploadError) {
          if (uploadError instanceof Error && uploadError.name === "AbortError") {
            setError(
              "La subida se estancó (red inestable) y se canceló. Inténtalo de nuevo; si persiste, prueba con un video más corto o desde el ordenador.",
            );
            return;
          }
          if (
            uploadError instanceof Error &&
            /maximumSizeInBytes|too large|entity/i.test(uploadError.message)
          ) {
            setError("El archivo supera el máximo de 60 MB.");
            return;
          }
          setError(
            "La subida falló. Comprueba tu conexión e inténtalo de nuevo.",
          );
          return;
        } finally {
          watchdog.stop();
          setUploadPct(null);
        }
      }
      if (file.size > 2_300_000) {
        setError(
          "Sin almacenamiento remoto activo solo suben archivos de hasta ~2 MB. Los videos grandes necesitan el store Blob de Vercel conectado a este proyecto.",
        );
        return;
      }
      const dataUrl = await readFileAsDataUrl(file);
      const failure = await call(`/api/admin/nominees/${nomineeId}`, "PATCH", {
        mediaUrl: dataUrl,
        mediaType: file.type,
      });
      if (failure) setError(failure);
      else await refreshDone();
    } catch {
      setError("La subida falló. Comprueba tu conexión e inténtalo de nuevo.");
    }
  }

  async function refreshDone(): Promise<void> {
    setNotice("Media adjuntada.");
    setReloadKey((key) => key + 1);
  }

  if (!data) {
    return (
      <div className="flex flex-1 items-center justify-center py-24">
        <p className="text-[13px] italic text-ink-soft">
          {error ?? "Abriendo los registros del capitán…"}
        </p>
      </div>
    );
  }

  const tabs: Array<{ id: typeof tab; label: string }> = [
    { id: "etat", label: "Estado" },
    { id: "pena", label: "Peña" },
    { id: "categories", label: "Categorías" },
    { id: "votants", label: "Votantes" },
    { id: "resultats", label: "Resultados" },
  ];

  return (
    <div className="mx-auto flex w-full max-w-[640px] flex-1 flex-col gap-5 px-4 py-6 sm:px-8">
      <header className="flex flex-col items-center gap-3 text-center">
        <h1 className="font-display text-[24px] font-bold uppercase tracking-[0.05em] text-ink">
          Oficina del capitán
        </h1>
        <p className="text-[12px] italic text-ink-soft">
          La oficina de producción de la gala · Temporada 2025/2026
        </p>
      </header>

      <nav className="flex flex-wrap justify-center gap-2" aria-label="Secciones de la oficina">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              setTab(item.id);
              if (item.id === "resultats") void loadResults();
            }}
            aria-pressed={tab === item.id}
            className={`plate-press border px-3.5 py-2 font-caps text-[11px] tracking-[0.14em] uppercase transition-colors ${
              tab === item.id
                ? "border-ink bg-ink text-ivory"
                : "border-ink/50 bg-ivory text-ink-soft"
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <input
        ref={photoInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          const memberId = photoTargetRef.current;
          if (file && memberId) void uploadPhoto(memberId, file);
          event.target.value = "";
        }}
      />

      <input
        ref={mediaInputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime,image/gif,image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          const nomineeId = mediaTargetRef.current;
          if (file && nomineeId) void uploadMedia(nomineeId, file);
          event.target.value = "";
        }}
      />

      {error || notice ? (
        <div
          ref={messageBannerRef}
          className={`sticky top-1 z-30 mx-auto max-w-[560px] bg-ivory px-1 shadow-[0_4px_10px_rgba(28,24,19,0.18)] ${
            error ? "pt-1" : ""
          }`}
        >
          {error ? (
            <p
              role="alert"
              className="border-y border-ink bg-ivory px-3 py-2 text-center text-[12px] italic text-ink-soft"
            >
              {error}
            </p>
          ) : null}
          {notice ? (
            <p className="border-y border-foil/60 bg-ivory px-3 py-2 text-center text-[12px] italic text-ink-soft">
              {notice}
            </p>
          ) : null}
        </div>
      ) : null}

      {tab === "etat" ? (
        <section className="flex flex-col gap-5" aria-label="Estado del evento">
          <div className="flex flex-col gap-3">
            <p className="caps-line font-caps text-[10px] text-ink">Código de la gala</p>
            <div className="flex gap-2">
              <input
                value={codeDraft ?? ""}
                onChange={(event) => setCodeDraft(event.target.value)}
                className="tabular flex-1 border border-ink bg-ivory-deep/60 px-3 py-2.5 font-caps text-[14px] tracking-[0.2em] text-ink uppercase focus:border-foil"
                aria-label="Código del grupo"
              />
              <button
                type="button"
                disabled={codeDraft === data.settings.groupCode || (codeDraft ?? "").length < 4}
                onClick={() =>
                  withNotice(
                    () => call("/api/admin/state", "PATCH", { groupCode: codeDraft }),
                    "Código guardado. Comunícalo a la peña.",
                  )
                }
                className="plate-press border border-ink bg-ivory px-4 py-2 font-caps text-[11px] tracking-[0.14em] text-ink uppercase disabled:opacity-40"
              >
                Guardar
              </button>
            </div>
            <p className="text-[11px] italic text-ink-faint">
              El código abre la puerta de la votación. Las sesiones ya abiertas no se cierran.
            </p>
          </div>

          <DiamondDivider className="text-ink-faint" />

          <div className="flex flex-col gap-3">
            <p className="caps-line font-caps text-[10px] text-ink">La votación</p>
            {confirmVoting ? (
              <div className="grid grid-cols-2 gap-2">
                <Coupon
                  action={() => setConfirmVoting(false)}
                  label="Cancelar"
                  invert={false}
                />
                <Coupon
                  action={() => {
                    setConfirmVoting(false);
                    void withNotice(
                      () =>
                        call("/api/admin/state", "PATCH", {
                          votingOpen: !data.settings.votingOpen,
                        }),
                      data.settings.votingOpen
                        ? "Votación cerrada. El cajón viaja al teatro."
                        : "Votación abierta. Que la peña sella.",
                    );
                  }}
                  label="Confirmar"
                />
              </div>
            ) : (
              <Coupon
                action={() => setConfirmVoting(true)}
                label={
                  data.settings.votingOpen
                    ? "Votaciones abiertas — cerrar"
                    : "Votaciones cerradas — abrir"
                }
                sub={
                  data.settings.votingOpen
                    ? "El cajón recibe papeletas"
                    : "La peña aguarda el código"
                }
                invert={data.settings.votingOpen}
              />
            )}
          </div>

          <DiamondDivider className="text-ink-faint" />

          <div className="flex flex-col gap-3">
            <p className="caps-line font-caps text-[10px] text-ink">La ceremonia</p>
            {confirmReveal ? (
              <div className="flex flex-col gap-3">
                <p className="text-center text-[12px] italic text-ink-soft">
                  Activar la gala cierra las votaciones y abre la revelación para
                  toda la peña. ¿Alzamos el telón?
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <Coupon action={() => setConfirmReveal(false)} label="Cancelar" invert={false} />
                  <Coupon
                    action={() => {
                      setConfirmReveal(false);
                      void withNotice(
                        () =>
                          call("/api/admin/state", "PATCH", {
                            revealActive: !data.settings.revealActive,
                            votingOpen: false,
                          }),
                        data.settings.revealActive
                          ? "Gala desactivada. Los resultados vuelven al sobre."
                          : "Telón alzado. La ceremonia está disponible.",
                      );
                    }}
                    label="Confirmar"
                  />
                </div>
              </div>
            ) : (
              <Coupon
                action={() => setConfirmReveal(true)}
                label={
                  data.settings.revealActive
                    ? "Gala activa — bajar el telón"
                    : "Alzar el telón — activar la gala"
                }
                sub={
                  data.settings.revealActive
                    ? "La peña ve la ceremonia"
                    : "Cierra la votación y revela"
                }
                invert={!data.settings.revealActive}
              />
            )}
          </div>
        </section>
      ) : null}

      {tab === "pena" ? (
        <section className="flex flex-col gap-4" aria-label="Miembros de la peña">
          {data.members.map((member) => (
            <article key={member.id} className="flex flex-col gap-2 border border-ink/50 bg-ivory px-4 py-3">
              <div className="flex items-center gap-3">
                <Monogram name={member.name} photoUrl={member.photoUrl} size={44} />
                <input
                  defaultValue={member.name}
                  onBlur={(event) => {
                    if (event.target.value !== member.name) {
                      void withNotice(
                        () =>
                          call(`/api/admin/members/${member.id}`, "PATCH", {
                            name: event.target.value,
                          }),
                        "Nombre actualizado.",
                      );
                    }
                  }}
                  className="flex-1 border border-ink/40 bg-ivory-deep/50 px-3 py-2 font-caps text-[13px] tracking-[0.06em] text-ink focus:border-foil"
                  aria-label={`Nombre de ${member.name}`}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    photoTargetRef.current = member.id;
                    photoInputRef.current?.click();
                  }}
                  className="plate-press border border-ink/50 bg-ivory px-3 py-1.5 font-caps text-[10px] tracking-[0.14em] text-ink-soft uppercase"
                >
                  {member.photoUrl ? "Cambiar la foto" : "Añadir una foto"}
                </button>
                {member.photoUrl ? (
                  <button
                    type="button"
                    onClick={() =>
                      withNotice(
                        () =>
                          call(`/api/admin/members/${member.id}`, "PATCH", {
                            photoUrl: null,
                          }),
                        "Foto retirada. Vuelve el monograma.",
                      )
                    }
                    className="plate-press border border-ink/50 bg-ivory px-3 py-1.5 font-caps text-[10px] tracking-[0.14em] text-ink-soft uppercase"
                  >
                    Quitar la foto
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() =>
                    withNotice(
                      () => call(`/api/admin/members/${member.id}`, "DELETE"),
                      "Miembro retirado de la lista.",
                    )
                  }
                  className="plate-press border border-ink/50 bg-ivory px-3 py-1.5 font-caps text-[10px] tracking-[0.14em] text-ink-soft uppercase"
                >
                  Retirar de la peña
                </button>
              </div>
            </article>
          ))}
          <div className="flex gap-2">
            <input
              value={newMemberName}
              onChange={(event) => setNewMemberName(event.target.value)}
              placeholder="Nuevo miembro"
              className="flex-1 border border-ink/40 bg-ivory-deep/50 px-3 py-2.5 font-caps text-[13px] text-ink placeholder:text-ink-faint/60 focus:border-foil"
              aria-label="Nuevo miembro"
            />
            <button
              type="button"
              disabled={!newMemberName.trim()}
              onClick={() =>
                withNotice(async () => {
                  const failure = await call("/api/admin/members", "POST", {
                    name: newMemberName.trim(),
                  });
                  if (!failure) setNewMemberName("");
                  return failure;
                }, "Miembro añadido a la peña.")
              }
              className="plate-press border border-ink bg-ink px-4 py-2 font-caps text-[11px] tracking-[0.14em] text-ivory uppercase disabled:opacity-40"
            >
              Añadir
            </button>
          </div>
          <p className="text-[11px] italic text-ink-faint">
            Los miembros son nominados y electores. Balón de Oro y Mejor 5 se
            actualizan solos.
          </p>
        </section>
      ) : null}

      {tab === "categories" ? (
        <section className="flex flex-col gap-6" aria-label="Categorías">
          {data.categories.map((category) => (
            <article key={category.id} className="flex flex-col gap-3 border border-ink/50 bg-ivory px-4 py-4">
              <div className="flex flex-col gap-1">
                <p className="font-display text-[17px] font-bold uppercase tracking-[0.04em] text-ink">
                  {category.title}
                </p>
                <p className="text-[11px] text-ink-faint">
                  {KIND_LABEL[category.kind] ?? category.kind} · numéro {category.position}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <input
                  defaultValue={category.title}
                  onBlur={(event) => {
                    if (event.target.value !== category.title) {
                      void withNotice(
                        () =>
                          call(`/api/admin/categories/${category.id}`, "PATCH", {
                            title: event.target.value,
                          }),
                        "Título actualizado.",
                      );
                    }
                  }}
                  className="border border-ink/40 bg-ivory-deep/50 px-3 py-2 font-caps text-[12px] text-ink focus:border-foil"
                  aria-label={`Título de ${category.title}`}
                />
                <input
                  defaultValue={category.tagline ?? ""}
                  onBlur={(event) => {
                    if (event.target.value !== (category.tagline ?? "")) {
                      void withNotice(
                        () =>
                          call(`/api/admin/categories/${category.id}`, "PATCH", {
                            tagline: event.target.value,
                          }),
                        "Subtítulo actualizado.",
                      );
                    }
                  }}
                  className="border border-ink/40 bg-ivory-deep/50 px-3 py-2 text-[12px] italic text-ink focus:border-foil"
                  aria-label={`Subtítulo de ${category.title}`}
                />
              </div>

              {category.autoNominees ? (
                <p className="text-[11px] italic text-ink-faint">
                  Nominados: toda la peña, automáticamente ({data.members.length}).
                </p>
              ) : null}

              {category.key === "puskas" || category.key === "olivada" ? (
                <div className="flex flex-col gap-2.5">
                  {category.nominees.map((nominee) => (
                    <div key={nominee.id} className="flex flex-col gap-1.5 border border-ink/30 px-3 py-2.5">
                      <div className="flex gap-1.5">
                        <input
                          defaultValue={nominee.authorName ?? ""}
                          onBlur={(event) => {
                            if (event.target.value !== (nominee.authorName ?? "")) {
                              void withNotice(
                                () =>
                                  call(`/api/admin/nominees/${nominee.id}`, "PATCH", {
                                    authorName: event.target.value,
                                  }),
                                "Autor actualizado.",
                              );
                            }
                          }}
                          className="w-24 border border-ink/40 bg-ivory-deep/50 px-2 py-1.5 font-caps text-[11px] text-ink focus:border-foil"
                          aria-label="Autor del mensaje"
                        />
                        <input
                          defaultValue={nominee.messageAt ?? ""}
                          placeholder="fecha"
                          onBlur={(event) => {
                            if (event.target.value !== (nominee.messageAt ?? "")) {
                              void withNotice(
                                () =>
                                  call(`/api/admin/nominees/${nominee.id}`, "PATCH", {
                                    messageAt: event.target.value,
                                  }),
                                "Fecha actualizada.",
                              );
                            }
                          }}
                          className="w-20 border border-ink/40 bg-ivory-deep/50 px-2 py-1.5 text-[11px] text-ink focus:border-foil"
                          aria-label="Fecha del mensaje"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            withNotice(
                              () => call(`/api/admin/nominees/${nominee.id}`, "DELETE"),
                              "Mensaje retirado.",
                            )
                          }
                          className="plate-press ml-auto border border-ink/40 bg-ivory px-2 py-1.5 font-caps text-[10px] tracking-[0.1em] text-ink-soft uppercase"
                        >
                          Retirar
                        </button>
                      </div>
                      <textarea
                        defaultValue={nominee.messageText ?? ""}
                        rows={2}
                        placeholder={nominee.mediaUrl ? "Sin texto — el mensaje es la media adjunta" : undefined}
                        onBlur={(event) => {
                          if (event.target.value !== (nominee.messageText ?? "")) {
                            void withNotice(
                              () =>
                                call(`/api/admin/nominees/${nominee.id}`, "PATCH", {
                                  messageText: event.target.value || null,
                                }),
                              "Mensaje actualizado.",
                            );
                          }
                        }}
                        className="border border-ink/40 bg-ivory-deep/50 px-2 py-1.5 text-[12px] leading-snug text-ink focus:border-foil"
                        aria-label="Texto del mensaje"
                      />
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          disabled={uploadPct !== null}
                          onClick={() => {
                            if (uploadPct !== null) return;
                            mediaTargetRef.current = nominee.id;
                            mediaInputRef.current?.click();
                          }}
                          className="plate-press border border-ink/50 bg-ivory px-3 py-1.5 font-caps text-[10px] tracking-[0.14em] text-ink-soft uppercase disabled:opacity-60"
                        >
                          {uploadPct?.nomineeId === nominee.id
                            ? `Subiendo… ${uploadPct.pct}%`
                            : nominee.mediaUrl
                              ? "Cambiar la media"
                              : "Adjuntar video/gif"}
                        </button>
                        {nominee.mediaUrl ? (
                          <button
                            type="button"
                            onClick={() =>
                              withNotice(
                                () =>
                                  call(`/api/admin/nominees/${nominee.id}`, "PATCH", {
                                    mediaUrl: null,
                                    mediaType: null,
                                  }),
                                "Media retirada.",
                              )
                            }
                            className="plate-press border border-ink/50 bg-ivory px-3 py-1.5 font-caps text-[10px] tracking-[0.14em] text-ink-soft uppercase"
                          >
                            Quitar la media
                          </button>
                        ) : null}
                        {nominee.mediaUrl ? (
                          <span className="flex items-center gap-2 text-[11px] italic text-ink-faint">
                            {nominee.mediaType?.startsWith("video/") ? (
                              <video
                                src={nominee.mediaUrl}
                                controls
                                preload="metadata"
                                playsInline
                                className="h-12 w-20 border border-ink/40 bg-black object-contain"
                              />
                            ) : (
                              <img
                                src={nominee.mediaUrl}
                                alt="Preview de la media"
                                className="h-12 w-20 border border-ink/40 object-contain"
                              />
                            )}
                            {nominee.mediaType}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      withNotice(
                        () =>
                          call("/api/admin/nominees", "POST", {
                            type: "message",
                            categoryKey: category.key,
                            authorName: "Autor",
                            messageText: "Pega aquí el mensaje nominado…",
                            messageAt: null,
                          }),
                        "Mensaje añadido — edítalo arriba.",
                      )
                    }
                    className="plate-press border border-ink/50 bg-ivory px-3 py-2 font-caps text-[10px] tracking-[0.14em] text-ink-soft uppercase"
                  >
                    Añadir un mensaje
                  </button>
                  <p className="text-[11px] italic text-ink-faint">
                    {category.nominees.length} mensajes nominados
                    {category.nominees.length !== 4
                      ? " — la gala prevé 4; recorta o amplía a tu juicio."
                      : "."}
                  </p>
                </div>
              ) : null}

              {category.kind === "ceremonial" ? (
                <div className="flex flex-col gap-2">
                  {category.nominees
                    .slice()
                    .sort((a, b) => (a.rankPosition ?? 0) - (b.rankPosition ?? 0))
                    .map((nominee) => (
                      <div
                        key={nominee.id}
                        className="flex items-center gap-2 border border-ink/30 px-3 py-2"
                      >
                        <span className="font-caps text-[12px] text-foil-ink">
                          {nominee.rankPosition}
                        </span>
                        <span className="font-caps text-[12px] tracking-[0.06em] text-ink">
                          {data.members.find((m) => m.id === nominee.memberId)?.name ??
                            nominee.authorName}
                        </span>
                        <span className="ml-auto flex gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              withNotice(
                                () =>
                                  call(`/api/admin/nominees/${nominee.id}`, "PATCH", {
                                    move: "up",
                                  }),
                                "Podio reordenado.",
                              )
                            }
                            aria-label="Subir en el podio"
                            className="plate-press flex items-center border border-ink/40 bg-ivory px-2 py-1 text-ink-soft"
                          >
                            <Chevron direction="up" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              withNotice(
                                () =>
                                  call(`/api/admin/nominees/${nominee.id}`, "PATCH", {
                                    move: "down",
                                }),
                                "Podio reordenado.",
                              )
                            }
                            aria-label="Bajar en el podio"
                            className="plate-press flex items-center border border-ink/40 bg-ivory px-2 py-1 text-ink-soft"
                          >
                            <Chevron direction="down" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              withNotice(
                                () => call(`/api/admin/nominees/${nominee.id}`, "DELETE"),
                                "Retirado del podio.",
                              )
                            }
                            className="plate-press border border-ink/40 bg-ivory px-2 py-1 font-caps text-[10px] tracking-[0.1em] text-ink-soft uppercase"
                          >
                            Retirar
                          </button>
                        </span>
                      </div>
                    ))}
                  <div className="flex gap-2">
                    <select
                      defaultValue=""
                      onChange={(event) => {
                        const memberId = Number(event.target.value);
                        if (memberId) {
                          void withNotice(
                            () =>
                              call("/api/admin/nominees", "POST", {
                                type: "podium",
                                categoryKey: category.key,
                                memberId,
                                rankPosition: category.nominees.length + 1,
                              }),
                            "Añadido al podio.",
                          );
                        }
                      }}
                      className="flex-1 border border-ink/40 bg-ivory-deep/50 px-2 py-2 font-caps text-[11px] text-ink focus:border-foil"
                      aria-label="Añadir miembro al podio"
                    >
                      <option value="">Añadir al podio…</option>
                      {data.members.map((member) => (
                        <option key={member.id} value={member.id}>
                          {member.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : null}
            </article>
          ))}
        </section>
      ) : null}

      {tab === "votants" ? (
        <section className="flex flex-col gap-4" aria-label="Votos en vivo">
          <p className="text-center text-[12px] italic text-ink-soft">
            {data.turnout.totalBallots} papeletas selladas en total · las cifras
            viven aquí hasta el telón.
          </p>
          {voidTarget ? (
            <div className="flex flex-col gap-2 border border-ink bg-ivory px-4 py-3">
              <p className="text-center text-[12px] italic text-ink-soft">
                ¿Anular la papeleta de {voidTarget.memberName} en{" "}
                {voidTarget.categoryTitle}? El votante podrá sellarla de nuevo.
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Coupon
                  action={() => setVoidTarget(null)}
                  label="Cancelar"
                  invert={false}
                />
                <Coupon
                  action={() => {
                    const target = voidTarget;
                    setVoidTarget(null);
                    if (!target) return;
                    void withNotice(
                      () =>
                        call("/api/admin/ballots", "DELETE", {
                          voterId: target.voterId,
                          categoryId: target.categoryId,
                        }),
                      "Papeleta anulada. El votante puede volver a sellar.",
                    );
                  }}
                  label="Confirmar"
                />
              </div>
            </div>
          ) : null}
          {data.members.map((member) => (
            <article
              key={member.id}
              className="flex flex-wrap items-center gap-3 border border-ink/40 bg-ivory px-4 py-3"
            >
              <Monogram name={member.name} photoUrl={member.photoUrl} size={40} />
              <span className="font-caps text-[13px] tracking-[0.06em] text-ink">
                {member.name}
              </span>
              <span className="tabular ml-auto flex items-center gap-2 text-[12px] text-ink-soft">
                {member.votedCategoryIds.length} / {data.categories.length}
                {member.votedCategoryIds.length === data.categories.length &&
                data.categories.length > 0 ? (
                  <span className="font-caps text-[10px] tracking-[0.1em] text-foil-ink uppercase">
                    Complète
                  </span>
                ) : null}
              </span>
              {member.votedCategoryIds.length > 0 ? (
                <ul className="flex w-full flex-wrap gap-1.5 pt-1">
                  {member.votedCategoryIds.map((categoryId) => {
                    const category = data.categories.find(
                      (item) => item.id === categoryId,
                    );
                    return (
                      <li key={categoryId}>
                        <button
                          type="button"
                          onClick={() =>
                            setVoidTarget({
                              voterId: member.id,
                              categoryId,
                              memberName: member.name,
                              categoryTitle: category?.title ?? `#${categoryId}`,
                            })
                          }
                          className="plate-press group flex items-center gap-1.5 border border-ink/40 bg-ivory-deep/60 px-2.5 py-1 font-caps text-[10px] tracking-[0.08em] text-ink-soft uppercase transition-colors hover:border-ink hover:text-ink"
                          aria-label={`Anular papeleta en ${category?.title ?? categoryId}`}
                          title="Anular esta papeleta"
                        >
                          {category?.title ?? `#${categoryId}`}
                          <span
                            aria-hidden="true"
                            className="text-ink-faint group-hover:text-ink"
                          >
                            ×
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : null}
            </article>
          ))}
          <p className="text-[11px] italic text-ink-faint">
            Papeleta ciega: aquí se ve quién votó, jamás qué votó. El × anula la
            papeleta sin revelarla — solo con la votación abierta.
          </p>
        </section>
      ) : null}

      {tab === "resultats" ? (
        <section className="flex flex-col gap-5" aria-label="Resultados">
          <button
            type="button"
            onClick={() => void loadResults()}
            className="plate-press self-center border border-ink/50 bg-ivory px-4 py-2 font-caps text-[11px] tracking-[0.14em] text-ink-soft uppercase"
          >
            Actualizar las cifras
          </button>
          {results ? (
            results.categories.map((category) => (
              <article key={category.key} className="flex flex-col gap-2 border border-ink/50 bg-ivory px-4 py-3">
                <p className="font-display text-[15px] font-bold uppercase tracking-[0.04em] text-ink">
                  {category.title}
                  <span className="tabular ml-2 text-[11px] font-normal text-ink-faint">
                    {category.ballotsCount} papeletas
                  </span>
                </p>
                {category.podium.length === 0 ? (
                  <p className="text-[12px] italic text-ink-faint">Sin votos aún.</p>
                ) : (
                  category.podium.map((entry) => (
                    <p key={`n${entry.nomineeId ?? entry.id}`} className="tabular flex gap-2 text-[12px] text-ink-soft">
                      <span className="font-caps text-foil-ink">{entry.position}</span>
                      <span className="text-ink">
                        {entry.nominee?.memberName ?? entry.nominee?.authorName ??
                          entry.memberName ?? entry.authorName ?? "—"}
                      </span>
                      {entry.points !== undefined ? (
                        <span className="ml-auto">
                          {entry.points} pts · {entry.firsts} primeros
                        </span>
                      ) : null}
                      {entry.votes !== undefined ? (
                        <span className="ml-auto">{entry.votes} votos</span>
                      ) : null}
                    </p>
                  ))
                )}
              </article>
            ))
          ) : (
            <p className="text-center text-[12px] italic text-ink-soft">
              Leyendo los sobres…
            </p>
          )}
          <p className="text-[11px] italic text-ink-faint">
            Vista parcial en vivo — solo el acta final es la verdad.
          </p>
        </section>
      ) : null}

      <footer className="mt-auto flex flex-col items-center gap-3 pt-6 text-center">
        <DiamondDivider className="w-full max-w-[200px] text-ink-faint" />
        <CouponLink
          href="/"
          label="Volver a la portada"
          invert={false}
          className="max-w-[300px]"
        />
        <button
          type="button"
          onClick={() =>
            fetch("/api/admin/session", { method: "DELETE" }).then(() =>
              window.location.reload(),
            )
          }
          className="text-[10px] tracking-[0.3em] text-ink-faint/70 uppercase transition-colors hover:text-ink-soft"
        >
          Cerrar la oficina
        </button>
      </footer>
    </div>
  );
}
