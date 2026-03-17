"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import GlassCard from "@/app/components/ui/GlassCard";
import PrimaryButton from "@/app/components/ui/PrimaryButton";
import { getAllPartnersWithCategory } from "@/lib/activitiesData";

export default function BackofficeLoginPage() {
  const router = useRouter();
  const partners = useMemo(() => getAllPartnersWithCategory(), []);
  const [partnerId, setPartnerId] = useState<string>(partners[0]?.id ?? "");
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!partnerId && partners[0]?.id) setPartnerId(partners[0].id);
  }, [partnerId, partners]);

  const selected = partners.find((p) => p.id === partnerId) ?? null;

  return (
    <div className="page-bg page-bg-dashboard text-white font-sans min-h-screen">
      <div className="mx-auto max-w-3xl px-4 pb-24 pt-24 sm:px-6 lg:px-10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/65">
          FitLife Pass · Backoffice
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Aceder como parceiro
        </h1>
        <p className="mt-3 text-sm text-white/70">
          Modo demo: escolhe o teu parceiro para isolar dados e permissões.
        </p>

        <GlassCard variant="app" padding="lg" className="mt-8 border-white/10">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/60">
            Parceiro
          </p>
          <select
            value={partnerId}
            onChange={(e) => setPartnerId(e.target.value)}
            className="mt-4 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white/90 outline-none"
          >
            {partners.map((p) => (
              <option key={p.id} value={p.id} className="bg-[#020617]">
                {p.categoryLabel} · {p.name}
              </option>
            ))}
          </select>

          {selected && (
            <p className="mt-4 text-sm text-white/75">
              {selected.location}
            </p>
          )}

          <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-white/60">
            PIN de acesso
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
              if (!partnerId) return;
              setError(null);
              (async () => {
                try {
                  const res = await fetch("/api/backoffice/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ partnerId, pin }),
                  });
                  const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
                  if (!res.ok || !data.ok) {
                    setError(data.error || "PIN incorreto.");
                    return;
                  }
                  const params = new URLSearchParams(window.location.search);
                  const next = params.get("next");
                  router.push(next && next.startsWith("/backoffice") ? next : "/backoffice");
                } catch {
                  setError("Não foi possível entrar. Tenta novamente.");
                }
              })();
            }}
          >
            Entrar no backoffice
          </PrimaryButton>
        </GlassCard>
      </div>
    </div>
  );
}

