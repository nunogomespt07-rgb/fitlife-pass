"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PrimaryButton from "./ui/PrimaryButton";
import { login } from "@/lib/api";
import type { StoredUser } from "@/lib/storedUser";
import { getStoredUser, joinName, replaceStoredUser, setStoredUser } from "@/lib/storedUser";
import { clearFitlifeLocalDemoCaches } from "@/lib/clearClientSession";
import {
  creditsDebug,
  mirrorWalletCreditsAfterAuth,
  writeWalletCreditsToLocalStorage,
} from "@/lib/walletCredits";
import { COUNTRIES } from "@/lib/countries";

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
  const c = passwordChecks(pwd);
  return c.minLength && c.hasNumberOrSymbol;
}

type RegisterSuccessResponse = {
  token?: string;
  user?: { id?: string; name?: string; email?: string; credits?: number };
  credits?: number;
  accessToken?: string;
  access_token?: string;
  jwt?: string;
  data?: { token?: string; accessToken?: string };
  message?: string;
};

function extractRegisterToken(data: RegisterSuccessResponse): string {
  if (typeof data.token === "string" && data.token.trim()) return data.token.trim();
  if (typeof data.accessToken === "string" && data.accessToken.trim()) return data.accessToken.trim();
  if (typeof data.access_token === "string" && data.access_token.trim()) return data.access_token.trim();
  if (typeof data.jwt === "string" && data.jwt.trim()) return data.jwt.trim();
  if (data.data && typeof data.data === "object") {
    const d = data.data;
    if (typeof d.token === "string" && d.token.trim()) return d.token.trim();
    if (typeof d.accessToken === "string" && d.accessToken.trim()) return d.accessToken.trim();
  }
  return "";
}

const SIGNUP_DEBUG =
  typeof process !== "undefined" && process.env.NODE_ENV === "development";

function signupDebug(label: string, payload: unknown) {
  if (!SIGNUP_DEBUG) return;
  console.log(`[signup/email] ${label}`, payload);
}

function EyeIcon({ show }: { show: boolean }) {
  return show ? (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
      />
    </svg>
  ) : (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
      />
    </svg>
  );
}

const MONTHS = [
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

export default function EmailAuthCard() {
  const router = useRouter();

  const [emailMode, setEmailMode] = useState<"login" | "signup">("login");
  const [signupStep, setSignupStep] = useState<0 | 1>(0);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [country, setCountry] = useState("");
  const [phone, setPhone] = useState("");

  const [dobDay, setDobDay] = useState("");
  const [dobMonth, setDobMonth] = useState("");
  const [dobYear, setDobYear] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  const [emailTouched, setEmailTouched] = useState(false);
  const [emailError, setEmailError] = useState("");

  const [lastDial, setLastDial] = useState("");

  const pwChecks = passwordChecks(password);

  const inputBase =
    "w-full min-h-12 rounded-xl border bg-white/[0.06] px-4 text-[16px] text-white outline-none transition-all duration-200 placeholder:text-white/30 focus:border-blue-400/60 focus:ring-2 focus:ring-blue-400/50 sm:text-[15px]";
  const inputError =
    "border-amber-400/40 focus:border-amber-400/60 focus:ring-amber-400/30";
  const selectBase =
    "w-full min-h-12 rounded-xl border border-[var(--ref-glass-border)] bg-white/[0.06] px-4 pr-10 text-[16px] text-white outline-none transition-all duration-200 focus:border-blue-400/60 focus:ring-2 focus:ring-blue-400/50 appearance-none sm:text-[15px]";

  const updateEmailError = useCallback(() => {
    const value = email.trim();
    if (value.length === 0) {
      setEmailError("");
      return;
    }
    setEmailError(validateEmail(value) ? "" : "Introduz um email válido.");
  }, [email]);

  useEffect(() => {
    updateEmailError();
  }, [email, updateEmailError]);

  function dispatchAuthChanged() {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("fitlife-auth-changed"));
    }
  }

  /** Só valores confirmados pelo backend; sem número => não espelhar saldo inventado. */
  function resolveWalletCredits(apiCredits?: number | null): number | null {
    if (typeof apiCredits === "number" && Number.isFinite(apiCredits) && apiCredits >= 0) {
      return Math.floor(apiCredits);
    }
    return null;
  }

  /**
   * Persist JWT session (order matters): token → credits → user → event → navigate.
   * Registo: créditos = 0 salvo se o backend devolver número finito; `redirectTo` → onboarding.
   */
  function completeJwtSession(opts: {
    token: string;
    user: { id?: string; name: string; email: string };
    firstName: string | null;
    lastName: string | null;
    credits?: number | null;
    /** Apenas registo: dados do formulário */
    profileExtra?: {
      dateOfBirth?: string | null;
      country?: string | null;
      phone?: string | null;
    };
    /** Destino após persistência (ex.: /onboarding após registo) */
    redirectTo?: string;
    /** Dev-only: log extra context for signup debugging */
    _debugSource?: "signup" | "login";
  }) {
    if (typeof window === "undefined") return;

    const isSignup = opts._debugSource === "signup";
    if (isSignup) {
      clearFitlifeLocalDemoCaches();
    }

    const mirror = mirrorWalletCreditsAfterAuth(opts.credits);
    const creditsStr = String(mirror);

    localStorage.removeItem("credits");
    localStorage.setItem("token", opts.token);
    writeWalletCreditsToLocalStorage(mirror);

    const emailSafe = (opts.user.email ?? "").trim();
    const userId =
      (opts.user.id && String(opts.user.id).trim()) || emailSafe || "";

    creditsDebug("completeJwtSession: wrote wallet", {
      creditsStr,
      mirror,
      apiCreditsInput: opts.credits,
      lsCreditsAfter: localStorage.getItem("credits"),
      source: opts._debugSource,
      userId,
    });

    signupDebug("completeJwtSession: after setItem token", {
      tokenLen: opts.token.length,
      tokenPrefix: opts.token.slice(0, 12),
      credits: creditsStr,
      localStorageToken: localStorage.getItem("token")?.length ?? 0,
      source: opts._debugSource,
    });

    if (opts._debugSource === "signup") {
      signupDebug("completeJwtSession: stored user payload", {
        id: userId,
        email: opts.user.email,
        profileExtra: opts.profileExtra,
      });
    }

    const nextPath = opts.redirectTo ?? "/dashboard";

    const prev = getStoredUser();
    const loginEmail = (opts.user.email ?? "").trim().toLowerCase();
    const sameAccount =
      Boolean(prev?.email?.trim()) &&
      prev!.email.trim().toLowerCase() === loginEmail;

    const mergedFirst =
      !isSignup && sameAccount
        ? (opts.firstName?.trim() || prev?.firstName?.trim() || null)
        : opts.firstName;
    const mergedLast =
      !isSignup && sameAccount
        ? (opts.lastName?.trim() || prev?.lastName?.trim() || null)
        : opts.lastName;

    const mergedName =
      opts.user.name?.trim() ||
      joinName(mergedFirst, mergedLast) ||
      prev?.name?.trim() ||
      "";

    if (SIGNUP_DEBUG && !isSignup) {
      console.log("[signup/email] login merge", {
        sameAccount,
        mergedFirst,
        mergedLast,
        mergedName,
        prevPhone: prev?.phone,
      });
    }

    /** Registo: substituir `fitlife-user` por completo (sem merge com sessão antiga). Login: merge seguro. */
    if (isSignup) {
      const su: StoredUser = {
        id: userId || "",
        name: mergedName,
        email: opts.user.email?.trim() || loginEmail,
        firstName: mergedFirst ?? null,
        lastName: mergedLast ?? null,
        credits: mirror,
        subscriptionPlanId: null,
        subscriptionPlanName: null,
        pendingPlanId: null,
        pendingPlanName: null,
        onboardingCompleted: false,
        ...(opts.profileExtra
          ? {
              dateOfBirth: opts.profileExtra.dateOfBirth?.trim() || null,
              country: opts.profileExtra.country?.trim() || null,
              phone: opts.profileExtra.phone?.trim() || null,
            }
          : {}),
      };
      replaceStoredUser(su);
    } else {
      setStoredUser({
        id: userId || prev?.id || "",
        name: mergedName,
        email: opts.user.email || prev?.email || loginEmail,
        firstName: mergedFirst ?? undefined,
        lastName: mergedLast ?? undefined,
        credits: mirror,
        ...(opts.profileExtra
          ? {
              dateOfBirth: opts.profileExtra.dateOfBirth?.trim() || undefined,
              country: opts.profileExtra.country?.trim() || undefined,
              phone: opts.profileExtra.phone?.trim() || undefined,
            }
          : {}),
      });
    }

    creditsDebug("completeJwtSession: getStoredUser read-back", {
      user: getStoredUser(),
      source: opts._debugSource,
    });

    dispatchAuthChanged();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("fitlife-user-updated"));
    }

    signupDebug("completeJwtSession: navigate", { path: nextPath, ok: true });
    router.push(nextPath);
  }

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
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
      if (!data?.token) {
        setError("Não foi possível iniciar sessão.");
        return;
      }
      creditsDebug("login: response before persist", {
        apiCredits: data.credits,
        email: emailVal,
      });
      const split = splitFullName(data.user?.name ?? "");
      completeJwtSession({
        token: data.token,
        user: {
          id: data.user?.id ?? emailVal,
          name: data.user?.name ?? "",
          email: data.user?.email ?? emailVal,
        },
        firstName: split.firstName?.trim() ? split.firstName : null,
        lastName: split.lastName?.trim() ? split.lastName : null,
        credits: data.credits ?? data.user?.credits,
        _debugSource: "login",
      });
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

  function handleSignupStep0(e: React.FormEvent<HTMLFormElement>) {
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

  async function handleSignupStep1(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const emailVal = email.trim().toLowerCase();

    if (!trimmedFirstName) {
      setError("Nome é obrigatório.");
      return;
    }
    if (!trimmedLastName) {
      setError("Apelido é obrigatório.");
      return;
    }
    if (!dateOfBirth.trim()) {
      setError("Data de nascimento é obrigatória.");
      return;
    }
    if (!validateEmail(emailVal)) {
      setEmailTouched(true);
      setEmailError("Introduz um email válido.");
      return;
    }
    if (!passwordValid(password)) {
      setError("A palavra-passe deve ter pelo menos 6 caracteres e incluir um número ou símbolo.");
      return;
    }

    const fullName = `${trimmedFirstName} ${trimmedLastName}`.trim();
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fullName,
          email: emailVal,
          password,
          dateOfBirth: dateOfBirth.trim(),
          country: country.trim() || null,
          phone: phone.trim() || null,
        }),
      });

      const data: RegisterSuccessResponse = await res.json().catch(() => ({}));

      signupDebug("POST /api/register ok", { status: res.ok, bodyKeys: data && typeof data === "object" ? Object.keys(data) : [] });
      signupDebug("register raw payload", data);

      if (!res.ok) {
        const msg =
          typeof data?.message === "string" && data.message.trim() ? data.message : "Erro no registo";
        const safeMsg =
          /failed to fetch|load failed|fetch failed|network error|connection refused/i.test(msg)
            ? "Não foi possível criar a conta. Tenta novamente."
            : msg;
        setError(safeMsg);
        return;
      }

      const token = extractRegisterToken(data);
      signupDebug("extracted token", {
        hasToken: Boolean(token),
        tokenLength: token.length,
        preview: token ? `${token.slice(0, 8)}…` : "(empty)",
      });

      if (!token) {
        setError("Conta criada, mas não foi possível iniciar sessão automaticamente.");
        return;
      }

      const uidRaw = data.user?.id != null ? String(data.user.id).trim() : "";
      if (!uidRaw) {
        setError("Conta criada mas resposta do servidor sem id de utilizador.");
        return;
      }
      const uname = typeof data.user?.name === "string" && data.user.name.trim() ? data.user.name : fullName;
      const uemail = typeof data.user?.email === "string" ? data.user.email : emailVal;

      const signupCredits =
        typeof data.user?.credits === "number" && Number.isFinite(data.user.credits)
          ? Math.max(0, Math.floor(data.user.credits))
          : typeof data.credits === "number" && Number.isFinite(data.credits)
            ? Math.max(0, Math.floor(data.credits))
            : null;

      creditsDebug("signup: register response credits", {
        signupCredits,
        rawCreditsField: data.credits,
      });

      completeJwtSession({
        token,
        user: { id: uidRaw, name: uname, email: uemail },
        firstName: trimmedFirstName,
        lastName: trimmedLastName,
        credits: signupCredits,
        profileExtra: {
          dateOfBirth: dateOfBirth.trim() || null,
          country: country.trim() || null,
          phone: phone.trim() || null,
        },
        redirectTo: "/onboarding?step=1",
        _debugSource: "signup",
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      const isNetworkError =
        (e instanceof TypeError &&
          (e.message === "Failed to fetch" || e.message === "Load failed")) ||
        /failed to fetch|load failed|fetch failed|network error/i.test(String(msg));
      setError(
        isNetworkError
          ? "Não foi possível criar a conta. Tenta novamente."
          : "Conta criada, mas não foi possível iniciar sessão automaticamente."
      );
    } finally {
      setLoading(false);
    }
  }

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1900 + 1 }, (_, i) => String(currentYear - i));

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

  const cardShell =
    "glass-dark mx-auto w-full min-w-0 max-w-[420px] rounded-[var(--radius-card)] p-5 shadow-[var(--shadow-glass)] sm:p-6";

  return (
    <div className={cardShell}>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Link
          href="/"
          className="inline-flex shrink-0 items-center gap-1 rounded-xl px-2 py-1.5 text-xs font-semibold text-white/60 transition-colors hover:text-white"
        >
          ← Voltar
        </Link>
      </div>

      <h2 className="mb-5 text-center text-xl font-semibold tracking-tight text-white sm:text-[1.25rem]">
        Entrar ou registar-se
      </h2>

      <div className="mb-5 flex gap-1 rounded-xl border border-[var(--ref-glass-border)] bg-white/[0.06] p-1.5">
        <button
          type="button"
          onClick={() => {
            setEmailMode("login");
            setError("");
            setSignupStep(0);
          }}
          className={`flex-1 rounded-lg py-3 text-sm font-medium transition-all duration-200 ${
            emailMode === "login"
              ? "bg-white/20 text-white shadow-[0_0_20px_-4px_rgba(59,130,246,0.35),0_1px_0_rgba(255,255,255,0.08)_inset]"
              : "text-white/45 hover:text-white/80"
          }`}
        >
          Entrar
        </button>
        <button
          type="button"
          onClick={() => {
            setEmailMode("signup");
            setError("");
            setSignupStep(0);
          }}
          className={`flex-1 rounded-lg py-3 text-sm font-medium transition-all duration-200 ${
            emailMode === "signup"
              ? "bg-white/20 text-white shadow-[0_0_20px_-4px_rgba(59,130,246,0.35),0_1px_0_rgba(255,255,255,0.08)_inset]"
              : "text-white/45 hover:text-white/80"
          }`}
        >
          Criar conta
        </button>
      </div>

      <div
        className={
          emailMode === "signup" && signupStep === 1
            ? "max-h-[min(52vh,420px)] overflow-y-auto overflow-x-hidden pr-1 [scrollbar-gutter:stable]"
            : ""
        }
      >
        {emailMode === "login" ? (
          <form onSubmit={handleLogin} className="flex w-full min-w-0 flex-col gap-4">
            <div>
              <label
                htmlFor="email-auth-email"
                className="mb-1.5 block text-[11px] font-medium tracking-wide text-white/50"
              >
                Email
              </label>
              <input
                id="email-auth-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => {
                  setEmailTouched(true);
                  updateEmailError();
                }}
                required
                className={`${inputBase} ${emailTouched && emailError ? inputError : "border-white/[0.12]"}`}
                placeholder="o-teu@email.com"
                aria-invalid={emailTouched && !!emailError}
                autoComplete="email"
              />
              {emailTouched && emailError && (
                <p id="email-auth-email-err" className="mt-1.5 text-[11px] text-amber-200/90">
                  {emailError}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="email-auth-password"
                className="mb-1.5 block text-[11px] font-medium tracking-wide text-white/50"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="email-auth-password"
                  type={showLoginPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className={`${inputBase} border-white/[0.12] pr-11`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword((v) => !v)}
                  className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-lg p-1.5 text-white/45 hover:text-white/80"
                  aria-label={showLoginPassword ? "Ocultar password" : "Mostrar password"}
                >
                  <EyeIcon show={showLoginPassword} />
                </button>
              </div>
            </div>

            <p className="-mt-1 text-right">
              <a
                href="/forgot-password"
                className="text-[11px] font-medium text-white/50 underline-offset-2 hover:text-white/80 hover:underline"
              >
                Esqueceste-te da palavra-passe?
              </a>
            </p>

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
              className="mt-1 h-12 w-full rounded-xl py-4 text-[15px] lg:landing-primary-cta"
            >
              Entrar
            </PrimaryButton>
          </form>
        ) : signupStep === 0 ? (
          <form onSubmit={handleSignupStep0} className="flex w-full min-w-0 flex-col gap-4">
            <div>
              <label
                htmlFor="email-signup-email"
                className="mb-1.5 block text-[11px] font-medium tracking-wide text-white/50"
              >
                Email
              </label>
              <input
                id="email-signup-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => {
                  setEmailTouched(true);
                  updateEmailError();
                }}
                required
                className={`${inputBase} ${emailTouched && emailError ? inputError : "border-white/[0.12]"}`}
                placeholder="o-teu@email.com"
                aria-invalid={emailTouched && !!emailError}
                autoComplete="email"
              />
              {emailTouched && emailError && (
                <p className="mt-1.5 text-[11px] text-amber-200/90">{emailError}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="email-signup-password"
                className="mb-1.5 block text-[11px] font-medium tracking-wide text-white/50"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="email-signup-password"
                  type={showSignupPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  required
                  autoComplete="new-password"
                  className={`${inputBase} border-white/[0.12] pr-11`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowSignupPassword((v) => !v)}
                  className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-lg p-1.5 text-white/45 hover:text-white/80"
                  aria-label={showSignupPassword ? "Ocultar password" : "Mostrar password"}
                >
                  <EyeIcon show={showSignupPassword} />
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <p
                className={`flex items-center gap-2 text-[11px] transition-colors ${
                  pwChecks.minLength ? "text-emerald-300/90" : "text-white/40"
                }`}
              >
                {pwChecks.minLength ? (
                  <span className="text-emerald-400" aria-hidden>
                    ✓
                  </span>
                ) : (
                  <span className="h-3.5 w-3.5 shrink-0 rounded-full border border-white/30" aria-hidden />
                )}
                Mínimo 6 caracteres
              </p>
              <p
                className={`flex items-center gap-2 text-[11px] transition-colors ${
                  pwChecks.hasNumberOrSymbol ? "text-emerald-300/90" : "text-white/40"
                }`}
              >
                {pwChecks.hasNumberOrSymbol ? (
                  <span className="text-emerald-400" aria-hidden>
                    ✓
                  </span>
                ) : (
                  <span className="h-3.5 w-3.5 shrink-0 rounded-full border border-white/30" aria-hidden />
                )}
                Inclui número ou símbolo
              </p>
            </div>

            {error && (
              <div className="rounded-xl border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                {error}
              </div>
            )}

            <PrimaryButton type="submit" variant="primary" className="h-12 w-full rounded-xl py-4 text-[15px] lg:landing-primary-cta">
              Criar conta
            </PrimaryButton>
          </form>
        ) : (
          <form onSubmit={handleSignupStep1} className="flex w-full min-w-0 flex-col gap-4 pb-1">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="min-w-0">
                <label
                  htmlFor="email-signup-firstName"
                  className="mb-1.5 block text-[11px] font-medium tracking-wide text-white/50"
                >
                  Nome <span className="text-amber-300/80">*</span>
                </label>
                <input
                  id="email-signup-firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className={`${inputBase} border-white/[0.12]`}
                  placeholder="Ex.: Pedro"
                  autoComplete="given-name"
                />
              </div>
              <div className="min-w-0">
                <label
                  htmlFor="email-signup-lastName"
                  className="mb-1.5 block text-[11px] font-medium tracking-wide text-white/50"
                >
                  Apelido <span className="text-amber-300/80">*</span>
                </label>
                <input
                  id="email-signup-lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className={`${inputBase} border-white/[0.12]`}
                  placeholder="Ex.: Silva"
                  autoComplete="family-name"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-medium tracking-wide text-white/50">
                Data de nascimento <span className="text-amber-300/80">*</span>
              </label>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="relative min-w-0">
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
                    <option value="" className="bg-slate-950">
                      Dia
                    </option>
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
                <div className="relative min-w-0">
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
                    <option value="" className="bg-slate-950">
                      Mês
                    </option>
                    {MONTHS.map((m) => (
                      <option key={m.value} value={m.value} className="bg-slate-950">
                        {m.label}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/40">
                    ▾
                  </span>
                </div>
                <div className="relative min-w-0">
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
                    <option value="" className="bg-slate-950">
                      Ano
                    </option>
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

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="relative min-w-0">
                <label className="mb-1.5 block text-[11px] font-medium tracking-wide text-white/50">
                  País <span className="text-white/35">(opcional)</span>
                </label>
                <select
                  value={country}
                  onChange={(e) => {
                    const next = e.target.value;
                    setCountry(next);
                    const dial = COUNTRIES.find((c) => c.code === next)?.dial ?? "";
                    setPhone((prev) => {
                      const trimmed = prev.trim();
                      if (!trimmed) return dial ? `${dial} ` : "";
                      if (lastDial && trimmed.startsWith(lastDial)) {
                        const rest = trimmed.slice(lastDial.length).trimStart();
                        return dial ? `${dial} ${rest}`.trimEnd() : rest;
                      }
                      return prev;
                    });
                    setLastDial(dial);
                  }}
                  className={selectBase}
                  aria-label="País"
                >
                  <option value="" className="bg-slate-950">
                    Selecionar país
                  </option>
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code} className="bg-slate-950">
                      {c.name}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-3 top-[calc(50%+12px)] -translate-y-1/2 text-white/40">
                  ▾
                </span>
              </div>
              <div className="min-w-0">
                <label className="mb-1.5 block text-[11px] font-medium tracking-wide text-white/50">
                  Telemóvel <span className="text-white/35">(opcional)</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={`${inputBase} border-white/[0.12]`}
                  placeholder={
                    country
                      ? `${COUNTRIES.find((c) => c.code === country)?.dial ?? ""} 912 345 678`
                      : "+351 912 345 678"
                  }
                  inputMode="tel"
                  autoComplete="tel"
                />
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
              className="h-12 w-full rounded-xl py-4 text-[15px] lg:landing-primary-cta"
            >
              Concluir registo
            </PrimaryButton>
          </form>
        )}
      </div>

      <p className="auth-legal mt-6 text-center text-xs text-white/45">
        Os teus dados estão protegidos. Nunca partilhamos o teu email.
      </p>
    </div>
  );
}
