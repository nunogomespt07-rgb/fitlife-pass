"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import GlassCard from "@/app/components/ui/GlassCard";
import PrimaryButton from "@/app/components/ui/PrimaryButton";
import { getStoredUser, setStoredUser } from "@/lib/storedUser";
import { useHasCustomerAuth } from "@/app/hooks/useEffectiveUserId";

export default function OnboardingProfilePage() {
  const router = useRouter();
  const hasAuth = useHasCustomerAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [nif, setNif] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!hasAuth) {
      router.replace("/");
      return;
    }
    try {
      const u = getStoredUser();
      if (u?.profileCompleted) {
        router.replace("/onboarding/preferences");
        return;
      }
      if (u?.firstName) setFirstName(u.firstName);
      if (u?.lastName) setLastName(u.lastName);
      if (!u?.firstName && !u?.lastName && u?.name) {
        // best-effort for legacy accounts
        const parts = u.name.trim().split(/\s+/).filter(Boolean);
        if (parts.length) setFirstName(parts[0]);
        if (parts.length > 1) setLastName(parts.slice(1).join(" "));
      }
      if (u?.dateOfBirth) setDateOfBirth(u.dateOfBirth);
      if (u?.nif) setNif(u.nif);
    } catch {
      // ignore
    }
  }, [router, hasAuth]);

  function handleSubmit(e: React.FormEvent) {
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
    const birth = new Date(dateOfBirth.trim());
    if (Number.isNaN(birth.getTime())) {
      setError("Data de nascimento inválida.");
      return;
    }
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    if (age < 16) {
      setError("É necessário ter pelo menos 16 anos para criar conta.");
      return;
    }
    setLoading(true);
    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      setStoredUser({
        name: fullName,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        dateOfBirth: dateOfBirth.trim() || null,
        nif: nif.trim() || null,
        profileCompleted: true,
      });
      router.push("/onboarding/preferences");
    } catch {
      setError("Erro ao guardar. Tenta novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-bg text-white font-sans min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 pb-20 pt-28 sm:px-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/50">
          FitLife Pass · Completa o perfil
        </p>
        <h1 className="mt-5 text-[1.75rem] font-semibold tracking-tight text-white sm:text-3xl">
          Quase lá
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-white/75">
          Precisamos de alguns dados para concluir a tua conta. Só apareces uma vez.
        </p>
        <GlassCard
          variant="dark"
          padding="lg"
          className="mt-10 rounded-2xl border border-white/[0.12] bg-white/[0.06] shadow-[0_16px_48px_rgba(15,23,42,0.4)] backdrop-blur-xl"
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="profile-firstname"
                  className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/60"
                >
                  Nome <span className="font-normal normal-case text-amber-300/80">*</span>
                </label>
                <input
                  id="profile-firstname"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="w-full rounded-2xl border border-white/[0.14] bg-white/[0.06] px-4 py-3.5 text-[15px] text-white placeholder:text-white/40 outline-none transition focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/30"
                  placeholder="Ex.: Pedro"
                />
              </div>
              <div>
                <label
                  htmlFor="profile-lastname"
                  className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/60"
                >
                  Apelido <span className="font-normal normal-case text-amber-300/80">*</span>
                </label>
                <input
                  id="profile-lastname"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="w-full rounded-2xl border border-white/[0.14] bg-white/[0.06] px-4 py-3.5 text-[15px] text-white placeholder:text-white/40 outline-none transition focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/30"
                  placeholder="Ex.: Silva"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="profile-dob"
                className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/60"
              >
                Data de nascimento <span className="font-normal normal-case text-amber-300/80">*</span>
              </label>
              <input
                id="profile-dob"
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                required
                className="w-full rounded-2xl border border-white/[0.14] bg-white/[0.06] px-4 py-3.5 text-[15px] text-white placeholder:text-white/40 outline-none transition focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/30"
              />
            </div>
            <div>
              <label
                htmlFor="profile-nif"
                className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/60"
              >
                NIF <span className="font-normal normal-case text-white/45">(opcional)</span>
              </label>
              <input
                id="profile-nif"
                type="text"
                value={nif}
                onChange={(e) => setNif(e.target.value)}
                maxLength={9}
                pattern="[0-9]{9}"
                title="9 dígitos"
                className="w-full rounded-2xl border border-white/[0.14] bg-white/[0.06] px-4 py-3.5 text-[15px] text-white placeholder:text-white/40 outline-none transition focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/30"
                placeholder="123456789"
              />
              <p className="mt-1.5 text-[11px] text-white/45">9 dígitos, sem espaços.</p>
            </div>
            {error && (
              <p className="rounded-xl border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                {error}
              </p>
            )}
            <PrimaryButton
              type="submit"
              loading={loading}
              disabled={loading}
              className="mt-4 w-full rounded-2xl py-3.5 text-[15px] font-semibold"
            >
              Continuar
            </PrimaryButton>
          </form>
        </GlassCard>
        <p className="mt-6 text-center">
          <Link href="/dashboard" className="text-sm text-white/50 underline-offset-2 hover:text-white/80 hover:underline">
            Completar mais tarde
          </Link>
        </p>
      </div>
    </div>
  );
}
