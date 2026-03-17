"use client";

import Link from "next/link";
import { useMemo } from "react";
import GlassCard from "@/app/components/ui/GlassCard";
import { getAllPartnersWithCategory } from "@/lib/activitiesData";

export default function AdminPartnersPage() {
  const partners = useMemo(() => getAllPartnersWithCategory(), []);

  return (
    <div>
      <GlassCard variant="app" padding="lg" className="border-white/10">
        <p className="text-xs font-semibold uppercase tracking-wider text-white/60">
          Parceiros
        </p>
        <p className="mt-2 text-sm text-white/70">
          Gestão interna: créditos peak/off-peak e configuração base por parceiro.
        </p>
      </GlassCard>

      <div className="mt-6 grid gap-3">
        {partners.map((p) => (
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
    </div>
  );
}

