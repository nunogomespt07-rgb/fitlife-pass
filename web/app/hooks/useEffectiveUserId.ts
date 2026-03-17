"use client";

import { useMemo } from "react";
import { useSession } from "next-auth/react";
import { getStoredUser } from "@/lib/storedUser";

/**
 * Customer identity resolver (client-side).
 * Primary: NextAuth session user id/email.
 * Fallback: stored user id (legacy/demo).
 */
export function useEffectiveUserId(): string | null {
  const { data: session } = useSession();

  return useMemo(() => {
    const sessionUser = session?.user;
    const sessionUserId =
      sessionUser != null
        ? (sessionUser as { id?: string }).id ?? (sessionUser.email ?? null)
        : null;
    if (sessionUserId && String(sessionUserId).trim()) return String(sessionUserId);
    const stored = getStoredUser();
    return stored?.id ?? null;
  }, [session]);
}

/**
 * Transitional auth gate: session OR token OR stored user.
 * Never treat token as identity; only as capability for API calls.
 */
export function useHasCustomerAuth(): boolean {
  const { data: session } = useSession();

  return useMemo(() => {
    if (session?.user) return true;
    if (typeof window === "undefined") return false;
    const hasToken = Boolean(localStorage.getItem("token"));
    if (hasToken) return true;
    return Boolean(getStoredUser()?.id);
  }, [session]);
}

