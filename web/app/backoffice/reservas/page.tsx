"use client";

import { useEffect, useMemo, useState } from "react";
import GlassCard from "@/app/components/ui/GlassCard";
import {
  getAllPartnersWithCategory,
  type PartnerWithCategory,
} from "@/lib/activitiesData";
import {
  getPartnerReservationsForCurrentUser,
} from "@/lib/backoffice";

function formatDate(dateISO: string): string {
  const d = new Date(dateISO + "T12:00:00");
  return d.toLocaleDateString("pt-PT", { day: "numeric", month: "short" });
}

export default function BackofficeReservasPage() {
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

  const partner = useMemo<PartnerWithCategory | null>(
    () => (partnerId ? partners.find((p) => p.id === partnerId) ?? null : null),
    [partnerId, partners]
  );

  const reservations = useMemo(() => {
    if (!partnerId) return [];
    return getPartnerReservationsForCurrentUser(partnerId)
      .slice()
      .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
  }, [partnerId]);

  const upcoming = reservations.filter((r) => r.status === "confirmed");
  const cancelled = reservations.filter((r) => r.status === "cancelled");
  const completed = reservations.filter((r) => r.status === "completed");

  return (
    <div>
      <GlassCard variant="app" padding="lg" className="border-white/10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-white/60">
              Reservas
            </p>
            <p className="mt-2 text-sm text-white/70">
              Vista demo: reservas do utilizador atual filtradas pelo teu parceiro.
            </p>
          </div>
        </div>
      </GlassCard>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <GlassCard variant="app" padding="md" className="border-white/10">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/60">Confirmadas</p>
          <p className="mt-2 text-2xl font-semibold text-white">{upcoming.length}</p>
        </GlassCard>
        <GlassCard variant="app" padding="md" className="border-white/10">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/60">Concluídas</p>
          <p className="mt-2 text-2xl font-semibold text-white">{completed.length}</p>
        </GlassCard>
        <GlassCard variant="app" padding="md" className="border-white/10">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/60">Canceladas</p>
          <p className="mt-2 text-2xl font-semibold text-white">{cancelled.length}</p>
        </GlassCard>
      </div>

      <div className="mt-6 grid gap-3">
        {upcoming.length === 0 && completed.length === 0 && cancelled.length === 0 ? (
          <GlassCard variant="app" padding="lg" className="border-white/10">
            <p className="text-sm text-white/75">
              Sem reservas para este parceiro.
            </p>
          </GlassCard>
        ) : (
          upcoming.concat(completed, cancelled).map((r) => (
            <GlassCard key={r.id} variant="app" padding="md" className="border-white/10">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white">
                    {r.type === "gym" ? "Acesso" : (r.activityTitle ?? r.partnerName)}
                  </p>
                  <p className="mt-1 text-xs text-white/60">
                    {formatDate(r.date)} · {r.time} · {r.status}
                  </p>
                  <p className="mt-1 text-xs text-white/60">
                    Créditos: {r.creditsUsed}
                  </p>
                </div>
                <span className="text-xs text-white/60">
                  {partner?.name ?? r.partnerName}
                </span>
              </div>
            </GlassCard>
          ))
        )}
      </div>
    </div>
  );
}

