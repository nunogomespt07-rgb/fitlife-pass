"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { creditsDebug } from "@/lib/walletCredits";

/**
 * Barra fixa mínima para /onboarding: marca legível (sem truncar), sem créditos/pesquisa do dashboard.
 */
export default function OnboardingChrome() {
  const router = useRouter();

  function handleLogout() {
    if (typeof window !== "undefined") {
      creditsDebug("OnboardingChrome: logout", {});
      localStorage.removeItem("token");
      localStorage.removeItem("credits");
      localStorage.removeItem("fitlife-user");
      window.dispatchEvent(new Event("fitlife-auth-changed"));
    }
    void signOut({ callbackUrl: "/" }).then(() => router.push("/"));
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06] bg-[rgba(15,25,50,0.72)] shadow-[0_1px_0_rgba(255,255,255,0.03)] backdrop-blur-[16px] supports-[backdrop-filter]:bg-[rgba(15,25,50,0.65)]">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:h-16 sm:px-6 lg:px-10">
        <Link
          href="/dashboard"
          className="inline-flex min-w-0 shrink-0 items-baseline gap-1.5 whitespace-nowrap text-white/90 transition hover:text-white focus:outline-none focus:ring-2 focus:ring-white/15 focus:ring-offset-2 focus:ring-offset-transparent"
        >
          <span className="text-[1.25rem] font-[600] tracking-[-0.03em]">FitLife</span>
          <span className="text-[0.95rem] font-[400] tracking-[-0.02em] text-white/75">Pass</span>
        </Link>

        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-full px-4 py-2 text-sm font-medium text-white/80 transition hover:bg-white/[0.08] hover:text-white"
          >
            Sair
          </button>
        </div>
      </div>
    </header>
  );
}
