import Link from "next/link";
import { redirect } from "next/navigation";
import Image from "next/image";
import { getCeremonyData } from "@/lib/event";
import { getVoterSession, isAdminSession } from "@/lib/session";
import { BallVignette, DiamondDivider, RuleFrame } from "@/components/ornaments";
import { Monogram } from "@/components/monogram";
import { mainLogo } from "@/components/logos";
import { connection } from "next/server";

export const instant = false;
export const metadata = {
  title: "Acta oficial — Chin Ballon d'Or",
};

function pct(part: number, total: number): string {
  if (total <= 0) return "—";
  return `${Math.round((part / total) * 100)}%`;
}

export default async function ActaPage() {
  await connection();
  const session = await getVoterSession();
  const adminPreview = await isAdminSession();
  if (!session && !adminPreview) redirect("/entrar");

  const { settings, categories, turnout } = await getCeremonyData();

  if (!settings.revealActive && !adminPreview) {
    return (
      <main className="paper relative flex min-h-dvh flex-col">
        <RuleFrame className="m-3 flex-1 sm:m-5" innerClassName="flex flex-1 flex-col items-center justify-center gap-6 p-8 text-center">
          <BallVignette className="h-14 w-28 text-ink-soft" />
          <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-ink">
            El acta aguarda
          </h1>
          <p className="max-w-[40ch] text-[15px] leading-relaxed text-ink-soft">
            Las cifras se imprimen cuando el telón caiga y la ceremonia termine.
          </p>
          <Link
            href="/"
            className="caps-line-tight font-caps text-[11px] text-ink underline decoration-foil decoration-1 underline-offset-[6px]"
          >
            Volver a la portada
          </Link>
        </RuleFrame>
      </main>
    );
  }

  return (
    <main className="paper relative flex min-h-dvh flex-col">
      <RuleFrame className="m-3 flex-1 sm:m-5" innerClassName="flex flex-col p-5 sm:p-10">
        <div className="mx-auto flex w-full max-w-[620px] flex-col gap-10 py-6">
          <header className="flex flex-col items-center gap-4 text-center">
            <Image
              src={mainLogo()}
              alt="El Chin Ballon d'Or"
              className="h-auto w-[min(44vw,170px)]"
            />
            <h1
              className="font-display font-bold uppercase text-foil-ink"
              style={{ fontSize: "clamp(1.8rem, 8vw, 2.6rem)", letterSpacing: "0.05em" }}
            >
              Acta oficial
            </h1>
            <p
              className="caps-line font-caps text-[11px] text-ink"
              style={{ textWrap: "balance" }}
            >
              Distribución de premios · Temporada 2025/2026
            </p>
            {settings.revealActive ? null : (
              <p
                aria-label="Vista previa — solo visible para el capitán"
                className="caps-line-tight border border-ink/50 px-2 py-1 font-caps text-[9px] tracking-[0.2em] text-ink-soft uppercase"
              >
                Vista previa · el telón sigue bajado
              </p>
            )}
            <DiamondDivider className="w-full max-w-[220px] text-ink-faint" />
            <p className="max-w-[52ch] text-[13px] leading-relaxed text-ink-soft italic">
              Cifras agregadas de la votación. Las papeletas individuales
              permanecen selladas en el cajón del teatro — nadie sabrá jamás
              quién votó a quién.
            </p>
          </header>

          <section className="rule-double-b border-b border-ink pb-4" aria-label="Participación">
            <p className="caps-line font-caps text-[11px] text-ink">Los electores</p>
            <p className="tabular mt-2 text-[13px] text-ink-soft">
              {turnout.totalMembers} electores inscritos ·
              {" "}
              {categories
                .map((category) => `${category.ballotsCount}`)
                .join(" / ")}{" "}
              papeletas por categoría (Olivada / Puskas / Mejor 5 / Entrenadores
              / Mr Parley / Ballon d&apos;Or)
            </p>
          </section>

          {categories.map((category) => (
            <section
              key={category.key}
              className="flex flex-col gap-4"
              aria-label={category.title}
            >
              <div className="flex flex-col gap-1">
                <h2 className="font-display text-[22px] font-bold uppercase tracking-[0.04em] text-ink">
                  {category.title}
                </h2>
                {category.tagline ? (
                  <p className="text-[13px] italic text-ink-soft">{category.tagline}</p>
                ) : null}
              </div>

              {category.kind === "ranked" ? (
                <table className="tabular w-full text-left text-[13px]">
                  <thead>
                    <tr className="border-b border-ink/60">
                      <th scope="col" className="py-2 pr-2 font-caps text-[10px] tracking-[0.18em] text-ink-soft uppercase">
                        Nominado
                      </th>
                      <th scope="col" className="py-2 pr-2 text-right font-caps text-[10px] tracking-[0.18em] text-ink-soft uppercase">
                        Pts
                      </th>
                      <th scope="col" className="py-2 pr-2 text-right font-caps text-[10px] tracking-[0.18em] text-ink-soft uppercase">
                        1º
                      </th>
                      <th scope="col" className="py-2 pr-2 text-right font-caps text-[10px] tracking-[0.18em] text-ink-soft uppercase">
                        2º
                      </th>
                      <th scope="col" className="py-2 text-right font-caps text-[10px] tracking-[0.18em] text-ink-soft uppercase">
                        % papeletas
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {category.tallies.map((tally) =>
                      "points" in tally ? (
                        <tr
                          key={`n${tally.nomineeId}`}
                          className={`border-b border-ink/25 ${
                            tally.position === 1 ? "text-ink" : "text-ink-soft"
                          }`}
                        >
                          <td className="py-2 pr-2">
                            <span className="flex items-center gap-2">
                              <span
                                className={`font-caps text-[11px] ${
                                  tally.position === 1 ? "text-foil-ink" : "text-ink-faint"
                                }`}
                              >
                                {tally.position}
                              </span>
                              {tally.nominee.memberName ?? tally.nominee.authorName ?? "—"}
                              {tally.tied ? (
                                <span className="text-[11px] italic text-ink-faint">
                                  empate
                                </span>
                              ) : null}
                            </span>
                          </td>
                          <td className="py-2 pr-2 text-right">{tally.points}</td>
                          <td className="py-2 pr-2 text-right">{tally.firsts}</td>
                          <td className="py-2 pr-2 text-right">{tally.seconds}</td>
                          <td className="py-2 text-right">
                            {pct(tally.appearances, category.ballotsCount)}
                          </td>
                        </tr>
                      ) : null,
                    )}
                  </tbody>
                </table>
              ) : null}

              {category.kind === "pick5" ? (
                <>
                  <div className="flex flex-wrap gap-3">
                    {category.podium.map((entry) =>
                      "nominee" in entry ? (
                        <span
                          key={`n${entry.nomineeId}`}
                          className="flex items-center gap-2 border border-foil/70 bg-ivory-deep/50 px-3 py-2"
                        >
                          <Monogram
                            name={entry.nominee.memberName ?? "Peña"}
                            photoUrl={entry.nominee.photoUrl}
                            size={34}
                            foil
                          />
                          <span className="font-caps text-[12px] tracking-[0.06em] text-ink">
                            {entry.nominee.memberName}
                          </span>
                          <span className="tabular text-[11px] text-ink-soft">
                            {"votes" in entry ? `${entry.votes}v` : ""}
                          </span>
                        </span>
                      ) : null,
                    )}
                  </div>
                  <table className="tabular w-full text-left text-[13px]">
                    <thead>
                      <tr className="border-b border-ink/60">
                        <th scope="col" className="py-2 pr-2 font-caps text-[10px] tracking-[0.18em] text-ink-soft uppercase">
                          Nominado
                        </th>
                        <th scope="col" className="py-2 text-right font-caps text-[10px] tracking-[0.18em] text-ink-soft uppercase">
                          Votos · % papeletas
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {category.tallies.map((tally) =>
                        "votes" in tally ? (
                          <tr
                            key={`n${tally.nomineeId}`}
                            className={`border-b border-ink/25 ${
                              tally.inTeam ? "text-ink" : "text-ink-soft"
                            }`}
                          >
                            <td className="py-2 pr-2">
                              <span className="flex items-center gap-2">
                                <span
                                  className={`font-caps text-[11px] ${
                                    tally.inTeam ? "text-foil-ink" : "text-ink-faint"
                                  }`}
                                >
                                  {tally.position}
                                </span>
                                {tally.nominee.memberName ?? "—"}
                              </span>
                            </td>
                            <td className="py-2 text-right">
                              {tally.votes} · {pct(tally.votes, category.ballotsCount)}
                            </td>
                          </tr>
                        ) : null,
                      )}
                    </tbody>
                  </table>
                </>
              ) : null}

              {category.kind === "ceremonial" ? (
                <ol className="flex flex-col">
                  {category.podium.map((entry) =>
                    "rankPosition" in entry ? (
                      <li
                        key={`n${entry.id}`}
                        className="flex items-center gap-4 border-b border-ink/25 py-2.5"
                      >
                        <span
                          className={`font-caps text-[13px] ${
                            entry.rankPosition === 1 ? "text-foil-ink" : "text-ink-faint"
                          }`}
                        >
                          {entry.rankPosition}
                        </span>
                        <Monogram
                          name={entry.memberName ?? "Peña"}
                          photoUrl={entry.photoUrl}
                          size={38}
                          foil={entry.rankPosition === 1}
                        />
                        <span className="font-display text-[16px] font-semibold text-ink">
                          {entry.memberName ?? entry.authorName ?? "—"}
                        </span>
                        <span className="ml-auto text-[11px] italic text-ink-faint">
                          por decisión del comité
                        </span>
                      </li>
                    ) : null,
                  )}
                </ol>
              ) : null}
            </section>
          ))}

          <footer className="flex flex-col items-center gap-3 pt-2 pb-6 text-center">
            <DiamondDivider className="w-full max-w-[220px] text-ink-faint" />
            <p className="caps-line-tight font-caps text-[10px] text-ink-soft">
              Acta cerrada y sellada · Chin Ballon d&apos;Or
            </p>
            <Link
              href="/"
              className="caps-line-tight font-caps text-[11px] text-ink underline decoration-foil decoration-1 underline-offset-[6px]"
            >
              Volver a la portada
            </Link>
          </footer>
        </div>
      </RuleFrame>
    </main>
  );
}
