/**
 * Credit activity / transaction log per user.
 * Persisted in localStorage for demo; can be replaced by API later.
 */

export type CreditTransaction = {
  id: string;
  userId: string;
  type: "credit" | "debit";
  amount: number;
  reason: string;
  source?: string;
  activityName?: string;
  clubName?: string;
  createdAt: string; // ISO
};

const STORAGE_KEY_PREFIX = "fitlife-credit-transactions";

function getKey(userId: string | null): string | null {
  if (userId == null || String(userId).trim() === "") return null;
  return `${STORAGE_KEY_PREFIX}-${userId}`;
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

/** Get total count of stored transactions for a user. */
export function getStoredCreditTransactionsCount(userId: string | null): number {
  const key = getKey(userId);
  if (key == null) return 0;
  const all = safeParse<CreditTransaction[]>(key, []);
  return Array.isArray(all) ? all.length : 0;
}

/** Get stored transactions (newest first). Optional limit/offset for pagination. */
export function getStoredCreditTransactions(
  userId: string | null,
  limit?: number,
  offset?: number
): CreditTransaction[] {
  const key = getKey(userId);
  if (key == null) return [];
  const all = safeParse<CreditTransaction[]>(key, []);
  if (!Array.isArray(all)) return [];
  const sorted = [...all].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const start = offset ?? 0;
  const end = limit != null ? start + limit : sorted.length;
  return sorted.slice(start, end);
}

/** Append a transaction. Caller must ensure userId is set. */
export function appendCreditTransaction(
  userId: string | null,
  tx: Omit<CreditTransaction, "id" | "userId" | "createdAt">
): CreditTransaction | null {
  const key = getKey(userId);
  if (key == null) return null;
  const id =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `tx-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const createdAt = new Date().toISOString();
  const full: CreditTransaction = {
    ...tx,
    id,
    userId: userId ?? "",
    createdAt,
  };
  const all = safeParse<CreditTransaction[]>(key, []);
  const next = [full, ...(Array.isArray(all) ? all : [])];
  safeSet(key, next);
  return full;
}
