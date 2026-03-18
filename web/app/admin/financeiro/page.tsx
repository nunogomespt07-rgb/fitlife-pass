"use client";

import { useEffect, useState } from "react";
import GlassCard from "@/app/components/ui/GlassCard";

type FinanceMetrics = {
  totalRevenue: number;
  platformRevenue: number;
  partnerPayoutTotal: number;
  creditsSold: number;
  creditsConsumed: number;
  creditsRemainingLiability: number;
  averageRevenuePerUser: number;
  averageCreditsPerPurchase: number;
  valuePerCredit: number;
  byPartner: Record<string, { credits: number; revenue: number }>;
  byPlan: Record<string, number>;
  period: string;
  dateFrom: string | null;
  dateTo: string | null;
};

export default function AdminFinanceiroPage() {
  const [metrics, setMetrics] = useState<FinanceMetrics | null>(null);
  const [period, setPeriod] = useState("month");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("period", period);
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);
    fetch(`/api/admin/finance/metrics?${params}`)
      .then((r) => (r.ok ? r.json() : null))
      .then(setMetrics)
      .catch(() => setMetrics(null));
  }, [period, dateFrom, dateTo]);

  return (
    <div className="space-y-6">
      <GlassCard variant="app" padding="lg" className="border-white/10">
        <p className="text-xs font-semibold uppercase tracking-wider text-white/60">Filtros</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none"
          >
            <option value="today">Hoje</option>
            <option value="yesterday">Ontem</option>
            <option value="week">Esta semana</option>
            <option value="month">Este mês</option>
          </select>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            placeholder="De"
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none"
          />
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            placeholder="Até"
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none"
          />
        </div>
      </GlassCard>

      {metrics != null && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <GlassCard variant="app" padding="lg" className="border-white/10">
              <p className="text-xs font-semibold uppercase tracking-wider text-white/60">Receita total</p>
              <p className="mt-2 text-2xl font-semibold text-white">{metrics.totalRevenue.toFixed(2)} €</p>
            </GlassCard>
            <GlassCard variant="app" padding="lg" className="border-white/10">
              <p className="text-xs font-semibold uppercase tracking-wider text-white/60">Receita plataforma</p>
              <p className="mt-2 text-2xl font-semibold text-white">{metrics.platformRevenue.toFixed(2)} €</p>
            </GlassCard>
            <GlassCard variant="app" padding="lg" className="border-white/10">
              <p className="text-xs font-semibold uppercase tracking-wider text-white/60">Payout parceiros</p>
              <p className="mt-2 text-2xl font-semibold text-white">{metrics.partnerPayoutTotal.toFixed(2)} €</p>
            </GlassCard>
            <GlassCard variant="app" padding="lg" className="border-white/10">
              <p className="text-xs font-semibold uppercase tracking-wider text-white/60">Créditos vendidos</p>
              <p className="mt-2 text-2xl font-semibold text-white">{metrics.creditsSold}</p>
            </GlassCard>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <GlassCard variant="app" padding="lg" className="border-white/10">
              <p className="text-xs font-semibold uppercase tracking-wider text-white/60">Créditos consumidos</p>
              <p className="mt-2 text-xl font-semibold text-white">{metrics.creditsConsumed}</p>
            </GlassCard>
            <GlassCard variant="app" padding="lg" className="border-white/10">
              <p className="text-xs font-semibold uppercase tracking-wider text-white/60">Média receita/utilizador</p>
              <p className="mt-2 text-xl font-semibold text-white">{metrics.averageRevenuePerUser.toFixed(2)} €</p>
            </GlassCard>
            <GlassCard variant="app" padding="lg" className="border-white/10">
              <p className="text-xs font-semibold uppercase tracking-wider text-white/60">Valor por crédito</p>
              <p className="mt-2 text-xl font-semibold text-white">{metrics.valuePerCredit.toFixed(2)} €</p>
            </GlassCard>
          </div>

          {Object.keys(metrics.byPartner).length > 0 && (
            <GlassCard variant="app" padding="lg" className="border-white/10">
              <p className="text-xs font-semibold uppercase tracking-wider text-white/60">Por parceiro</p>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[400px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-white/60">
                      <th className="pb-2 pr-2">Parceiro</th>
                      <th className="pb-2 pr-2">Créditos</th>
                      <th className="pb-2 pr-2">Receita</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(metrics.byPartner).map(([partnerId, data]) => (
                      <tr key={partnerId} className="border-b border-white/5 text-white/80">
                        <td className="py-2 pr-2">{partnerId}</td>
                        <td className="py-2 pr-2">{data.credits}</td>
                        <td className="py-2 pr-2">{data.revenue.toFixed(2)} €</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          )}
        </>
      )}

      {metrics == null && (
        <GlassCard variant="app" padding="lg" className="border-white/10">
          <p className="text-sm text-white/70">A carregar métricas…</p>
        </GlassCard>
      )}
    </div>
  );
}
