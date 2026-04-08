"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { getStoredUser } from "@/lib/storedUser";

/**
 * Se o registo por email ficou com onboarding por concluir, força o fluxo
 * de preferências antes de usar o dashboard (evita saltar por URL).
 */
export default function DashboardOnboardingGate({ children }: { children: ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("token");
    if (!token) return;
    const u = getStoredUser();
    if (u?.onboardingCompleted === false) {
      router.replace("/onboarding?step=1");
    }
  }, [router]);

  return <>{children}</>;
}
