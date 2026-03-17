export type RoutineGoal =
  | "perder_peso"
  | "ganhar_massa"
  | "manter_forma"
  | "relaxar_bem_estar"
  | "melhorar_performance";

export type WeeklyFrequency = 2 | 3 | 4 | 5;

export type TimeSlot = "manha" | "almoco" | "pos_trabalho" | "noite";

export type LocationPreference = "perto_casa" | "perto_trabalho" | "indiferente";

export type RoutineActivityType =
  | "gym_access"
  | "yoga"
  | "pilates"
  | "piscina"
  | "crossfit"
  | "boxe"
  | "danca"
  | "padel"
  | "pilates_reformer"
  | "personal_training"
  | "nutricao"
  | "massagem_desportiva";

export type RoutinePreferences = {
  goal: RoutineGoal;
  weeklyFrequency: WeeklyFrequency;
  preferredTimeSlots: TimeSlot[];
  preferredLocation: LocationPreference;
  preferredActivityTypes: RoutineActivityType[];
  createdAt: string; // ISO
  updatedAt: string; // ISO
};

const STORAGE_KEY_PREFIX = "fitlife-routine-preferences";

function getKey(userId: string | null): string | null {
  if (userId == null || String(userId).trim() === "") return null;
  return `${STORAGE_KEY_PREFIX}-${userId}`;
}

function safeParse<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (raw == null) return fallback;
    const parsed = JSON.parse(raw) as T;
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function safeSet(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

export function getStoredRoutinePreferences(userId: string | null): RoutinePreferences | null {
  const key = getKey(userId);
  if (!key) return null;
  const raw = safeParse<RoutinePreferences | null>(key, null);
  if (!raw || typeof raw !== "object") return null;
  if (!("goal" in raw) || !("weeklyFrequency" in raw)) return null;
  return raw;
}

export function setStoredRoutinePreferences(
  userId: string | null,
  prefs: Omit<RoutinePreferences, "createdAt" | "updatedAt">,
  now: Date = new Date()
): RoutinePreferences | null {
  const key = getKey(userId);
  if (!key) return null;
  const existing = getStoredRoutinePreferences(userId);
  const createdAt = existing?.createdAt ?? now.toISOString();
  const next: RoutinePreferences = {
    ...prefs,
    createdAt,
    updatedAt: now.toISOString(),
  };
  safeSet(key, next);
  return next;
}

