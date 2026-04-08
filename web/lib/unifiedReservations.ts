/**
 * Single source of truth for all reservations (activity + restaurant).
 * Persisted in localStorage under one key.
 */

export type ReservationStatus = "confirmed" | "cancelled" | "completed" | "expired" | "used" | "no_show";

export type PeopleLabel = "pessoas" | "jogadores";

export type UnifiedReservation = {
  id: string;
  userId?: string;
  partnerId: string;
  partnerName: string;
  type: "activity" | "restaurant" | "gym";
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
/** Base neutra para cálculos locais (nunca confundir com saldo real da API). */
const UNIFIED_LOCAL_CREDIT_BASELINE = 0;
/** Gym QR / access valid for 8 hours from creation. */
export const GYM_ACCESS_VALID_HOURS = 8;
/** Minimum hours before scheduled start to allow cancellation (unless grace window applies). */
export const CANCELLATION_MIN_HOURS_BEFORE = 12;
/** Cancel allowed within this many minutes after booking, regardless of start time. */
export const CANCELLATION_GRACE_MINUTES_AFTER_BOOK = 5;
/** Max cancellations per user per calendar month (enforced). */
export const MONTHLY_CANCELLATION_LIMIT = 3;
/** Max confirmed reservations per calendar day per user (enforced). */
export const MAX_RESERVATIONS_PER_DAY = 2;

const CANCELLATION_COUNT_KEY_PREFIX = "fitlife-cancellation-count";

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

/** Current calendar month key YYYY-MM for cancellation tracking. */
export function getCurrentMonthKey(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function getCancellationCountKey(userId: string | null): string | null {
  if (userId == null || String(userId).trim() === "") return null;
  return `${CANCELLATION_COUNT_KEY_PREFIX}-${userId}`;
}

/** Get per-month cancellation counts: { "YYYY-MM": number }. */
export function getStoredMonthlyCancellationCounts(userId: string | null): Record<string, number> {
  const key = getCancellationCountKey(userId);
  if (key == null) return {};
  const raw = safeParse<Record<string, number> | null>(key, null);
  if (raw != null && typeof raw === "object") return raw;
  return {};
}

/** Increment cancellation count for the given month; returns new count for that month. */
export function incrementMonthlyCancellationCount(userId: string | null, monthKey: string): number {
  const key = getCancellationCountKey(userId);
  if (key == null) return 0;
  const counts = getStoredMonthlyCancellationCounts(userId);
  const next = (counts[monthKey] ?? 0) + 1;
  safeSet(key, { ...counts, [monthKey]: next });
  return next;
}

/** Get cancellation count for current month (read-only). */
export function getMonthlyCancellationCount(userId: string | null, now: Date = new Date()): number {
  const monthKey = getCurrentMonthKey(now);
  const counts = getStoredMonthlyCancellationCounts(userId);
  return counts[monthKey] ?? 0;
}

function todayYMD(): string {
  return new Date().toISOString().slice(0, 10);
}

function isDateTodayOrFuture(dateStr: string): boolean {
  return dateStr >= todayYMD();
}

/** Parse date string (YYYY-MM-DD or DD/MM/YYYY) + time to Date. */
export function getScheduledDateTime(reservation: Pick<UnifiedReservation, "date" | "time">): Date | null {
  const dateStr = reservation.date.trim();
  const timeStr = (reservation.time || "00:00").trim();
  let iso: string;
  if (dateStr.includes("/")) {
    const [d, m, y] = dateStr.split("/");
    if (!d || !m || !y) return null;
    iso = `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}T${timeStr.includes(":") ? timeStr : timeStr + ":00"}`;
    if (iso.length < 19) iso = `${iso}:00`;
  } else {
    iso = `${dateStr}T${timeStr.includes(":") ? timeStr : timeStr + ":00"}`;
    if (iso.length < 19) iso = `${iso}:00`;
  }
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * Refund credits only if cancellation is allowed and credits were used (activity/gym/restaurant credits mode).
 */
export function canRefundOnCancellation(reservation: UnifiedReservation, now: Date = new Date()): boolean {
  if (reservation.creditsUsed <= 0) return false;
  if (reservation.type === "restaurant" && reservation.bookingMode === "discount") return false;
  return canCancelReservation(reservation, now);
}

/** True if gym reservation is past 8h from createdAt (QR no longer valid). */
export function isGymQrExpired(reservation: UnifiedReservation, now: Date = new Date()): boolean {
  if (reservation.type !== "gym") return false;
  const created = new Date(reservation.createdAt);
  const expiry = new Date(created.getTime() + GYM_ACCESS_VALID_HOURS * 60 * 60 * 1000);
  return now >= expiry;
}

/** True if reservation should be treated as no-show: time passed, still confirmed, no check-in. */
export function shouldMarkAsNoShow(reservation: UnifiedReservation, now: Date = new Date()): boolean {
  if (reservation.status !== "confirmed") return false;
  if (reservation.completedAt) return false;
  if (reservation.type === "gym") {
    return isGymQrExpired(reservation, now);
  }
  if (reservation.type === "activity") {
    const scheduled = getScheduledDateTime(reservation);
    if (!scheduled) return false;
    return now >= scheduled;
  }
  return false;
}

/** Apply no-show status to reservations that qualify; returns new array (mutates stored only if caller persists). */
export function applyNoShowToReservations(
  reservations: UnifiedReservation[],
  now: Date = new Date()
): UnifiedReservation[] {
  return reservations.map((r) =>
    shouldMarkAsNoShow(r, now) ? { ...r, status: "no_show" as const } : r
  );
}

/** Display status for a reservation (active, used, expired, no_show, etc.). */
export function getReservationStatus(
  reservation: UnifiedReservation,
  now: Date = new Date()
): ReservationStatus {
  if (reservation.status === "no_show") return "no_show";
  if (reservation.status !== "confirmed") return reservation.status;
  if (reservation.type === "gym") {
    if (reservation.completedAt) return "used";
    if (isGymQrExpired(reservation, now)) return "no_show";
  }
  if (reservation.type === "activity") {
    const scheduled = getScheduledDateTime(reservation);
    if (scheduled && now >= scheduled && !reservation.completedAt) return "no_show";
  }
  return "confirmed";
}

function withinGraceAfterBooking(reservation: UnifiedReservation, now: Date): boolean {
  const created = new Date(reservation.createdAt);
  if (Number.isNaN(created.getTime())) return false;
  const graceMs = CANCELLATION_GRACE_MINUTES_AFTER_BOOK * 60 * 1000;
  return now.getTime() - created.getTime() <= graceMs;
}

/** True if user can cancel: ≥12h before start OR within 5 min of booking. */
export function canCancelReservation(reservation: UnifiedReservation, now: Date = new Date()): boolean {
  if (reservation.status !== "confirmed") return false;

  if (withinGraceAfterBooking(reservation, now)) return true;

  if (reservation.type === "gym") {
    const scheduled = getScheduledDateTime(reservation);
    if (!scheduled) return !isGymQrExpired(reservation, now);
    const diffMs = scheduled.getTime() - now.getTime();
    return diffMs >= CANCELLATION_MIN_HOURS_BEFORE * 60 * 60 * 1000;
  }

  const scheduled = getScheduledDateTime(reservation);
  if (!scheduled) return true;
  const diffMs = scheduled.getTime() - now.getTime();
  return diffMs >= CANCELLATION_MIN_HOURS_BEFORE * 60 * 60 * 1000;
}

/** Normalize reservation `date` to YYYY-MM-DD for counting. */
export function normalizeReservationDateYMD(r: Pick<UnifiedReservation, "date">): string {
  const d = r.date.trim();
  if (d.includes("/")) {
    const parts = d.split("/");
    if (parts.length >= 3) {
      const [dd, mm, yy] = parts;
      return `${yy}-${String(mm).padStart(2, "0")}-${String(dd).padStart(2, "0")}`;
    }
  }
  return d.slice(0, 10);
}

/** Confirmed reservations on a given calendar day (YYYY-MM-DD). */
export function countConfirmedReservationsOnCalendarDay(
  reservations: UnifiedReservation[],
  calendarDayYMD: string
): number {
  const target = calendarDayYMD.slice(0, 10);
  return reservations.filter((r) => {
    if (r.status !== "confirmed") return false;
    return normalizeReservationDateYMD(r) === target;
  }).length;
}

/**
 * Lista unificada em localStorage (apenas visitante / sem JWT).
 * Sem migração de chaves globais nem merge com dados de servidor — evita reservas demo em contas reais.
 */
export function getStoredUnifiedReservations(userId: string | null): UnifiedReservation[] {
  const key = getReservationsKey(userId);
  if (key == null) return [];
  const raw = safeParse<UnifiedReservation[] | null>(key, null);
  if (raw != null && Array.isArray(raw)) {
    return raw;
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

/** Count reservations that are active (confirmed, not expired/no_show for gym). */
export function getActiveReservationCount(reservations: UnifiedReservation[]): number {
  const now = new Date();
  return reservations.filter((r) => {
    if (r.status !== "confirmed") return false;
    if (r.type === "gym") return !isGymQrExpired(r, now);
    return isDateTodayOrFuture(r.date);
  }).length;
}

/**
 * Saldo disponível = valor em carteira (`credits` em localStorage), já debitado em cada reserva.
 * `reservations` mantém-se para histórico / reembolsos; não subtrair de novo aqui (evita dupla dedução).
 */
export function getCreditsFromUnified(
  _reservations: UnifiedReservation[],
  purchasedCredits: number
): number {
  return Math.max(0, Math.floor(purchasedCredits));
}

export function getDefaultCredits(): number {
  return UNIFIED_LOCAL_CREDIT_BASELINE;
}
