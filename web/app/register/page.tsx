"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import GlassCard from "../components/ui/GlassCard";
import PrimaryButton from "../components/ui/PrimaryButton";
import { setStoredUser } from "@/lib/storedUser";

const COUNTRIES: Array<{ value: string; label: string; dial: string }> = [
  { value: "PT", label: "Portugal", dial: "+351" },
  { value: "ES", label: "Espanha", dial: "+34" },
  { value: "FR", label: "França", dial: "+33" },
  { value: "GB", label: "Reino Unido", dial: "+44" },
  { value: "DE", label: "Alemanha", dial: "+49" },
  { value: "BR", label: "Brasil", dial: "+55" },
  { value: "US", label: "Estados Unidos", dial: "+1" },
];

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [country, setCountry] = useState("");
  const [phone, setPhone] = useState("");
  const [lastDial, setLastDial] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedAge, setAcceptedAge] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("As passwords não coincidem.");
      return;
    }
    if (!acceptedTerms || !acceptedAge) {
      setError("É necessário aceitar os Termos e Condições para criar conta.");
      return;
    }
    setLoading(true);
    try {
      const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
      if (!base || /localhost|127\.0\.0\.1/i.test(base)) {
        setError("Não foi possível criar a conta. NEXT_PUBLIC_API_URL em falta ou inválida.");
        setLoading(false);
        return;
      }
      const res = await fetch(`${base}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          country: country.trim() || null,
          phone: phone.trim() || null,
        }),
      });
      const data = await res.json().catch(() => ({} as Record<string, unknown>));

      if (!res.ok) {
        const msg = data && typeof data === "object" && typeof (data as { message?: string }).message === "string"
          ? (data as { message: string }).message
          : "";
        const safeMsg =
          /failed to fetch|load failed|fetch failed|network error|connection refused/i.test(msg)
            ? "Não foi possível criar a conta. Tenta novamente."
            : msg;
        if (res.status === 409 || /já está|already|duplicate|exist|registado/i.test(safeMsg)) {
          setError("Este email já está em utilização.");
        } else if (safeMsg) {
          setError(safeMsg);
        } else {
          setError("Não foi possível criar a conta. Tenta novamente.");
        }
        return;
      }

      // Auto-login via NextAuth Credentials (preferred)
      const emailVal = email.trim().toLowerCase();
      const loginResult = await signIn("credentials", {
        email: emailVal,
        password,
        redirect: false,
      });
      if (loginResult?.ok) {
        // iOS Safari: avoid "stuck zoom" by blurring focused inputs before navigation.
        try {
          (document.activeElement as HTMLElement | null)?.blur?.();
        } catch {}
        // Persist optional profile fields entered during registration so Profile can show them.
        try {
          setStoredUser({
            id: "",
            name: name.trim(),
            email: emailVal,
            country: country.trim() || null,
            phone: phone.trim() || null,
          });
        } catch {}
        router.push("/dashboard");
        return;
      }

      setError("Conta criada, mas não foi possível iniciar sessão automaticamente. Entra com o teu email.");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      const isNetwork =
        (e instanceof TypeError && (e.message === "Failed to fetch" || e.message.includes("fetch"))) ||
        msg === "Load failed" ||
        (typeof msg === "string" && msg.includes("Load failed"));
      setError(isNetwork ? "Não foi possível criar a conta. Tenta novamente." : (msg || "Erro no registo"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-bg font-sans">
      <div className="flex min-h-screen flex-col items-center justify-center px-4 pt-24 pb-12">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/60">
          FitLife Pass
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Criar conta
        </h1>

        <GlassCard variant="dark" padding="lg" className="mt-8 w-full max-w-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="mb-1.5 block text-xs font-medium text-white/60">
                Nome
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-[20px] border border-white/10 bg-white/5 px-4 py-3 text-[16px] sm:text-sm text-white placeholder:text-white/40 outline-none transition focus:ring-2 focus:ring-white/20"
                placeholder="O teu nome"
              />
            </div>
            <div>
              <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-white/60">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-[20px] border border-white/10 bg-white/5 px-4 py-3 text-[16px] sm:text-sm text-white placeholder:text-white/40 outline-none transition focus:ring-2 focus:ring-white/20"
                placeholder="o-teu@email.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1.5 block text-xs font-medium text-white/60">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-[20px] border border-white/10 bg-white/5 px-4 py-3 text-[16px] sm:text-sm text-white placeholder:text-white/40 outline-none transition focus:ring-2 focus:ring-white/20"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label
                htmlFor="confirm-password"
                className="mb-1.5 block text-xs font-medium text-white/60"
              >
                Confirmar password
              </label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full rounded-[20px] border border-white/10 bg-white/5 px-4 py-3 text-[16px] sm:text-sm text-white placeholder:text-white/40 outline-none transition focus:ring-2 focus:ring-white/20"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label htmlFor="country" className="mb-1.5 block text-xs font-medium text-white/60">
                País <span className="text-white/35">(opcional)</span>
              </label>
              <div className="relative">
                <select
                  id="country"
                  value={country}
                  onChange={(e) => {
                    const next = e.target.value;
                    setCountry(next);
                    const dial = COUNTRIES.find((c) => c.value === next)?.dial ?? "";
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
                  className="w-full appearance-none rounded-[20px] border border-white/10 bg-white/5 px-4 py-3 pr-10 text-[16px] sm:text-sm text-white outline-none transition focus:ring-2 focus:ring-white/20"
                >
                  <option value="" className="bg-slate-950">
                    Selecionar país
                  </option>
                  {COUNTRIES.map((c) => (
                    <option key={c.value} value={c.value} className="bg-slate-950">
                      {c.label}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-white/45">
                  ▾
                </span>
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="mb-1.5 block text-xs font-medium text-white/60">
                Telemóvel <span className="text-white/35">(opcional)</span>
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-[20px] border border-white/10 bg-white/5 px-4 py-3 text-[16px] sm:text-sm text-white placeholder:text-white/40 outline-none transition focus:ring-2 focus:ring-white/20"
                placeholder={country ? `${COUNTRIES.find((c) => c.value === country)?.dial ?? ""} 912 345 678` : "+351 912 345 678"}
                inputMode="tel"
                autoComplete="tel"
              />
            </div>
            <div className="flex items-start gap-3">
              <input
                id="accept-terms"
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-1 h-4 w-4 shrink-0 rounded border border-white/20 bg-white/5 text-white focus:ring-2 focus:ring-white/20"
              />
              <label htmlFor="accept-terms" className="text-sm text-white/80">
                Concordo com os{" "}
                <Link href="/legal/termos" className="font-medium text-white underline underline-offset-2 hover:text-white/90">
                  Termos e Condições
                </Link>{" "}
                e{" "}
                <Link href="/legal/privacidade" className="font-medium text-white underline underline-offset-2 hover:text-white/90">
                  Política de Privacidade
                </Link>
              </label>
            </div>
            <div className="flex items-start gap-3">
              <input
                id="accept-age"
                type="checkbox"
                checked={acceptedAge}
                onChange={(e) => setAcceptedAge(e.target.checked)}
                className="mt-1 h-4 w-4 shrink-0 rounded border border-white/20 bg-white/5 text-white focus:ring-2 focus:ring-white/20"
              />
              <label htmlFor="accept-age" className="text-sm text-white/80">
                Confirmo que tenho 16 anos ou mais
              </label>
            </div>
            {error && (
              <p className="rounded-[16px] border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-100">
                {error}
              </p>
            )}
            <PrimaryButton type="submit" loading={loading} disabled={loading} className="w-full">
              Criar conta
            </PrimaryButton>
            <div className="relative my-3 flex items-center gap-3">
              <span className="flex-1 border-t border-white/15" />
              <span className="text-xs font-medium uppercase tracking-wider text-white/50">
                ou
              </span>
              <span className="flex-1 border-t border-white/15" />
            </div>
            <button
              type="button"
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              className="flex w-full items-center justify-center gap-3 rounded-[20px] border border-white/[0.18] bg-white/[0.06] px-4 py-3.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-white/[0.1] hover:border-white/25 focus:outline-none focus:ring-2 focus:ring-white/20"
            >
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
              Continuar com Google
            </button>
          </form>
        </GlassCard>

        <p className="mt-6 text-sm text-white/60">
          Já tens conta?{" "}
          <Link href="/" className="font-medium text-white underline-offset-2 hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
