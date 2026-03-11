"use client";

import type { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="page-bg page-bg-dashboard text-white font-sans min-h-screen">
      <div className="mx-auto max-w-6xl px-4 pb-24 pt-20 sm:px-6 lg:px-10">
        {children}
      </div>
    </div>
  );
}

