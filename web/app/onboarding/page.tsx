"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import GlassCard from "../components/ui/GlassCard";
import PrimaryButton from "../components/ui/PrimaryButton";
import SectionHeader from "../components/ui/SectionHeader";
import { Dumbbell, Flower2, PersonStanding, Waves } from "lucide-react";

const STEPS = [
  {
    title: "Encontre e reserve aulas desportivas",
    subtitle: "Ginásio, yoga, running e muito mais num só lugar.",
    icons: [
      { label: "Ginásio", type: "gym" as const },
      { label: "Yoga", type: "yoga" as const },
      { label: "Running", type: "running" as const },
      { label: "Natação", type: "swim" as const },
    ],
    cta: "Continuar",
  },
  {
    title: "O teu dashboard",
    subtitle: "Vê os teus créditos e reservas num só sítio.",
    preview: "dashboard",
    cta: "Continuar",
  },
  {
    title: "Lista de atividades",
    subtitle: "Escolhe a aula, reserva com um clique.",
    preview: "activities",
    cta: "Começar a explorar",
  },
];

function OnboardingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const stepParam = searchParams.get("step");
  const [step, setStep] = useState(1);

  useEffect(() => {
    const n = stepParam ? parseInt(stepParam, 10) : 1;
    if (n >= 1 && n <= 3) setStep(n);
  }, [stepParam]);

  const current = STEPS[step - 1];
  const isLast = step === 3;

  function handleNext() {
    if (isLast) {
      router.push("/");
      return;
    }
    setStep((s) => Math.min(3, s + 1));
    router.replace(`/onboarding?step=${step + 1}`, { scroll: false });
  }

  return (
    <div className="mx-auto max-w-md px-5 pb-14 pt-24 sm:px-6">
      <div className="mb-10 flex gap-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition ${
              i <= step ? "bg-white/70" : "bg-white/15"
            }`}
          />
        ))}
      </div>

      <div className="min-h-[50vh]">
        {step === 1 && (
          <div className="animate-in">
            <SectionHeader title={current.title} subtitle={current.subtitle} />
            <div className="mt-10 grid grid-cols-2 gap-4">
              {current.icons?.map(({ label, type }) => {
                let IconComp: React.ElementType = Dumbbell;
                if (type === "yoga") IconComp = Flower2;
                else if (type === "running") IconComp = PersonStanding;
                else if (type === "swim") IconComp = Waves;
                return (
                  <GlassCard
                    key={label}
                    variant="dark"
                    padding="lg"
                    hover
                    className="flex flex-col items-center justify-center text-center"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white">
                      <IconComp className="h-7 w-7" strokeWidth={1.7} />
                    </div>
                    <p className="mt-3 text-sm font-medium text-white">{label}</p>
                  </GlassCard>
                );
              })}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-in">
            <SectionHeader title={current.title} subtitle={current.subtitle} />
            <div className="mt-10">
              <GlassCard variant="dark" padding="lg">
                <div className="space-y-5">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/50">Olá, Utilizador</span>
                    <span className="font-semibold text-white">Créditos e reservas</span>
                  </div>
                  <div className="rounded-[22px] border border-white/[0.1] bg-white/[0.05] p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-white/50">
                      Minhas reservas
                    </p>
                    <p className="mt-2 text-sm text-white/75">
                      Yoga Flow — 15 Mar · 2 créditos
                    </p>
                  </div>
                </div>
              </GlassCard>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-in">
            <SectionHeader title={current.title} subtitle={current.subtitle} />
            <div className="mt-10 space-y-4">
              {[
                { title: "Yoga Flow", location: "Lisboa", credits: 2 },
                { title: "HIIT", location: "Porto", credits: 3 },
              ].map((a) => (
                <GlassCard key={a.title} variant="dark" padding="md" hover>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex flex-col gap-1">
                      <p className="font-semibold text-white">{a.title}</p>
                      <p className="text-xs text-white/60">{a.location}</p>
                    </div>
                    <span className="rounded-full bg-white/[0.12] px-3 py-1 text-xs text-white">
                      {a.credits} créditos
                    </span>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-12">
        <PrimaryButton onClick={handleNext} className="w-full py-4">
          {current.cta}
        </PrimaryButton>
        {step > 1 && (
          <button
            type="button"
            onClick={() => {
              setStep(step - 1);
              router.replace(`/onboarding?step=${step - 1}`, { scroll: false });
            }}
            className="mt-5 w-full text-center text-sm font-medium text-white/60 hover:text-white"
          >
            Voltar
          </button>
        )}
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <div className="page-bg text-white font-sans">
      <Suspense fallback={<div className="mx-auto max-w-md px-4 py-16 text-center text-white/60">A carregar…</div>}>
        <OnboardingContent />
      </Suspense>
    </div>
  );
}
