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
    <div>
      <GlassCard variant="app" padding="lg" className="admin-card border-white/15">
        <p className="text-xs font-semibold uppercase tracking-wider text-white/60">Parceiros</p>
        <p className="mt-2 text-sm text-white/70">Gestão interna: créditos peak/off-peak e configuração base por parceiro.</p>
      </GlassCard>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="text"
          placeholder="Pesquisar (nome, cidade, categoria)"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="rounded-xl border border-white/15 bg-slate-900/80 px-3 py-2 text-sm text-slate-200 placeholder:text-white/40 outline-none max-w-xs focus:ring-1 focus:ring-white/30"
        />
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={visibility}
            onChange={(e) => { setVisibility(e.target.value); setPage(1); }}
            className="rounded-xl border border-white/15 bg-slate-900/80 px-3 py-2 text-sm text-slate-200 outline-none focus:ring-1 focus:ring-white/30"
          >
            <option value="">Todos</option>
            <option value="visible">Visíveis</option>
            <option value="hidden">Ocultos</option>
          </select>
          <select
            value={sort}
            onChange={(e) => { setSort(e.target.value); setPage(1); }}
            className="rounded-xl border border-white/15 bg-slate-900/80 px-3 py-2 text-sm text-slate-200 outline-none focus:ring-1 focus:ring-white/30"
          >
            <option value="name">Nome</option>
            <option value="reservations">Reservas</option>
            <option value="revenue">Receita</option>
          </select>
          <span className="text-xs text-white/50">{total} total</span>
        </div>
        <Link
          href="/admin/parceiros/novo"
          className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-medium text-white/85 hover:bg-white/10"
        >
          + Adicionar parceiro
        </Link>
      </div>

      <div className="mt-6 grid gap-3">
        {list?.items?.map((p) => (
          <GlassCard key={p.partnerId} variant="app" padding="md" className="admin-card border-white/15">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white">{p.partnerName}</p>
                <p className="mt-1 text-xs text-white/60">{p.category} · {p.city || "—"}</p>
                <p className="mt-1 text-xs text-white/50">Reservas: {p.totalReservations} · Receita: {p.totalRevenue.toFixed(2)} €</p>
              </div>
              <Link
                href={`/admin/parceiros/${p.partnerId}`}
                className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white/85 hover:bg-white/10"
              >
                Abrir
              </Link>
            </div>
          </GlassCard>
        ))}
      </div>

      {list?.items?.length === 0 && (
        <p className="mt-6 text-center text-sm text-white/50">Nenhum parceiro encontrado.</p>
      )}

      {list && totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
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
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
              className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white/85 hover:bg-white/10 disabled:opacity-40"
            >
              ← Anterior
            </button>
            <span className="text-sm text-white/70">Página {safePage} de {totalPages}</span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
              className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white/85 hover:bg-white/10 disabled:opacity-40"
            >
              Seguinte →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

