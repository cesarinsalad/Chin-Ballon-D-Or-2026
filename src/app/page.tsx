import Link from "next/link";
import { BallVignette, DiamondDivider, RuleFrame } from "@/components/ornaments";
import { CouponLink } from "@/components/coupon";
import { getSettings, getVoterProgress } from "@/lib/event";
import { getVoterSession } from "@/lib/session";
import { connection } from "next/server";

export const instant = false;
export const metadata = {
  title: "Chin Ballon d'Or — Première Cérémonie",
};

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
    noticeTitle = "La Cérémonie";
    noticeSub = "Los sobres aguardan sobre la mesa. Toma asiento.";
    coupon = { href: "/gala", label: "Asistir à la cérémonie", sub: "Reproducción individual" };
    secondary = { href: "/acta", label: "Acte Officiel — cifras de la votación" };
  } else if (settings.votingOpen) {
    noticeTitle = "Les votations sont ouvertes";
    noticeSub = "Sella tu papeleta con el código de la soirée.";
    if (!session) {
      coupon = { href: "/entrar", label: "Entrar à la soirée", sub: "Código de invitación" };
    } else if (ballotComplete) {
      coupon = null;
      noticeSub = "Tu papeleta está completa y sellada. Rideau bientôt.";
    } else {
      coupon = { href: "/votar", label: "Continuar ta papeleta", sub: `${progress.length} de 4 categorías selladas` };
    }
  } else {
    noticeTitle = "Les votations sont closes";
    noticeSub = "La cérémonie se prépare. Rideau bientôt.";
  }

  const showEnter = settings.votingOpen && !session && !settings.revealActive;

  return (
    <main className="paper relative flex min-h-dvh flex-col">
      <RuleFrame className="m-3 flex-1 sm:m-5" innerClassName="flex flex-col p-5 sm:p-10">
        <div className="mx-auto flex w-full max-w-[560px] flex-1 flex-col items-center justify-between gap-8 text-center">
          <p className="caps-line font-caps text-[10px] text-ink-soft [letter-spacing:0.42em]">
            Une seule fois par an
          </p>

          <div className="flex flex-col items-center gap-6">
            <BallVignette className="h-16 w-30 text-ink-soft sm:h-20 sm:w-40" />
            <h1
              className="font-display font-bold uppercase text-foil"
              style={{
                fontSize: "clamp(2.6rem, 12vw, 4.6rem)",
                lineHeight: 1.02,
                letterSpacing: "0.045em",
                textShadow: "0 1px 0 rgba(239,230,210,0.5)",
              }}
            >
              Chin
              <br />
              Ballon d&apos;Or
            </h1>
            <p
              className="caps-line font-caps text-[11px] text-ink sm:text-[12px]"
              style={{ textWrap: "balance" }}
            >
              Première Cérémonie · Saison 2026
            </p>
            <p className="max-w-[42ch] font-display text-[15px] italic leading-relaxed text-ink-soft">
              La nuit la plus prestigieuse du chinparley — les prix de l&apos;année,
              par la volonté de la peña, pour la peña.
            </p>
          </div>

          <div className="flex w-full flex-col items-center gap-6">
            <div className="w-full max-w-[420px]">
              <div className="rule-double-b pb-3">
                <p className="caps-line font-caps text-[12px] text-ink">{noticeTitle}</p>
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
              Sur invitation uniquement · Théâtre du Chinparley
            </p>
            <Link
              href="/admin"
              className="text-[10px] tracking-[0.3em] text-ink-faint/70 uppercase transition-colors hover:text-ink-soft"
            >
              Bureau du capitaine
            </Link>
          </div>
        </div>
      </RuleFrame>
    </main>
  );
}
