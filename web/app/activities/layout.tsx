"use client";

import type { ReactNode } from "react";

export default function ActivitiesLayout({ children }: { children: ReactNode }) {
  return (
    <div className="page-bg page-bg-dashboard text-white font-sans min-h-screen app-internal">
      {children}
    </div>
  );
}
