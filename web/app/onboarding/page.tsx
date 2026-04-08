"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import OnboardingCard from "@/app/components/OnboardingCard";
import { setStoredUser } from "@/lib/storedUser";
import {
  ONBOARDING_TOTAL_STEPS,
  ONBOARDING_GOAL_OPTIONS,
  ONBOARDING_FREQUENCY_OPTIONS,
  ONBOARDING_CATEGORY_INTEREST_OPTIONS,
  ONBOARDING_EXPERIENCE_OPTIONS,
  ONBOARDING_TIME_OPTIONS,
  ONBOARDING_HEALTHY_FOOD_OPTIONS,
} from "@/lib/onboardingConstants";
import { patchCurrentUser } from "@/lib/api";

function readToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

function parseStep(raw: string | null): number {
  const n = parseInt(raw ?? "1", 10);
  if (Number.isNaN(n) || n < 1) return 1;
  if (n > ONBOARDING_TOTAL_STEPS) return ONBOARDING_TOTAL_STEPS;
  return n;
}

const optionCardBase =
  "w-full rounded-2xl border px-4 py-4 text-left text-[15px] font-medium transition-all duration-200 active:scale-[0.99]";
const optionInactive =
  "border-white/[0.12] bg-white/[0.05] text-white/90 hover:border-white/25 hover:bg-white/[0.09]";
const optionActive =
  "border-blue-400/55 bg-blue-500/20 text-white shadow-[0_0_0_1px_rgba(96,165,250,0.35)]";

function OnboardingFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const step = useMemo(() => parseStep(searchParams.get("step")), [searchParams]);

  const [goal, setGoal] = useState<string | null>(null);
  const [weeklyFrequency, setWeeklyFrequency] = useState<string | null>(null);
  const [interests, setInterests] = useState<string[]>([]);
  const [experienceLevel, setExperienceLevel] = useState<string | null>(null);
  const [preferredTimes, setPreferredTimes] = useState<string[]>([]);
  const [healthyFoodInterest, setHealthyFoodInterest] = useState<string | null>(null);
  const [finishing, setFinishing] = useState(false);
  const [checkedAuth, setCheckedAuth] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = readToken();
    if (!token) {
      router.replace("/auth/email");
      setCheckedAuth(true);
      return;
    }
    try {
      const raw = localStorage.getItem("fitlife-user");
      if (raw) {
        const parsed = JSON.parse(raw) as {
          onboardingCompleted?: boolean;
          primaryGoal?: string;
          trainingFrequency?: string;
          preferredActivities?: string[];
          experienceLevel?: string;
          preferredTrainingTimes?: string[];
          healthyFoodInterest?: string;
        };
        if (parsed.onboardingCompleted === true) {
          router.replace("/dashboard");
          setCheckedAuth(true);
          return;
        }
        if (parsed.onboardingCompleted !== false) {
          router.replace("/dashboard");
          setCheckedAuth(true);
          return;
        }
        if (parsed.primaryGoal) setGoal(parsed.primaryGoal);
        if (parsed.trainingFrequency) setWeeklyFrequency(parsed.trainingFrequency);
        if (Array.isArray(parsed.preferredActivities)) setInterests(parsed.preferredActivities);
        if (parsed.experienceLevel) setExperienceLevel(parsed.experienceLevel);
        if (Array.isArray(parsed.preferredTrainingTimes)) setPreferredTimes(parsed.preferredTrainingTimes);
        if (parsed.healthyFoodInterest) setHealthyFoodInterest(parsed.healthyFoodInterest);
      }
    } catch {
      // ignore
    }
    setCheckedAuth(true);
  }, [router]);

  const setStep = useCallback(
    (n: number) => {
      const next = Math.min(ONBOARDING_TOTAL_STEPS, Math.max(1, n));
      router.replace(`/onboarding?step=${next}`, { scroll: false });
    },
    [router]
  );

  const toggleMulti = useCallback((id: string, list: string[], setList: (v: string[]) => void) => {
    setList(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  }, []);

  const canContinue = useCallback(() => {
    switch (step) {
      case 1:
        return Boolean(goal);
      case 2:
        return Boolean(weeklyFrequency);
      case 3:
        return preferredTimes.length > 0;
      case 4:
        return Boolean(experienceLevel);
      case 5:
        return interests.length > 0;
      case 6:
        return Boolean(healthyFoodInterest);
      default:
        return false;
    }
  }, [step, goal, weeklyFrequency, experienceLevel, healthyFoodInterest, preferredTimes, interests]);

  const handleContinue = useCallback(async () => {
    if (!canContinue()) return;
    if (step < ONBOARDING_TOTAL_STEPS) {
      setStep(step + 1);
      return;
    }
    setFinishing(true);
    try {
      setStoredUser({
        primaryGoal: goal ?? undefined,
        trainingFrequency: weeklyFrequency ?? null,
        preferredActivities: interests.length > 0 ? interests : undefined,
        interests: interests.length > 0 ? interests : undefined,
        experienceLevel: experienceLevel ?? null,
        preferredTrainingTimes: preferredTimes.length > 0 ? preferredTimes : undefined,
        healthyFoodInterest: healthyFoodInterest ?? null,
        onboardingCompleted: true,
      });
      const token = readToken();
      if (token) {
        try {
          await patchCurrentUser({ interests });
        } catch {
          // Perfil local já foi guardado
        }
      }
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("fitlife-user-updated"));
      }
      router.push("/dashboard");
    } finally {
      setFinishing(false);
    }
  }, [
    canContinue,
    step,
    setStep,
    goal,
    weeklyFrequency,
    interests,
    experienceLevel,
    preferredTimes,
    healthyFoodInterest,
    router,
  ]);

  const handleBack = useCallback(() => {
    if (step <= 1) return;
    setStep(step - 1);
  }, [step, setStep]);

  if (!checkedAuth) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center text-sm text-white/55">
        A carregar…
      </div>
    );
  }

  const continueLabel = step === ONBOARDING_TOTAL_STEPS ? "Entrar na app" : "Continuar";

  return (
    <div className="page-bg min-h-screen text-white font-sans">
      {step === 1 && (
        <OnboardingCard
          step={step}
          totalSteps={ONBOARDING_TOTAL_STEPS}
          title="Qual é o teu principal objetivo?"
          description="Escolhe a opção que melhor descreve o que queres alcançar."
          onContinue={handleContinue}
          onBack={handleBack}
          showBack={false}
          continueDisabled={!goal}
          continueLoading={finishing}
          continueLabel={continueLabel}
        >
          <div className="space-y-3">
            {ONBOARDING_GOAL_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setGoal(opt.id)}
                className={`${optionCardBase} ${goal === opt.id ? optionActive : optionInactive}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </OnboardingCard>
      )}

      {step === 2 && (
        <OnboardingCard
          step={step}
          totalSteps={ONBOARDING_TOTAL_STEPS}
          title="Quantas vezes por semana queres treinar?"
          description="Isto ajuda-nos a sugerir planos e rotinas adequadas."
          onContinue={handleContinue}
          onBack={handleBack}
          continueDisabled={!weeklyFrequency}
          continueLoading={finishing}
          continueLabel={continueLabel}
        >
          <div className="space-y-3">
            {ONBOARDING_FREQUENCY_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setWeeklyFrequency(opt.id)}
                className={`${optionCardBase} ${
                  weeklyFrequency === opt.id ? optionActive : optionInactive
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </OnboardingCard>
      )}

      {step === 3 && (
        <OnboardingCard
          step={step}
          totalSteps={ONBOARDING_TOTAL_STEPS}
          title="Quando preferes treinar?"
          description="Seleciona todas as opções que se aplicam."
          onContinue={handleContinue}
          onBack={handleBack}
          continueDisabled={preferredTimes.length === 0}
          continueLoading={finishing}
          continueLabel={continueLabel}
        >
          <div className="flex flex-wrap gap-2.5">
            {ONBOARDING_TIME_OPTIONS.map((opt) => {
              const on = preferredTimes.includes(opt.id);
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => toggleMulti(opt.id, preferredTimes, setPreferredTimes)}
                  className={`rounded-full px-4 py-2.5 text-sm font-medium transition ${
                    on
                      ? "bg-blue-500/85 text-white ring-2 ring-blue-400/50"
                      : "bg-white/10 text-white/88 hover:bg-white/16"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </OnboardingCard>
      )}

      {step === 4 && (
        <OnboardingCard
          step={step}
          totalSteps={ONBOARDING_TOTAL_STEPS}
          title="Qual é o teu nível?"
          description="Sem julgamentos — só para personalizar sugestões."
          onContinue={handleContinue}
          onBack={handleBack}
          continueDisabled={!experienceLevel}
          continueLoading={finishing}
          continueLabel={continueLabel}
        >
          <div className="space-y-3">
            {ONBOARDING_EXPERIENCE_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setExperienceLevel(opt.id)}
                className={`${optionCardBase} ${
                  experienceLevel === opt.id ? optionActive : optionInactive
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </OnboardingCard>
      )}

      {step === 5 && (
        <OnboardingCard
          step={step}
          totalSteps={ONBOARDING_TOTAL_STEPS}
          title="Que tipo de atividades te interessam?"
          description="Escolhe todas as categorias que queres explorar no FitLife Pass."
          onContinue={handleContinue}
          onBack={handleBack}
          continueDisabled={interests.length === 0}
          continueLoading={finishing}
          continueLabel={continueLabel}
        >
          <div className="grid max-h-[min(52vh,520px)] gap-2.5 overflow-y-auto overflow-x-hidden pr-1 [scrollbar-gutter:stable] sm:grid-cols-2">
            {ONBOARDING_CATEGORY_INTEREST_OPTIONS.map((opt) => {
              const on = interests.includes(opt.id);
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => toggleMulti(opt.id, interests, setInterests)}
                  className={`rounded-2xl border px-4 py-3.5 text-left text-[14px] font-medium leading-snug transition ${
                    on
                      ? "border-blue-400/55 bg-blue-500/20 text-white shadow-[0_0_0_1px_rgba(96,165,250,0.35)]"
                      : "border-white/[0.12] bg-white/[0.05] text-white/90 hover:border-white/25 hover:bg-white/[0.09]"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </OnboardingCard>
      )}

      {step === 6 && (
        <OnboardingCard
          step={step}
          totalSteps={ONBOARDING_TOTAL_STEPS}
          title="Tens interesse em opções de alimentação saudável?"
          description="Healthy food e parceiros no FitLife Pass."
          onContinue={handleContinue}
          onBack={handleBack}
          continueDisabled={!healthyFoodInterest}
          continueLoading={finishing}
          continueLabel={continueLabel}
        >
          <div className="space-y-3">
            {ONBOARDING_HEALTHY_FOOD_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setHealthyFoodInterest(opt.id)}
                className={`${optionCardBase} ${
                  healthyFoodInterest === opt.id ? optionActive : optionInactive
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </OnboardingCard>
      )}
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="page-bg min-h-screen px-4 py-24 text-center text-sm text-white/55">
          A carregar…
        </div>
      }
    >
      <OnboardingFlow />
    </Suspense>
  );
}
