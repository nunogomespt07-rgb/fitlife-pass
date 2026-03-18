"use client";

import { useEffect, useState } from "react";
import GlassCard from "@/app/components/ui/GlassCard";

type PartnerRow = {
  partnerId: string;
  partnerName: string;
  reservations: number;
  credits: number;
  revenue: number;
  partnerPayout: number;
  platformMargin: number;
};

type FinanceMetrics = {
  totalRevenue: number;
  revenueInPeriod: number;
  platformRevenue: number;
  partnerPayoutTotal: number;
  creditsSold: number;
  creditsConsumed: number;
  creditsRemainingLiability: number;
  valuePerCredit: number;
  totalReservations: number;
  ticketMedio: number;
  byPartner: PartnerRow[];
  period: string;
  dateFrom: string | null;
  dateTo: string | null;
};

export default function AdminFinancasPage() {
  const [metrics, setMetrics] = useState<FinanceMetrics | null>(null);
  const [period, setPeriod] = useState("month");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [partnerSort, setPartnerSort] = useState<"revenue" | "reservations" | "platformMargin">("revenue");

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

  const partnerRows = metrics?.byPartner
    ? [...metrics.byPartner].sort((a, b) => {
        if (partnerSort === "revenue") return b.revenue - a.revenue;
        if (partnerSort === "reservations") return b.reservations - a.reservations;
        return b.platformMargin - a.platformMargin;
      })
    : [];
  const hasData = metrics && (metrics.creditsConsumed > 0 || metrics.creditsSold > 0 || (metrics.byPartner && metrics.byPartner.length > 0));

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-white/70 mb-3">Filtrar por</h2>
        <GlassCard variant="app" padding="lg" className="admin-card border-white/15">
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-xs text-white/60">Período</label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="rounded-xl border border-white/15 bg-slate-900/80 px-3 py-2 text-sm text-slate-200 outline-none focus:ring-1 focus:ring-white/30"
            >
              <option value="today">Hoje</option>
              <option value="yesterday">Ontem</option>
              <option value="week">Últimos 7 dias</option>
              <option value="month">Últimos 30 dias / Este mês</option>
              <option value="custom">Personalizado</option>
            </select>
            {period === "custom" && (
              <>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="rounded-xl border border-white/15 bg-slate-900/80 px-3 py-2 text-sm text-slate-200 outline-none"
                />
                <span className="text-white/50">–</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="rounded-xl border border-white/15 bg-slate-900/80 px-3 py-2 text-sm text-slate-200 outline-none"
                />
              </>
            )}
          </div>
        </GlassCard>
      </section>

      {metrics != null && hasData && (
        <>
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-white/70 mb-3">Resumo (KPIs)</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <GlassCard variant="app" padding="lg" className="admin-card border-white/15">
                <p className="text-xs font-semibold uppercase tracking-wider text-white/60">Receita total (€)</p>
                <p className="mt-2 text-2xl font-semibold text-white">{metrics.totalRevenue.toFixed(2)} €</p>
              </GlassCard>
              <GlassCard variant="app" padding="lg" className="admin-card border-white/15">
                <p className="text-xs font-semibold uppercase tracking-wider text-white/60">Receita no período (€)</p>
                <p className="mt-2 text-2xl font-semibold text-white">{metrics.revenueInPeriod.toFixed(2)} €</p>
              </GlassCard>
              <GlassCard variant="app" padding="lg" className="admin-card border-white/15">
                <p className="text-xs font-semibold uppercase tracking-wider text-white/60">Créditos consumidos</p>
                <p className="mt-2 text-2xl font-semibold text-white">{metrics.creditsConsumed}</p>
              </GlassCard>
              <GlassCard variant="app" padding="lg" className="admin-card border-white/15">
                <p className="text-xs font-semibold uppercase tracking-wider text-white/60">Valor médio por crédito (€)</p>
                <p className="mt-2 text-2xl font-semibold text-white">{metrics.valuePerCredit.toFixed(2)} €</p>
              </GlassCard>
              <GlassCard variant="app" padding="lg" className="admin-card border-white/15">
                <p className="text-xs font-semibold uppercase tracking-wider text-white/60">Receita para parceiros (€)</p>
                <p className="mt-2 text-2xl font-semibold text-white">{metrics.partnerPayoutTotal.toFixed(2)} €</p>
              </GlassCard>
              <GlassCard variant="app" padding="lg" className="admin-card border-white/15">
                <p className="text-xs font-semibold uppercase tracking-wider text-white/60">Receita da plataforma (€)</p>
                <p className="mt-2 text-2xl font-semibold text-white">{metrics.platformRevenue.toFixed(2)} €</p>
              </GlassCard>
              <GlassCard variant="app" padding="lg" className="admin-card border-white/15">
                <p className="text-xs font-semibold uppercase tracking-wider text-white/60">Total de reservas</p>
                <p className="mt-2 text-2xl font-semibold text-white">{metrics.totalReservations}</p>
              </GlassCard>
              <GlassCard variant="app" padding="lg" className="admin-card border-white/15">
                <p className="text-xs font-semibold uppercase tracking-wider text-white/60">Ticket médio por reserva (€)</p>
                <p className="mt-2 text-2xl font-semibold text-white">{metrics.ticketMedio.toFixed(2)} €</p>
              </GlassCard>
            </div>
          </section>

          {partnerRows.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-white/70 mb-3">Receita por parceiro</h2>
              <GlassCard variant="app" padding="lg" className="admin-card border-white/15 overflow-x-auto">
                <table className="admin-table w-full min-w-[640px] text-left text-sm">
                  <thead>
                    <tr>
                      <th className="pb-2 pr-2">Parceiro</th>
                      <th className="pb-2 pr-2 cursor-pointer" onClick={() => setPartnerSort("reservations")}>nº reservas</th>
                      <th className="pb-2 pr-2">Créditos consumidos</th>
                      <th className="pb-2 pr-2 cursor-pointer" onClick={() => setPartnerSort("revenue")}>Receita gerada (€)</th>
                      <th className="pb-2 pr-2">Valor pago ao parceiro (€)</th>
                      <th className="pb-2 pr-2 cursor-pointer" onClick={() => setPartnerSort("platformMargin")}>Margem plataforma (€)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {partnerRows.map((row) => (
                      <tr key={row.partnerId}>
                        <td className="py-2 pr-2">{row.partnerName || row.partnerId}</td>
                        <td className="py-2 pr-2">{row.reservations}</td>
                        <td className="py-2 pr-2">{row.credits}</td>
                        <td className="py-2 pr-2">{row.revenue.toFixed(2)} €</td>
                        <td className="py-2 pr-2">{row.partnerPayout.toFixed(2)} €</td>
                        <td className="py-2 pr-2">{row.platformMargin.toFixed(2)} €</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </GlassCard>
            </section>
          )}
        </>
      )}

      {metrics != null && !hasData && (
        <GlassCard variant="app" padding="lg" className="admin-card border-white/15">
          <p className="text-center text-white/70">Sem dados financeiros para o período selecionado.</p>
        </GlassCard>
      )}

      {metrics == null && (
        <GlassCard variant="app" padding="lg" className="admin-card border-white/15">
          <p className="text-sm text-white/70">A carregar…</p>
        </GlassCard>
      )}
    </div>
  );
}
