"use client";

import { useEffect, useState } from "react";
import GlassCard from "@/app/components/ui/GlassCard";

type ReservationItem = {
  id: string;
  userEmail: string;
  customerName?: string | null;
  partnerId: string;
  partnerName: string;
  activityTitle?: string | null;
  type: string;
  date: string;
  time: string;
  status: string;
  creditsUsed: number;
  createdAt: string;
};

type ListRes = {
  items: ReservationItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

type MetricsRes = {
  total: number;
  upcoming: number;
  completed: number;
  cancelled: number;
  noShow: number;
};

export default function AdminReservasPage() {
  const [metrics, setMetrics] = useState<MetricsRes | null>(null);
  const [list, setList] = useState<ListRes | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [status, setStatus] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");

  useEffect(() => {
    fetch("/api/admin/reservations/metrics")
      .then((r) => (r.ok ? r.json() : null))
      .then(setMetrics)
      .catch(() => setMetrics(null));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));
    if (status) params.set("status", status);
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);
    if (search) params.set("search", search);
    if (sort) params.set("sort", sort);
    fetch(`/api/admin/reservations/list?${params}`)
      .then((r) => (r.ok ? r.json() : null))
      .then(setList)
      .catch(() => setList(null));
  }, [page, pageSize, status, dateFrom, dateTo, search, sort]);

  return (
    <div className="space-y-6">
      <GlassCard variant="app" padding="lg" className="border-white/10">
        <p className="text-xs font-semibold uppercase tracking-wider text-white/60">Reservas globais</p>
        {metrics != null ? (
          <div className="mt-2 flex flex-wrap gap-4 text-sm text-white/80">
            <span>Total: <strong>{metrics.total}</strong></span>
            <span>Próximas: <strong>{metrics.upcoming}</strong></span>
            <span>Concluídas: <strong>{metrics.completed}</strong></span>
            <span>Canceladas: <strong>{metrics.cancelled}</strong></span>
            <span>No-show: <strong>{metrics.noShow}</strong></span>
          </div>
        ) : (
          <p className="mt-2 text-sm text-white/70">A carregar…</p>
        )}
      </GlassCard>

      <GlassCard variant="app" padding="lg" className="border-white/10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <input
            type="text"
            placeholder="Pesquisar (cliente, email, parceiro, atividade)"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 outline-none"
          />
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none"
            >
              <option value="">Todos os estados</option>
              <option value="confirmed">Confirmada</option>
              <option value="completed">Concluída</option>
              <option value="cancelled">Cancelada</option>
              <option value="no_show">No-show</option>
            </select>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none"
            />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none"
            />
            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value); setPage(1); }}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none"
            >
              <option value="newest">Mais recentes</option>
              <option value="oldest">Mais antigas</option>
              <option value="date">Por data</option>
            </select>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-white/60">
                <th className="pb-2 pr-2">Data / Hora</th>
                <th className="pb-2 pr-2">Cliente</th>
                <th className="pb-2 pr-2">Parceiro</th>
                <th className="pb-2 pr-2">Atividade</th>
                <th className="pb-2 pr-2">Estado</th>
                <th className="pb-2 pr-2">Créditos</th>
              </tr>
            </thead>
            <tbody>
              {list?.items?.length ? (
                list.items.map((r) => (
                  <tr key={r.id} className="border-b border-white/5 text-white/80">
                    <td className="py-2 pr-2">{r.date} {r.time}</td>
                    <td className="py-2 pr-2">{r.customerName || r.userEmail}</td>
                    <td className="py-2 pr-2">{r.partnerName}</td>
                    <td className="py-2 pr-2">{r.activityTitle ?? "—"}</td>
                    <td className="py-2 pr-2">{r.status}</td>
                    <td className="py-2 pr-2">{r.creditsUsed}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-white/50">Nenhuma reserva encontrada.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {list && list.totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/60">Por página</span>
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-sm text-white outline-none"
              >
                {[10, 20, 50].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
              <span className="text-xs text-white/50">{list.total} total</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white/85 hover:bg-white/10 disabled:opacity-40"
              >
                ← Anterior
              </button>
              <span className="text-sm text-white/70">Página {list.page} de {list.totalPages}</span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(list.totalPages, p + 1))}
                disabled={page >= list.totalPages}
                className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white/85 hover:bg-white/10 disabled:opacity-40"
              >
                Seguinte →
              </button>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
