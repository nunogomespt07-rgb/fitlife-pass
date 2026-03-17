"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import type { UnifiedReservation } from "@/lib/unifiedReservations";
import {
  getStoredUnifiedReservations,
  setStoredUnifiedReservations,
  getStoredPurchasedCredits,
  setStoredPurchasedCredits,
  generateUnifiedReservationId,
  getActiveReservationCount,
  getCreditsFromUnified,
  canRefundOnCancellation,
  canCancelReservation,
  applyNoShowToReservations,
  getMonthlyCancellationCount,
  incrementMonthlyCancellationCount,
  getCurrentMonthKey,
  MONTHLY_CANCELLATION_LIMIT,
} from "@/lib/unifiedReservations";
import { getStoredUser } from "@/lib/storedUser";
import type { MockReservation } from "@/lib/mockReservations";
import type { RestaurantReservation } from "@/lib/mockRestaurantReservations";
import { useCreditActivity } from "@/app/context/CreditActivityContext";
import { setStoredUser } from "@/lib/storedUser";

type AddReservationInput = Omit<MockReservation, "id" | "status">;
type AddRestaurantReservationInput = Omit<RestaurantReservation, "id" | "status">;

type MockReservationsContextValue = {
  /** All reservations (activity + restaurant + gym) from single source of truth. */
  reservations: UnifiedReservation[];
  /** Number of active (confirmed, non-expired) reservations. */
  activeReservationCount: number;
  credits: number;
  /** True when credits have been hydrated from the correct source of truth. */
  creditsReady: boolean;
  /** Cancellations this calendar month (for display). */
  monthlyCancellationCount: number;
  /** Max cancellations per month. */
  monthlyCancellationLimit: number;
  addReservation: (input: AddReservationInput) => { success: boolean; error?: string };
  addGymReservation: (input: { partnerId: string; partnerName: string; creditsRequired: number }) => { success: boolean; error?: string; reservation?: UnifiedReservation };
  cancelReservation: (id: string) => { success: boolean; error?: string };
  completeReservation: (id: string) => void;
  clearHistory: () => void;
  addPurchasedCredits: (amount: number, reason?: string) => void;
  countReservationsForActivity: (partnerId: string, activityId: string) => number;
  addRestaurantReservation: (input: AddRestaurantReservationInput) => { success: boolean; error?: string };
  cancelRestaurantReservation: (id: string) => { success: boolean; error?: string };
};

const MockReservationsContext = createContext<MockReservationsContextValue | null>(null);

function todayYMD(): string {
  return new Date().toISOString().slice(0, 10);
}

export function MockReservationsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const creditActivity = useCreditActivity();
  const [reservations, setReservations] = useState<UnifiedReservation[]>([]);
  const [purchasedCredits, setPurchasedCredits] = useState(0);
  const [creditsReady, setCreditsReady] = useState(false);

  const effectiveUserId = useMemo(() => {
    const sessionUser = session?.user;
    const sessionEmail = sessionUser?.email ? String(sessionUser.email).trim().toLowerCase() : "";
    if (sessionEmail) return sessionEmail;
    const sessionUserId = sessionUser != null ? (sessionUser as { id?: string }).id ?? null : null;
    if (sessionUserId) return sessionUserId;
    const stored = getStoredUser();
    return stored?.id ?? null;
  }, [session]);

  useEffect(() => {
    let list = getStoredUnifiedReservations(effectiveUserId);
    const now = new Date();
    const withNoShow = applyNoShowToReservations(list, now);
    const hasNoShowChanges = list.some((r, i) => withNoShow[i].status !== r.status);
    if (hasNoShowChanges) {
      setStoredUnifiedReservations(effectiveUserId, withNoShow);
      list = withNoShow;
    }
    setReservations(list);
    // For session users, credits are hydrated from server store to ensure cross-device consistency.
    // Avoid bootstrapping from localStorage (often 0) which can momentarily overwrite valid state.
    if (!session?.user) {
      setPurchasedCredits(getStoredPurchasedCredits(effectiveUserId));
      setCreditsReady(true);
    }
  }, [pathname, effectiveUserId]);

  // Cross-device demo persistence: when user has a NextAuth session, hydrate credits/plan from server store.
  useEffect(() => {
    if (!session?.user) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/customer/state", { cache: "no-store" });
        if (!res.ok) {
          // Fallback to local cache (still never authoritative across devices).
          setPurchasedCredits(getStoredPurchasedCredits(effectiveUserId));
          setCreditsReady(true);
          return;
        }
        const data = (await res.json().catch(() => null)) as
          | { purchasedCredits?: number; subscriptionPlanId?: string | null; subscriptionPlanName?: string | null }
          | null;
        if (!data || cancelled) return;
        if (typeof data.purchasedCredits === "number" && Number.isFinite(data.purchasedCredits)) {
          setPurchasedCredits(Math.max(0, Math.floor(data.purchasedCredits)));
          // Keep local compatibility in sync for pages reading local storage.
          setStoredPurchasedCredits(effectiveUserId, Math.max(0, Math.floor(data.purchasedCredits)));
        }
        setCreditsReady(true);
        if (data.subscriptionPlanId || data.subscriptionPlanName) {
          try {
            setStoredUser({
              subscriptionPlanId: data.subscriptionPlanId ?? null,
              subscriptionPlanName: data.subscriptionPlanName ?? null,
            });
          } catch {}
        }
      } catch {
        setPurchasedCredits(getStoredPurchasedCredits(effectiveUserId));
        setCreditsReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [session, effectiveUserId]);

  // Ensure credits written while userId was not yet available get persisted once it becomes available.
  useEffect(() => {
    if (!effectiveUserId) return;
    const currentStored = getStoredPurchasedCredits(effectiveUserId);
    if (typeof purchasedCredits === "number" && purchasedCredits >= 0 && currentStored !== purchasedCredits) {
      setStoredPurchasedCredits(effectiveUserId, purchasedCredits);
      if (session?.user) {
        fetch("/api/customer/state", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ purchasedCredits }),
        }).catch(() => {});
      }
    }
  }, [effectiveUserId, purchasedCredits, session]);

  const activeReservationCount = useMemo(
    () => getActiveReservationCount(reservations),
    [reservations]
  );

  const credits = useMemo(
    () => getCreditsFromUnified(reservations, purchasedCredits),
    [reservations, purchasedCredits]
  );

  const addReservation = useCallback(
    (input: AddReservationInput): { success: boolean; error?: string } => {
      const userId = effectiveUserId;
      const currentCredits = getCreditsFromUnified(reservations, purchasedCredits);
      if (currentCredits < input.creditsRequired) {
        return { success: false, error: "Créditos insuficientes." };
      }
      const id = generateUnifiedReservationId("act");
      const r: UnifiedReservation = {
        id,
        partnerId: input.partnerId,
        partnerName: input.partnerName,
        type: "activity",
        date: input.date,
        time: input.time,
        people: input.participantCount ?? 1,
        peopleLabel: input.participantCount != null ? "jogadores" : "pessoas",
        creditsUsed: input.creditsRequired,
        creditsRefunded: false,
        status: "confirmed",
        createdAt: new Date().toISOString(),
        activityId: input.activityId,
        activityTitle: input.activityTitle,
        categorySlug: input.categorySlug,
        location: input.location,
      };
      setReservations((prev) => {
        const next = [r, ...prev];
        setStoredUnifiedReservations(userId, next);
        return next;
      });
      if (creditActivity && input.creditsRequired > 0) {
        creditActivity.addTransaction({
          type: "debit",
          amount: input.creditsRequired,
          reason: "Reserva confirmada",
          activityName: input.activityTitle ?? input.partnerName,
          clubName: input.partnerName,
        });
        creditActivity.showToast("Reserva confirmada", `-${input.creditsRequired} créditos usados`);
      }
      return { success: true };
    },
    [effectiveUserId, reservations, purchasedCredits, creditActivity]
  );

  const addGymReservation = useCallback(
    (input: { partnerId: string; partnerName: string; creditsRequired: number }): { success: boolean; error?: string; reservation?: UnifiedReservation } => {
      const userId = effectiveUserId;
      const currentCredits = getCreditsFromUnified(reservations, purchasedCredits);
      if (currentCredits < input.creditsRequired) {
        return { success: false, error: "Créditos insuficientes." };
      }
      const now = new Date();
      const dateYMD = now.toISOString().slice(0, 10);
      const timeHM = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      const id = generateUnifiedReservationId("gym");
      const r: UnifiedReservation = {
        id,
        partnerId: input.partnerId,
        partnerName: input.partnerName,
        type: "gym",
        date: dateYMD,
        time: timeHM,
        people: 1,
        peopleLabel: "pessoas",
        creditsUsed: input.creditsRequired,
        creditsRefunded: false,
        status: "confirmed",
        createdAt: now.toISOString(),
        activityTitle: "Acesso ginásio",
      };
      setReservations((prev) => {
        const next = [r, ...prev];
        setStoredUnifiedReservations(userId, next);
        return next;
      });
      if (creditActivity && input.creditsRequired > 0) {
        creditActivity.addTransaction({
          type: "debit",
          amount: input.creditsRequired,
          reason: "Reserva confirmada",
          activityName: "Acesso ginásio",
          clubName: input.partnerName,
        });
        creditActivity.showToast("Reserva confirmada", `-${input.creditsRequired} créditos usados`);
      }
      return { success: true, reservation: r };
    },
    [effectiveUserId, reservations, purchasedCredits, creditActivity]
  );

  const addRestaurantReservation = useCallback(
    (input: AddRestaurantReservationInput): { success: boolean; error?: string } => {
      const userId = effectiveUserId;
      const mode: "credits" | "discount" = (input as { bookingMode?: "credits" | "discount" }).bookingMode ?? "discount";
      let creditsToUse = 0;
      if (mode === "credits") {
        // Simple rule: 6 créditos por pessoa para restaurante, placeholder until real pricing.
        const perPerson = 6;
        creditsToUse = perPerson * (input.partySize ?? 1);
        const currentCredits = getCreditsFromUnified(reservations, purchasedCredits);
        if (currentCredits < creditsToUse) {
          return { success: false, error: "Créditos insuficientes." };
        }
      }
      const id = generateUnifiedReservationId("rest");
      const r: UnifiedReservation = {
        id,
        partnerId: input.restaurantId,
        partnerName: input.restaurantName,
        type: "restaurant",
        date: input.date,
        time: input.time,
        people: input.partySize ?? 1,
        peopleLabel: "pessoas",
        creditsUsed: creditsToUse,
        bookingMode: mode,
        status: "confirmed",
        createdAt: new Date().toISOString(),
        discountLabel: input.discountLabel,
        restaurantId: input.restaurantId,
        userName: input.userName,
      };
      setReservations((prev) => {
        const next = [r, ...prev];
        setStoredUnifiedReservations(userId, next);
        return next;
      });
      if (creditActivity && creditsToUse > 0) {
        creditActivity.addTransaction({
          type: "debit",
          amount: creditsToUse,
          reason: "Reserva confirmada",
          activityName: input.restaurantName,
          clubName: input.restaurantName,
        });
        creditActivity.showToast("Reserva confirmada", `-${creditsToUse} créditos usados`);
      }
      return { success: true };
    },
    [effectiveUserId, reservations, purchasedCredits, creditActivity]
  );

  const cancelReservation = useCallback((id: string): { success: boolean; error?: string } => {
    const r = reservations.find((x) => x.id === id);
    if (!r) return { success: false, error: "Reserva não encontrada." };
    const now = new Date();
    if (!canCancelReservation(r, now)) {
      return { success: false, error: "Não é possível cancelar com menos de 6 horas de antecedência." };
    }
    const userId = effectiveUserId;
    const monthKey = getCurrentMonthKey(now);
    const currentCount = getMonthlyCancellationCount(userId, now);
    if (currentCount >= MONTHLY_CANCELLATION_LIMIT) {
      return { success: false, error: "Atingiste o limite mensal de cancelamentos." };
    }
    incrementMonthlyCancellationCount(userId, monthKey);
      const refundable = canRefundOnCancellation(r, now);
      const refundAmount = refundable && r.creditsUsed > 0 ? r.creditsUsed : 0;
      if (creditActivity && refundAmount > 0) {
        creditActivity.addTransaction({
          type: "credit",
          amount: refundAmount,
          reason: "Reserva cancelada",
          activityName: r.activityTitle,
          clubName: r.partnerName,
        });
        creditActivity.showToast("Reserva cancelada", `+${refundAmount} créditos devolvidos`);
      }
      setReservations((prev) => {
        const next = prev.map((res) => {
          if (res.id !== id) return res;
          return {
            ...res,
            status: "cancelled" as const,
            cancelledAt: now.toISOString(),
            creditsRefunded: refundable ? true : res.creditsRefunded === true ? true : false,
          };
        });
        setStoredUnifiedReservations(userId, next);
        return next;
      });
      return { success: true };
  }, [effectiveUserId, reservations, creditActivity]);

  const cancelRestaurantReservation = useCallback((id: string) => {
    return cancelReservation(id);
  }, [cancelReservation]);

  const completeReservation = useCallback((id: string) => {
    const userId = effectiveUserId;
    setReservations((prev) => {
      const now = new Date().toISOString();
      const next = prev.map((r) =>
        r.id === id ? { ...r, status: "completed" as const, completedAt: now } : r
      );
      setStoredUnifiedReservations(userId, next);
      return next;
    });
  }, [effectiveUserId]);

  const countReservationsForActivity = useCallback(
    (partnerId: string, activityId: string) =>
      reservations.filter(
        (r) =>
          r.type === "activity" &&
          r.partnerId === partnerId &&
          r.activityId === activityId &&
          r.status === "confirmed"
      ).length,
    [reservations]
  );

  const clearHistory = useCallback(() => {
    const userId = effectiveUserId;
    const today = todayYMD();
    setReservations((prev) => {
      const next = prev.filter(
        (r) => r.status === "confirmed" && r.date >= today
      );
      setStoredUnifiedReservations(userId, next);
      return next;
    });
  }, [effectiveUserId]);

  const addPurchasedCredits = useCallback((amount: number, reason?: string) => {
    const userId =
      effectiveUserId ??
      getStoredUser()?.id ??
      (session?.user?.email ? String(session.user.email).trim().toLowerCase() : null);
    const n = Math.max(0, Math.floor(amount));
    setPurchasedCredits((prev) => {
      const next = prev + n;
      setStoredPurchasedCredits(userId, next);
      setCreditsReady(true);
      // Best-effort: persist to server store for session users (cross-device).
      if (session?.user) {
        fetch("/api/customer/state", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ purchasedCredits: next }),
        }).catch(() => {});
      }
      return next;
    });
    if (creditActivity && n > 0) {
      creditActivity.addTransaction({
        type: "credit",
        amount: n,
        reason: reason ?? "Compra de créditos extra",
      });
      if (!reason) {
        creditActivity.showToast("Créditos adicionados", `+${n} créditos`);
      }
    }
  }, [effectiveUserId, creditActivity, session]);

  const monthlyCancellationCount = getMonthlyCancellationCount(effectiveUserId);

  const value = useMemo<MockReservationsContextValue>(
    () => ({
      reservations,
      activeReservationCount,
      credits,
      creditsReady,
      monthlyCancellationCount,
      monthlyCancellationLimit: MONTHLY_CANCELLATION_LIMIT,
      addReservation,
      addGymReservation,
      cancelReservation,
      completeReservation,
      clearHistory,
      addPurchasedCredits,
      countReservationsForActivity,
      addRestaurantReservation,
      cancelRestaurantReservation,
    }),
    [
      reservations,
      activeReservationCount,
      credits,
      creditsReady,
      monthlyCancellationCount,
      addReservation,
      addGymReservation,
      cancelReservation,
      completeReservation,
      clearHistory,
      addPurchasedCredits,
      countReservationsForActivity,
      addRestaurantReservation,
      cancelRestaurantReservation,
    ]
  );

  return (
    <MockReservationsContext.Provider value={value}>
      {children}
    </MockReservationsContext.Provider>
  );
}

export function useMockReservations(): MockReservationsContextValue {
  const ctx = useContext(MockReservationsContext);
  if (!ctx) {
    throw new Error("useMockReservations must be used within MockReservationsProvider");
  }
  return ctx;
}
