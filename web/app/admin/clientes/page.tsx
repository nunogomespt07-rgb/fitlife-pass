"use client";

import { useEffect, useState } from "react";
import GlassCard from "@/app/components/ui/GlassCard";

type CustomerItem = {
  userEmail: string;
  fullName: string | null;
  email: string;
  phone: string | null;
  country: string | null;
  city: string | null;
  createdAt: string | null;
  currentPlan: string | null;
  purchasedCredits: number;
  totalReservations: number;
  lastActivity: string | null;
  status: string;
  blocked: boolean;
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
  const [filterOpen, setFilterOpen] = useState(false);
  const [planFilter, setPlanFilter] = useState("");
  const [sort, setSort] = useState("newest");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [creditsMin, setCreditsMin] = useState("");
  const [creditsMax, setCreditsMax] = useState("");
  const [reservationsMin, setReservationsMin] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [activityFilter, setActivityFilter] = useState("");
  const [refetch, setRefetch] = useState(0);

  const api = (path: string, options?: RequestInit) =>
    fetch(path, { credentials: "include", ...options });
  const enc = (e: string) => encodeURIComponent(e.trim().toLowerCase());

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
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);
    if (country) params.set("country", country);
    if (city) params.set("city", city);
    if (creditsMin !== "") params.set("creditsMin", creditsMin);
    if (creditsMax !== "") params.set("creditsMax", creditsMax);
    if (reservationsMin !== "") params.set("reservationsMin", reservationsMin);
    if (statusFilter) params.set("status", statusFilter);
    if (activityFilter) params.set("activity", activityFilter);
    fetch(`/api/admin/customers/list?${params}`)
      .then((r) => (r.ok ? r.json() : null))
      .then(setList)
      .catch(() => setList(null));
  }, [page, pageSize, search, planFilter, sort, dateFrom, dateTo, country, city, creditsMin, creditsMax, reservationsMin, statusFilter, activityFilter, refetch]);

  const activeFilters =
    [planFilter, dateFrom, dateTo, country, city, creditsMin, creditsMax, reservationsMin, statusFilter, activityFilter].filter(Boolean).length;

  return (
    <div className="space-y-6">
      <GlassCard variant="app" padding="lg" className="admin-card border-white/15">
        <p className="admin-kpi-label">Base de dados de clientes</p>
        {metrics != null ? (
          <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm text-white/75">
            <span>Total: <strong className="text-white/90">{metrics.totalUsers}</strong></span>
            <span>Hoje: <strong className="text-white/90">{metrics.newToday}</strong></span>
            <span>Esta semana: <strong className="text-white/90">{metrics.newWeek}</strong></span>
            <span>Este mês: <strong className="text-white/90">{metrics.newMonth}</strong></span>
            <span>Com plano: <strong className="text-white/90">{metrics.withPlan}</strong></span>
            <span>Sem plano: <strong className="text-white/90">{metrics.withoutPlan}</strong></span>
          </div>
        ) : (
          <p className="mt-2 text-sm text-white/60">A carregar…</p>
        )}
      </GlassCard>

      <GlassCard variant="app" padding="lg" className="admin-card border-white/15">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <input
              type="search"
              placeholder="Pesquisar por nome, email ou contacto"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="admin-input w-full max-w-sm rounded-lg border border-white/12 bg-slate-900/90 px-3 py-2 text-sm text-slate-200 placeholder:text-white/40 outline-none focus:border-white/25 focus:ring-2 focus:ring-white/10"
            />
            <div className="flex flex-wrap items-center gap-2">
              <details
                open={filterOpen}
                onToggle={(e) => setFilterOpen((e.target as HTMLDetailsElement).open)}
                className="admin-dropdown-panel rounded-lg border border-white/12 bg-slate-900/90"
              >
                <summary className="admin-dropdown-trigger cursor-pointer list-none px-3 py-2 text-sm font-medium text-white/90 [&::-webkit-details-marker]:hidden">
                  Filtrar por {activeFilters > 0 ? `(${activeFilters})` : ""}
                </summary>
                <div className="border-t border-white/10 p-4">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-white/55">Plano</label>
                      <select
                        value={planFilter}
                        onChange={(e) => { setPlanFilter(e.target.value); setPage(1); }}
                        className="admin-input w-full rounded-lg px-2.5 py-1.5 text-sm"
                      >
                        <option value="">Todos</option>
                        <option value="with">Com plano</option>
                        <option value="without">Sem plano</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-white/55">Estado do cliente</label>
                      <select
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                        className="admin-input w-full rounded-lg px-2.5 py-1.5 text-sm"
                      >
                        <option value="">Todos</option>
                        <option value="active">Ativo</option>
                        <option value="inactive">Inativo</option>
                        <option value="blocked">Bloqueado</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-white/55">Atividade</label>
                      <select
                        value={activityFilter}
                        onChange={(e) => { setActivityFilter(e.target.value); setPage(1); }}
                        className="admin-input w-full rounded-lg px-2.5 py-1.5 text-sm"
                      >
                        <option value="">Todos</option>
                        <option value="with">Com atividade</option>
                        <option value="without">Sem atividade</option>
                      </select>
                    </div>
                    <div className="admin-date-range flex items-center gap-2">
                      <label className="text-white/55">Data de</label>
                      <input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
                        className="admin-input flex-1 min-w-0 rounded-lg px-2.5 py-1.5 text-sm"
                      />
                    </div>
                    <div className="admin-date-range flex items-center gap-2">
                      <label className="text-white/55">até</label>
                      <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
                        className="admin-input flex-1 min-w-0 rounded-lg px-2.5 py-1.5 text-sm"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-white/55">País</label>
                      <input
                        type="text"
                        value={country}
                        onChange={(e) => { setCountry(e.target.value); setPage(1); }}
                        placeholder="Ex.: PT"
                        className="admin-input w-full rounded-lg px-2.5 py-1.5 text-sm"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-white/55">Cidade</label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => { setCity(e.target.value); setPage(1); }}
                        placeholder="Ex.: Lisboa"
                        className="admin-input w-full rounded-lg px-2.5 py-1.5 text-sm"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-white/55">Créditos (mín.)</label>
                      <input
                        type="number"
                        min={0}
                        value={creditsMin}
                        onChange={(e) => { setCreditsMin(e.target.value); setPage(1); }}
                        placeholder="0"
                        className="admin-input w-full rounded-lg px-2.5 py-1.5 text-sm"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-white/55">Créditos (máx.)</label>
                      <input
                        type="number"
                        min={0}
                        value={creditsMax}
                        onChange={(e) => { setCreditsMax(e.target.value); setPage(1); }}
                        placeholder="—"
                        className="admin-input w-full rounded-lg px-2.5 py-1.5 text-sm"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-white/55">Reservas (mín.)</label>
                      <input
                        type="number"
                        min={0}
                        value={reservationsMin}
                        onChange={(e) => { setReservationsMin(e.target.value); setPage(1); }}
                        placeholder="0"
                        className="admin-input w-full rounded-lg px-2.5 py-1.5 text-sm"
                      />
                    </div>
                  </div>
                </div>
              </details>
              <select
                value={sort}
                onChange={(e) => { setSort(e.target.value); setPage(1); }}
                className="admin-input rounded-lg px-2.5 py-2 text-sm"
              >
                <option value="newest">Ordenar: mais recentes</option>
                <option value="oldest">Ordenar: mais antigos</option>
                <option value="email">Ordenar: email</option>
                <option value="reservations">Ordenar: reservas</option>
              </select>
            </div>
          </div>

          <div className="mt-2 overflow-x-auto">
            <table className="admin-table w-full min-w-[960px] text-left text-sm">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Email</th>
                  <th>Contacto</th>
                  <th>País</th>
                  <th>Cidade</th>
                  <th>Plano</th>
                  <th>Créditos</th>
                  <th>Adesão</th>
                  <th>Reservas</th>
                  <th>Última atividade</th>
                  <th>Estado</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {list?.items?.length ? (
                  list.items.map((c) => (
                    <tr key={c.email}>
                      <td className="font-medium text-white/92">{c.fullName ?? "—"}</td>
                      <td className="text-white/85">{c.email}</td>
                      <td className="text-white/75">{c.phone ?? "—"}</td>
                      <td className="text-white/75">{c.country ?? "—"}</td>
                      <td className="text-white/75">{c.city ?? "—"}</td>
                      <td className="text-white/80">{c.currentPlan ?? "—"}</td>
                      <td className="tabular-nums text-white/90">{c.purchasedCredits}</td>
                      <td className="text-white/75">{c.createdAt ? new Date(c.createdAt).toLocaleDateString("pt-PT") : "—"}</td>
                      <td className="tabular-nums text-white/85">{c.totalReservations}</td>
                      <td className="text-white/75">{c.lastActivity ? new Date(c.lastActivity).toLocaleDateString("pt-PT") : "—"}</td>
                      <td>
                        <span className={
                          c.status === "blocked" ? "text-red-300/90" :
                          c.status === "active" ? "text-emerald-300/90" : "text-white/60"
                        }>
                          {c.status === "blocked" ? "Bloqueado" : c.status === "active" ? "Ativo" : "Inativo"}
                        </span>
                      </td>
                      <td>
                        <div className="flex flex-wrap gap-1">
                          {c.blocked ? (
                            <button
                              type="button"
                              onClick={() => api(`/api/admin/customers/${enc(c.email)}/unblock`, { method: "POST" }).then(() => setRefetch((x) => x + 1))}
                              className="admin-btn-secondary"
                            >
                              Desbloquear
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => api(`/api/admin/customers/${enc(c.email)}/block`, { method: "POST" }).then(() => setRefetch((x) => x + 1))}
                              className="admin-btn-secondary"
                            >
                              Bloquear
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              const n = prompt("Créditos a adicionar:", "10");
                              const num = parseInt(n ?? "0", 10);
                              if (Number.isFinite(num) && num > 0) {
                                api(`/api/admin/customers/${enc(c.email)}/credits`, {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ add: num }),
                                }).then(() => setRefetch((x) => x + 1));
                              }
                            }}
                            className="admin-btn-secondary"
                          >
                            + Créditos
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const n = prompt("Créditos a remover:", "10");
                              const num = parseInt(n ?? "0", 10);
                              if (Number.isFinite(num) && num > 0) {
                                api(`/api/admin/customers/${enc(c.email)}/credits`, {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ remove: num }),
                                }).then(() => setRefetch((x) => x + 1));
                              }
                            }}
                            className="admin-btn-secondary"
                          >
                            − Créditos
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm("Remover cliente (soft delete)?")) {
                                api(`/api/admin/customers/${enc(c.email)}/remove`, { method: "POST" }).then(() => setRefetch((x) => x + 1));
                              }
                            }}
                            className="admin-btn-danger"
                          >
                            Remover
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={12} className="admin-empty">Nenhum cliente encontrado.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {list && list.totalPages > 1 && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/55">Por página</span>
                <select
                  value={pageSize}
                  onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                  className="admin-input rounded-lg px-2 py-1.5 text-sm"
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
                  className="admin-pagination-btn"
                >
                  ← Anterior
                </button>
                <span className="text-sm text-white/65">Página {list.page} de {list.totalPages}</span>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(list.totalPages, p + 1))}
                  disabled={page >= list.totalPages}
                  className="admin-pagination-btn"
                >
                  Seguinte →
                </button>
              </div>
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
}