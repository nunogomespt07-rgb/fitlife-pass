/**
 * Fallback coords from profile city (when GPS is unavailable).
 * Used for "perto de ti" suggestions.
 */

export type Coords = { lat: number; lon: number };

const CITY_COORDS: Record<string, Coords> = {
  Lisboa: { lat: 38.7223, lon: -9.1393 },
  Lisbon: { lat: 38.7223, lon: -9.1393 },
  Porto: { lat: 41.1579, lon: -8.6291 },
  "Vila Nova de Gaia": { lat: 41.1336, lon: -8.6174 },
  Matosinhos: { lat: 41.1822, lon: -8.6894 },
};

const PROFILE_STORAGE_KEY = "fitlife-profile";

export function getProfileCoords(): Coords | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { city?: string };
    const city = typeof parsed?.city === "string" ? parsed.city.trim() : "";
    if (!city) return null;
    return CITY_COORDS[city] ?? null;
  } catch {
    return null;
  }
}
