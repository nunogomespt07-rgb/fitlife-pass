import { getAllPartnersWithCategory } from "@/lib/activitiesData";

const STORAGE_KEY = "fitlife-backoffice-partner-id";
const LEGACY_SELECTED_PARTNER_KEY = "fitlife-backoffice-selected-partner";

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

export function getCurrentBackofficePartnerId(): string | null {
  const id = safeParse<string | null>(STORAGE_KEY, null);
  if (id == null || String(id).trim() === "") return null;
  // Validate against known partners (demo safety)
  const exists = getAllPartnersWithCategory().some((p) => p.id === id);
  return exists ? id : null;
}

export function setCurrentBackofficePartnerId(partnerId: string): void {
  safeSet(STORAGE_KEY, partnerId);
}

export function clearCurrentBackofficePartner(): void {
  safeSet(STORAGE_KEY, null);
}

/**
 * Demo migration helper:
 * If an older "selected partner" key exists, adopt it as backoffice identity.
 */
export function migrateLegacySelectedPartner(): string | null {
  const existing = getCurrentBackofficePartnerId();
  if (existing) return existing;
  const legacy = safeParse<string | null>(LEGACY_SELECTED_PARTNER_KEY, null);
  if (!legacy || String(legacy).trim() === "") return null;
  const exists = getAllPartnersWithCategory().some((p) => p.id === legacy);
  if (!exists) return null;
  setCurrentBackofficePartnerId(legacy);
  return legacy;
}

