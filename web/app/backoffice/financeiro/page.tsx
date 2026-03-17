"use client";

import { useEffect, useMemo, useState } from "react";
import GlassCard from "@/app/components/ui/GlassCard";
import { getAllPartnersWithCategory } from "@/lib/activitiesData";
import {
  getEurPerCredit,
  getPartnerReservationsForCurrentUser,
  setEurPerCredit,
} from "@/lib/backoffice";
import { getAuthedBackofficePartnerId } from "@/lib/backofficeAuth";

function currentMonthKey(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function isInMonth(dateISO: string, monthKey: string): boolean {
  return dateISO.slice(0, 7) === monthKey;
}

export default function BackofficeFinanceiroPage() {
  const partners = useMemo(() => getAllPartnersWithCategory(), []);
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [eurPerCredit, setEurPerCreditState] = useState<number>(() => getEurPerCredit());

  useEffect(() => {
    setPartnerId(getAuthedBackofficePartnerId());
  }, [partners]);

  const monthKey = currentMonthKey();
  const monthReservations = useMemo(() => {
    if (!partnerId) return [];
    return getPartnerReservationsForCurrentUser(partnerId).filter((r) => isInMonth(r.date, monthKey));
  }, [partnerId, monthKey]);

  const confirmed = monthReservations.filter((r) => r.status === "confirmed" || r.status === "completed");
  const creditsConsumed = confirmed.reduce((sum, r) => sum + (r.creditsUsed > 0 ? r.creditsUsed : 0), 0);
  const reservationsCount = confirmed.length;
  const avgCredits = reservationsCount > 0 ? creditsConsumed / reservationsCount : 0;
  const estimatedEur = creditsConsumed * eurPerCredit;

  const breakdown = useMemo(() => {
    const map = new Map<string, { label: string; count: number; credits: number }>();
    for (const r of confirmed) {
      const label = r.type === "gym" ? "Acesso" : (r.activityTitle ?? r.partnerName);
      const key = `${r.partnerId}|${label}|${r.time}`;
      const existing = map.get(key) ?? { label, count: 0, credits: 0 };
      existing.count += 1;
      existing.credits += r.creditsUsed > 0 ? r.creditsUsed : 0;
      map.set(key, existing);
    }
    return [...map.values()].sort((a, b) => b.credits - a.credits);
  }, [confirmed]);

  return (
    <div>
      <GlassCard variant="app" padding="lg" className="border-white/10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-white/60">
              Financeiro
            </p>
            <p className="mt-2 text-sm text-white/70">
              Estimativas baseadas em créditos consumidos este mês (demo).
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
              <span className="text-xs font-semibold text-white/60">€ / crédito</span>
              <input
                value={eurPerCredit}
                onChange={(e) => setEurPerCreditState(Number(e.target.value))}
                onBlur={() => setEurPerCredit(eurPerCredit)}
                inputMode="decimal"
                className="w-20 bg-transparent text-sm font-semibold text-white outline-none"
              />
            </div>
          </div>
        </div>
      </GlassCard>

      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        <GlassCard variant="app" padding="md" className="border-white/10">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/60">Créditos consumidos</p>
          <p className="mt-2 text-2xl font-semibold text-white">{creditsConsumed}</p>
        </GlassCard>
        <GlassCard variant="app" padding="md" className="border-white/10">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/60">Estimativa (€)</p>
          <p className="mt-2 text-2xl font-semibold text-white">{estimatedEur.toFixed(0)}</p>
        </GlassCard>
        <GlassCard variant="app" padding="md" className="border-white/10">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/60">Reservas</p>
          <p className="mt-2 text-2xl font-semibold text-white">{reservationsCount}</p>
        </GlassCard>
        <GlassCard variant="app" padding="md" className="border-white/10">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/60">Média créditos</p>
          <p className="mt-2 text-2xl font-semibold text-white">{avgCredits.toFixed(1)}</p>
        </GlassCard>
      </div>

      <GlassCard variant="app" padding="lg" className="mt-6 border-white/10">
        <p className="text-xs font-semibold uppercase tracking-wider text-white/60">
          Breakdown (este mês)
        </p>
        <div className="mt-4 space-y-2">
          {breakdown.length === 0 ? (
            <p className="text-sm text-white/70">Sem dados ainda.</p>
          ) : (
            breakdown.slice(0, 12).map((b) => (
              <div
                key={b.label + b.count + b.credits}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">{b.label}</p>
                  <p className="mt-0.5 text-xs text-white/60">{b.count} cliente(s)</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-white">{b.credits} créditos</p>
                  <p className="mt-0.5 text-xs text-white/60">
                    ~ €{(b.credits * eurPerCredit).toFixed(0)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </GlassCard>
    </div>
  );
}

