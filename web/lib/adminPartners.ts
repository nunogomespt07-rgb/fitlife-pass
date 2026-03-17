import type { Partner, PartnerWithCategory } from "@/lib/activitiesData";
import { CATEGORY_PARTNERS } from "@/lib/activitiesData";

export type AdminPartnerRecord = PartnerWithCategory & {
  /** Demo-only visibility flag controlled by admin */
  isActive?: boolean;
};

type AdminPartnerStore = {
  /** partnerId -> record */
  byId: Record<string, AdminPartnerRecord>;
};

const STORAGE_KEY = "fitlife-admin-partners";

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

export function getAdminPartnerStore(): AdminPartnerStore {
  return safeParse<AdminPartnerStore>(STORAGE_KEY, { byId: {} });
}

export function setAdminPartnerStore(store: AdminPartnerStore): void {
  safeSet(STORAGE_KEY, store);
}

export function listAdminPartners(): AdminPartnerRecord[] {
  const store = getAdminPartnerStore();
  return Object.values(store.byId ?? {}).filter(Boolean);
}

export function upsertAdminPartner(record: AdminPartnerRecord): void {
  const store = getAdminPartnerStore();
  const next: AdminPartnerStore = {
    ...store,
    byId: {
      ...(store.byId ?? {}),
      [record.id]: record,
    },
  };
  setAdminPartnerStore(next);
}

export function deleteAdminPartner(partnerId: string): void {
  const store = getAdminPartnerStore();
  const next = { ...(store.byId ?? {}) };
  delete next[partnerId];
  setAdminPartnerStore({ ...store, byId: next });
}

export function isValidCategorySlug(slug: string): boolean {
  return Object.prototype.hasOwnProperty.call(CATEGORY_PARTNERS, slug);
}

export function getCategoryLabel(slug: string): string {
  return CATEGORY_PARTNERS[slug]?.label ?? slug;
}

export function normalizePartnerDraft(draft: Partial<AdminPartnerRecord>): AdminPartnerRecord | null {
  const id = String(draft.id ?? "").trim();
  const name = String(draft.name ?? "").trim();
  const categorySlug = String(draft.categorySlug ?? "").trim();
  const partnerType = (draft.partnerType as Partner["partnerType"]) ?? "class_booking";

  if (!id || !name || !isValidCategorySlug(categorySlug)) return null;

  const minCredits = Number(draft.minCredits ?? 0);

  return {
    id,
    name,
    imageSrc: String(draft.imageSrc ?? "/images/fitness-hero.jpg"),
    location: String(draft.location ?? "").trim(),
    description: String(draft.description ?? "").trim(),
    activitiesCount: Number.isFinite(Number(draft.activitiesCount)) ? Number(draft.activitiesCount) : 0,
    minCredits: Number.isFinite(minCredits) ? Math.max(0, Math.floor(minCredits)) : 0,
    partnerType,
    provider: draft.provider,
    address: String(draft.address ?? "").trim() || undefined,
    city: String(draft.city ?? "").trim() || undefined,
    latitude: typeof draft.latitude === "number" ? draft.latitude : undefined,
    longitude: typeof draft.longitude === "number" ? draft.longitude : undefined,
    googleMapsUrl: String(draft.googleMapsUrl ?? "").trim() || undefined,
    openingHours: String(draft.openingHours ?? "").trim() || undefined,
    fitlifePassHours: String(draft.fitlifePassHours ?? "").trim() || undefined,
    creditsPerEntry: typeof draft.creditsPerEntry === "number" ? draft.creditsPerEntry : undefined,
    categorySlug,
    categoryLabel: getCategoryLabel(categorySlug),
    isActive: draft.isActive !== false,
  };
}

