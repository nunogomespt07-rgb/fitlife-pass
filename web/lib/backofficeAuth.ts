import { getAllPartnersWithCategory } from "@/lib/activitiesData";

export type BackofficeAuthSession = {
  partnerId: string;
  /** ISO timestamp */
  issuedAt: string;
  /** ISO timestamp */
  expiresAt: string;
};

const STORAGE_KEY = "fitlife-backoffice-auth";
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12h demo session

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

function safeRemove(key: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

/**
 * Demo credentials: partner-specific PIN.
 * Keep this lightweight; real auth can replace this later.
 */
export function getDemoPinForPartner(partnerId: string): string {
  // Stable, not guessable-from-UI mapping (demo only).
  if (partnerId.startsWith("trainer-")) return "1122";
  if (partnerId.includes("padel")) return "2244";
  if (partnerId.includes("crossfit")) return "3344";
  if (partnerId.includes("yoga")) return "4455";
  if (partnerId.includes("pilates")) return "5566";
  if (partnerId.includes("nutri")) return "6677";
  if (partnerId.includes("recovery") || partnerId.includes("massagem")) return "7788";
  // Default for gyms/pools/other partners
  return "1234";
}

export function getStoredBackofficeSession(): BackofficeAuthSession | null {
  const raw = safeParse<BackofficeAuthSession | null>(STORAGE_KEY, null);
  if (!raw || typeof raw !== "object") return null;
  if (!raw.partnerId || typeof raw.partnerId !== "string") return null;
  if (!raw.issuedAt || !raw.expiresAt) return null;

  // Validate partner exists (demo safety)
  const exists = getAllPartnersWithCategory().some((p) => p.id === raw.partnerId);
  if (!exists) return null;

  const now = Date.now();
  const exp = Date.parse(raw.expiresAt);
  if (!Number.isFinite(exp) || exp <= now) return null;
  return raw;
}

export function getAuthedBackofficePartnerId(): string | null {
  return getStoredBackofficeSession()?.partnerId ?? null;
}

export function clearBackofficeSession(): void {
  safeRemove(STORAGE_KEY);
}

export function loginBackofficeDemo(params: { partnerId: string; pin: string }): { ok: true } | { ok: false; error: string } {
  const { partnerId, pin } = params;
  const trimmed = String(pin ?? "").trim();
  if (!partnerId) return { ok: false, error: "Seleciona um parceiro." };
  if (trimmed.length === 0) return { ok: false, error: "Introduz o PIN de acesso." };

  // Validate partner exists
  const exists = getAllPartnersWithCategory().some((p) => p.id === partnerId);
  if (!exists) return { ok: false, error: "Parceiro inválido." };

  const expected = getDemoPinForPartner(partnerId);
  if (trimmed !== expected) return { ok: false, error: "PIN incorreto." };

  const issuedAt = new Date().toISOString();
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();
  const session: BackofficeAuthSession = { partnerId, issuedAt, expiresAt };
  safeSet(STORAGE_KEY, session);
  return { ok: true };
}

