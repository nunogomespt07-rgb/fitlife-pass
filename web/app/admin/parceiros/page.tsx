"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import GlassCard from "@/app/components/ui/GlassCard";
import { getAllPartnersWithCategory } from "@/lib/activitiesData";

export default function AdminPartnersPage() {
  const partners = useMemo(() => getAllPartnersWithCategory(), []);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  const total = partners.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(totalPages, Math.max(1, page));
  const start = (safePage - 1) * pageSize;
  const end = start + pageSize;
  const pageItems = partners.slice(start, end);

  return (
    <div>
      <GlassCard variant="app" padding="lg" className="border-white/10 select-none cursor-default">
        <p className="text-xs font-semibold uppercase tracking-wider text-white/60">
          Parceiros
        </p>
        <p className="mt-2 text-sm text-white/70">
          Gestão interna: créditos peak/off-peak e configuração base por parceiro.
        </p>
      </GlassCard>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
          <span className="text-xs font-semibold text-white/60">Por página</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="bg-transparent text-sm font-semibold text-white outline-none"
          >
            {[10, 20, 50].map((n) => (
              <option key={n} value={n} className="bg-[#020617]">
                {n}
              </option>
            ))}
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
        {pageItems.map((p) => (
          <GlassCard key={p.id} variant="app" padding="md" className="border-white/10">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white">{p.name}</p>
                <p className="mt-1 text-xs text-white/60">{p.categoryLabel} · {p.location}</p>
              </div>
              <Link
                href={`/admin/parceiros/${p.id}`}
                className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white/85 hover:bg-white/10"
              >
                Abrir
              </Link>
            </div>
          </GlassCard>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={safePage <= 1}
          className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white/85 hover:bg-white/10 disabled:opacity-40"
        >
          ← Anterior
        </button>
        <span className="text-sm text-white/70">
          Página {safePage} de {totalPages}
        </span>
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
  );
}

