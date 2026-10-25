import { redirect } from "next/navigation";
import { RuleFrame } from "@/components/ornaments";
import { getBallotData } from "@/lib/event";
import { getVoterSession } from "@/lib/session";
import { BallotWizard } from "./ballot-wizard";
import { connection } from "next/server";

export const instant = false;
export const metadata = {
  title: "Papeleta — Chin Ballon d'Or",
};

export default async function VotarPage() {
  await connection();
  const session = await getVoterSession();
  if (!session) redirect("/entrar");

  const ballotData = await getBallotData(session.memberId);

  if (ballotData.settings.revealActive) {
    redirect("/gala");
  }

  if (!ballotData.settings.votingOpen) {
    return (
      <main className="paper relative flex min-h-dvh flex-col">
        <RuleFrame className="m-3 flex-1 sm:m-5" innerClassName="flex flex-1 flex-col">
          <BallotWizard
            categories={ballotData.categories}
            initialVotedKeys={ballotData.votedKeys}
            voterName={session.name}
            voterMemberId={session.memberId}
            votingClosed
          />
        </RuleFrame>
      </main>
    );
  }

  return (
    <main className="paper relative flex min-h-dvh flex-col">
      <RuleFrame className="m-3 flex-1 sm:m-5" innerClassName="flex flex-1 flex-col">
        <BallotWizard
          categories={ballotData.categories}
          initialVotedKeys={ballotData.votedKeys}
          voterName={session.name}
          voterMemberId={session.memberId}
        />
      </RuleFrame>
    </main>
  );
}
