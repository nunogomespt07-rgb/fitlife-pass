/**
 * Restaurant reservation (table booking) – FitLife Pass benefit.
 * No credits; discount applied at venue when user shows name.
 */

export type RestaurantReservation = {
  id: string;
  restaurantId: string;
  restaurantName: string;
  date: string;
  time: string;
  userName: string;
  discountLabel: string;
  /** Party size 1–4. */
  partySize?: number;
  /** credits vs discount mode for restaurant bookings */
  bookingMode?: "credits" | "discount";
  status: "active";
};

export type RestaurantReservationHistoryEntry = Omit<RestaurantReservation, "status"> & {
  status: "concluída" | "cancelada" | "expirada";
};

const STORAGE_KEY = "fitlife-restaurant-reservations";
const STORAGE_KEY_HISTORY = "fitlife-restaurant-history";
export const DEMO_USER_NAME = "Maria Silva";

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

export function getStoredRestaurantReservations(): RestaurantReservation[] {
  const data = safeParse<RestaurantReservation[]>(STORAGE_KEY, []);
  return Array.isArray(data) ? data : [];
}

export function setStoredRestaurantReservations(list: RestaurantReservation[]): void {
  safeSet(STORAGE_KEY, list);
}

export function getStoredRestaurantHistory(): RestaurantReservationHistoryEntry[] {
  const data = safeParse<RestaurantReservationHistoryEntry[]>(STORAGE_KEY_HISTORY, []);
  return Array.isArray(data) ? data : [];
}

export function setStoredRestaurantHistory(list: RestaurantReservationHistoryEntry[]): void {
  safeSet(STORAGE_KEY_HISTORY, list);
}

export function generateRestaurantReservationId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `rest-${crypto.randomUUID()}`;
  }
  return `rest-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}
