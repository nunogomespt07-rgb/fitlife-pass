"use client";

import GlassCard from "@/app/components/ui/GlassCard";

export default function AdminHomePage() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <GlassCard variant="app" padding="lg" className="border-white/10">
        <p className="text-xs font-semibold uppercase tracking-wider text-white/60">Reservas globais</p>
        <p className="mt-2 text-sm text-white/70">MVP: ligar ao backend/API numa fase seguinte.</p>
      </GlassCard>
      <GlassCard variant="app" padding="lg" className="border-white/10">
        <p className="text-xs font-semibold uppercase tracking-wider text-white/60">Novos registos</p>
        <p className="mt-2 text-sm text-white/70">MVP: ligar ao backend/API numa fase seguinte.</p>
      </GlassCard>
      <GlassCard variant="app" padding="lg" className="border-white/10">
        <p className="text-xs font-semibold uppercase tracking-wider text-white/60">Financeiro</p>
        <p className="mt-2 text-sm text-white/70">MVP: visão agregada (créditos → €).</p>
      </GlassCard>
    </div>
  );
}

