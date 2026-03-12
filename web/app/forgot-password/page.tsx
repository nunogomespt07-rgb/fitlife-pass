"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import GlassCard from "../components/ui/GlassCard";
import PrimaryButton from "../components/ui/PrimaryButton";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = (await res.json().catch(() => ({}))) as { message?: string };
      if (!res.ok) {
        setError(data?.message ?? "Ocorreu um erro. Tenta novamente.");
        return;
      }
      setSent(true);
    } catch {
      setError("Não foi possível enviar o pedido. Tenta novamente.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="page-bg font-sans">
        <div className="flex min-h-screen flex-col items-center justify-center px-4 pt-24 pb-16">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/60">
            FitLife Pass
          </p>
          <GlassCard
            variant="dark"
            padding="lg"
            className="mt-8 w-full max-w-[420px] rounded-[32px] border border-white/[0.12] bg-white/[0.05] shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-[20px]"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-500/20 text-emerald-300">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="mt-6 text-xl font-semibold tracking-tight text-white">
              Verifica o teu email
            </h1>
            <p className="mt-3 text-sm text-white/75">
              Se existir uma conta associada a <span className="font-medium text-white/90">{email}</span>, receberás instruções para redefinir a password em breve.
            </p>
            <p className="mt-4 text-xs text-white/60">
              Não recebeste o email? Verifica a pasta de spam ou{" "}
              <button
                type="button"
                onClick={() => { setSent(false); setError(""); }}
                className="font-medium text-white/80 underline-offset-2 hover:text-white hover:underline"
              >
                tenta outro email
              </button>
              .
            </p>
            <PrimaryButton
              type="button"
              variant="secondary"
              className="mt-6 w-full"
              onClick={() => router.push("/")}
            >
              Voltar ao início de sessão
            </PrimaryButton>
          </GlassCard>
        </div>
      </div>
    );
  }

  return (
    <div className="page-bg font-sans">
      <div className="flex min-h-screen flex-col items-center justify-center px-4 pt-24 pb-16">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/60">
          FitLife Pass
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Recuperar password
        </h1>
        <p className="mt-2 max-w-sm text-center text-sm text-white/70">
          Indica o email da tua conta e enviaremos instruções para redefinir a password.
        </p>

        <GlassCard
          variant="dark"
          padding="lg"
          className="relative mt-8 w-full max-w-[420px] overflow-hidden rounded-[32px] border border-white/[0.12] bg-white/[0.05] shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-[20px]"
        >
          <div className="pointer-events-none absolute inset-0 rounded-[32px] bg-[linear-gradient(120deg,rgba(255,255,255,0.15),rgba(255,255,255,0.03),rgba(255,255,255,0))]" />
          <div className="relative">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="forgot-email" className="mb-1.5 block text-xs font-medium text-white/60">
                  Email
                </label>
                <input
                  id="forgot-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full h-[52px] rounded-[16px] border border-white/[0.14] bg-white/[0.08] px-4 text-[15px] text-white placeholder:text-white/40 outline-none transition focus:border-[#60A5FA] focus:ring-2 focus:ring-[#60A5FA]/40"
                  placeholder="o-teu@email.com"
                />
              </div>
              {error && (
                <p className="rounded-[16px] border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-100">
                  {error}
                </p>
              )}
              <PrimaryButton
                type="submit"
                loading={loading}
                disabled={loading}
                className="w-full h-[52px] rounded-[16px] text-[15px] font-semibold"
              >
                Enviar instruções
              </PrimaryButton>
            </form>
          </div>
        </GlassCard>

        <p className="mt-6 text-sm text-white/60">
          <Link href="/" className="font-medium text-white underline-offset-2 hover:underline">
            ← Voltar ao início
          </Link>
        </p>
      </div>
    </div>
  );
}
