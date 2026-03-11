"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Legacy route /activities/[id] is no longer used.
 * Activity details live at:
 * /activities/categorias/[slug]/parceiros/[partnerId]/atividades/[activityId]
 * Redirect any old links to the main activities page to avoid 400 from API.
 */
export default function LegacyActivityIdPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/activities");
  }, [router]);

  return (
    <div className="page-bg flex min-h-screen items-center justify-center font-sans text-white">
      <p className="text-sm text-white/70">A redirecionar…</p>
    </div>
  );
}
