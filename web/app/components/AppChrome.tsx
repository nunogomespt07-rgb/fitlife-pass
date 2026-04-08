"use client";

import { usePathname } from "next/navigation";
import Nav, { MobileSearchProvider } from "@/app/components/Nav";
import MobileDashboardNav from "@/app/components/MobileDashboardNav";
import Footer from "@/app/components/Footer";
import OnboardingChrome from "@/app/components/OnboardingChrome";

/**
 * Customer-facing shell: nav, footer, mobile dashboard bar.
 * Auth routes (/auth/*) must not show the authenticated app chrome — only page content.
 * Onboarding uses a minimal top bar (sem créditos/pesquisa) para evitar layout partido.
 */
export default function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isPartnerBackoffice = pathname.startsWith("/backoffice");
  const isAdminBackoffice = pathname.startsWith("/admin");
  const isAuthRoute = pathname.startsWith("/auth");
  const isOnboarding = pathname.startsWith("/onboarding");

  if (
    typeof process !== "undefined" &&
    process.env.NODE_ENV === "development" &&
    process.env.NEXT_PUBLIC_DEBUG_AUTH === "1"
  ) {
    console.log("[AppChrome] route", pathname, {
      isAuthRoute,
      isOnboarding,
      isPartnerBackoffice,
      isAdminBackoffice,
    });
  }

  if (isPartnerBackoffice || isAdminBackoffice || isAuthRoute) {
    return <>{children}</>;
  }

  if (isOnboarding) {
    return (
      <MobileSearchProvider>
        <OnboardingChrome />
        <div className="pb-8 md:pb-10">{children}</div>
      </MobileSearchProvider>
    );
  }

  return (
    <MobileSearchProvider>
      <Nav />
      <div className="pb-[calc(140px+env(safe-area-inset-bottom,0px))] md:pb-0">
        {children}
        <Footer />
      </div>
      <MobileDashboardNav />
    </MobileSearchProvider>
  );
}
