"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import GlassCard from "../../components/ui/GlassCard";
import PrimaryButton from "../../components/ui/PrimaryButton";
import { useMockReservations } from "@/app/context/MockReservationsContext";
import { getStoredUser, setStoredUser, StoredUser, splitFullName } from "@/lib/storedUser";
import { changePassword, fetchCurrentUserProfile, patchCurrentUser } from "@/lib/api";
import { COUNTRIES } from "@/lib/countries";

function renderValue(value: string | null | undefined): ReactNode {
  const t = value?.trim();
  const isEmpty = !t;
  return (
    <span className={isEmpty ? "text-white/45 font-medium" : "text-white"}>
      {isEmpty ? "—" : t}
    </span>
  );
}

function getCountryLabel(value: string | null | undefined): string {
  const v = value?.trim();
  if (!v) return "";
  const found = COUNTRIES.find((c) => c.code.toLowerCase() === v.toLowerCase());
  return found ? found.name : v;
}

/** Após hidratação: dados vêm do GET /api/user (Mongo). LS é apenas cache espelho. */
/** Build profile display from stored user — deriva nome/apelido do `name` se necessário. */
function profileFromStoredUser(user: StoredUser | null): {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  dateOfBirth: string;
  nif: string;
  fitnessGoal: string;
} {
  if (!user) {
    return {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      postalCode: "",
      country: "",
      dateOfBirth: "",
      nif: "",
      fitnessGoal: "",
    };
  }
  let firstName = (user.firstName ?? "").trim();
  let lastName = (user.lastName ?? "").trim();
  if (!firstName && !lastName && user.name?.trim()) {
    const d = splitFullName(user.name);
    firstName = d.firstName;
    lastName = d.lastName;
  }
  return {
    firstName,
    lastName,
    email: user.email ?? "",
    phone: user.phone ?? "",
    address: user.address ?? "",
    city: user.city ?? "",
    postalCode: user.postalCode ?? "",
    country: getCountryLabel(user.country ?? ""),
    dateOfBirth: user.dateOfBirth ?? "",
    nif: user.nif ?? "",
    fitnessGoal: user.fitnessGoal ?? "",
  };
}

export type ProfileData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  dateOfBirth: string;
  nif: string;
  fitnessGoal: string;
};

export default function DashboardPerfilPage() {
  const [profile, setProfile] = useState<ProfileData>(profileFromStoredUser(null));
  const [editing, setEditing] = useState<ProfileData>(profileFromStoredUser(null));
  const [isEditing, setIsEditing] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");
  const [ready, setReady] = useState(false);
  const { reservations } = useMockReservations();

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    function loadFromStorage() {
      const user = getStoredUser();
      if (typeof process !== "undefined" && process.env.NODE_ENV === "development") {
        console.log("USER AFTER MERGE:", user);
        console.log("CREDITS:", typeof window !== "undefined" ? localStorage.getItem("credits") : null);
      }
      const loaded = profileFromStoredUser(user);
      setProfile(loaded);
      setEditing(loaded);
      setReady(true);
    }

    async function hydrateFromServer() {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) {
        loadFromStorage();
        return;
      }
      try {
        const data = await fetchCurrentUserProfile();
        if (cancelled) return;
        const id = String((data as { id?: string }).id ?? "").trim();
        if (id) {
          const credits = (data as { credits?: number }).credits;
          setStoredUser({
            id,
            name: String((data as { name?: string }).name ?? ""),
            email: String((data as { email?: string }).email ?? ""),
            ...(typeof credits === "number" && Number.isFinite(credits)
              ? { credits: Math.max(0, Math.floor(credits)) }
              : {}),
            firstName: (data as { firstName?: string | null }).firstName ?? undefined,
            lastName: (data as { lastName?: string | null }).lastName ?? undefined,
            phone: (data as { phone?: string | null }).phone ?? undefined,
            address: (data as { address?: string | null }).address ?? undefined,
            city: (data as { city?: string | null }).city ?? undefined,
            postalCode: (data as { postalCode?: string | null }).postalCode ?? undefined,
            country: (data as { country?: string | null }).country ?? undefined,
            dateOfBirth: (data as { dateOfBirth?: string | null }).dateOfBirth ?? undefined,
            nif: (data as { nif?: string | null }).nif ?? undefined,
            fitnessGoal: (data as { fitnessGoal?: string | null }).fitnessGoal ?? undefined,
            subscriptionPlanId:
              (data as { subscriptionPlanId?: string | null }).subscriptionPlanId ??
              (data as { plan?: string | null }).plan ??
              null,
            subscriptionPlanName:
              (data as { subscriptionPlanName?: string | null }).subscriptionPlanName ??
              (data as { plan?: string | null }).plan ??
              null,
            interests: Array.isArray((data as { interests?: unknown }).interests)
              ? ((data as { interests: string[] }).interests as string[])
              : undefined,
            preferredActivities:
              Array.isArray((data as { interests?: unknown }).interests) &&
              (data as { interests: string[] }).interests.length > 0
                ? ((data as { interests: string[] }).interests as string[])
                : undefined,
          });
        }
      } catch {
        // Mantém cache local se a API falhar
      }
      loadFromStorage();
    }

    void hydrateFromServer();

    const onUpdate = () => {
      void hydrateFromServer();
    };
    window.addEventListener("fitlife-auth-changed", onUpdate);
    window.addEventListener("fitlife-user-updated", onUpdate);
    window.addEventListener("storage", onUpdate);
    return () => {
      cancelled = true;
      window.removeEventListener("fitlife-auth-changed", onUpdate);
      window.removeEventListener("fitlife-user-updated", onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, []);

  function handleStartEdit() {
    setEditing({ ...profile });
    setIsEditing(true);
    setSavedMessage("");
  }

  function handleCancel() {
    setEditing({ ...profile });
    setIsEditing(false);
    setSavedMessage("");
  }

  async function handleSave() {
    const combinedName = `${editing.firstName.trim()} ${editing.lastName.trim()}`.trim();
    const trimmed: ProfileData = {
      ...editing,
      firstName: editing.firstName.trim(),
      lastName: editing.lastName.trim(),
      phone: editing.phone.trim(),
      nif: editing.nif.trim(),
      address: editing.address.trim(),
      city: editing.city.trim(),
      postalCode: editing.postalCode.trim(),
      country: editing.country.trim(),
      dateOfBirth: editing.dateOfBirth.trim(),
      fitnessGoal: editing.fitnessGoal.trim(),
    };
    console.log("[PERFIL] handleSave called", { trimmed });
    try {
      const patchResult = await patchCurrentUser({
        name: combinedName || undefined,
        firstName: trimmed.firstName,
        lastName: trimmed.lastName,
        phone: trimmed.phone,
        nif: trimmed.nif,
        address: trimmed.address,
        city: trimmed.city,
        postalCode: trimmed.postalCode,
        country: trimmed.country,
        dateOfBirth: trimmed.dateOfBirth,
        fitnessGoal: trimmed.fitnessGoal,
      });
      console.log("[PERFIL] patchCurrentUser result", patchResult);
      setStoredUser({
        name: combinedName || undefined,
        firstName: trimmed.firstName,
        lastName: trimmed.lastName,
        phone: trimmed.phone,
        nif: trimmed.nif,
        address: trimmed.address,
        city: trimmed.city,
        postalCode: trimmed.postalCode,
        country: trimmed.country,
        dateOfBirth: trimmed.dateOfBirth,
        fitnessGoal: trimmed.fitnessGoal,
      });
      setProfile(trimmed);
      setEditing(trimmed);
      setIsEditing(false);
      setSavedMessage("Perfil guardado com sucesso.");
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("fitlife-user-updated"));
      }
    } catch (err) {
      console.error("[PERFIL] Error in handleSave", err);
      setSavedMessage("Erro ao guardar perfil. Tenta novamente.");
    }
  }

  function updateEditing(field: keyof ProfileData, value: string) {
    setEditing((prev) => ({ ...prev, [field]: value }));
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");
    if (!newPassword.trim()) {
      setPasswordError("Introduz a nova palavra-passe.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("A nova palavra-passe e a confirmação não coincidem.");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("A nova palavra-passe deve ter pelo menos 6 caracteres.");
      return;
    }
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      setPasswordError("Sessão inválida. Inicia sessão novamente.");
      return;
    }
    setPasswordLoading(true);
    try {
      await changePassword(token, currentPassword, newPassword);
      setPasswordSuccess("Palavra-passe alterada com sucesso.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      const e = err as Error & { status?: number; data?: { message?: string } };
      const msg =
        e?.data && typeof e.data === "object" && typeof e.data.message === "string"
          ? e.data.message
          : e?.message ?? "Erro ao alterar palavra-passe. Verifica a palavra-passe atual.";
      setPasswordError(msg);
    } finally {
      setPasswordLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-white/[0.12] bg-white/[0.06] px-4 py-3 text-[15px] text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition duration-[180ms]";
  const labelClass = "block text-xs font-semibold uppercase tracking-wider text-white/65 mb-1.5";

  const completedActivities = reservations.filter(
    (r) => r.type === "activity" && r.status === "completed"
  );
  const usedCredits = reservations
    .filter((r) => r.type === "activity" && r.creditsUsed > 0 && r.creditsRefunded !== true)
    .reduce((sum, r) => sum + r.creditsUsed, 0);
  const uniquePartners = new Set(reservations.map((r) => r.partnerId)).size;
  const totalReservations = reservations.length;
  const visitedRestaurants = new Set(
    reservations.filter((r) => r.type === "restaurant").map((r) => r.partnerId)
  ).size;

  if (!ready) {
    return (
      <div className="page-bg min-h-screen font-sans text-white flex items-center justify-center">
        <p className="text-white/60">A carregar…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans text-white">
      <div className="mx-auto max-w-2xl px-4 pb-28 pt-6 sm:px-6 lg:px-10">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-white/80 transition hover:text-white"
        >
          ← Voltar à conta
        </Link>

        <h1 className="app-hero-title mt-8 text-white">
          Perfil
        </h1>
        <p className="mt-2 text-[15px] text-white/65">
          Os teus dados pessoais e preferências.
        </p>

        {savedMessage && (
          <div className="mt-6 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-5 py-3.5 text-[15px] text-emerald-100">
            {savedMessage}
          </div>
        )}

        {/* Personal info */}
        <GlassCard
          variant="app"
          padding="lg"
          className="mt-10"
        >
          <div className="space-y-6">
            <div>
              <label className={labelClass}>Nome</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editing.firstName}
                  onChange={(e) => updateEditing("firstName", e.target.value)}
                  className={inputClass}
                  placeholder="Ex.: Pedro"
                />
              ) : (
                <p className="text-sm font-medium">{renderValue(profile.firstName)}</p>
              )}
            </div>

            <div>
              <label className={labelClass}>Apelido</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editing.lastName}
                  onChange={(e) => updateEditing("lastName", e.target.value)}
                  className={inputClass}
                  placeholder="Ex.: Silva"
                />
              ) : (
                <p className="text-sm font-medium">{renderValue(profile.lastName)}</p>
              )}
            </div>

            <div>
              <label className={labelClass}>Email</label>
              <p className="text-sm font-medium">{renderValue(profile.email)}</p>
              <p className="mt-0.5 text-xs text-white/50">Associado à tua conta (apenas leitura)</p>
            </div>

            {/* Compact two-column info layout */}
            <div className="border-t border-white/10 pt-8 mt-6 space-y-6">
              {/* Row 1 */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Telemóvel</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editing.phone}
                      onChange={(e) => updateEditing("phone", e.target.value)}
                      className={inputClass}
                      placeholder="+351 912 345 678"
                    />
                  ) : (
                    <p className="text-sm font-medium">{renderValue(profile.phone)}</p>
                  )}
                </div>
                <div>
                  <label className={labelClass}>NIF</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editing.nif}
                      onChange={(e) => updateEditing("nif", e.target.value)}
                      className={inputClass}
                      placeholder="9 dígitos"
                    />
                  ) : (
                    <p className="text-sm font-medium">{renderValue(profile.nif)}</p>
                  )}
                </div>
              </div>

              {/* Row 2 (full width) */}
              <div>
                <label className={labelClass}>Morada</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editing.address}
                    onChange={(e) => updateEditing("address", e.target.value)}
                    className={inputClass}
                    placeholder="Rua, número, andar"
                  />
                ) : (
                  <p className="text-sm font-medium">{renderValue(profile.address)}</p>
                )}
              </div>

              {/* Row 3 */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Cidade</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editing.city}
                      onChange={(e) => updateEditing("city", e.target.value)}
                      className={inputClass}
                      placeholder="Lisboa, Porto…"
                    />
                  ) : (
                    <p className="text-sm font-medium">{renderValue(profile.city)}</p>
                  )}
                </div>
                <div>
                  <label className={labelClass}>Código Postal</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editing.postalCode}
                      onChange={(e) => updateEditing("postalCode", e.target.value)}
                      className={inputClass}
                      placeholder="1200-195"
                    />
                  ) : (
                    <p className="text-sm font-medium">{renderValue(profile.postalCode)}</p>
                  )}
                </div>
              </div>

              {/* Row 4 */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>País</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editing.country}
                      onChange={(e) => updateEditing("country", e.target.value)}
                      className={inputClass}
                      placeholder="Portugal"
                    />
                  ) : (
                    <p className="text-sm font-medium">{renderValue(profile.country)}</p>
                  )}
                </div>
                <div>
                  <label className={labelClass}>Data de nascimento</label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={editing.dateOfBirth}
                      onChange={(e) => updateEditing("dateOfBirth", e.target.value)}
                      className={inputClass}
                    />
                  ) : (
                    <p className="text-sm font-medium">
                      {profile.dateOfBirth
                        ? renderValue(
                            new Date(profile.dateOfBirth + "T12:00:00").toLocaleDateString("pt-PT", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })
                          )
                        : renderValue("")}
                    </p>
                  )}
                </div>
              </div>

              {/* Row 5 (full width) */}
              <div>
                <label className={labelClass}>Objetivo fitness</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editing.fitnessGoal}
                    onChange={(e) => updateEditing("fitnessGoal", e.target.value)}
                    className={inputClass}
                    placeholder="Ex.: Manter forma, perder peso..."
                  />
                ) : (
                  <p className="text-sm font-medium">{renderValue(profile.fitnessGoal)}</p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            {isEditing ? (
              <>
                <PrimaryButton variant="appPrimary" onClick={handleSave}>
                  Guardar
                </PrimaryButton>
                <PrimaryButton variant="appSecondary" onClick={handleCancel}>
                  Cancelar
                </PrimaryButton>
              </>
            ) : (
              <PrimaryButton variant="appPrimary" onClick={handleStartEdit}>
                Editar perfil
              </PrimaryButton>
            )}
          </div>
        </GlassCard>

        {/* Security */}
        <GlassCard
          variant="app"
          padding="lg"
          className="mt-12"
        >
          <h2 className="app-card-title text-white/90">
            Segurança
          </h2>
          <p className="mt-1 text-[13px] text-white/55">Altera a tua palavra-passe.</p>
          <form onSubmit={handleChangePassword} className="mt-6 space-y-4">
            <div>
              <label htmlFor="current-password" className={labelClass}>Palavra-passe atual</label>
              <input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => { setCurrentPassword(e.target.value); setPasswordError(""); }}
                className={inputClass}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>
            <div>
              <label htmlFor="new-password" className={labelClass}>Nova palavra-passe</label>
              <input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => { setNewPassword(e.target.value); setPasswordError(""); }}
                className={inputClass}
                placeholder="••••••••"
                autoComplete="new-password"
                minLength={6}
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className={labelClass}>Confirmar nova palavra-passe</label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setPasswordError(""); }}
                className={inputClass}
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </div>
            {passwordError && (
              <div className="rounded-xl border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                {passwordError}
              </div>
            )}
            {passwordSuccess && (
              <div className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                <span>{passwordSuccess}</span>
                <button
                  type="button"
                  onClick={() => setPasswordSuccess("")}
                  className="shrink-0 text-xs font-medium text-emerald-200/90 underline-offset-2 hover:underline"
                >
                  Fechar
                </button>
              </div>
            )}
            <PrimaryButton
              type="submit"
              variant="appPrimary"
              loading={passwordLoading}
              disabled={passwordLoading}
              loadingLabel="A alterar…"
            >
              Alterar palavra-passe
            </PrimaryButton>
          </form>
        </GlassCard>

        {/* Stats */}
        <GlassCard
          variant="app"
          padding="lg"
          className="mt-12"
        >
          <h2 className="app-card-title text-white/90">
            Estatísticas
          </h2>
          <div className="mt-6 grid gap-6 text-[15px] text-white/90 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-white/55">
                Atividades realizadas
              </p>
              <p className="mt-1 text-xl font-semibold text-white">
                {completedActivities.length}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-white/55">
                Créditos utilizados
              </p>
              <p className="mt-1 text-xl font-semibold text-white">
                {usedCredits}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-white/55">
                Parceiros visitados
              </p>
              <p className="mt-1 text-xl font-semibold text-white">
                {uniquePartners}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-white/55">
                Restaurantes visitados
              </p>
              <p className="mt-1 text-xl font-semibold text-white">
                {visitedRestaurants}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-white/55">
                Reservas totais
              </p>
              <p className="mt-1 text-xl font-semibold text-white">
                {totalReservations}
              </p>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
