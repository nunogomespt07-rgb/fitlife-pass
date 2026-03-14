"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import GlassCard from "@/app/components/ui/GlassCard";
import PrimaryButton from "@/app/components/ui/PrimaryButton";
import {
  SUBSCRIPTION_PLANS,
  type SubscriptionPlan,
} from "@/lib/mockPayments";

type StoredUser = {
  id: string;
  name: string;
  email: string;
  city?: string | null;
  subscriptionPlanId?: string | null;
  subscriptionPlanName?: string | null;
  pendingPlanId?: string | null;
  pendingPlanName?: string | null;
};

export default function OnboardingPlanPage() {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!localStorage.getItem("token")) {
      router.replace("/");
      return;
    }
    try {
      const raw = localStorage.getItem("fitlife-user");
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<StoredUser>;
      if (parsed.subscriptionPlanId) {
        setSelectedId(parsed.subscriptionPlanId);
      } else if (parsed.pendingPlanId) {
        setSelectedId(parsed.pendingPlanId);
      }
    } catch {
      // ignore
    }
  }, []);

  function handleSelect(plan: SubscriptionPlan) {
    setSelectedId(plan.id);
  }

  function handleContinue() {
    if (!selectedId) return;
    const plan = SUBSCRIPTION_PLANS.find((p) => p.id === selectedId);
    if (!plan) return;
    setSaving(true);
    try {
      if (typeof window !== "undefined") {
        const raw = localStorage.getItem("fitlife-user");
        let base: StoredUser = {
          id: "",
          name: "",
          email: "",
          pendingPlanId: plan.id,
          pendingPlanName: plan.planName,
        };
        if (raw) {
          try {
            const parsed = JSON.parse(raw) as Partial<StoredUser>;
            base = {
              id: typeof parsed.id === "string" ? parsed.id : "",
              name: typeof parsed.name === "string" ? parsed.name : "",
              email: typeof parsed.email === "string" ? parsed.email : "",
              city: parsed.city ?? null,
              subscriptionPlanId: parsed.subscriptionPlanId ?? null,
              subscriptionPlanName: parsed.subscriptionPlanName ?? null,
              pendingPlanId: plan.id,
              pendingPlanName: plan.planName,
            };
          } catch {
            // ignore, keep base
          }
        }
        localStorage.setItem("fitlife-user", JSON.stringify(base));
      }
      router.push("/dashboard");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page-bg text-white font-sans min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 pb-20 pt-28 sm:px-8 lg:px-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/50">
          FitLife Pass · Passo 3 de 3
        </p>
        <h1 className="mt-5 text-[1.75rem] font-semibold tracking-tight text-white sm:text-3xl">
          Escolhe o teu plano
        </h1>
        <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-white/75">
          Podes alterar de plano mais tarde em Pagamentos. Para já, escolhe o que faz mais sentido para ti. O plano e os créditos só são ativados após o pagamento.
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {SUBSCRIPTION_PLANS.map((plan) => {
            const isSelected = plan.id === selectedId;
            return (
              <GlassCard
                key={plan.id}
                variant="dark"
                padding="lg"
                className={`relative flex h-full flex-col rounded-2xl border backdrop-blur-xl transition-all duration-200 ${
                  isSelected
                    ? "border-blue-400/60 bg-white/[0.12] shadow-[0_16px_40px_rgba(37,99,235,0.65)]"
                    : "border-white/[0.14] bg-white/[0.06] hover:bg-white/[0.1] hover:shadow-[0_16px_40px_rgba(15,23,42,0.6)]"
                }`}
              >
                {plan.planName === "FitLife Core" && (
                  <span className="mb-2 inline-block text-xs font-medium text-amber-200/95">
                    ⭐ Mais popular
                  </span>
                )}
                <p className="text-sm font-semibold uppercase tracking-wider text-white/60">
                  {plan.planName}
                </p>
                <p className="mt-3 text-2xl font-bold text-white">
                  {plan.monthlyPrice}
                  {plan.currency}
                  <span className="text-sm font-medium text-white/80"> / mês</span>
                </p>
                <p className="mt-2 text-sm text-white/75">
                  {plan.creditsIncluded} créditos mensais incluídos
                </p>
                <ul className="mt-4 flex-1 space-y-2 text-sm text-white/80">
                  {plan.benefits.map((b) => (
                    <li key={b} className="flex items-start gap-2">
                      <span className="mt-0.5 shrink-0 text-white/40">•</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
                <PrimaryButton
                  type="button"
                  variant={plan.id === "pro" ? "primary" : "secondary"}
                  className="mt-5 w-full rounded-xl py-3 text-sm font-semibold"
                  onClick={() => {
                    handleSelect(plan);
                    handleContinue();
                  }}
                  disabled={saving}
                  loading={saving && selectedId === plan.id}
                >
                  Escolher plano
                </PrimaryButton>
              </GlassCard>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="mt-8 text-sm font-medium text-white/60 underline-offset-2 hover:text-white hover:underline"
        >
          Escolher mais tarde
        </button>
      </div>
    </div>
  );
}
