import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { CouponLink } from "@/components/coupon";
import { getSettings, getVoterProgress } from "@/lib/event";
import { getVoterSession } from "@/lib/session";
import { RuleFrame, DiamondDivider } from "@/components/ornaments";
import { mainLogo } from "@/components/logos";

export const instant = false;
export const metadata = {
  title: "Chin Ballon d'Or — Primera Edición",
};

const logo = mainLogo();

export default async function Portada() {
  await connection();
  const session = await getVoterSession();
  const settings = await getSettings();
  const progress = session ? await getVoterProgress(session.memberId) : [];
  const ballotComplete = progress.length >= 4;

  let noticeTitle = "";
  let noticeSub = "";
  let coupon: { href: string; label: string; sub?: string } | null = null;
  let secondary: { href: string; label: string } | null = null;

  if (settings.revealActive) {
    noticeTitle = "La ceremonia";
    noticeSub = "Los sobres aguardan sobre la mesa. Toma asiento.";
    coupon = { href: "/gala", label: "Asistir a la ceremonia", sub: "Reproducción individual" };
    secondary = { href: "/acta", label: "Acta oficial — cifras de la votación" };
  } else if (settings.votingOpen) {
    noticeTitle = "Las votaciones están abiertas.";
    noticeSub = "Sella tu papeleta con el código de la gala.";
    if (!session) {
      coupon = { href: "/entrar", label: "Entrar a la gala", sub: "Código de invitación" };
    } else if (ballotComplete) {
      coupon = null;
      noticeSub = "Tu papeleta está completa y sellada. El telón cae pronto.";
    } else {
      coupon = { href: "/votar", label: "Continuar tu papeleta", sub: `${progress.length} de 4 categorías selladas` };
    }
  } else {
    noticeTitle = "Las votaciones están cerradas.";
    noticeSub = "La ceremonia se prepara.";
  }

  const showEnter = settings.votingOpen && !session && !settings.revealActive;

  return (
    <main className="paper relative flex min-h-dvh flex-col">
      <RuleFrame className="m-3 flex-1 sm:m-5" innerClassName="flex flex-col p-5 sm:p-10">
        <div className="mx-auto flex w-full max-w-[560px] flex-1 flex-col items-center justify-between gap-8 text-center">
          <p className="caps-line font-caps text-[10px] text-ink-soft [letter-spacing:0.42em]">
            El evento más importante del año.
          </p>

          <div className="flex flex-col items-center gap-6">
            <h1>
              <Image
                src={logo}
                alt="El Chin Ballon d'Or"
                priority
                className="h-auto w-[min(64vw,280px)] sm:w-[340px]"
              />
            </h1>
            <p
              className="caps-line font-caps text-[11px] text-ink sm:text-[12px]"
              style={{ textWrap: "balance" }}
            >
              Primera Edición · Temporada 2025/2026
            </p>
            <p className="max-w-[42ch] font-display text-[15px] italic leading-relaxed text-ink-soft">
              La velada más prestigiosa del año. La celebración de los momentos más destacados del grupo.
            </p>
          </div>

          <div className="flex w-full flex-col items-center gap-6">
            <div className="w-full max-w-[420px]">
              <div className="rule-double-b">
                <p className="caps-line font-caps text-[12px] text-ink pb-3 pt-3">{noticeTitle}</p>
              </div>
              <p className="pt-3 text-[14px] leading-relaxed text-ink-soft">{noticeSub}</p>
            </div>

            {coupon ? (
              <CouponLink
                href={coupon.href}
                label={coupon.label}
                sub={coupon.sub}
                className="w-full max-w-[420px]"
              />
            ) : null}

            {showEnter ? (
              <p className="text-[13px] italic text-ink-faint">
                Se sortea un solo código para toda la peña. Guárdalo como una entrada.
              </p>
            ) : null}

            {secondary ? (
              <Link
                href={secondary.href}
                className="caps-line-tight font-caps text-[11px] text-ink-soft underline decoration-foil decoration-1 underline-offset-[6px] transition-colors hover:text-ink"
              >
                {secondary.label}
              </Link>
            ) : null}
          </div>

          <div className="flex w-full flex-col items-center gap-3">
            <DiamondDivider className="w-full max-w-[240px] text-ink-faint" />
            <p className="text-[11px] italic text-ink-faint">
              Solo invitados · Teatro del Chinparley
            </p>
            <Link
              href="/admin"
              className="text-[10px] tracking-[0.3em] text-ink-faint/70 uppercase transition-colors hover:text-ink-soft"
            >
              Oficina del capitán
            </Link>
          </div>
        </div>
      </RuleFrame>
    </main>
  );
}
