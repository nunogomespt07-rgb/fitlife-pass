"use client";

import { useEffect, useMemo, useState } from "react";
import GlassCard from "@/app/components/ui/GlassCard";
import { getAllPartnersWithCategory } from "@/lib/activitiesData";

export default function BackofficePerfilPage() {
  const partners = useMemo(() => getAllPartnersWithCategory(), []);
  const [partnerId, setPartnerId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/backoffice/session", { method: "GET" });
        if (!res.ok) return;
        const data = (await res.json().catch(() => ({}))) as { partnerId?: string };
        if (data.partnerId) setPartnerId(data.partnerId);
      } catch {
        // ignore (layout/middleware redirects)
      }
    })();
  }, [partners]);

  const partner = useMemo(
    () => (partnerId ? partners.find((p) => p.id === partnerId) ?? null : null),
    [partnerId, partners]
  );

  return (
    <div>
      <GlassCard variant="app" padding="lg" className="border-white/10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-white/60">
              Perfil
            </p>
            <p className="mt-2 text-sm text-white/70">
              Perfil do parceiro/profissional (demo).
            </p>
          </div>
        </div>
      </GlassCard>

      <GlassCard variant="app" padding="lg" className="mt-6 border-white/10">
        <p className="text-sm font-semibold text-white">{partner?.name ?? "—"}</p>
        <p className="mt-1 text-sm text-white/70">{partner?.location ?? ""}</p>
        <p className="mt-3 text-sm text-white/75">{partner?.description ?? ""}</p>
        {partner?.provider?.type === "trainer" && (
          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/60">
              Especialidades
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {partner.provider.specialties.slice(0, 8).map((s) => (
                <span
                  key={s}
                  className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-white/80"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
}

