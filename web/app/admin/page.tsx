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
    <div className="grid gap-5 sm:grid-cols-3">
      <Link href="/admin/reservas" className="block">
        <GlassCard variant="app" padding="lg" className="admin-card border-white/15 transition-colors hover:border-white/20">
          <p className="admin-kpi-label">Reservas globais</p>
          {res != null ? (
            <div className="mt-2 text-sm text-white/80">
              <p className="font-medium text-white/90">Total: {res.total}</p>
              <p className="mt-0.5 text-white/60">Próximas: {res.upcoming} · Concluídas: {res.completed} · Canceladas: {res.cancelled}</p>
            </div>
          ) : (
            <p className="mt-2 text-sm text-white/60">A carregar…</p>
          )}
        </GlassCard>
      </Link>
      <Link href="/admin/clientes" className="block">
        <GlassCard variant="app" padding="lg" className="admin-card border-white/15 transition-colors hover:border-white/20">
          <p className="admin-kpi-label">Novos registos / Clientes</p>
          {cust != null ? (
            <div className="mt-2 text-sm text-white/80">
              <p className="font-medium text-white/90">Total utilizadores: {cust.totalUsers}</p>
              <p className="mt-0.5 text-white/60">Hoje: {cust.newToday} · Esta semana: {cust.newWeek} · Com plano: {cust.withPlan}</p>
            </div>
          ) : (
            <p className="mt-2 text-sm text-white/60">A carregar…</p>
          )}
        </GlassCard>
      </Link>
      <Link href="/admin/financas" className="block">
        <GlassCard variant="app" padding="lg" className="admin-card border-white/15 transition-colors hover:border-white/20">
          <p className="admin-kpi-label">Finanças</p>
          {fin != null ? (
            <div className="mt-2 text-sm text-white/80">
              <p className="font-medium text-white/90">Receita total: {fin.totalRevenue.toLocaleString("pt-PT", { minimumFractionDigits: 2 })} €</p>
              <p className="mt-0.5 text-white/60">Créditos vendidos: {fin.creditsSold} · Plataforma: {fin.platformRevenue.toLocaleString("pt-PT", { minimumFractionDigits: 2 })} €</p>
            </div>
          ) : (
            <p className="mt-2 text-sm text-white/60">A carregar…</p>
          )}
        </GlassCard>
      </Link>
    </div>
  );
}

