import { getStoredUnifiedReservations, type UnifiedReservation } from "@/lib/unifiedReservations";
import { getStoredUser } from "@/lib/storedUser";
import { setStoredPublicWeekAvailability, type PublicWeekAvailability, type PublicSession } from "@/lib/publicAvailability";

export type Weekday =
  | "segunda"
  | "terca"
  | "quarta"
  | "quinta"
  | "sexta"
  | "sabado"
  | "domingo";

export type BackofficeSessionType =
  | "group_class"
  | "court"
  | "access_window"
  | "professional";

export type BackofficeSession = {
  id: string;
  partnerId: string;
  type: BackofficeSessionType;
  /**
   * Backoffice internal label.
   * For type-specific session naming, prefer:
   * - group_class: className
   * - access_window: windowName
   * - court: courtName
   * - professional: serviceName
   */
  name: string;
  weekday: Weekday;
  /** For most session types. For access windows, this is the start time. */
  time: string; // HH:MM
  /** For access windows, this can be derived from endTime. */
  durationMinutes: number;
  capacity: number;
  fitlifeSlots: number;
  credits: number;
  /** Optional type-specific fields (used to avoid forcing a single "class" model). */
  className?: string;
  instructor?: string;
  courtName?: string;
  windowName?: string;
  endTime?: string; // HH:MM for access windows
  serviceName?: string;
  /** Optional: used by professional sessions */
  professionalName?: string;
  specialties?: string[];
  /** Session location only (no ownership). */
  sessionLocation?: string;
  /** Optional internal notes */
  notes?: string;
};

export type BackofficeWeekSchedule = {
  partnerId: string;
  weekStartISO: string; // YYYY-MM-DD (Monday)
  sessions: BackofficeSession[];
  updatedAt: string; // ISO
};

const STORAGE_KEY_PREFIX = "fitlife-backoffice-schedule";
const STORAGE_SELECTED_PARTNER = "fitlife-backoffice-selected-partner";
const DEFAULT_EUR_PER_CREDIT = 0.6;
const STORAGE_EUR_PER_CREDIT = "fitlife-backoffice-eur-per-credit";

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

function keyFor(partnerId: string, weekStartISO: string): string {
  return `${STORAGE_KEY_PREFIX}-${partnerId}-${weekStartISO}`;
}

export function getSelectedBackofficePartnerId(): string | null {
  return safeParse<string | null>(STORAGE_SELECTED_PARTNER, null);
}

export function setSelectedBackofficePartnerId(partnerId: string): void {
  safeSet(STORAGE_SELECTED_PARTNER, partnerId);
}

export function getEurPerCredit(): number {
  const n = safeParse<number>(STORAGE_EUR_PER_CREDIT, DEFAULT_EUR_PER_CREDIT);
  return typeof n === "number" && Number.isFinite(n) && n > 0 ? n : DEFAULT_EUR_PER_CREDIT;
}

export function setEurPerCredit(value: number): void {
  const v = Number(value);
  if (!Number.isFinite(v) || v <= 0) return;
  safeSet(STORAGE_EUR_PER_CREDIT, v);
}

export function isoYMD(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function startOfWeekMonday(now: Date = new Date()): Date {
  const d = new Date(now);
  d.setHours(12, 0, 0, 0);
  const day = d.getDay(); // 0=Sun
  const diff = (day + 6) % 7; // days since Monday
  d.setDate(d.getDate() - diff);
  return d;
}

export function addDays(ymd: string, days: number): string {
  const d = new Date(ymd + "T12:00:00");
  d.setDate(d.getDate() + days);
  return isoYMD(d);
}

export function weekdayLabel(weekday: Weekday): string {
  switch (weekday) {
    case "segunda":
      return "Segunda";
    case "terca":
      return "Terça";
    case "quarta":
      return "Quarta";
    case "quinta":
      return "Quinta";
    case "sexta":
      return "Sexta";
    case "sabado":
      return "Sábado";
    case "domingo":
      return "Domingo";
  }
}

export function weekdayToOffset(weekday: Weekday): number {
  switch (weekday) {
    case "segunda":
      return 0;
    case "terca":
      return 1;
    case "quarta":
      return 2;
    case "quinta":
      return 3;
    case "sexta":
      return 4;
    case "sabado":
      return 5;
    case "domingo":
      return 6;
  }
}

export function getWeekdayForDateISO(dateISO: string): Weekday {
  const d = new Date(dateISO + "T12:00:00");
  const day = d.getDay(); // 0=Sun
  if (day === 0) return "domingo";
  if (day === 1) return "segunda";
  if (day === 2) return "terca";
  if (day === 3) return "quarta";
  if (day === 4) return "quinta";
  if (day === 5) return "sexta";
  return "sabado";
}

export function getStoredWeekSchedule(partnerId: string, weekStartISO: string): BackofficeWeekSchedule | null {
  const raw = safeParse<BackofficeWeekSchedule | null>(keyFor(partnerId, weekStartISO), null);
  if (!raw || typeof raw !== "object") return null;
  if (raw.partnerId !== partnerId) return null;
  if (raw.weekStartISO !== weekStartISO) return null;
  if (!Array.isArray(raw.sessions)) return null;
  return raw;
}

export function setStoredWeekSchedule(schedule: BackofficeWeekSchedule): void {
  safeSet(keyFor(schedule.partnerId, schedule.weekStartISO), schedule);
}

/** Write public, customer-facing availability derived from partner schedule. */
export function publishWeekAvailability(schedule: BackofficeWeekSchedule): void {
  function minutesBetween(startHHMM: string, endHHMM: string): number | null {
    const [sh, sm] = startHHMM.split(":").map((x) => parseInt(x, 10));
    const [eh, em] = endHHMM.split(":").map((x) => parseInt(x, 10));
    if (![sh, sm, eh, em].every((n) => Number.isFinite(n))) return null;
    const start = sh * 60 + sm;
    const end = eh * 60 + em;
    if (end <= start) return null;
    return end - start;
  }

  const sessions: PublicSession[] = schedule.sessions.map((s) => ({
    id: s.id,
    partnerId: schedule.partnerId,
    name:
      s.type === "group_class"
        ? (s.className ?? s.name)
        : s.type === "court"
          ? (s.name || s.courtName || "Slot de campo")
          : s.type === "access_window"
            ? (s.windowName ?? s.name)
            : (s.serviceName ?? s.name),
    dateISO: addDays(schedule.weekStartISO, weekdayToOffset(s.weekday)),
    time: s.time,
    durationMinutes:
      s.type === "access_window" && s.endTime
        ? (minutesBetween(s.time, s.endTime) ?? s.durationMinutes)
        : s.durationMinutes,
    credits: s.credits,
    fitlifeSlots: s.fitlifeSlots,
    location: s.sessionLocation,
    professionalName: s.type === "professional" ? s.professionalName : undefined,
    specialties: s.type === "professional" ? s.specialties : undefined,
    publicDescription: undefined,
  }));

  const pub: PublicWeekAvailability = {
    partnerId: schedule.partnerId,
    weekStartISO: schedule.weekStartISO,
    sessions,
    updatedAt: new Date().toISOString(),
  };
  setStoredPublicWeekAvailability(pub);
}

export function duplicateScheduleToNextWeek(partnerId: string, weekStartISO: string): BackofficeWeekSchedule | null {
  const current = getStoredWeekSchedule(partnerId, weekStartISO);
  if (!current) return null;
  const nextWeekStart = addDays(weekStartISO, 7);
  const next: BackofficeWeekSchedule = {
    partnerId,
    weekStartISO: nextWeekStart,
    sessions: current.sessions.map((s) => ({
      ...s,
      id: `${s.id}-copy-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    })),
    updatedAt: new Date().toISOString(),
  };
  setStoredWeekSchedule(next);
  publishWeekAvailability(next);
  return next;
}

/** Demo integration: use current user's stored reservations filtered to partnerId. */
export function getPartnerReservationsForCurrentUser(partnerId: string): UnifiedReservation[] {
  const u = getStoredUser();
  const userId = u?.id ?? null;
  const all = getStoredUnifiedReservations(userId);
  return all.filter((r) => r.partnerId === partnerId);
}

