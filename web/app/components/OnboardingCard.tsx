"use client";

import type { ReactNode } from "react";
import PrimaryButton from "./ui/PrimaryButton";

type OnboardingCardProps = {
  step: number;
  totalSteps: number;
  eyebrow?: string;
  title: string;
  description?: string;
  children: ReactNode;
  onBack?: () => void;
  onContinue: () => void;
  continueLabel?: string;
  backLabel?: string;
  continueDisabled?: boolean;
  continueLoading?: boolean;
  showBack?: boolean;
};

export default function OnboardingCard({
  step,
  totalSteps,
  eyebrow = "FitLife Pass",
  title,
  description,
  children,
  onBack,
  onContinue,
  continueLabel = "Continuar",
  backLabel = "Voltar",
  continueDisabled = false,
  continueLoading = false,
  showBack = true,
}: OnboardingCardProps) {
  return (
    <div className="mx-auto w-full max-w-lg px-5 pb-16 pt-24 sm:px-6 sm:pt-28">
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/50">
        {eyebrow} · {step}/{totalSteps}
      </p>

      <div className="mt-4 mb-8 flex gap-1.5">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((n) => (
          <div
            key={n}
            className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
              n <= step ? "bg-blue-400/90" : "bg-white/12"
            }`}
          />
        ))}
      </div>

      <h1 className="text-[1.65rem] font-semibold leading-snug tracking-tight text-white sm:text-3xl">
        {title}
      </h1>
      {description ? (
        <p className="mt-3 text-[15px] leading-relaxed text-white/72">{description}</p>
      ) : null}

      <div className="mt-10 rounded-[1.35rem] border border-white/[0.12] bg-white/[0.06] p-5 shadow-[0_20px_50px_rgba(15,23,42,0.45)] backdrop-blur-xl sm:p-7">
        {children}

        <div className="mt-10 space-y-3">
          <PrimaryButton
            type="button"
            onClick={onContinue}
            disabled={continueDisabled || continueLoading}
            loading={continueLoading}
            className="w-full rounded-2xl py-4 text-[15px] font-semibold"
          >
            {continueLabel}
          </PrimaryButton>
          {showBack && onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="w-full py-3 text-center text-sm font-medium text-white/55 transition hover:text-white/90"
            >
              {backLabel}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
