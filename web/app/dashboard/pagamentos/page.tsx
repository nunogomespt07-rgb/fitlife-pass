"use client";

import { useState, useEffect } from "react";
import GlassCard from "../../components/ui/GlassCard";
import PrimaryButton from "../../components/ui/PrimaryButton";
import { useMockReservations } from "@/app/context/MockReservationsContext";
import { getStoredUser, setStoredUser } from "@/lib/storedUser";
import {
  MOCK_CREDIT_PACKS,
  SUBSCRIPTION_PLANS,
  type PaymentMethod,
  type PaymentMethodType,
  type SubscriptionPlan,
  type PaymentHistoryEntry,
} from "@/lib/mockPayments";

export default function DashboardPagamentosPage() {
  const { addPurchasedCredits } = useMockReservations();
  const [activePlanId, setActivePlanId] = useState<string | null>(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState<string | null>(null);
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [methodModalOpen, setMethodModalOpen] = useState(false);
  const [methodStep, setMethodStep] = useState<"type" | "details">("type");
  const [selectedType, setSelectedType] = useState<PaymentMethodType | null>(null);
  const [mbwayPhone, setMbwayPhone] = useState("");
  const [subscriptionStatus, setSubscriptionStatus] = useState<"active" | "cancel_at_period_end">("active");
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [creditsModalOpen, setCreditsModalOpen] = useState(false);
  const [creditsMethodType, setCreditsMethodType] = useState<PaymentMethodType | null>(null);
  const [creditsMbwayPhone, setCreditsMbwayPhone] = useState("");
  const [pendingPackId, setPendingPackId] = useState<string | null>(null);
  const [subscribeModalPlan, setSubscribeModalPlan] = useState<SubscriptionPlan | null>(null);

  /** Real payment history for the authenticated user. Empty until real transactions exist. */
  const [paymentHistory] = useState<PaymentHistoryEntry[]>([]);

  function scrollToPlanos() {
    document.getElementById("planos")?.scrollIntoView({ behavior: "smooth" });
  }

  useEffect(() => {
    const u = getStoredUser();
    setActivePlanId(u?.subscriptionPlanId ?? null);
  }, [purchaseSuccess]);

  const primaryMethod =
    methods.find((m) => m.isDefault) ?? methods[0] ?? null;
  const otherMethods = methods.filter((m) => m.id !== primaryMethod?.id);
  const renewalMethod =
    methods.find((m) => m.isDefault && m.type !== "mbway") ??
    methods.find((m) => m.type !== "mbway") ??
    null;

  function handleBuyCredits(credits: number, label: string) {
    addPurchasedCredits(credits);
    setPurchaseSuccess(`${label} adicionados à tua conta.`);
    setTimeout(() => setPurchaseSuccess(null), 4000);
  }

  function formatMethodLabel(m: PaymentMethod): string {
    switch (m.type) {
      case "card":
        return `${m.brand} •••• ${m.last4}`;
      case "mbway":
        return `${m.label ?? "MB WAY"} · ${m.phone}`;
      case "apple_pay":
        return m.label ?? "Apple Pay";
      case "google_pay":
        return m.label ?? "Google Pay";
      default:
        return "Método";
    }
  }

  function openMethodModal() {
    setMethodStep("type");
    setSelectedType(null);
    setMbwayPhone("");
    setMethodModalOpen(true);
  }

  function handleConfirmMethod() {
    if (!selectedType) return;
    let newMethod: PaymentMethod | null = null;
    if (selectedType === "card") {
      // Demo: keep existing mock card as template
      newMethod = {
        id: `pm-card-${Date.now()}`,
        type: "card",
        brand: "Visa",
        last4: "4582",
        expiry: "06/27",
        isDefault: true,
      };
    } else if (selectedType === "mbway") {
      if (!mbwayPhone.trim()) return;
      newMethod = {
        id: `pm-mbway-${Date.now()}`,
        type: "mbway",
        phone: mbwayPhone.trim(),
        label: "MB WAY",
        isDefault: true,
      };
    } else if (selectedType === "apple_pay") {
      newMethod = {
        id: `pm-apple-${Date.now()}`,
        type: "apple_pay",
        label: "Apple Pay",
        isDefault: true,
      };
    } else if (selectedType === "google_pay") {
      newMethod = {
        id: `pm-google-${Date.now()}`,
        type: "google_pay",
        label: "Google Pay",
        isDefault: true,
      };
    }
    if (!newMethod) return;
    setMethods((prev) => {
      const cleared = prev.map((m) => ({ ...m, isDefault: false }));
      return [newMethod!, ...cleared];
    });
    setMethodModalOpen(false);
  }

  function openCreditsModal(packId: string) {
    setPendingPackId(packId);
    setCreditsMethodType(null);
    setCreditsMbwayPhone("");
    setCreditsModalOpen(true);
  }

  function handleConfirmCredits() {
    if (!pendingPackId || !creditsMethodType) return;
    const pack = MOCK_CREDIT_PACKS.find((p) => p.id === pendingPackId);
    if (!pack) return;
    if (creditsMethodType === "mbway" && !creditsMbwayPhone.trim()) return;
    handleBuyCredits(pack.credits, pack.label);
    setCreditsModalOpen(false);
  }

  function handleSubscribe(plan: SubscriptionPlan) {
    setStoredUser({
      subscriptionPlanId: plan.id,
      subscriptionPlanName: plan.planName,
      pendingPlanId: null,
      pendingPlanName: null,
    });
    addPurchasedCredits(plan.creditsIncluded);
    setPurchaseSuccess(
      `Subscrição ${plan.planName} ativada. ${plan.creditsIncluded} créditos adicionados.`
    );
    setTimeout(() => setPurchaseSuccess(null), 5000);
    setSubscribeModalPlan(null);
    setActivePlanId(plan.id);
  }

  return (
    <div className="page-bg text-white font-sans min-h-screen">
      <div className="mx-auto max-w-4xl px-4 pb-24 pt-24 sm:px-6 lg:px-10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/75">
          FitLife Pass · Pagamentos
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Pagamentos
        </h1>
        <p className="mt-3 text-sm text-white/70">
          Subscrição, créditos extra e histórico.
        </p>

        {purchaseSuccess && (
          <div className="mt-6 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-5 py-3.5 text-sm text-emerald-100">
            {purchaseSuccess}
          </div>
        )}

        {/* 1️⃣ CURRENT PLAN or NO-PLAN STATE */}
        <section className="mt-10">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/60">
            Subscrição mensal
          </h2>
          {activePlanId ? (() => {
            const plan = SUBSCRIPTION_PLANS.find((p) => p.id === activePlanId);
            if (!plan) return null;
            const renewalDate = new Date();
            renewalDate.setMonth(renewalDate.getMonth() + 1);
            const renewalStr = renewalDate.toLocaleDateString("pt-PT", { day: "numeric", month: "long", year: "numeric" });
            return (
              <GlassCard
                variant="dark"
                padding="none"
                className="mb-10 overflow-hidden rounded-2xl border border-white/[0.2] bg-white/[0.1] shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_8px_32px_rgba(15,23,42,0.4),0_0_60px_-8px_rgba(59,130,246,0.25)] backdrop-blur-xl transition-all duration-200 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_12px_40px_rgba(15,23,42,0.45),0_0_72px_-6px_rgba(59,130,246,0.3)]"
              >
                <div className="p-8 sm:p-10">
                  <p className="text-xs font-semibold uppercase tracking-wider text-white/60">
                    Plano atual
                  </p>
                  <p className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                    {plan.planName}
                  </p>
                  <p className="mt-2 text-xl font-semibold text-white/95">
                    {plan.monthlyPrice}
                    {plan.currency}/mês
                  </p>
                  <p className="mt-4 text-sm text-white/80">
                    {plan.creditsIncluded} créditos incluídos
                  </p>
                  <p className="mt-2 text-sm text-white/75">
                    Renova automaticamente em{" "}
                    <span className="font-medium text-white">{renewalStr}</span>
                  </p>
                  <p className="mt-1 text-sm text-white/70">
                    Método de renovação:{" "}
                    {renewalMethod ? (
                      <span className="font-medium text-white">
                        {formatMethodLabel(renewalMethod)}
                      </span>
                    ) : (
                      <span className="font-medium text-white/80">
                        Define um método elegível (cartão, Apple Pay ou Google Pay).
                      </span>
                    )}
                  </p>
                  <p className="mt-2 text-sm text-white/70">
                    Estado:{" "}
                    {subscriptionStatus === "active" ? (
                      <span className="font-medium text-emerald-200">Ativa</span>
                    ) : (
                      <span className="font-medium text-amber-200">
                        Cancelada no fim do período — acesso ativo até {renewalStr}
                      </span>
                    )}
                  </p>
                  <div className="mt-8 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={scrollToPlanos}
                      className="inline-flex items-center justify-center rounded-xl bg-[linear-gradient(135deg,#4EA6FF,#2F6BFF)] px-7 py-3.5 text-sm font-semibold text-white shadow-[0_8px_25px_rgba(0,120,255,0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(0,120,255,0.45)]"
                    >
                      Alterar plano
                    </button>
                    <button
                      type="button"
                      onClick={() => setCancelModalOpen(true)}
                      className="inline-flex items-center justify-center rounded-xl border border-white/18 bg-white/5 px-6 py-3.5 text-sm font-medium text-white/85 transition-all duration-200 hover:bg-white/10 hover:text-white"
                    >
                      Cancelar subscrição
                    </button>
                  </div>
                </div>
              </GlassCard>
            );
          })() : (
            <GlassCard
              variant="dark"
              padding="lg"
              className="mb-10 rounded-2xl border border-white/[0.14] bg-white/[0.06] backdrop-blur-xl"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-white/60">
                Sem subscrição ativa
              </p>
              <p className="mt-3 text-xl font-semibold text-white">
                Escolhe um plano para começar
              </p>
              <p className="mt-2 text-sm text-white/70">
                Ainda não tens um plano ativo. Escolhe um dos planos abaixo e conclui o pagamento para ativar créditos e benefícios.
              </p>
              <PrimaryButton
                variant="primary"
                className="mt-6 rounded-xl py-3.5 text-sm font-semibold"
                onClick={scrollToPlanos}
              >
                Ver planos
              </PrimaryButton>
            </GlassCard>
          )}
        </section>

        {/* 2️⃣ CHANGE PLAN – pricing cards */}
        <section className="mt-14" id="planos">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/60">
            {activePlanId ? "Mudar de plano" : "Escolher plano"}
          </h2>
          <p className="mb-6 text-sm text-white/70">
            {activePlanId ? "Escolhe o plano que melhor se adapta ao teu ritmo." : "Escolhe um plano e conclui o pagamento para ativar a subscrição e receber créditos."}
          </p>
          <div className="grid gap-6 sm:grid-cols-3">
            {SUBSCRIPTION_PLANS.map((plan) => {
              const isCurrent = plan.id === activePlanId;
              const isPopular = plan.isPopular === true;
              return (
                <GlassCard
                  key={plan.id}
                  variant="dark"
                  padding="lg"
                  className={`relative flex flex-col rounded-2xl border backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 ${
                    isCurrent
                      ? "border-blue-400/40 bg-white/[0.1] shadow-[0_0_0_1px_rgba(59,130,246,0.2),0_8px_32px_rgba(15,23,42,0.35)]"
                      : "border-white/[0.12] bg-white/[0.06] shadow-[0_12px_32px_rgba(15,23,42,0.3)] hover:bg-white/[0.08] hover:shadow-[0_16px_40px_rgba(15,23,42,0.35)]"
                  } ${isPopular && !isCurrent ? "ring-1 ring-blue-400/30" : ""}`}
                >
                  {isPopular && (
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-[linear-gradient(135deg,#3B82F6,#2563EB)] px-3 py-1 text-xs font-semibold text-white shadow-lg">
                      Mais popular
                    </span>
                  )}
                  {isCurrent && (
                    <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full border border-emerald-400/40 bg-emerald-500/25 px-2.5 py-1 text-[11px] font-semibold text-emerald-100 shadow-md">
                      <span className="text-emerald-200" aria-hidden>
                        ✓
                      </span>
                      <span>Plano atual</span>
                    </span>
                  )}
                  <p className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                    {plan.planName}
                  </p>
                  <p className="mt-3 text-2xl font-bold text-white">
                    {plan.monthlyPrice}
                    {plan.currency} <span className="text-base font-semibold text-white/80">/ mês</span>
                  </p>
                  <p className="mt-2 text-sm text-white/70">
                    {plan.creditsIncluded} créditos incluídos
                  </p>
                  <ul className="mt-6 flex-1 space-y-2.5 text-sm text-white/80">
                    {plan.benefits.map((b, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="mt-0.5 shrink-0 text-white/50">•</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                  {isCurrent ? (
                    <p className="mt-6 text-sm font-semibold text-emerald-200/90">
                      Plano atual
                    </p>
                  ) : (
                    <PrimaryButton
                      variant={isPopular ? "primary" : "secondary"}
                      className="mt-6 w-full rounded-xl py-3.5 text-sm font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/25"
                      onClick={() => setSubscribeModalPlan(plan)}
                    >
                      {activePlanId ? "Mudar para este plano" : "Subscrever"}
                    </PrimaryButton>
                  )}
                </GlassCard>
              );
            })}
          </div>
        </section>

        {/* 3️⃣ BUY EXTRA CREDITS – minimal rows (separado da subscrição) */}
        <section className="mt-14" id="creditos-extra">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/60">
            Comprar créditos extra
          </h2>
          <p className="mb-6 text-sm text-white/70">
            Compra créditos adicionais quando precisares, usando cartão, MB WAY, Apple Pay ou Google Pay.
          </p>
          <GlassCard
            variant="dark"
            padding="none"
            className="overflow-hidden rounded-2xl border border-white/[0.12] bg-white/[0.05] backdrop-blur-xl"
          >
            <div className="divide-y divide-white/[0.08]">
              {MOCK_CREDIT_PACKS.map((pack) => (
                <div
                  key={pack.id}
                  className="flex flex-wrap items-center justify-between gap-4 px-6 py-5 sm:px-7 transition-colors duration-150 hover:bg-white/[0.04]"
                >
                  <div className="flex items-baseline gap-2">
                    <span className="font-semibold text-white">
                      {pack.label}
                    </span>
                    <span className="text-white/50">—</span>
                    <span className="text-lg font-semibold text-white/90">
                      {pack.price}€
                    </span>
                  </div>
                  <PrimaryButton
                    variant="secondary"
                    className="rounded-xl py-2.5 px-5 text-sm font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/20"
                    onClick={() => openCreditsModal(pack.id)}
                  >
                    Comprar
                  </PrimaryButton>
                </div>
              ))}
            </div>
          </GlassCard>
        </section>

        {/* Payment methods – demo, multi-method ready */}
        <section className="mt-14">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/60">
            Método de pagamento
          </h2>
          <p className="mb-4 text-sm text-white/70">
            Define o teu método principal para a subscrição e compras de créditos.
          </p>
          <GlassCard
            variant="dark"
            padding="md"
            className="rounded-2xl border border-white/[0.14] bg-white/[0.06] backdrop-blur-xl"
          >
            {primaryMethod ? (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-300/90">
                  Método principal
                </p>
                <p className="mt-2 text-sm font-medium text-white">
                  {formatMethodLabel(primaryMethod)}
                </p>
                <p className="mt-1 text-xs text-white/60">
                  Utilizado para a renovação do plano e para compras de créditos em modo demo.
                </p>
              </div>
            ) : (
              <p className="text-sm text-white/70">
                Ainda não tens um método de pagamento definido.
              </p>
            )}
            <div className="mt-5 flex flex-wrap gap-3">
              <PrimaryButton
                variant="primary"
                className="rounded-xl py-3 text-sm font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/25"
                onClick={openMethodModal}
              >
                Adicionar método
              </PrimaryButton>
              {primaryMethod && (
                <button
                  type="button"
                  onClick={openMethodModal}
                  className="rounded-xl border border-white/[0.15] bg-white/[0.05] px-5 py-3 text-sm font-medium text-white/80 transition-all duration-200 hover:bg-white/[0.1] hover:text-white"
                >
                  Alterar método
                </button>
              )}
            </div>
          </GlassCard>
        </section>

        {/* 4️⃣ PAYMENT HISTORY – real transactions only, empty state when none */}
        <section className="mt-14">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/60">
            Histórico de pagamentos
          </h2>
          <p className="mb-6 text-sm text-white/70">
            Recibos e transações anteriores.
          </p>
          <GlassCard
            variant="dark"
            padding="none"
            className="overflow-hidden rounded-2xl border border-white/[0.12] bg-white/[0.05] backdrop-blur-xl"
          >
            {paymentHistory.length === 0 ? (
              <div className="flex min-h-[240px] flex-col items-center justify-center px-6 py-12 text-center sm:px-8">
                <p className="text-base font-semibold text-white/90">
                  Ainda não tens pagamentos.
                </p>
                <p className="mt-2 max-w-sm text-sm text-white/55">
                  Quando subscreveres um plano ou comprares créditos, os recibos vão aparecer aqui.
                </p>
                <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                  <PrimaryButton
                    variant="primary"
                    className="rounded-xl py-3 text-sm font-semibold"
                    onClick={scrollToPlanos}
                  >
                    Ver planos
                  </PrimaryButton>
                  <button
                    type="button"
                    onClick={() => document.getElementById("creditos-extra")?.scrollIntoView({ behavior: "smooth" })}
                    className="rounded-xl border border-white/[0.18] bg-white/[0.06] px-5 py-3 text-sm font-medium text-white/85 transition hover:bg-white/[0.1] hover:text-white"
                  >
                    Comprar créditos
                  </button>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.08]">
                {paymentHistory.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex flex-wrap items-center justify-between gap-4 px-6 py-5 sm:px-7 transition-colors duration-150 hover:bg-white/[0.04]"
                  >
                    <div>
                      <p className="font-medium text-white">
                        {entry.description}
                      </p>
                      <p className="mt-0.5 text-sm text-white/55">
                        {entry.date}
                      </p>
                    </div>
                    <div className="flex items-center gap-5">
                      <p className="text-lg font-semibold text-white">
                        {entry.amount}
                        {entry.currency}
                      </p>
                      <button
                        type="button"
                        className="text-sm font-medium text-blue-200 underline-offset-2 transition-colors duration-200 hover:text-blue-100 hover:underline"
                      >
                        Ver recibo →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </section>
      </div>

      {/* Subscribe confirmation modal */}
      {subscribeModalPlan && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-[#020617]/80 backdrop-blur-sm"
            onClick={() => setSubscribeModalPlan(null)}
          />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/[0.14] bg-[#020617]/95 p-6 shadow-2xl backdrop-blur-2xl">
            <h2 className="text-lg font-semibold text-white">
              Confirmar subscrição
            </h2>
            <p className="mt-3 text-sm text-white/80">
              Vais subscrever <span className="font-semibold text-white">{subscribeModalPlan.planName}</span> por {subscribeModalPlan.monthlyPrice}{subscribeModalPlan.currency}/mês e receber {subscribeModalPlan.creditsIncluded} créditos. Em modo demo o pagamento é simulado.
            </p>
            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={() => setSubscribeModalPlan(null)}
                className="rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-sm font-medium text-white/85 hover:bg-white/10"
              >
                Cancelar
              </button>
              <PrimaryButton
                variant="primary"
                className="rounded-xl px-5 py-2.5 text-sm font-semibold"
                onClick={() => handleSubscribe(subscribeModalPlan)}
              >
                Confirmar e ativar
              </PrimaryButton>
            </div>
          </div>
        </div>
      )}

      {/* Subscription cancel modal */}
      {cancelModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-[#020617]/80 backdrop-blur-sm"
            onClick={() => setCancelModalOpen(false)}
          />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/[0.14] bg-[#020617]/95 p-6 shadow-2xl backdrop-blur-2xl">
            <h2 className="text-lg font-semibold text-white">
              Tens a certeza que queres cancelar a subscrição?
            </h2>
            <p className="mt-3 text-sm text-white/80">
              A tua subscrição continuará ativa até ao fim do período já pago. Não perderás o acesso até essa data.
            </p>
            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={() => setCancelModalOpen(false)}
                className="rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-sm font-medium text-white/85 hover:bg-white/10"
              >
                Manter subscrição
              </button>
              <PrimaryButton
                variant="primary"
                className="rounded-xl px-5 py-2.5 text-sm font-semibold"
                onClick={() => {
                  setSubscriptionStatus("cancel_at_period_end");
                  setCancelModalOpen(false);
                }}
              >
                Confirmar cancelamento
              </PrimaryButton>
            </div>
          </div>
        </div>
      )}

      {/* Payment method modal – demo selection */}
      {methodModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-[#020617]/80 backdrop-blur-sm"
            onClick={() => setMethodModalOpen(false)}
          />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/[0.14] bg-[#020617]/95 p-6 shadow-2xl backdrop-blur-2xl">
            <h2 className="text-lg font-semibold text-white">
              {methodStep === "type" ? "Escolher método de pagamento" : "Configurar método"}
            </h2>
            {methodStep === "type" && (
              <div className="mt-4 space-y-2">
                {[
                  { type: "card" as PaymentMethodType, label: "Cartão bancário" },
                  { type: "mbway" as PaymentMethodType, label: "MB WAY" },
                  { type: "apple_pay" as PaymentMethodType, label: "Apple Pay" },
                  { type: "google_pay" as PaymentMethodType, label: "Google Pay" },
                ].map((opt) => (
                  <button
                    key={opt.type}
                    type="button"
                    onClick={() => {
                      setSelectedType(opt.type);
                      setMethodStep(opt.type === "mbway" ? "details" : "details");
                    }}
                    className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm font-medium text-white/90 transition ${
                      selectedType === opt.type
                        ? "border-blue-400/60 bg-blue-500/20"
                        : "border-white/15 bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            )}
            {methodStep === "details" && selectedType === "mbway" && (
              <div className="mt-4 space-y-3">
                <p className="text-sm text-white/75">
                  Introduz o teu número de telemóvel para associar MB WAY em modo demo.
                </p>
                <input
                  type="tel"
                  value={mbwayPhone}
                  onChange={(e) => setMbwayPhone(e.target.value)}
                  placeholder="+351 912 345 678"
                  className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-blue-400/60 focus:outline-none focus:ring-1 focus:ring-blue-400/60"
                />
              </div>
            )}
            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={() => setMethodModalOpen(false)}
                className="rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-sm font-medium text-white/85 hover:bg-white/10"
              >
                Cancelar
              </button>
              <PrimaryButton
                variant="primary"
                className="rounded-xl px-5 py-2.5 text-sm font-semibold"
                onClick={handleConfirmMethod}
              >
                Guardar método
              </PrimaryButton>
            </div>
          </div>
        </div>
      )}

      {/* Extra credits payment modal */}
      {creditsModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-[#020617]/80 backdrop-blur-sm"
            onClick={() => setCreditsModalOpen(false)}
          />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/[0.14] bg-[#020617]/95 p-6 shadow-2xl backdrop-blur-2xl">
            <h2 className="text-lg font-semibold text-white">
              Escolher método para créditos extra
            </h2>
            <p className="mt-2 text-sm text-white/75">
              Métodos disponíveis: Cartão, MB WAY, Apple Pay e Google Pay.
            </p>
            <div className="mt-4 space-y-2">
              {[
                { type: "card" as PaymentMethodType, label: "Cartão bancário" },
                { type: "mbway" as PaymentMethodType, label: "MB WAY" },
                { type: "apple_pay" as PaymentMethodType, label: "Apple Pay" },
                { type: "google_pay" as PaymentMethodType, label: "Google Pay" },
              ].map((opt) => (
                <button
                  key={opt.type}
                  type="button"
                  onClick={() => setCreditsMethodType(opt.type)}
                  className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm font-medium text-white/90 transition ${
                    creditsMethodType === opt.type
                      ? "border-blue-400/60 bg-blue-500/20"
                      : "border-white/15 bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
            {creditsMethodType === "mbway" && (
              <div className="mt-4 space-y-3">
                <p className="text-sm text-white/75">
                  Introduz o teu número MB WAY para simular o pagamento.
                </p>
                <input
                  type="tel"
                  value={creditsMbwayPhone}
                  onChange={(e) => setCreditsMbwayPhone(e.target.value)}
                  placeholder="+351 912 345 678"
                  className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-blue-400/60 focus:outline-none focus:ring-1 focus:ring-blue-400/60"
                />
              </div>
            )}
            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={() => setCreditsModalOpen(false)}
                className="rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-sm font-medium text-white/85 hover:bg-white/10"
              >
                Cancelar
              </button>
              <PrimaryButton
                variant="primary"
                className="rounded-xl px-5 py-2.5 text-sm font-semibold"
                onClick={handleConfirmCredits}
              >
                Confirmar compra
              </PrimaryButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
