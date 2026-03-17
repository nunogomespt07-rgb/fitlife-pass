"use client";

import { usePathname } from "next/navigation";
import Nav, { MobileSearchProvider } from "@/app/components/Nav";
import MobileDashboardNav from "@/app/components/MobileDashboardNav";
import Footer from "@/app/components/Footer";

export default function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isPartnerBackoffice = pathname.startsWith("/backoffice");
  const isAdminBackoffice = pathname.startsWith("/admin");

  if (isPartnerBackoffice || isAdminBackoffice) {
    // Backoffice areas use their own layouts/shells; avoid leaking customer chrome/context.
    return <>{children}</>;
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

