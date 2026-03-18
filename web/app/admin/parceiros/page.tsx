"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import GlassCard from "@/app/components/ui/GlassCard";

type PartnerItem = {
  partnerId: string;
  partnerName: string;
  category: string;
  city: string;
  visible: boolean;
  totalActivities: number;
  totalReservations: number;
  totalRevenue: number;
  payoutEstimate: number;
};

type ListRes = {
  items: PartnerItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export default function AdminPartnersPage() {
  const [list, setList] = useState<ListRes | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [visibility, setVisibility] = useState("");
  const [sort, setSort] = useState("name");

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));
    if (search) params.set("search", search);
    if (visibility) params.set("visibility", visibility);
    if (sort) params.set("sort", sort);
    fetch(`/api/admin/partners/list?${params}`)
      .then((r) => (r.ok ? r.json() : null))
      .then(setList)
      .catch(() => setList(null));
  }, [page, pageSize, search, visibility, sort]);

  const total = list?.total ?? 0;
  const totalPages = list?.totalPages ?? 1;
  const safePage = Math.min(totalPages, Math.max(1, page));

  return (
    <div className="space-y-6">
      <GlassCard variant="app" padding="lg" className="admin-card border-white/15">
        <p className="admin-kpi-label">Parceiros</p>
        <p className="mt-1.5 text-sm text-white/65">Gestão interna: créditos peak/off-peak e configuração base por parceiro.</p>
      </GlassCard>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="search"
          placeholder="Pesquisar (nome, cidade, categoria)"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="admin-input w-full max-w-xs rounded-lg px-3 py-2 text-sm"
        />
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={visibility}
            onChange={(e) => { setVisibility(e.target.value); setPage(1); }}
            className="admin-input rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Todos</option>
            <option value="visible">Visíveis</option>
            <option value="hidden">Ocultos</option>
          </select>
          <select
            value={sort}
            onChange={(e) => { setSort(e.target.value); setPage(1); }}
            className="admin-input rounded-lg px-3 py-2 text-sm"
          >
            <option value="name">Nome</option>
            <option value="reservations">Reservas</option>
            <option value="revenue">Receita</option>
          </select>
          <span className="text-xs text-white/50">{total} total</span>
        </div>
        <Link
          href="/admin/parceiros/novo"
          className="admin-btn-secondary inline-flex items-center px-4 py-2.5 text-sm font-medium no-underline"
        >
          + Adicionar parceiro
        </Link>
      </div>

      <div className="grid gap-4">
        {list?.items?.map((p) => (
          <GlassCard key={p.partnerId} variant="app" padding="lg" className="admin-card border-white/15">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 space-y-1">
                <p className="text-base font-semibold text-white">{p.partnerName}</p>
                <p className="text-sm text-white/65">{p.category} · {p.city || "—"}</p>
                <p className="text-xs text-white/55 tabular-nums">Reservas: {p.totalReservations} · Receita: {p.totalRevenue.toLocaleString("pt-PT", { minimumFractionDigits: 2 })} €</p>
              </div>
              <Link
                href={`/admin/parceiros/${p.partnerId}`}
                className="admin-btn-secondary shrink-0 inline-flex items-center px-4 py-2 text-sm font-medium no-underline"
              >
                Abrir
              </Link>
            </div>
          </GlassCard>
        ))}
      </div>

      {list?.items?.length === 0 && (
        <p className="admin-empty">Nenhum parceiro encontrado.</p>
      )}

      {list && totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-3">
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
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
              className="admin-pagination-btn"
            >
              ← Anterior
            </button>
            <span className="text-sm text-white/65">Página {safePage} de {totalPages}</span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
              className="admin-pagination-btn"
            >
              Seguinte →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

