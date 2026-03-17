"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import GlassCard from "@/app/components/ui/GlassCard";
import PrimaryButton from "@/app/components/ui/PrimaryButton";
import { useHasCustomerAuth } from "@/app/hooks/useEffectiveUserId";

const ACTIVITY_OPTIONS = [
  { id: "gym", label: "Ginásio" },
  { id: "yoga", label: "Yoga" },
  { id: "padel", label: "Padel" },
  { id: "swimming", label: "Natação" },
  { id: "crossfit", label: "Crossfit" },
  { id: "healthy-food", label: "Healthy Food" },
  { id: "running", label: "Running" },
  { id: "pilates", label: "Pilates" },
];

const FREQUENCY_OPTIONS = [
  { id: "1-2", label: "1–2 vezes por semana" },
  { id: "3-4", label: "3–4 vezes por semana" },
  { id: "5+", label: "5 ou mais vezes por semana" },
];

const OBJECTIVE_OPTIONS = [
  { id: "fitness", label: "Fitness geral" },
  { id: "performance", label: "Performance" },
  { id: "wellness", label: "Bem-estar" },
];

type StoredUser = {
  id: string;
  name: string;
  email: string;
  city?: string | null;
  phone?: string | null;
  subscriptionPlanId?: string | null;
  subscriptionPlanName?: string | null;
  preferredActivities?: string[];
  trainingFrequency?: string | null;
  objective?: string | null;
};

export default function OnboardingPreferencesPage() {
  const router = useRouter();
  const hasAuth = useHasCustomerAuth();
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [frequency, setFrequency] = useState<string | null>(null);
  const [objective, setObjective] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!hasAuth) {
      router.replace("/");
      return;
    }
    try {
      const raw = localStorage.getItem("fitlife-user");
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<StoredUser>;
      if (Array.isArray(parsed.preferredActivities)) setSelectedActivities(parsed.preferredActivities);
      if (parsed.trainingFrequency) setFrequency(parsed.trainingFrequency);
      if (parsed.objective) setObjective(parsed.objective);
    } catch {
      // ignore
    }
  }, [router, hasAuth]);

  function toggleActivity(id: string) {
    setSelectedActivities((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (typeof window !== "undefined") {
        const raw = localStorage.getItem("fitlife-user");
        const base: Partial<StoredUser> = raw ? (JSON.parse(raw) as Partial<StoredUser>) : {};
        const updated = {
          ...base,
          preferredActivities: selectedActivities.length > 0 ? selectedActivities : undefined,
          trainingFrequency: frequency || null,
          objective: objective || null,
        };
        localStorage.setItem("fitlife-user", JSON.stringify(updated));
      }
      router.push("/onboarding/plan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-bg text-white font-sans min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 pb-20 pt-28 sm:px-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/50">
          FitLife Pass · Passo 2 de 3
        </p>
        <h1 className="mt-5 text-[1.75rem] font-semibold tracking-tight text-white sm:text-3xl">
          As tuas preferências
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-white/75">
          Que tipo de atividades te interessam? Isto ajuda-nos a personalizar a tua experiência. Todos os campos são opcionais.
        </p>
        <GlassCard
          variant="dark"
          padding="lg"
          className="mt-10 rounded-2xl border border-white/[0.12] bg-white/[0.06] shadow-[0_16px_48px_rgba(15,23,42,0.4)] backdrop-blur-xl"
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/65">
                Atividades de interesse
              </h2>
              <div className="flex flex-wrap gap-2.5">
                {ACTIVITY_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => toggleActivity(opt.id)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                      selectedActivities.includes(opt.id)
                        ? "bg-blue-500/80 text-white ring-2 ring-blue-400/60"
                        : "bg-white/10 text-white/90 hover:bg-white/15"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/65">
                Frequência de treino
              </h2>
              <div className="space-y-2.5">
                {FREQUENCY_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setFrequency(opt.id)}
                    className={`block w-full rounded-xl px-4 py-3 text-left text-sm transition ${
                      frequency === opt.id
                        ? "bg-white/15 text-white ring-2 ring-white/30"
                        : "bg-white/5 text-white/80 hover:bg-white/10"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/65">
                Objetivo
              </h2>
              <div className="space-y-2.5">
                {OBJECTIVE_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setObjective(opt.id)}
                    className={`block w-full rounded-xl px-4 py-3 text-left text-sm transition ${
                      objective === opt.id
                        ? "bg-white/15 text-white ring-2 ring-white/30"
                        : "bg-white/5 text-white/80 hover:bg-white/10"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <PrimaryButton
              type="submit"
              loading={loading}
              disabled={loading}
              className="mt-4 w-full rounded-2xl py-3.5 text-[15px] font-semibold"
            >
              Continuar
            </PrimaryButton>
          </form>
        </GlassCard>
      </div>
    </div>
  );
}
