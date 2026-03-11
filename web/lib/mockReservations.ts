/**
 * Mock reservation shape for localStorage and UI.
 * status is always "active" for now.
 */
export type MockReservation = {
  id: string;
  activityId: string;
  activityTitle: string;
  partnerId: string;
  partnerName: string;
  categorySlug: string;
  date: string;
  time: string;
  creditsRequired: number;
  location?: string;
  /** For padel/court_booking: number of players (1–4). */
  participantCount?: number;
  status: "active";
};

/** Past reservation for history (fitlife-history). */
export type ReservationHistoryStatus = "concluída" | "cancelada" | "expirada";

export type ReservationHistoryEntry = Omit<MockReservation, "status"> & {
  status: ReservationHistoryStatus;
};

const STORAGE_KEY_RESERVATIONS = "fitlife-reservations";
const STORAGE_KEY_HISTORY = "fitlife-history";
const STORAGE_KEY_CREDITS = "fitlife-credits";
const STORAGE_KEY_PURCHASED_CREDITS = "fitlife-purchased-credits";
const DEFAULT_CREDITS = 0;

/** Credits are derived from reservations so they stay in sync: initial - sum(reservation.creditsRequired) */
export function getCreditsFromReservations(reservations: MockReservation[]): number {
  const used = reservations.reduce((sum, r) => sum + r.creditsRequired, 0);
  return Math.max(0, DEFAULT_CREDITS - used);
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

export function getStoredReservations(): MockReservation[] {
  const data = safeParse<MockReservation[]>(STORAGE_KEY_RESERVATIONS, []);
  return Array.isArray(data) ? data : [];
}

export function getStoredCredits(): number {
  const reservations = getStoredReservations();
  return getCreditsFromReservations(reservations);
}

export function setStoredReservations(list: MockReservation[]): void {
  safeSet(STORAGE_KEY_RESERVATIONS, list);
}

export function getStoredHistory(): ReservationHistoryEntry[] {
  const data = safeParse<ReservationHistoryEntry[]>(STORAGE_KEY_HISTORY, []);
  return Array.isArray(data) ? data : [];
}

export function setStoredHistory(list: ReservationHistoryEntry[]): void {
  safeSet(STORAGE_KEY_HISTORY, list);
}

export function getStoredPurchasedCredits(): number {
  const n = safeParse<number>(STORAGE_KEY_PURCHASED_CREDITS, 0);
  return typeof n === "number" && n >= 0 ? n : 0;
}

export function setStoredPurchasedCredits(amount: number): void {
  safeSet(STORAGE_KEY_PURCHASED_CREDITS, Math.max(0, amount));
}

export function setStoredCredits(credits: number): void {
  safeSet(STORAGE_KEY_CREDITS, Math.max(0, credits));
}

export function generateReservationId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `mock-${crypto.randomUUID()}`;
  }
  return `mock-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}
