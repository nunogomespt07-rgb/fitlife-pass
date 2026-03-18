"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import GlassCard from "@/app/components/ui/GlassCard";

type ResMetrics = {
  total: number;
  upcoming: number;
  completed: number;
  cancelled: number;
  noShow: number;
} | null;

type CustMetrics = {
  totalUsers: number;
  newToday: number;
  newWeek: number;
  newMonth: number;
  withPlan: number;
  withoutPlan: number;
} | null;

type FinanceMetrics = {
  totalRevenue: number;
  creditsSold: number;
  creditsConsumed: number;
  platformRevenue: number;
  partnerPayoutTotal: number;
} | null;

export default function AdminHomePage() {
  const [res, setRes] = useState<ResMetrics>(null);
  const [cust, setCust] = useState<CustMetrics>(null);
  const [fin, setFin] = useState<FinanceMetrics>(null);

  useEffect(() => {
    fetch("/api/admin/reservations/metrics")
      .then((r) => r.ok ? r.json() : null)
      .then(setRes)
      .catch(() => setRes(null));
  }, []);
  useEffect(() => {
    fetch("/api/admin/customers/metrics")
      .then((r) => r.ok ? r.json() : null)
      .then(setCust)
      .catch(() => setCust(null));
  }, []);
  useEffect(() => {
    fetch("/api/admin/finance/metrics")
      .then((r) => r.ok ? r.json() : null)
      .then(setFin)
      .catch(() => setFin(null));
  }, []);

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Link href="/admin/reservas">
        <GlassCard variant="app" padding="lg" className="border-white/10 hover:border-white/20 transition-colors">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/60">Reservas globais</p>
          {res != null ? (
            <div className="mt-2 text-sm text-white/80">
              <p>Total: {res.total}</p>
              <p className="text-white/60">Próximas: {res.upcoming} · Concluídas: {res.completed} · Canceladas: {res.cancelled}</p>
            </div>
          ) : (
            <p className="mt-2 text-sm text-white/70">A carregar…</p>
          )}
        </GlassCard>
      </Link>
      <Link href="/admin/clientes">
        <GlassCard variant="app" padding="lg" className="border-white/10 hover:border-white/20 transition-colors">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/60">Novos registos / Clientes</p>
          {cust != null ? (
            <div className="mt-2 text-sm text-white/80">
              <p>Total utilizadores: {cust.totalUsers}</p>
              <p className="text-white/60">Hoje: {cust.newToday} · Esta semana: {cust.newWeek} · Com plano: {cust.withPlan}</p>
            </div>
          ) : (
            <p className="mt-2 text-sm text-white/70">A carregar…</p>
          )}
        </GlassCard>
      </Link>
      <Link href="/admin/financeiro">
        <GlassCard variant="app" padding="lg" className="border-white/10 hover:border-white/20 transition-colors">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/60">Financeiro</p>
          {fin != null ? (
            <div className="mt-2 text-sm text-white/80">
              <p>Receita total: {fin.totalRevenue.toFixed(2)} €</p>
              <p className="text-white/60">Créditos vendidos: {fin.creditsSold} · Plataforma: {fin.platformRevenue.toFixed(2)} €</p>
            </div>
          ) : (
            <p className="mt-2 text-sm text-white/70">A carregar…</p>
          )}
        </GlassCard>
      </Link>
    </div>
  );
}

