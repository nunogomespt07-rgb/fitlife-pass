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
        <h2 className="admin-kpi-label mb-3">Filtrar por período</h2>
        <GlassCard variant="app" padding="lg" className="admin-card border-white/15">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-white/55">Período</label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="admin-input rounded-lg px-3 py-2 text-sm text-slate-200"
              >
                <option value="today">Hoje</option>
                <option value="yesterday">Ontem</option>
                <option value="week">Últimos 7 dias</option>
                <option value="month">Últimos 30 dias / Este mês</option>
                <option value="custom">Personalizado</option>
              </select>
            </div>
            {period === "custom" && (
              <div className="admin-date-range flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <label className="text-xs text-white/55">Data de</label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="admin-input rounded-lg px-3 py-2 text-sm text-slate-200"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-white/55">até</label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="admin-input rounded-lg px-3 py-2 text-sm text-slate-200"
                  />
                </div>
              </div>
            )}
          </div>
        </GlassCard>
      </section>

      {metrics != null && hasData && (
        <>
          <section>
            <h2 className="admin-kpi-label mb-3">Resumo (KPIs)</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <GlassCard variant="app" padding="lg" className="admin-card border-white/15">
                <p className="admin-kpi-label">Receita total</p>
                <p className="admin-kpi-value mt-1.5">{metrics.totalRevenue.toLocaleString("pt-PT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</p>
              </GlassCard>
              <GlassCard variant="app" padding="lg" className="admin-card border-white/15">
                <p className="admin-kpi-label">Receita no período</p>
                <p className="admin-kpi-value mt-1.5">{metrics.revenueInPeriod.toLocaleString("pt-PT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</p>
              </GlassCard>
              <GlassCard variant="app" padding="lg" className="admin-card border-white/15">
                <p className="admin-kpi-label">Créditos consumidos</p>
                <p className="admin-kpi-value mt-1.5">{metrics.creditsConsumed}</p>
              </GlassCard>
              <GlassCard variant="app" padding="lg" className="admin-card border-white/15">
                <p className="admin-kpi-label">Valor médio por crédito</p>
                <p className="admin-kpi-value mt-1.5">{metrics.valuePerCredit.toLocaleString("pt-PT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</p>
              </GlassCard>
              <GlassCard variant="app" padding="lg" className="admin-card border-white/15">
                <p className="admin-kpi-label">Receita para parceiros</p>
                <p className="admin-kpi-value mt-1.5">{metrics.partnerPayoutTotal.toLocaleString("pt-PT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</p>
              </GlassCard>
              <GlassCard variant="app" padding="lg" className="admin-card border-white/15">
                <p className="admin-kpi-label">Receita da plataforma</p>
                <p className="admin-kpi-value mt-1.5">{metrics.platformRevenue.toLocaleString("pt-PT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</p>
              </GlassCard>
              <GlassCard variant="app" padding="lg" className="admin-card border-white/15">
                <p className="admin-kpi-label">Total de reservas</p>
                <p className="admin-kpi-value mt-1.5">{metrics.totalReservations}</p>
              </GlassCard>
              <GlassCard variant="app" padding="lg" className="admin-card border-white/15">
                <p className="admin-kpi-label">Ticket médio por reserva</p>
                <p className="admin-kpi-value mt-1.5">{metrics.ticketMedio.toLocaleString("pt-PT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</p>
              </GlassCard>
            </div>
          </section>

          {partnerRows.length > 0 && (
            <section>
              <h2 className="admin-kpi-label mb-3">Receita por parceiro</h2>
              <GlassCard variant="app" padding="lg" className="admin-card border-white/15 overflow-x-auto">
                <table className="admin-table w-full min-w-[640px] text-left text-sm">
                  <thead>
                    <tr>
                      <th>Parceiro</th>
                      <th className="cursor-pointer" onClick={() => setPartnerSort("reservations")}>nº reservas</th>
                      <th>Créditos consumidos</th>
                      <th className="cursor-pointer" onClick={() => setPartnerSort("revenue")}>Receita gerada</th>
                      <th>Valor pago ao parceiro</th>
                      <th className="cursor-pointer" onClick={() => setPartnerSort("platformMargin")}>Margem plataforma</th>
                    </tr>
                  </thead>
                  <tbody>
                    {partnerRows.map((row) => (
                      <tr key={row.partnerId}>
                        <td>{row.partnerName || row.partnerId}</td>
                        <td className="tabular-nums">{row.reservations}</td>
                        <td className="tabular-nums">{row.credits}</td>
                        <td className="tabular-nums">{row.revenue.toLocaleString("pt-PT", { minimumFractionDigits: 2 })} €</td>
                        <td className="tabular-nums">{row.partnerPayout.toLocaleString("pt-PT", { minimumFractionDigits: 2 })} €</td>
                        <td className="tabular-nums">{row.platformMargin.toLocaleString("pt-PT", { minimumFractionDigits: 2 })} €</td>
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
          <p className="admin-empty">Sem dados financeiros para o período selecionado.</p>
        </GlassCard>
      )}

      {metrics == null && (
        <GlassCard variant="app" padding="lg" className="admin-card border-white/15">
          <p className="text-sm text-white/60">A carregar…</p>
        </GlassCard>
      )}
    </div>
  );
}
