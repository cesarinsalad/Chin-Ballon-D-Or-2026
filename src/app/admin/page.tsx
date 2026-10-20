import { RuleFrame, BallVignette } from "@/components/ornaments";
import { isAdminSession } from "@/lib/session";
import { AdminLogin } from "./admin-login";
import { AdminPanel } from "./admin-panel";
import { connection } from "next/server";

export const instant = false;
export const metadata = {
  title: "Bureau du capitaine — Chin Ballon d'Or",
};

export default async function AdminPage() {
  await connection();
  const isAdmin = await isAdminSession();
  return (
    <main className="paper relative flex min-h-dvh flex-col">
      <RuleFrame className="m-3 flex-1 sm:m-5" innerClassName="flex flex-1 flex-col">
        {isAdmin ? (
          <AdminPanel />
        ) : (
          <div className="mx-auto flex w-full max-w-[460px] flex-1 flex-col items-center justify-center gap-6 p-8 text-center">
            <BallVignette className="h-12 w-24 text-ink-soft" />
            <AdminLogin />
          </div>
        )}
      </RuleFrame>
    </main>
  );
}
