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
} from "@/lib/unifiedReservations";
import { getStoredUser } from "@/lib/storedUser";
import type { MockReservation } from "@/lib/mockReservations";
import type { RestaurantReservation } from "@/lib/mockRestaurantReservations";

type AddReservationInput = Omit<MockReservation, "id" | "status">;
type AddRestaurantReservationInput = Omit<RestaurantReservation, "id" | "status">;

type MockReservationsContextValue = {
  /** All reservations (activity + restaurant + gym) from single source of truth. */
  reservations: UnifiedReservation[];
  /** Number of active (confirmed, non-expired) reservations. */
  activeReservationCount: number;
  credits: number;
  addReservation: (input: AddReservationInput) => { success: boolean; error?: string };
  addGymReservation: (input: { partnerId: string; partnerName: string; creditsRequired: number }) => { success: boolean; error?: string; reservation?: UnifiedReservation };
  cancelReservation: (id: string) => { success: boolean; error?: string };
  completeReservation: (id: string) => void;
  clearHistory: () => void;
  addPurchasedCredits: (amount: number) => void;
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
  const [reservations, setReservations] = useState<UnifiedReservation[]>([]);
  const [purchasedCredits, setPurchasedCredits] = useState(0);

  useEffect(() => {
    const userId = getStoredUser()?.id ?? null;
    setReservations(getStoredUnifiedReservations(userId));
    setPurchasedCredits(getStoredPurchasedCredits(userId));
  }, [pathname, session]);

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
      const userId = getStoredUser()?.id ?? null;
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
      return { success: true };
    },
    [reservations, purchasedCredits]
  );

  const addGymReservation = useCallback(
    (input: { partnerId: string; partnerName: string; creditsRequired: number }): { success: boolean; error?: string; reservation?: UnifiedReservation } => {
      const userId = getStoredUser()?.id ?? null;
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
      return { success: true, reservation: r };
    },
    [reservations, purchasedCredits]
  );

  const addRestaurantReservation = useCallback(
    (input: AddRestaurantReservationInput): { success: boolean; error?: string } => {
      const userId = getStoredUser()?.id ?? null;
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
      return { success: true };
    },
    [reservations, purchasedCredits]
  );

  const cancelReservation = useCallback((id: string): { success: boolean; error?: string } => {
    const r = reservations.find((x) => x.id === id);
    if (!r) return { success: false, error: "Reserva não encontrada." };
    const now = new Date();
    if (!canCancelReservation(r, now)) {
      return { success: false, error: "Reservas não podem ser canceladas com menos de 6 horas de antecedência." };
    }
    const userId = getStoredUser()?.id ?? null;
    setReservations((prev) => {
      const next = prev.map((res) => {
        if (res.id !== id) return res;
        const refundable = canRefundOnCancellation(res, now);
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
  }, [reservations]);

  const cancelRestaurantReservation = useCallback((id: string) => {
    return cancelReservation(id);
  }, [cancelReservation]);

  const completeReservation = useCallback((id: string) => {
    const userId = getStoredUser()?.id ?? null;
    setReservations((prev) => {
      const now = new Date().toISOString();
      const next = prev.map((r) =>
        r.id === id ? { ...r, status: "completed" as const, completedAt: now } : r
      );
      setStoredUnifiedReservations(userId, next);
      return next;
    });
  }, []);

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
    const userId = getStoredUser()?.id ?? null;
    const today = todayYMD();
    setReservations((prev) => {
      const next = prev.filter(
        (r) => r.status === "confirmed" && r.date >= today
      );
      setStoredUnifiedReservations(userId, next);
      return next;
    });
  }, []);

  const addPurchasedCredits = useCallback((amount: number) => {
    const userId = getStoredUser()?.id ?? null;
    const n = Math.max(0, Math.floor(amount));
    setPurchasedCredits((prev) => {
      const next = prev + n;
      setStoredPurchasedCredits(userId, next);
      return next;
    });
  }, []);

  const value = useMemo<MockReservationsContextValue>(
    () => ({
      reservations,
      activeReservationCount,
      credits,
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
