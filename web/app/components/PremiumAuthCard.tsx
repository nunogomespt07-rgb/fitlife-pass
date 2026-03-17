"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import PrimaryButton from "./ui/PrimaryButton";
import { login } from "@/lib/api";
import { setStoredUser } from "@/lib/storedUser";

function splitFullName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const HAS_NUMBER_OR_SYMBOL = /[0-9]|[^a-zA-Z0-9]/;

function validateEmail(value: string): boolean {
  return value.trim().length > 0 && EMAIL_REGEX.test(value.trim());
}

function passwordChecks(pwd: string) {
  return {
    minLength: pwd.length >= 6,
    hasNumberOrSymbol: HAS_NUMBER_OR_SYMBOL.test(pwd),
  };
}

function passwordValid(pwd: string): boolean {
  const { minLength, hasNumberOrSymbol } = passwordChecks(pwd);
  return minLength && hasNumberOrSymbol;
}

type PremiumAuthCardProps = { desktopWider?: boolean; mode?: "landing" | "full" };

export default function PremiumAuthCard({ desktopWider, mode = "landing" }: PremiumAuthCardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [screen, setScreen] = useState<"entry" | "email">(mode === "full" ? "email" : "entry");
  const [emailMode, setEmailMode] = useState<"login" | "signup">("login");
  const [signupStep, setSignupStep] = useState<0 | 1>(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [dobDay, setDobDay] = useState("");
  const [dobMonth, setDobMonth] = useState("");
  const [dobYear, setDobYear] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [emailError, setEmailError] = useState("");

  const pwChecks = passwordChecks(password);

  const updateEmailError = useCallback(() => {
    const v = email.trim();
    if (v.length === 0) {
      setEmailError("");
      return;
    }
    setEmailError(validateEmail(v) ? "" : "Introduz um email válido.");
  }, [email]);

  useEffect(() => {
    updateEmailError();
  }, [email, updateEmailError]);

  useEffect(() => {
    const oauthError = searchParams.get("error");
    if (oauthError) {
      setError("Não foi possível entrar com Google. Tenta novamente.");
      setScreen("entry");
    }
  }, [searchParams]);

  function openEmailFlow(mode: "login" | "signup" = "login") {
    setScreen("email");
    setEmailMode(mode);
    setSignupStep(0);
    setError("");
    setEmailError("");
    setEmailTouched(false);
  }

  function backToEntry() {
    setScreen("entry");
    setError("");
    setEmailError("");
    setEmailTouched(false);
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const emailVal = email.trim().toLowerCase();
    if (!validateEmail(emailVal)) {
      setEmailTouched(true);
      setEmailError("Introduz um email válido.");
      return;
    }
    setLoading(true);
    try {
      const data = await login(emailVal, password);
      if (typeof window !== "undefined" && data.token) {
        localStorage.setItem("token", data.token);
        try {
          const existingRaw = localStorage.getItem("fitlife-user");
          let existing: { subscriptionPlanId?: string | null; subscriptionPlanName?: string | null } = {};
          if (existingRaw) {
            try {
              existing = JSON.parse(existingRaw) as typeof existing;
            } catch {}
          }
          const split = splitFullName(data.user.name ?? "");
          const payload = {
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            firstName: split.firstName || null,
            lastName: split.lastName || null,
            subscriptionPlanId: existing.subscriptionPlanId ?? null,
            subscriptionPlanName: existing.subscriptionPlanName ?? null,
          };
          localStorage.setItem("fitlife-user", JSON.stringify(payload));
        } catch {}
        router.push("/dashboard");
      }
    } catch (e) {
      const err = e as Error & { data?: { message?: string } };
      const msg =
        err?.data && typeof err.data === "object" && typeof err.data.message === "string"
          ? err.data.message
          : err?.message ?? "Erro ao entrar";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  function handleSignupStep0(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const emailVal = email.trim().toLowerCase();
    if (!validateEmail(emailVal)) {
      setEmailTouched(true);
      setEmailError("Introduz um email válido.");
      return;
    }
    if (!passwordValid(password)) {
      setError("A palavra-passe deve ter pelo menos 6 caracteres e incluir um número ou símbolo.");
      return;
    }
    setSignupStep(1);
  }

  async function handleSignupStep1(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!firstName.trim()) {
      setError("Nome é obrigatório.");
      return;
    }
    if (!lastName.trim()) {
      setError("Apelido é obrigatório.");
      return;
    }
    if (!dateOfBirth.trim()) {
      setError("Data de nascimento é obrigatória.");
      return;
    }
    const emailVal = email.trim().toLowerCase();
    if (!validateEmail(emailVal)) {
      setEmailTouched(true);
      setEmailError("Introduz um email válido.");
      return;
    }
    if (!passwordValid(password)) {
      setError("A palavra-passe deve ter pelo menos 6 caracteres e incluir um número ou símbolo.");
      return;
    }
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fullName,
          email: emailVal,
          password,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as
        | { token?: string; user?: { id?: string; name?: string; email?: string } }
        | { message?: string }
        | null;
      if (!res.ok) {
        const msg = (data as { message?: string }).message ?? "";
        if (process.env.NODE_ENV !== "production") {
          console.error("[signup] Erro no registo:", res.status, msg || data);
        }
        const safeMsg =
          /failed to fetch|load failed|fetch failed|network error|connection refused/i.test(msg)
            ? "Não foi possível criar a conta. Tenta novamente."
            : msg || "Erro no registo";
        setError(safeMsg);
        setLoading(false);
        return;
      }
      if (typeof window !== "undefined" && data && typeof data === "object" && "token" in data) {
        const { token, user } = data as {
          token?: string;
          user?: { id?: string; name?: string; email?: string };
        };
        if (token) {
          localStorage.setItem("token", token);
          try {
            if (user) {
              setStoredUser({
                id: user.id ?? "",
                name: fullName,
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                email: user.email ?? emailVal,
                dateOfBirth: dateOfBirth.trim() || null,
                profileCompleted: true,
              });
            }
          } catch {
            // ignore
          }
        }
      }
      router.push("/onboarding/preferences");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      const isNetwork =
        (e instanceof TypeError && (e.message === "Failed to fetch" || e.message.includes("fetch"))) ||
        msg === "Load failed" ||
        /failed to fetch|load failed|fetch failed/i.test(String(msg));
      setError(isNetwork ? "Não foi possível criar a conta. Tenta novamente." : (msg || "Erro no registo"));
    } finally {
      setLoading(false);
    }
  }

  const inputBase =
    "w-full h-12 rounded-xl border border-[var(--ref-glass-border)] bg-white/[0.06] px-4 text-[15px] text-white placeholder:text-white/35 outline-none transition-all duration-200 focus:ring-2 focus:ring-blue-400/50 focus:ring-offset-0 focus:border-blue-400/60";
  const inputError = "border-amber-400/50 focus:ring-amber-400/40 focus:border-amber-400/60";
  const selectBase =
    "w-full h-12 rounded-xl border border-[var(--ref-glass-border)] bg-white/[0.06] px-4 pr-10 text-[15px] text-white outline-none transition-all duration-200 focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/60 appearance-none";

  const EyeIcon = ({ show }: { show: boolean }) =>
    show ? (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
      </svg>
    ) : (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    );

  function OptionIcon({ kind }: { kind: "google" | "apple" | "email" | "facebook" }) {
    if (kind === "google") {
      return (
        <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
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
            : "border-[var(--ref-glass-border-strong)] bg-white/[0.06] text-white hover:bg-white/[0.10] hover:border-white/25 focus:outline-none focus:ring-2 focus:ring-blue-400/40 focus:border-blue-400/50"
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

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1900 + 1 }, (_, i) => String(currentYear - i));
  const months = [
    { value: "01", label: "Jan" },
    { value: "02", label: "Fev" },
    { value: "03", label: "Mar" },
    { value: "04", label: "Abr" },
    { value: "05", label: "Mai" },
    { value: "06", label: "Jun" },
    { value: "07", label: "Jul" },
    { value: "08", label: "Ago" },
    { value: "09", label: "Set" },
    { value: "10", label: "Out" },
    { value: "11", label: "Nov" },
    { value: "12", label: "Dez" },
  ];

  function updateDob(next: { d?: string; m?: string; y?: string }) {
    const d = (next.d ?? dobDay).padStart(2, "0");
    const m = (next.m ?? dobMonth).padStart(2, "0");
    const y = next.y ?? dobYear;
    if (!y || !m || !d) {
      setDateOfBirth("");
      return;
    }
    setDateOfBirth(`${y}-${m}-${d}`);
  }

  return (
    <div className={`glass-dark w-full max-w-[340px] rounded-[var(--radius-card)] p-5 shadow-[var(--shadow-glass)] sm:max-w-[360px] sm:p-6 ${desktopWider ? "lg:max-w-none lg:px-6 lg:py-6" : ""}`}>
      <div className="mt-0.5">
        <div className="flex items-center justify-between">
          {mode === "landing" && screen === "email" ? (
            <button
              type="button"
              onClick={backToEntry}
              className="-ml-1 inline-flex items-center gap-1 rounded-xl px-2 py-2 text-xs font-semibold text-white/55 hover:text-white/90 focus:outline-none focus:ring-2 focus:ring-blue-400/40 focus:ring-offset-1 focus:ring-offset-transparent"
            >
              ← Voltar
            </button>
          ) : (
            <span />
          )}
          <span />
          <span />
        </div>

        <h2 className="login-card-title mt-4 text-xl font-semibold tracking-tight text-white sm:mt-5 sm:text-[1.25rem]">
          Entrar ou registar-se
        </h2>

        {/* Content area – stable min-height */}
        <div className="mt-4 min-h-[280px] sm:min-h-[300px]">
          {mode === "landing" && screen === "entry" ? (
            <div className="animate-in">
              <PrimaryButton
                type="button"
                variant="primary"
                onClick={() => {
                  router.push("/auth");
                }}
                className="primary-auth-button w-full h-12 rounded-xl text-[15px] py-4 lg:landing-primary-cta"
              >
                Continuar com e-mail
              </PrimaryButton>

              <div className="auth-divider relative mt-4 mb-1.5 flex items-center gap-3">
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
                <AuthOptionBar
                  kind="apple"
                  label="Continuar com Apple"
                  disabled
                  hint="Ainda não disponível"
                />
                <AuthOptionBar
                  kind="facebook"
                  label="Continuar com Facebook"
                  disabled
                  hint="Ainda não disponível"
                />
              </div>

              {error && (
                <div className="mt-4 rounded-xl border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                  {error}
                </div>
              )}
            </div>
          ) : (
            <div className="animate-in">
              <div className="flex gap-1 rounded-xl bg-white/[0.06] p-1.5 border border-[var(--ref-glass-border)]">
                <button
                  type="button"
                  onClick={() => { setEmailMode("login"); setError(""); setSignupStep(0); }}
                  className={`flex-1 rounded-lg py-3.5 text-sm font-medium transition-all duration-200 ${
                    emailMode === "login"
                      ? "bg-white/20 text-white shadow-[0_0_20px_-4px_rgba(59,130,246,0.35),0_1px_0_rgba(255,255,255,0.08)_inset]"
                      : "text-white/45 hover:text-white/80"
                  }`}
                >
                  Entrar
                </button>
                <button
                  type="button"
                  onClick={() => { setEmailMode("signup"); setError(""); setSignupStep(0); }}
                  className={`flex-1 rounded-lg py-3.5 text-sm font-medium transition-all duration-200 ${
                    emailMode === "signup"
                      ? "bg-white/20 text-white shadow-[0_0_20px_-4px_rgba(59,130,246,0.35),0_1px_0_rgba(255,255,255,0.08)_inset]"
                      : "text-white/45 hover:text-white/80"
                  }`}
                >
                  Criar conta
                </button>
              </div>

              {emailMode === "login" ? (
                <form onSubmit={handleLogin} className="mt-5 space-y-4">
                  <div>
                    <label htmlFor="auth-email" className="mb-1.5 block text-[11px] font-medium tracking-wide text-white/50">
                      Email
                    </label>
                    <input
                      id="auth-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={() => { setEmailTouched(true); updateEmailError(); }}
                      required
                      className={`${inputBase} ${emailTouched && emailError ? inputError : "border-white/[0.12]"}`}
                      placeholder="o-teu@email.com"
                      aria-invalid={emailTouched && !!emailError}
                    />
                    {emailTouched && emailError && (
                      <p id="auth-email-error" className="mt-1.5 text-[11px] text-amber-200/90">{emailError}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="auth-password" className="mb-1.5 block text-[11px] font-medium tracking-wide text-white/50">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="auth-password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className={`${inputBase} pr-11 border-white/[0.12]`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors p-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20"
                        aria-label={showPassword ? "Ocultar password" : "Mostrar password"}
                        tabIndex={-1}
                      >
                        <EyeIcon show={showPassword} />
                      </button>
                    </div>
                    <p className="mt-2 text-right">
                      <a href="/forgot-password" className="text-[11px] font-medium text-white/50 underline-offset-2 hover:text-white/80 hover:underline">
                        Esqueceste-te da palavra-passe?
                      </a>
                    </p>
                  </div>
                  {error && (
                    <div className="rounded-xl border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                      {error}
                    </div>
                  )}
                  <PrimaryButton
                    type="submit"
                    variant="primary"
                    loading={loading}
                    disabled={loading}
                    loadingLabel="A entrar…"
                    className="mt-5 w-full h-12 rounded-xl text-[15px] py-4 lg:landing-primary-cta"
                  >
                    Entrar
                  </PrimaryButton>
                </form>
              ) : (
                <>
                  {signupStep === 0 ? (
                    <form onSubmit={handleSignupStep0} className="mt-5 space-y-4">
                      <div>
                        <label htmlFor="signup-email" className="mb-1.5 block text-[11px] font-medium tracking-wide text-white/50">
                          Email
                        </label>
                        <input
                          id="signup-email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          onBlur={() => { setEmailTouched(true); updateEmailError(); }}
                          required
                          className={`${inputBase} ${emailTouched && emailError ? inputError : "border-white/[0.12]"}`}
                          placeholder="o-teu@email.com"
                          aria-invalid={emailTouched && !!emailError}
                        />
                        {emailTouched && emailError && (
                          <p className="mt-1.5 text-[11px] text-amber-200/90">{emailError}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="signup-password" className="mb-1.5 block text-[11px] font-medium tracking-wide text-white/50">
                          Password
                        </label>
                        <div className="relative">
                          <input
                            id="signup-password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => { setPassword(e.target.value); setError(""); }}
                            required
                            minLength={6}
                            className={`${inputBase} pr-11 border-white/[0.12]`}
                            placeholder="••••••••"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((v) => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 p-1 rounded-lg"
                            aria-label={showPassword ? "Ocultar password" : "Mostrar password"}
                            tabIndex={-1}
                          >
                            <EyeIcon show={showPassword} />
                          </button>
                        </div>
                        <div className="mt-3 space-y-1.5">
                          <p className={`flex items-center gap-2 text-[11px] transition-colors ${pwChecks.minLength ? "text-emerald-300/90" : "text-white/40"}`}>
                            {pwChecks.minLength ? (
                              <span className="text-emerald-400" aria-hidden>✓</span>
                            ) : (
                              <span className="w-3.5 h-3.5 rounded-full border border-white/30" aria-hidden />
                            )}
                            Mínimo 6 caracteres
                          </p>
                          <p className={`flex items-center gap-2 text-[11px] transition-colors ${pwChecks.hasNumberOrSymbol ? "text-emerald-300/90" : "text-white/40"}`}>
                            {pwChecks.hasNumberOrSymbol ? (
                              <span className="text-emerald-400" aria-hidden>✓</span>
                            ) : (
                              <span className="w-3.5 h-3.5 rounded-full border border-white/30" aria-hidden />
                            )}
                            Inclui número ou símbolo
                          </p>
                        </div>
                      </div>

                      {error && (
                        <div className="rounded-xl border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                          {error}
                        </div>
                      )}

                      <PrimaryButton
                        type="submit"
                        variant="primary"
                        className="mt-4 w-full h-12 rounded-xl text-[15px] py-4 lg:landing-primary-cta"
                      >
                        Criar conta
                      </PrimaryButton>
                    </form>
                  ) : (
                    <form onSubmit={handleSignupStep1} className="mt-5 space-y-4">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <label htmlFor="signup-firstName" className="mb-1.5 block text-[11px] font-medium tracking-wide text-white/50">
                            Nome <span className="text-amber-300/80">*</span>
                          </label>
                          <input
                            id="signup-firstName"
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            required
                            className={`${inputBase} border-white/[0.12]`}
                            placeholder="Ex.: Pedro"
                          />
                        </div>
                        <div>
                          <label htmlFor="signup-lastName" className="mb-1.5 block text-[11px] font-medium tracking-wide text-white/50">
                            Apelido <span className="text-amber-300/80">*</span>
                          </label>
                          <input
                            id="signup-lastName"
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            required
                            className={`${inputBase} border-white/[0.12]`}
                            placeholder="Ex.: Silva"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="mb-1.5 block text-[11px] font-medium tracking-wide text-white/50">
                          Data de nascimento <span className="text-amber-300/80">*</span>
                        </label>
                        <div className="grid gap-3 sm:grid-cols-3">
                          <div className="relative">
                            <select
                              value={dobDay}
                              onChange={(e) => {
                                setDobDay(e.target.value);
                                updateDob({ d: e.target.value });
                              }}
                              className={selectBase}
                              required
                              aria-label="Dia"
                            >
                              <option value="" className="bg-slate-950">Dia</option>
                              {Array.from({ length: 31 }, (_, i) => String(i + 1)).map((d) => (
                                <option key={d} value={String(d).padStart(2, "0")} className="bg-slate-950">
                                  {d}
                                </option>
                              ))}
                            </select>
                            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/40">
                              ▾
                            </span>
                          </div>
                          <div className="relative">
                            <select
                              value={dobMonth}
                              onChange={(e) => {
                                setDobMonth(e.target.value);
                                updateDob({ m: e.target.value });
                              }}
                              className={selectBase}
                              required
                              aria-label="Mês"
                            >
                              <option value="" className="bg-slate-950">Mês</option>
                              {months.map((m) => (
                                <option key={m.value} value={m.value} className="bg-slate-950">
                                  {m.label}
                                </option>
                              ))}
                            </select>
                            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/40">
                              ▾
                            </span>
                          </div>
                          <div className="relative">
                            <select
                              value={dobYear}
                              onChange={(e) => {
                                setDobYear(e.target.value);
                                updateDob({ y: e.target.value });
                              }}
                              className={selectBase}
                              required
                              aria-label="Ano"
                            >
                              <option value="" className="bg-slate-950">Ano</option>
                              {years.map((y) => (
                                <option key={y} value={y} className="bg-slate-950">
                                  {y}
                                </option>
                              ))}
                            </select>
                            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/40">
                              ▾
                            </span>
                          </div>
                        </div>
                      </div>

                      {error && (
                        <div className="rounded-xl border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                          {error}
                        </div>
                      )}

                      <PrimaryButton
                        type="submit"
                        variant="primary"
                        loading={loading}
                        disabled={loading}
                        loadingLabel="A concluir…"
                        className="mt-4 w-full h-12 rounded-xl text-[15px] py-4 lg:landing-primary-cta"
                      >
                        Concluir registo
                      </PrimaryButton>
                    </form>
                  )}
                </>
              )}
            </div>
          )}

          <p className="auth-legal mt-5 text-center text-xs text-white/45">
            Os teus dados estão protegidos. Nunca partilhamos o teu email.
          </p>
        </div>
      </div>
    </div>
  );
}
