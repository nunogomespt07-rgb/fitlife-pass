"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import GlassCard from "@/app/components/ui/GlassCard";
import PrimaryButton from "@/app/components/ui/PrimaryButton";
import { getStoredUser } from "@/lib/storedUser";
import {
  getStoredRoutinePreferences,
  setStoredRoutinePreferences,
  type RoutineActivityType,
  type RoutineGoal,
  type RoutinePreferences,
  type WeeklyFrequency,
  type TimeSlot,
  type LocationPreference,
} from "@/lib/routinePreferences";

const GOALS: { id: RoutineGoal; label: string }[] = [
  { id: "perder_peso", label: "Perder peso" },
  { id: "ganhar_massa", label: "Ganhar massa" },
  { id: "manter_forma", label: "Manter forma" },
  { id: "relaxar_bem_estar", label: "Relaxar / bem-estar" },
  { id: "melhorar_performance", label: "Melhorar performance" },
];

const FREQUENCIES: { id: WeeklyFrequency; label: string }[] = [
  { id: 2, label: "2x por semana" },
  { id: 3, label: "3x por semana" },
  { id: 4, label: "4x por semana" },
  { id: 5, label: "5x por semana" },
];

const TIME_SLOTS: { id: TimeSlot; label: string }[] = [
  { id: "manha", label: "Manhã" },
  { id: "almoco", label: "Almoço" },
  { id: "pos_trabalho", label: "Pós-trabalho" },
  { id: "noite", label: "Noite" },
];

const LOCATIONS: { id: LocationPreference; label: string }[] = [
  { id: "perto_casa", label: "Perto de casa" },
  { id: "perto_trabalho", label: "Perto do trabalho" },
  { id: "indiferente", label: "Indiferente" },
];

const ACTIVITY_TYPES: { id: RoutineActivityType; label: string }[] = [
  { id: "gym_access", label: "Gym access" },
  { id: "yoga", label: "Yoga" },
  { id: "pilates", label: "Pilates" },
  { id: "piscina", label: "Piscina" },
  { id: "crossfit", label: "CrossFit" },
  { id: "boxe", label: "Boxe" },
  { id: "danca", label: "Dança" },
  { id: "padel", label: "Padel" },
  { id: "pilates_reformer", label: "Pilates reformer" },
  { id: "personal_training", label: "Personal training" },
  { id: "nutricao", label: "Nutrição" },
  { id: "massagem_desportiva", label: "Massagem desportiva" },
];

function toggleInList<T>(list: T[], item: T): T[] {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
}

function chipClass(active: boolean): string {
  return active
    ? "rounded-full border border-white/20 bg-white/10 px-3 py-2 text-sm font-medium text-white"
    : "rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white/80 hover:bg-white/8";
}

function deriveGoalFromProfile(raw: string | null | undefined): RoutineGoal {
  const t = (raw ?? "").toLowerCase();
  if (t.includes("massa")) return "ganhar_massa";
  if (t.includes("perder") || t.includes("emag")) return "perder_peso";
  if (t.includes("relax") || t.includes("bem")) return "relaxar_bem_estar";
  if (t.includes("perform")) return "melhorar_performance";
  return "manter_forma";
}

export default function RoutinePreferencesPage() {
  const router = useRouter();
  const userId = getStoredUser()?.id ?? null;

  const existing = useMemo<RoutinePreferences | null>(
    () => getStoredRoutinePreferences(userId),
    [userId]
  );

  const [goal, setGoal] = useState<RoutineGoal>("manter_forma");
  const [weeklyFrequency, setWeeklyFrequency] = useState<WeeklyFrequency>(3);
  const [preferredTimeSlots, setPreferredTimeSlots] = useState<TimeSlot[]>([
    "pos_trabalho",
    "noite",
  ]);
  const [preferredLocation, setPreferredLocation] =
    useState<LocationPreference>("indiferente");
  const [preferredActivityTypes, setPreferredActivityTypes] = useState<
    RoutineActivityType[]
  >(["gym_access", "yoga", "pilates"]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = getStoredUser();
    const existingPrefs = getStoredRoutinePreferences(stored?.id ?? null);
    if (existingPrefs) {
      setGoal(existingPrefs.goal);
      setWeeklyFrequency(existingPrefs.weeklyFrequency);
      setPreferredTimeSlots(existingPrefs.preferredTimeSlots ?? []);
      setPreferredLocation(existingPrefs.preferredLocation);
      setPreferredActivityTypes(existingPrefs.preferredActivityTypes ?? []);
      return;
    }
    if (stored?.fitnessGoal) {
      setGoal(deriveGoalFromProfile(stored.fitnessGoal));
    }
  }, []);

  function handleSave() {
    setError(null);
    if (!userId) {
      setError("Não foi possível guardar: utilizador não identificado.");
      return;
    }
    if (preferredTimeSlots.length === 0) {
      setError("Escolhe pelo menos um horário preferido.");
      return;
    }
    if (preferredActivityTypes.length === 0) {
      setError("Escolhe pelo menos um tipo de atividade.");
      return;
    }
    setSaving(true);
    try {
      setStoredRoutinePreferences(userId, {
        goal,
        weeklyFrequency,
        preferredTimeSlots,
        preferredLocation,
        preferredActivityTypes,
      });
      router.push("/dashboard/rotina");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page-bg text-white font-sans min-h-screen">
      <div className="mx-auto max-w-4xl px-4 pb-24 pt-24 sm:px-6 lg:px-10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
          FitLife Pass · Rotina
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Preferências
        </h1>
        <p className="mt-3 text-sm text-white/70">
          Define o que procuras. A tua rotina só é reservada quando confirmares.
        </p>

        <GlassCard variant="dark" padding="lg" className="mt-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/60">
            Objetivo
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {GOALS.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => setGoal(g.id)}
                className={chipClass(goal === g.id)}
              >
                {g.label}
              </button>
            ))}
          </div>

          <div className="mt-8 border-t border-white/[0.12] pt-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/60">
              Frequência semanal
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {FREQUENCIES.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setWeeklyFrequency(f.id)}
                  className={chipClass(weeklyFrequency === f.id)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 border-t border-white/[0.12] pt-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/60">
              Horários preferidos
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {TIME_SLOTS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() =>
                    setPreferredTimeSlots((prev) => toggleInList(prev, s.id))
                  }
                  className={chipClass(preferredTimeSlots.includes(s.id))}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 border-t border-white/[0.12] pt-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/60">
              Localização
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {LOCATIONS.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => setPreferredLocation(l.id)}
                  className={chipClass(preferredLocation === l.id)}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 border-t border-white/[0.12] pt-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/60">
              Tipos de atividade
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {ACTIVITY_TYPES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() =>
                    setPreferredActivityTypes((prev) => toggleInList(prev, t.id))
                  }
                  className={chipClass(preferredActivityTypes.includes(t.id))}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="mt-6 rounded-xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm text-red-100">
              {error}
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              className="text-sm font-medium text-white/80 underline-offset-2 hover:underline"
              onClick={() => router.push("/dashboard/rotina")}
            >
              ← Voltar
            </button>
            <PrimaryButton
              variant="appPrimary"
              className="rounded-xl py-3 text-sm font-semibold"
              onClick={handleSave}
              loading={saving}
              loadingLabel="A guardar…"
            >
              Guardar preferências
            </PrimaryButton>
          </div>

          {existing && (
            <p className="mt-4 text-xs text-white/50">
              Última atualização:{" "}
              {new Date(existing.updatedAt).toLocaleString("pt-PT", {
                day: "2-digit",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          )}
        </GlassCard>
      </div>
    </div>
  );
}

