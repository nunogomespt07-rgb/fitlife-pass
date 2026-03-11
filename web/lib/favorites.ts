/**
 * Favorites storage: activity partners and restaurant partners.
 * Keys are stable so we can toggle and list.
 */

export type FavoriteItem =
  | {
      type: "activity";
      partnerId: string;
      categorySlug: string;
      categoryLabel: string;
      partnerName: string;
    }
  | {
      type: "restaurant";
      restaurantId: string;
      restaurantName: string;
    };

const STORAGE_KEY = "fitlife-favorites";

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

export function getStoredFavorites(): FavoriteItem[] {
  const data = safeParse<FavoriteItem[]>(STORAGE_KEY, []);
  return Array.isArray(data) ? data : [];
}

export function setStoredFavorites(list: FavoriteItem[]): void {
  safeSet(STORAGE_KEY, list);
}

export function favoriteKey(item: FavoriteItem): string {
  if (item.type === "activity") return `activity:${item.categorySlug}:${item.partnerId}`;
  return `restaurant:${item.restaurantId}`;
}

export function isActivityPartnerFavorited(
  list: FavoriteItem[],
  categorySlug: string,
  partnerId: string
): boolean {
  return list.some(
    (f) => f.type === "activity" && f.categorySlug === categorySlug && f.partnerId === partnerId
  );
}

export function isRestaurantFavorited(list: FavoriteItem[], restaurantId: string): boolean {
  return list.some((f) => f.type === "restaurant" && f.restaurantId === restaurantId);
}
