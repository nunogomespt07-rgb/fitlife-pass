"use client";

import Link from "next/link";
import GlassCard from "../../components/ui/GlassCard";
import PrimaryButton from "../../components/ui/PrimaryButton";
import { useMockReservations } from "@/app/context/MockReservationsContext";
import { getStoredUser } from "@/lib/storedUser";
import { SUBSCRIPTION_PLANS } from "@/lib/mockPayments";

export default function DashboardCreditosPage() {
  const { credits } = useMockReservations();
  const stored = getStoredUser();
  const hasPlan = Boolean(stored?.subscriptionPlanId);
  const planId = stored?.subscriptionPlanId ?? null;
  const planName = stored?.subscriptionPlanName ?? null;
  const plan = planId ? SUBSCRIPTION_PLANS.find((p) => p.id === planId) : null;

  return (
    <div className="page-bg text-white font-sans min-h-screen">
      <div className="mx-auto max-w-4xl px-4 pb-24 pt-24 sm:px-6 lg:px-10">
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Créditos
        </h1>
        <p className="mt-3 text-sm text-white/70">
          Consulta o teu saldo de créditos e plano atual.
        </p>

        <GlassCard
          variant="dark"
          padding="lg"
          className="mt-8 rounded-2xl border border-white/[0.15] bg-white/[0.08] shadow-[0_20px_50px_rgba(15,23,42,0.6)] backdrop-blur-xl"
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-white/60">
            Créditos
          </p>
          <p className="mt-1 text-sm text-white/70">
            Saldo disponível
          </p>
          <p className="mt-3 text-4xl font-semibold text-white">
            {credits}
          </p>
          <p className="mt-1 text-sm text-white/60">
            créditos restantes
          </p>

          {hasPlan && plan ? (
            <div className="mt-8 border-t border-white/[0.12] pt-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-white/60">
                Plano atual
              </p>
              <p className="mt-2 text-xl font-semibold text-white">
                {planName ?? plan.planName}
              </p>
              <p className="mt-1 text-lg font-medium text-white/90">
                {plan.monthlyPrice}
                {plan.currency}/mês
              </p>
              <Link
                href="/dashboard/pagamentos"
                className="mt-4 inline-flex items-center text-sm font-medium text-blue-200 underline-offset-2 hover:text-blue-100 hover:underline transition-colors duration-200"
              >
                Gerir plano →
              </Link>
            </div>
          ) : (
            <div className="mt-8 border-t border-white/[0.12] pt-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-white/60">
                Plano
              </p>
              <p className="mt-2 text-lg font-medium text-white/90">
                Sem plano ativo
              </p>
              <p className="mt-1 text-sm text-white/60">
                Escolhe um plano para ativar créditos e reservar atividades.
              </p>
              <Link href="/dashboard/pagamentos#planos">
                <PrimaryButton variant="primary" className="mt-4 rounded-xl py-3 text-sm font-semibold">
                  Ver planos
                </PrimaryButton>
              </Link>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
