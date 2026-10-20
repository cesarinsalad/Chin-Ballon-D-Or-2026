import Link from "next/link";
import { redirect } from "next/navigation";
import { RuleFrame, BallVignette } from "@/components/ornaments";
import { getMembers, getSettings } from "@/lib/event";
import { getVoterSession } from "@/lib/session";
import { EnterForm } from "./enter-form";
import { connection } from "next/server";

export const instant = false;
export const metadata = {
  title: "Entrar — Chin Ballon d'Or",
};

export default async function EntrarPage() {
  await connection();
  const session = await getVoterSession();
  if (session) redirect("/votar");

  const settings = await getSettings();
  const members = await getMembers();

  if (!settings.votingOpen || settings.revealActive) {
    return (
      <main className="paper relative flex min-h-dvh flex-col">
        <RuleFrame className="m-3 flex-1 sm:m-5" innerClassName="flex flex-col items-center justify-center gap-6 p-8 text-center">
          <BallVignette className="h-14 w-28 text-ink-soft" />
          <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-ink">
            Les votations sont closes
          </h1>
          <p className="max-w-[38ch] text-[15px] leading-relaxed text-ink-soft">
            La papeleta ya está guardada en el cajón del teatro. La cérémonie se
            prepara.
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
        <EnterForm members={members} />
      </RuleFrame>
    </main>
  );
}
