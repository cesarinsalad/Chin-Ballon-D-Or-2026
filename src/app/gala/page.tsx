import Link from "next/link";
import { getCeremonyData } from "@/lib/event";
import { isAdminSession } from "@/lib/session";
import { BallVignette, RuleFrame } from "@/components/ornaments";
import { CeremonyPlayer } from "./ceremony-player";
import { connection } from "next/server";

export const instant = false;
export const metadata = {
  title: "La ceremonia — Chin Ballon d'Or",
};

export default async function GalaPage() {
  await connection();
  const adminPreview = await isAdminSession();
  const { settings, categories, turnout } = await getCeremonyData();

  if (!settings.revealActive && !adminPreview) {
    return (
      <main className="paper relative flex min-h-dvh flex-col">
        <RuleFrame className="m-3 flex-1 sm:m-5" innerClassName="flex flex-1 flex-col items-center justify-center gap-6 p-8 text-center">
          <BallVignette className="h-14 w-28 text-ink-soft" />
          <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-ink">
            La ceremonia no ha comenzado
          </h1>
          <p className="max-w-[40ch] text-[15px] leading-relaxed text-ink-soft">
            El telón sigue bajado. Vuelve cuando el capitán alce el telón y la
            sala se apague.
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
    <CeremonyPlayer
      categories={categories}
      turnout={turnout}
      preview={adminPreview && !settings.revealActive}
    />
  );
}
