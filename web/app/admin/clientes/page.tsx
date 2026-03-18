"use client";

import { useEffect, useState } from "react";
import GlassCard from "@/app/components/ui/GlassCard";

type CustomerItem = {
  userEmail: string;
  fullName: string | null;
  email: string;
  createdAt: string | null;
  currentPlan: string | null;
  purchasedCredits: number;
  totalReservations: number;
  lastActivity: string | null;
  status: string;
};

type ListRes = {
  items: CustomerItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

type MetricsRes = {
  totalUsers: number;
  newToday: number;
  newWeek: number;
  newMonth: number;
  withPlan: number;
  withoutPlan: number;
};

export default function AdminClientesPage() {
  const [metrics, setMetrics] = useState<MetricsRes | null>(null);
  const [list, setList] = useState<ListRes | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("");
  const [sort, setSort] = useState("newest");

  useEffect(() => {
    fetch("/api/admin/customers/metrics")
      .then((r) => (r.ok ? r.json() : null))
      .then(setMetrics)
      .catch(() => setMetrics(null));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));
    if (search) params.set("search", search);
    if (planFilter) params.set("plan", planFilter);
    if (sort) params.set("sort", sort);
    fetch(`/api/admin/customers/list?${params}`)
      .then((r) => (r.ok ? r.json() : null))
      .then(setList)
      .catch(() => setList(null));
  }, [page, pageSize, search, planFilter, sort]);

  return (
    <div className="space-y-6">
      <GlassCard variant="app" padding="lg" className="border-white/10">
        <p className="text-xs font-semibold uppercase tracking-wider text-white/60">Base de dados de clientes</p>
        {metrics != null ? (
          <div className="mt-2 flex flex-wrap gap-4 text-sm text-white/80">
            <span>Total: <strong>{metrics.totalUsers}</strong></span>
            <span>Hoje: <strong>{metrics.newToday}</strong></span>
            <span>Esta semana: <strong>{metrics.newWeek}</strong></span>
            <span>Este mês: <strong>{metrics.newMonth}</strong></span>
            <span>Com plano: <strong>{metrics.withPlan}</strong></span>
            <span>Sem plano: <strong>{metrics.withoutPlan}</strong></span>
          </div>
        ) : (
          <p className="mt-2 text-sm text-white/70">A carregar…</p>
        )}
      </GlassCard>

      <GlassCard variant="app" padding="lg" className="border-white/10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <input
            type="text"
            placeholder="Pesquisar (email, nome)"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 outline-none"
          />
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={planFilter}
              onChange={(e) => { setPlanFilter(e.target.value); setPage(1); }}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none"
            >
              <option value="">Todos os planos</option>
              <option value="with">Com plano</option>
              <option value="without">Sem plano</option>
            </select>
            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value); setPage(1); }}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none"
            >
              <option value="newest">Mais recentes</option>
              <option value="oldest">Mais antigos</option>
              <option value="email">Email</option>
              <option value="reservations">Por reservas</option>
            </select>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-white/60">
                <th className="pb-2 pr-2">Email</th>
                <th className="pb-2 pr-2">Plano</th>
                <th className="pb-2 pr-2">Créditos</th>
                <th className="pb-2 pr-2">Reservas</th>
                <th className="pb-2 pr-2">Última atividade</th>
                <th className="pb-2 pr-2">Estado</th>
              </tr>
            </thead>
            <tbody>
              {list?.items?.length ? (
                list.items.map((c) => (
                  <tr key={c.email} className="border-b border-white/5 text-white/80">
                    <td className="py-2 pr-2">{c.email}</td>
                    <td className="py-2 pr-2">{c.currentPlan ?? "—"}</td>
                    <td className="py-2 pr-2">{c.purchasedCredits}</td>
                    <td className="py-2 pr-2">{c.totalReservations}</td>
                    <td className="py-2 pr-2">{c.lastActivity ?? "—"}</td>
                    <td className="py-2 pr-2">{c.status}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-white/50">Nenhum cliente encontrado.</td>
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
