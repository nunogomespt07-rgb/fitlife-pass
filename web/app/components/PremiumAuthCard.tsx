"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import PrimaryButton from "./ui/PrimaryButton";

function OptionIcon({ kind }: { kind: "google" | "apple" | "email" | "facebook" }) {
  if (kind === "google") {
    return (
      <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
        <path
          fill="currentColor"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="currentColor"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="currentColor"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="currentColor"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
    );
  }
  if (kind === "apple") {
    return (
      <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
        <path
          fill="currentColor"
          d="M16.365 1.43c0 1.14-.42 2.2-1.23 3.02-.88.9-2.34 1.6-3.62 1.5-.16-1.23.47-2.5 1.29-3.35.9-.92 2.45-1.63 3.56-1.17zM20.76 17.01c-.41.95-.61 1.37-1.14 2.2-.74 1.16-1.78 2.61-3.07 2.62-1.15.01-1.45-.76-3.01-.75-1.56.01-1.9.76-3.05.74-1.29-.01-2.27-1.32-3.01-2.48-2.06-3.23-2.28-7.03-1-9.02.91-1.42 2.36-2.25 3.73-2.25 1.17 0 2.15.8 3.24.8 1.05 0 1.68-.8 3.23-.8 1.22 0 2.52.67 3.43 1.82-3.02 1.66-2.53 6.01.65 7.12z"
        />
      </svg>
    );
  }
  if (kind === "facebook") {
    return (
      <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
        <path
          fill="currentColor"
          d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06C2 17.08 5.66 21.24 10.44 22v-7.03H7.9v-2.91h2.54V9.85c0-2.52 1.49-3.91 3.78-3.91 1.1 0 2.24.2 2.24.2v2.47h-1.26c-1.24 0-1.63.78-1.63 1.57v1.88h2.78l-.44 2.91h-2.34V22C18.34 21.24 22 17.08 22 12.06Z"
        />
      </svg>
    );
  }
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 4-8 5L4 8V6l8 5 8-5v2Z"
      />
    </svg>
  );
}

function AuthOptionBar({
  kind,
  label,
  onClick,
  disabled,
  hint,
}: {
  kind: "google" | "apple" | "email" | "facebook";
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  hint?: string;
}) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`auth-provider-button relative flex w-full items-center justify-center rounded-2xl border px-4 py-3.5 text-sm font-semibold transition-all duration-200 lg:py-3 lg:text-[13px] ${
        disabled
          ? "border-white/[0.08] bg-white/[0.02] text-white/30"
          : "border-[var(--ref-glass-border-strong)] bg-white/[0.06] text-white hover:border-white/25 hover:bg-white/[0.10] focus:border-blue-400/50 focus:outline-none focus:ring-2 focus:ring-blue-400/40"
      }`}
      aria-disabled={disabled}
      title={disabled && hint ? hint : undefined}
    >
      <span className="auth-provider-button-content flex w-full items-center justify-center gap-3">
        <span className="text-white/80">
          <OptionIcon kind={kind} />
        </span>
        <span>{label}</span>
      </span>
    </button>
  );
}

type PremiumAuthCardProps = {
  desktopWider?: boolean;
};

export default function PremiumAuthCard({ desktopWider }: PremiumAuthCardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [oauthError, setOauthError] = useState("");

  useEffect(() => {
    const err = searchParams.get("error");
    if (err) {
      setOauthError("Não foi possível entrar com Google. Tenta novamente.");
    }
  }, [searchParams]);

  const cardShell = `glass-dark mx-auto w-full min-w-0 max-w-[420px] rounded-[var(--radius-card)] p-5 shadow-[var(--shadow-glass)] sm:p-6 ${
    desktopWider ? "lg:max-w-none lg:px-6 lg:py-6" : ""
  }`;

  return (
    <div className={cardShell}>
      <h2 className="mb-5 mt-1 text-center text-xl font-semibold tracking-tight text-white sm:mt-2 sm:text-[1.25rem]">
        Entrar ou registar-se
      </h2>

      <div className="animate-in flex flex-col">
        <PrimaryButton
          type="button"
          variant="primary"
          onClick={() => router.push("/auth/email")}
          className="primary-auth-button h-12 w-full rounded-xl py-4 text-[16px] sm:text-[15px] lg:landing-primary-cta"
        >
          Continuar com e-mail
        </PrimaryButton>

        <div className="auth-divider relative mb-1.5 mt-4 flex items-center gap-3">
          <span className="flex-1 border-t border-white/20" />
          <span className="text-xs font-medium uppercase tracking-wider text-white/45">ou</span>
          <span className="flex-1 border-t border-white/20" />
        </div>

        <div className="space-y-2.5">
          <AuthOptionBar
            kind="google"
            label="Continuar com Google"
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          />
          <AuthOptionBar kind="apple" label="Continuar com Apple" disabled hint="Ainda não disponível" />
          <AuthOptionBar kind="facebook" label="Continuar com Facebook" disabled hint="Ainda não disponível" />
        </div>

        {oauthError ? (
          <div className="mt-4 rounded-xl border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
            {oauthError}
          </div>
        ) : null}
      </div>

      <p className="auth-legal mt-6 text-center text-xs text-white/45">
        Os teus dados estão protegidos. Nunca partilhamos o teu email.
      </p>
    </div>
  );
}
