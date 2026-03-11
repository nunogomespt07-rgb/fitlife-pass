/**
 * Single source of truth for all reservations (activity + restaurant).
 * Persisted in localStorage under one key.
 */

export type ReservationStatus = "confirmed" | "cancelled" | "completed";

export type PeopleLabel = "pessoas" | "jogadores";

export type UnifiedReservation = {
  id: string;
  userId?: string;
  partnerId: string;
  partnerName: string;
  type: "activity" | "restaurant";
  date: string;
  time: string;
  people: number;
  /** How to label `people` in UI (default: pessoas). */
  peopleLabel?: PeopleLabel;
  creditsUsed: number;
  /** True if credits were refunded (eligible cancellation). */
  creditsRefunded?: boolean;
  /** For restaurant bookings: whether user chose credits or discount. */
  bookingMode?: "credits" | "discount";
  status: ReservationStatus;
  createdAt: string;
  cancelledAt?: string;
  completedAt?: string;
  // Activity-specific
  activityId?: string;
  activityTitle?: string;
  categorySlug?: string;
  location?: string;
  // Restaurant-specific
  discountLabel?: string;
  restaurantId?: string;
  userName?: string;
};

const STORAGE_KEY_PREFIX = "fitlife-unified-reservations";
const STORAGE_KEY_PURCHASED_PREFIX = "fitlife-purchased-credits";
const STORAGE_KEY = "fitlife-unified-reservations";
const STORAGE_KEY_PURCHASED_CREDITS = "fitlife-purchased-credits";
const OLD_KEY_ACTIVITY = "fitlife-reservations";
const OLD_KEY_ACTIVITY_HISTORY = "fitlife-history";
const OLD_KEY_RESTAURANT = "fitlife-restaurant-reservations";
const OLD_KEY_RESTAURANT_HISTORY = "fitlife-restaurant-history";
const DEFAULT_CREDITS = 0;
const CANCELLATION_REFUND_HOURS = 12;

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

/** Get storage key for a user. When userId is null/empty, returns null (no storage). */
function getReservationsKey(userId: string | null): string | null {
  if (userId == null || String(userId).trim() === "") return null;
  return `${STORAGE_KEY_PREFIX}-${userId}`;
}

function getCreditsKey(userId: string | null): string | null {
  if (userId == null || String(userId).trim() === "") return null;
  return `${STORAGE_KEY_PURCHASED_PREFIX}-${userId}`;
}

function todayYMD(): string {
  return new Date().toISOString().slice(0, 10);
}

function isDateTodayOrFuture(dateStr: string): boolean {
  return dateStr >= todayYMD();
}

export function getScheduledDateTime(reservation: Pick<UnifiedReservation, "date" | "time">): Date | null {
  const iso = `${reservation.date}T${reservation.time}:00`;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function canRefundOnCancellation(reservation: UnifiedReservation, now: Date = new Date()): boolean {
  if (reservation.type !== "activity") return false;
  if (reservation.creditsUsed <= 0) return false;
  const scheduled = getScheduledDateTime(reservation);
  if (!scheduled) return false;
  const diffMs = scheduled.getTime() - now.getTime();
  return diffMs >= CANCELLATION_REFUND_HOURS * 60 * 60 * 1000;
}

/** Migrate from legacy separate stores into unified list. */
function migrateFromLegacy(): UnifiedReservation[] {
  const activityRaw = safeParse<Array<{ id: string; partnerId: string; partnerName: string; date: string; time: string; creditsRequired?: number; activityId?: string; activityTitle?: string; categorySlug?: string; location?: string; participantCount?: number }>>(OLD_KEY_ACTIVITY, []);
  const activityHistoryRaw = safeParse<Array<{ id: string; partnerId: string; partnerName: string; date: string; time: string; creditsRequired?: number; activityId?: string; activityTitle?: string; categorySlug?: string; location?: string; participantCount?: number; status: string }>>(OLD_KEY_ACTIVITY_HISTORY, []);
  const restaurantRaw = safeParse<Array<{ id: string; restaurantId: string; restaurantName: string; date: string; time: string; userName?: string; discountLabel?: string; partySize?: number }>>(OLD_KEY_RESTAURANT, []);
  const restaurantHistoryRaw = safeParse<Array<{ id: string; restaurantId: string; restaurantName: string; date: string; time: string; userName?: string; discountLabel?: string; partySize?: number; status: string }>>(OLD_KEY_RESTAURANT_HISTORY, []);

  const list: UnifiedReservation[] = [];
  const now = new Date().toISOString();

  activityRaw.forEach((r) => {
    list.push({
      id: r.id,
      partnerId: r.partnerId,
      partnerName: r.partnerName,
      type: "activity",
      date: r.date,
      time: r.time,
      people: (r as { participantCount?: number }).participantCount ?? 1,
      peopleLabel: (r as { participantCount?: number }).participantCount != null ? "jogadores" : "pessoas",
      creditsUsed: r.creditsRequired ?? 0,
      status: "confirmed",
      createdAt: now,
      activityId: r.activityId,
      activityTitle: r.activityTitle,
      categorySlug: r.categorySlug,
      location: r.location,
    });
  });

  activityHistoryRaw.forEach((r) => {
    const status: ReservationStatus =
      r.status === "concluída" ? "completed" : r.status === "cancelada" ? "cancelled" : "completed";
    list.push({
      id: `${r.id}-hist-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      partnerId: r.partnerId,
      partnerName: r.partnerName,
      type: "activity",
      date: r.date,
      time: r.time,
      people: (r as { participantCount?: number }).participantCount ?? 1,
      peopleLabel: (r as { participantCount?: number }).participantCount != null ? "jogadores" : "pessoas",
      creditsUsed: r.creditsRequired ?? 0,
      creditsRefunded: r.status === "cancelada" ? true : false,
      status,
      createdAt: now,
      activityId: r.activityId,
      activityTitle: r.activityTitle,
      categorySlug: r.categorySlug,
      location: r.location,
    });
  });

  restaurantRaw.forEach((r) => {
    list.push({
      id: r.id,
      partnerId: r.restaurantId,
      partnerName: r.restaurantName,
      type: "restaurant",
      date: r.date,
      time: r.time,
      people: r.partySize ?? 1,
      peopleLabel: "pessoas",
      creditsUsed: 0,
      bookingMode: "discount",
      status: "confirmed",
      createdAt: now,
      discountLabel: r.discountLabel,
      restaurantId: r.restaurantId,
      userName: r.userName,
    });
  });

  restaurantHistoryRaw.forEach((r) => {
    const status: ReservationStatus = r.status === "cancelada" ? "cancelled" : "completed";
    list.push({
      id: `${r.id}-hist-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      partnerId: r.restaurantId,
      partnerName: r.restaurantName,
      type: "restaurant",
      date: r.date,
      time: r.time,
      people: r.partySize ?? 1,
      peopleLabel: "pessoas",
      creditsUsed: 0,
      bookingMode: "discount",
      status,
      createdAt: now,
      discountLabel: r.discountLabel,
      restaurantId: r.restaurantId,
      userName: r.userName,
    });
  });

  return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getStoredUnifiedReservations(userId: string | null): UnifiedReservation[] {
  const key = getReservationsKey(userId);
  if (key == null) return [];
  const raw = safeParse<UnifiedReservation[] | null>(key, null);
  if (raw != null && Array.isArray(raw)) {
    return raw;
  }
  // One-time migration: if this user has no data but global key has data, migrate to user key (first user on device)
  const globalRaw = safeParse<UnifiedReservation[] | null>(STORAGE_KEY, null);
  if (globalRaw != null && Array.isArray(globalRaw) && globalRaw.length > 0) {
    safeSet(key, globalRaw);
    try {
      if (typeof window !== "undefined") window.localStorage.removeItem(STORAGE_KEY);
    } catch {}
    return globalRaw;
  }
  return [];
}

export function setStoredUnifiedReservations(userId: string | null, list: UnifiedReservation[]): void {
  const key = getReservationsKey(userId);
  if (key == null) return;
  safeSet(key, list);
}

export function getStoredPurchasedCredits(userId: string | null): number {
  const key = getCreditsKey(userId);
  if (key == null) return 0;
  const n = safeParse<number>(key, 0);
  return typeof n === "number" && n >= 0 ? n : 0;
}

export function setStoredPurchasedCredits(userId: string | null, amount: number): void {
  const key = getCreditsKey(userId);
  if (key == null) return;
  safeSet(key, Math.max(0, amount));
}

export function generateUnifiedReservationId(prefix = "res"): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

/** Count reservations where status is confirmed and date >= today (activity + restaurant). */
export function getActiveReservationCount(reservations: UnifiedReservation[]): number {
  return reservations.filter(
    (r) => r.status === "confirmed" && isDateTodayOrFuture(r.date)
  ).length;
}

/** Credits = purchased (from plan/bonus) - used. No demo default for new users. */
export function getCreditsFromUnified(
  reservations: UnifiedReservation[],
  purchasedCredits: number
): number {
  const used = reservations
    .filter(
      (r) =>
        r.type === "activity" &&
        r.creditsUsed > 0 &&
        r.creditsRefunded !== true
    )
    .reduce((sum, r) => sum + r.creditsUsed, 0);
  return Math.max(0, purchasedCredits - used);
}

export function getDefaultCredits(): number {
  return DEFAULT_CREDITS;
}
