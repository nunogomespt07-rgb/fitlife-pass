/**
 * Cache espelho em localStorage ("credits"). A fonte de verdade é sempre o backend (Mongo).
 * Nunca inventar saldo: ausência de valor confirmado => null na leitura.
 */

import { setStoredUser } from "@/lib/storedUser";

const LS_KEY = "credits";

const CREDITS_DEBUG =
  typeof process !== "undefined" && process.env.NODE_ENV === "development";

export function creditsDebug(label: string, payload: Record<string, unknown>): void {
  if (!CREDITS_DEBUG) return;
  console.log(`[credits] ${label}`, payload);
}

/**
 * Lê apenas o cache espelho. Sem valor válido em LS => null (não assumir 0).
 */
export function readWalletCreditsFromLocalStorage(): number | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(LS_KEY);
  if (raw === null || raw === "") return null;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.floor(n);
}

/** Grava saldo já confirmado pelo backend (ou 0 quando o servidor reportou 0). */
export function writeWalletCreditsToLocalStorage(n: number): void {
  if (typeof window === "undefined") return;
  const v = Math.max(0, Math.floor(n));
  localStorage.setItem(LS_KEY, String(v));
  if (typeof process !== "undefined" && process.env.NODE_ENV === "development") {
    console.log("CREDITS:", localStorage.getItem("credits"));
  }
}

function tryFiniteNonNegativeCredits(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) {
    return Math.max(0, Math.floor(v));
  }
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    if (Number.isFinite(n) && n >= 0) return Math.floor(n);
  }
  return null;
}

/**
 * Após login/registo: espelho numérico explícito.
 * Se a API não envia `credits`, usar **0** — nunca omitir o campo no merge
 * (omitir deixava créditos fantasmas no `fitlife-user`, ex.: 20 de sessões antigas).
 */
export function mirrorWalletCreditsAfterAuth(apiCredits: unknown): number {
  return tryFiniteNonNegativeCredits(apiCredits) ?? 0;
}

/**
 * Extrai créditos de payloads GET /api/user ou GET /credits/balance.
 * Só aceita o campo explícito `credits` (raiz ou em `user`). Sem campo => null.
 * Nunca derivar saldo de plano (START/CORE/PRO) nem de `creditsIncluded`.
 */
export function parseCreditsFromApiUserPayload(data: unknown): number | null {
  if (data == null || typeof data !== "object") return null;

  const o = data as Record<string, unknown>;

  const n = tryFiniteNonNegativeCredits(o.credits);
  if (n != null) return n;

  if (o.user && typeof o.user === "object") {
    const u = o.user as Record<string, unknown>;
    const n2 = tryFiniteNonNegativeCredits(u.credits);
    if (n2 != null) return n2;
  }

  return null;
}

/** Limpa cache de créditos (ex.: logout). */
export function clearWalletCreditsLocalStorage(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(LS_KEY);
}

/** Espelha créditos no objeto fitlife-user quando há id. */
export function mirrorCreditsToStoredUser(userId: string, credits: number): void {
  const id = userId.trim();
  if (!id) return;
  setStoredUser({ id, credits: Math.max(0, Math.floor(credits)) });
}
