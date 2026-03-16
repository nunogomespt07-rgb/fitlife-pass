"use client";

import Link from "next/link";
import GlassCard from "../../components/ui/GlassCard";
import PrimaryButton from "../../components/ui/PrimaryButton";
import { useMockReservations } from "@/app/context/MockReservationsContext";
import { useCreditActivity } from "@/app/context/CreditActivityContext";
import { getStoredUser } from "@/lib/storedUser";
import { SUBSCRIPTION_PLANS } from "@/lib/mockPayments";
import type { CreditTransaction } from "@/lib/creditActivity";

function formatDateGroup(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const ymd = (x: Date) => x.toISOString().slice(0, 10);
  if (ymd(d) === ymd(today)) return "Hoje";
  if (ymd(d) === ymd(yesterday)) return "Ontem";
  return d.toLocaleDateString("pt-PT", { day: "numeric", month: "short", year: "numeric" });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" });
}

function groupByDate(txs: CreditTransaction[]): { label: string; items: CreditTransaction[] }[] {
  const map = new Map<string, CreditTransaction[]>();
  for (const tx of txs) {
    const label = formatDateGroup(tx.createdAt);
    if (!map.has(label)) map.set(label, []);
    map.get(label)!.push(tx);
  }
  const order = ["Hoje", "Ontem"];
  const rest = [...map.keys()].filter((k) => !order.includes(k));
  rest.sort((a, b) => {
    const da = map.get(a)?.[0]?.createdAt ?? "";
    const db = map.get(b)?.[0]?.createdAt ?? "";
    return new Date(db).getTime() - new Date(da).getTime();
  });
  const keys = [...order.filter((k) => map.has(k)), ...rest];
  return keys.map((label) => ({ label, items: map.get(label)! }));
}

export default function DashboardCreditosPage() {
  const { credits } = useMockReservations();
  const creditActivity = useCreditActivity();
  const stored = getStoredUser();
  const hasPlan = Boolean(stored?.subscriptionPlanId);
  const planId = stored?.subscriptionPlanId ?? null;
  const planName = stored?.subscriptionPlanName ?? null;
  const plan = planId ? SUBSCRIPTION_PLANS.find((p) => p.id === planId) : null;

  const transactions = creditActivity?.transactions ?? [];
  const hasMore = creditActivity?.hasMore ?? false;
  const loadMore = creditActivity?.loadMore ?? (() => {});
  const groups = groupByDate(transactions);

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

        {/* Activity feed */}
        <div className="mt-10">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-white/60">
            Atividade
          </h2>
          {groups.length === 0 ? (
            <p className="mt-4 text-sm text-white/60">
              Ainda não há movimentos de créditos.
            </p>
          ) : (
            <div className="mt-4 space-y-8">
              {groups.map(({ label, items }) => (
                <div key={label}>
                  <p className="mb-3 text-sm font-medium text-white/70">
                    {label}
                  </p>
                  <ul className="space-y-2">
                    {items.map((tx) => (
                      <li
                        key={tx.id}
                        className="rounded-xl border border-white/[0.1] bg-white/[0.06] px-4 py-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <p
                              className={
                                tx.type === "credit"
                                  ? "text-sm font-medium text-emerald-400/95"
                                  : "text-sm font-medium text-red-400/95"
                              }
                            >
                              {tx.type === "credit" ? "+" : "-"}
                              {tx.amount} créditos
                            </p>
                            <p className="mt-0.5 text-sm text-white/90">
                              {tx.reason}
                            </p>
                            {(tx.activityName || tx.clubName) && (
                              <p className="mt-0.5 text-xs text-white/60">
                                {[tx.activityName, tx.clubName].filter(Boolean).join(" · ")}
                              </p>
                            )}
                          </div>
                          <span className="shrink-0 text-xs text-white/50">
                            {formatTime(tx.createdAt)}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              {hasMore && (
                <button
                  type="button"
                  onClick={loadMore}
                  className="w-full rounded-xl border border-white/20 bg-white/5 py-3 text-sm font-medium text-white/90 transition hover:bg-white/10"
                >
                  Ver mais
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
