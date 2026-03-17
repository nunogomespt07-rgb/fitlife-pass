"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import GlassCard from "@/app/components/ui/GlassCard";
import PrimaryButton from "@/app/components/ui/PrimaryButton";

export default function AdminLoginPage() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="page-bg page-bg-dashboard text-white font-sans min-h-screen">
      <div className="mx-auto max-w-3xl px-4 pb-24 pt-24 sm:px-6 lg:px-10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/65">
          FitLife Pass · Admin
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Aceder como admin
        </h1>
        <p className="mt-3 text-sm text-white/70">
          Acesso interno. Em produção, isto deve ser substituído por autenticação admin real.
        </p>

        <GlassCard variant="app" padding="lg" className="mt-8 border-white/10">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/60">
            PIN admin
          </p>
          <input
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="••••"
            className="mt-3 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white/90 outline-none"
          />

          {error && (
            <div className="mt-4 rounded-xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm text-red-100">
              {error}
            </div>
          )}

          <PrimaryButton
            variant="appPrimary"
            className="mt-6 w-full rounded-xl py-3 text-sm font-semibold"
            onClick={() => {
              setError(null);
              (async () => {
                try {
                  const res = await fetch("/api/admin/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ pin }),
                  });
                  const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
                  if (!res.ok || !data.ok) {
                    setError(data.error || "PIN incorreto.");
                    return;
                  }
                  router.push("/admin");
                } catch {
                  setError("Não foi possível entrar. Tenta novamente.");
                }
              })();
            }}
          >
            Entrar
          </PrimaryButton>
        </GlassCard>
      </div>
    </div>
  );
}

