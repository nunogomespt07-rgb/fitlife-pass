"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
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
  countConfirmedReservationsOnCalendarDay,
  normalizeReservationDateYMD,
  MAX_RESERVATIONS_PER_DAY,
} from "@/lib/unifiedReservations";
import { getStoredUser, setStoredUser } from "@/lib/storedUser";
import {
  creditsDebug,
  readWalletCreditsFromLocalStorage,
  writeWalletCreditsToLocalStorage,
} from "@/lib/walletCredits";
import type { MockReservation } from "@/lib/mockReservations";
import type { RestaurantReservation } from "@/lib/mockRestaurantReservations";
import { useCreditActivity } from "@/app/context/CreditActivityContext";
import {
  apiFetch,
  fetchCreditsBalance,
  fetchCurrentUserProfile,
  getMyReservations,
  deleteApiBooking,
  type ApiBooking,
  type PostApiBookingResponse,
} from "@/lib/api";
import { normalizeBookingPayload } from "@/lib/normalize";
import { createReservation, reservationErrorMessage } from "@/lib/reservationFlow";

type AddReservationInput = Omit<MockReservation, "id" | "status">;
type AddRestaurantReservationInput = Omit<RestaurantReservation, "id" | "status">;

type MockReservationsContextValue = {
  reservations: UnifiedReservation[];
  activeReservationCount: number;
  /** True when a JWT is present in localStorage (synced via syncAuthFromStorage). */
  isAuthenticated: boolean;
  /**
   * Saldo da carteira (Mongo). null até creditsReady com valor confirmado.
   */
  walletBalance: number | null;
  /**
   * Créditos disponíveis para novas reservas (carteira menos créditos já comprometidos
   * em reservas unificadas locais).
   */
  credits: number;
  creditsReady: boolean;
  planId: string | null;
  planName: string | null;
  planReady: boolean;
  monthlyCancellationCount: number;
  monthlyCancellationLimit: number;
  addReservation: (input: AddReservationInput) => Promise<{ success: boolean; error?: string }>;
  addGymReservation: (input: {
    partnerId: string;
    partnerName: string;
    creditsRequired: number;
    activityId?: string;
  }) => Promise<{ success: boolean; error?: string; reservation?: UnifiedReservation }>;
  cancelReservation: (id: string) => Promise<{ success: boolean; error?: string }>;
  completeReservation: (id: string) => void;
  clearHistory: () => void;
  addPurchasedCredits: (amount: number, reason?: string) => void;
  refetchUserState: () => Promise<void>;
  countReservationsForActivity: (partnerId: string, activityId: string) => number;
  addRestaurantReservation: (
    input: AddRestaurantReservationInput
  ) => { success: boolean; error?: string };
  cancelRestaurantReservation: (id: string) => Promise<{ success: boolean; error?: string }>;
};

const MockReservationsContext = createContext<MockReservationsContextValue | null>(null);

function todayYMD(): string {
  return new Date().toISOString().slice(0, 10);
}
function readToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

function bookingApiErrorMessage(e: unknown): string {
  return reservationErrorMessage(e);
}

function mapApiBookingToUnified(b: ApiBooking): UnifiedReservation {
  const act = b.activity;
  const when =
    act?.date != null
      ? new Date(act.date)
      : b.bookingDate != null
        ? new Date(b.bookingDate)
        : b.createdAt != null
          ? new Date(b.createdAt)
          : new Date();
  const ok = !Number.isNaN(when.getTime());
  const dateYMD = ok ? when.toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10);
  const timeHM = ok
    ? `${String(when.getHours()).padStart(2, "0")}:${String(when.getMinutes()).padStart(2, "0")}`
    : "00:00";
  const st = String(b.status || "").toLowerCase() === "cancelled" ? "cancelled" : "confirmed";
  const actId = act?._id != null ? String(act._id) : "";
  const partnerName =
    (act as { partnerName?: string } | undefined)?.partnerName?.trim() ||
    (typeof act?.title === "string" ? act.title : "") ||
    "Atividade";
  return {
    id: String(b._id),
    partnerId: actId || "activity",
    partnerName,
    type: "activity",
    date: dateYMD,
    time: timeHM,
    people: 1,
    peopleLabel: "jogadores",
    creditsUsed: Math.max(0, Math.floor(b.creditsUsed ?? 0)),
    creditsRefunded: false,
    status: st,
    createdAt: b.createdAt != null ? new Date(b.createdAt).toISOString() : new Date().toISOString(),
    activityId: actId || undefined,
    activityTitle: act?.title,
    categorySlug: act?.sportType,
    location: act?.location,
  };
}

function persistCreditsToStorage(n: number) {
  writeWalletCreditsToLocalStorage(n);
}

function mergeStoredUser(update: Record<string, unknown>) {
  setStoredUser(update as Parameters<typeof setStoredUser>[0]);
}

/** Carteira global `credits`: debitar/repor e sincronizar Nav + fitlife-user.credits */
function syncWalletCreditsToStorage(next: number, userIdForMerge: string | null) {
  const n = Math.max(0, Math.floor(next));
  persistCreditsToStorage(n);
  if (userIdForMerge) {
    mergeStoredUser({ id: String(userIdForMerge), credits: n });
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("fitlife-auth-changed"));
  }
}

export function MockReservationsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session, status: sessionStatus } = useSession();
  const creditActivity = useCreditActivity();

  const [hasToken, setHasToken] = useState(false);
  const [purchasedCredits, setPurchasedCredits] = useState<number | null>(null);
  const [reservations, setReservations] = useState<UnifiedReservation[]>([]);
  const [creditsReady, setCreditsReady] = useState(false);
  const [planId, setPlanId] = useState<string | null>(null);
  const [planName, setPlanName] = useState<string | null>(null);
  const [planReady, setPlanReady] = useState(false);

  const syncAuthFromStorage = useCallback(() => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("token");

    if (!token) {
      setHasToken(false);
      setPurchasedCredits(null);
      setPlanId(null);
      setPlanName(null);
      setCreditsReady(true);
      setPlanReady(true);
      return;
    }

    setHasToken(true);
    /** Cache local não é fonte de verdade; refetchUserState vai preencher créditos. */
    creditsDebug("syncAuthFromStorage", {
      tokenLen: token.length,
      cacheCredits: readWalletCreditsFromLocalStorage(),
    });
  }, []);

  useEffect(() => {
    syncAuthFromStorage();
  }, [syncAuthFromStorage, pathname, sessionStatus]);

  const refetchUserStateRef = useRef<() => Promise<void>>(async () => {});

  useEffect(() => {
    if (typeof window === "undefined") return;

    const onStorageOrAuth = (e: Event) => {
      if (e.type === "storage") {
        const k = (e as StorageEvent).key;
        if (k !== "token" && k !== "credits" && k !== "fitlife-user") return;
      }
      syncAuthFromStorage();
      void refetchUserStateRef.current();
    };

    window.addEventListener("fitlife-auth-changed", onStorageOrAuth);
    window.addEventListener("storage", onStorageOrAuth);

    return () => {
      window.removeEventListener("fitlife-auth-changed", onStorageOrAuth);
      window.removeEventListener("storage", onStorageOrAuth);
    };
  }, [syncAuthFromStorage]);

  const effectiveUserId = useMemo(() => {
    if (hasToken) {
      const stored = getStoredUser();
      if (stored?.id?.trim()) return stored.id.trim();
    }

    const sessionUser = session?.user;
    const sessionEmail = sessionUser?.email
      ? String(sessionUser.email).trim().toLowerCase()
      : "";

    if (sessionEmail) return sessionEmail;

    const sessionUserId =
      sessionUser != null ? (sessionUser as { id?: string }).id ?? null : null;

    if (sessionUserId) return sessionUserId;

    const stored = getStoredUser();
    return stored?.id ?? null;
  }, [session, hasToken]);
  const authMode = useMemo<"loading" | "authenticated" | "unauthenticated">(() => {
  if (hasToken) return "authenticated";

  if (sessionStatus === "authenticated" && !hasToken) {
    return "loading";
  }

  if (sessionStatus === "unauthenticated" && !hasToken) {
    return "unauthenticated";
  }

  return "loading";
}, [sessionStatus, hasToken]);

  /**
   * Sem JWT: lista unificada em localStorage (fluxo legado / visitante).
   * Com JWT: lista vem só de refetchUserState → GET /api/reservations/my (nunca hidratar daqui).
   */
  useEffect(() => {
    if (hasToken) return;

    let list = getStoredUnifiedReservations(effectiveUserId);
    const now = new Date();

    const withNoShow = applyNoShowToReservations(list, now);

    const hasNoShowChanges =
      list.length === withNoShow.length &&
      list.some((r, i) => withNoShow[i].status !== r.status);

    if (hasNoShowChanges) {
      setStoredUnifiedReservations(effectiveUserId, withNoShow);
      list = withNoShow;
    }

    setReservations(list);
  }, [pathname, effectiveUserId, hasToken]);

  const refetchUserState = useCallback(async () => {
    const tokenNow = readToken();

    if (!tokenNow) {
      if (authMode === "loading") {
        setCreditsReady(false);
        setPlanReady(false);
        return;
      }

      if (authMode === "unauthenticated") {
        const localUser = getStoredUser();
        /** Sem sessão: não usar cache LS como saldo real (evita valores legados ex.: 20). */
        setPurchasedCredits(0);
        setPlanId(
          localUser?.subscriptionPlanId
            ? String(localUser.subscriptionPlanId).toUpperCase()
            : null
        );
        setPlanName(
          localUser?.subscriptionPlanName
            ? String(localUser.subscriptionPlanName).toUpperCase()
            : null
        );
        setCreditsReady(true);
        setPlanReady(true);
        return;
      }

      setCreditsReady(false);
      setPlanReady(false);
      return;
    }

    syncAuthFromStorage();
    setCreditsReady(false);
    setPlanReady(false);
    /** Conta real: limpar lista local/demo antes de hidratar da API (evita flash de reservas falsas). */
    setReservations([]);

    try {
      const [balance, data, bookingRows] = await Promise.all([
        fetchCreditsBalance(),
        fetchCurrentUserProfile(),
        getMyReservations(tokenNow).catch((e) => {
          console.warn("[MockReservationsContext] getMyReservations falhou", e);
          return [] as ApiBooking[];
        }),
      ]);

      /** Saldo: apenas GET /credits/balance (nunca inferir do plano nem do perfil). */
      const fromBalance =
        typeof balance?.credits === "number" && Number.isFinite(balance.credits)
          ? Math.max(0, Math.floor(balance.credits))
          : null;
      const nextCredits = fromBalance;

      const nextPlanIdRaw =
        (data as { subscriptionPlanId?: string | null })?.subscriptionPlanId ??
        (data as { plan?: string | null })?.plan ??
        (data as { subscription?: { id?: string | null } | null })?.subscription?.id ??
        null;

      const nextPlanNameRaw =
        (data as { subscriptionPlanName?: string | null })?.subscriptionPlanName ??
        (data as { planName?: string | null })?.planName ??
        (data as { subscription?: { name?: string | null } | null })?.subscription?.name ??
        null;

      const nextPlanId =
        nextPlanIdRaw == null ? null : String(nextPlanIdRaw).trim().toUpperCase();

      const nextPlanName =
        nextPlanNameRaw == null ? null : String(nextPlanNameRaw).trim().toUpperCase();

      setPlanId(nextPlanId);
      setPlanName(nextPlanName);

      const stored = getStoredUser();
      const userIdForMerge =
        String((data as { id?: string }).id ?? "").trim() ||
        stored?.id?.trim() ||
        effectiveUserId;

      if (nextCredits != null) {
        setPurchasedCredits(nextCredits);
        persistCreditsToStorage(nextCredits);
        if (userIdForMerge) {
          mergeStoredUser({
            id: userIdForMerge,
            credits: nextCredits,
            subscriptionPlanId: nextPlanId,
            subscriptionPlanName: nextPlanName,
            name:
              typeof (data as { name?: string }).name === "string"
                ? (data as { name: string }).name
                : undefined,
            email:
              typeof (data as { email?: string }).email === "string"
                ? (data as { email: string }).email
                : undefined,
            firstName: (data as { firstName?: string | null }).firstName ?? undefined,
            lastName: (data as { lastName?: string | null }).lastName ?? undefined,
            phone: (data as { phone?: string | null }).phone ?? undefined,
            country: (data as { country?: string | null }).country ?? undefined,
            city: (data as { city?: string | null }).city ?? undefined,
            interests: Array.isArray((data as { interests?: unknown }).interests)
              ? ((data as { interests: string[] }).interests as string[])
              : undefined,
          });
        }
        creditsDebug("refetchUserState: applied balance + profile", {
          nextCredits,
          fromBalance,
        });
      } else {
        /** Resposta anómala sem saldo: não manter cache antigo (ex.: 20). */
        setPurchasedCredits(0);
        persistCreditsToStorage(0);
        if (userIdForMerge) {
          mergeStoredUser({
            id: userIdForMerge,
            credits: 0,
            subscriptionPlanId: nextPlanId,
            subscriptionPlanName: nextPlanName,
            name:
              typeof (data as { name?: string }).name === "string"
                ? (data as { name: string }).name
                : undefined,
            email:
              typeof (data as { email?: string }).email === "string"
                ? (data as { email: string }).email
                : undefined,
            firstName: (data as { firstName?: string | null }).firstName ?? undefined,
            lastName: (data as { lastName?: string | null }).lastName ?? undefined,
            phone: (data as { phone?: string | null }).phone ?? undefined,
            country: (data as { country?: string | null }).country ?? undefined,
            city: (data as { city?: string | null }).city ?? undefined,
            interests: Array.isArray((data as { interests?: unknown }).interests)
              ? ((data as { interests: string[] }).interests as string[])
              : undefined,
          });
        }
        creditsDebug("refetchUserState: no credits from balance — aplicado 0", {});
      }

      const now = new Date();
      const fromApi = (Array.isArray(bookingRows) ? bookingRows : []).map(mapApiBookingToUnified);
      setReservations(applyNoShowToReservations(fromApi, now));

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("fitlife-user-updated"));
      }
    } catch (error) {
      console.warn("[MockReservationsContext] failed to hydrate balance + user", error);
      /** Com JWT: fallback 0 (nunca mostrar saldo fantasma do merge/LS). */
      if (tokenNow) {
        setPurchasedCredits(0);
        persistCreditsToStorage(0);
        setReservations([]);
        const u = getStoredUser();
        if (u?.id?.trim()) mergeStoredUser({ id: u.id.trim(), credits: 0 });
      } else {
        setPurchasedCredits(null);
      }
      creditsDebug("refetchUserState: error", { error: String(error) });
    } finally {
      setCreditsReady(true);
      setPlanReady(true);
    }
  }, [authMode, effectiveUserId, sessionStatus, syncAuthFromStorage]);

  refetchUserStateRef.current = refetchUserState;

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (cancelled) return;
      await refetchUserState();
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [refetchUserState]);

  useEffect(() => {
    if (authMode !== "unauthenticated") return;
    if (!effectiveUserId) return;
    if (typeof purchasedCredits !== "number" || purchasedCredits < 0) return;

    const currentStored = getStoredPurchasedCredits(effectiveUserId);
    if (currentStored !== purchasedCredits) {
      setStoredPurchasedCredits(effectiveUserId, purchasedCredits);
    }
  }, [authMode, effectiveUserId, purchasedCredits]);

  const activeReservationCount = useMemo(
    () => getActiveReservationCount(reservations),
    [reservations]
  );

  const walletBalance = useMemo(() => {
    if (!creditsReady) return null;
    /** Após ready, saldo sempre número (0 por omissão — evita "…" indefinido com cache legado). */
    return Math.max(0, Math.floor(purchasedCredits ?? 0));
  }, [purchasedCredits, creditsReady]);

  const credits = useMemo(
    () => getCreditsFromUnified(reservations, purchasedCredits ?? 0),
    [reservations, purchasedCredits]
  );

  const addReservation = useCallback(
    async (input: AddReservationInput): Promise<{ success: boolean; error?: string }> => {
      const userId = effectiveUserId;
      const token = readToken();
      const activityId = String(input.activityId ?? "").trim();
      if (!activityId) {
        return { success: false, error: "ID da atividade ausente. Recarrega a página." };
      }

      const mongoActivityId = /^[a-f0-9]{24}$/i.test(activityId);

      /** Reserva real: POST /api/reservations → Express (sem mock local). */
      if (authMode === "authenticated" && token) {
        try {
          console.log("CLICK RESERVAR", activityId);
          const raw = (await createReservation({
            activityId,
            token,
            activitySnapshot: mongoActivityId
              ? undefined
              : normalizeBookingPayload({
                  activityId: input.activityId,
                  partnerId: input.partnerId,
                  categorySlug: input.categorySlug,
                  activityTitle: input.activityTitle,
                  date: input.date,
                  time: input.time,
                  creditsRequired: input.creditsRequired,
                  location: input.location,
                  activitySpots: input.activitySpots,
                }),
          })) as PostApiBookingResponse & {
            wallet?: { creditsAfter?: number; debited?: number };
            creditsAfter?: number;
            remainingCredits?: number;
            debited?: number;
          };
          console.log("RESERVA OK");
          const after =
            raw.wallet?.creditsAfter ??
            (typeof raw.creditsAfter === "number" ? raw.creditsAfter : null) ??
            (typeof raw.remainingCredits === "number" ? raw.remainingCredits : null);
          if (typeof after === "number" && Number.isFinite(after)) {
            const next = Math.max(0, Math.floor(after));
            mergeStoredUser({ id: userId, credits: next });
          }
          await refetchUserState();

          const debited =
            typeof raw.wallet?.debited === "number"
              ? raw.wallet.debited
              : typeof raw.debited === "number"
                ? raw.debited
                : 0;

          if (creditActivity && debited > 0) {
            creditActivity.addTransaction({
              type: "debit",
              amount: debited,
              reason: "Reserva confirmada (servidor)",
              activityName: input.activityTitle ?? input.partnerName,
              clubName: input.partnerName,
            });
            const saldo =
              typeof raw.wallet?.creditsAfter === "number"
                ? raw.wallet.creditsAfter
                : typeof raw.creditsAfter === "number"
                  ? raw.creditsAfter
                  : after;
            creditActivity.showToast(
              "Reserva confirmada",
              `-${debited} créditos. Saldo: ${saldo ?? "—"}`
            );
          }

          return { success: true };
        } catch (e) {
          console.error("ERRO RESERVA", e);
          return { success: false, error: bookingApiErrorMessage(e) };
        }
      }

      return {
        success: false,
        error: "Inicia sessão para reservar (JWT necessário).",
      };
    },
    [effectiveUserId, creditActivity, authMode, refetchUserState]
  );

  const addGymReservation = useCallback(
    async (input: {
      partnerId: string;
      partnerName: string;
      creditsRequired: number;
      activityId?: string;
      activitySnapshot?: { activityId?: string; id?: string };
      activity?: { id?: string };
    }): Promise<{ success: boolean; error?: string; reservation?: UnifiedReservation }> => {
      const resolvedActivityId =
        input.activityId ||
        input.activitySnapshot?.activityId ||
        input.activity?.id ||
        input.activitySnapshot?.id;

      if (!resolvedActivityId || String(resolvedActivityId).trim().startsWith("gym-entry:")) {
        return { success: false, error: "Invalid activityId: using mock/synthetic ID" };
      }

      const activityId = String(resolvedActivityId).trim();
      console.log("FINAL ACTIVITY ID", activityId);

      if (!activityId) {
        return { success: false, error: "ID da atividade ausente. Recarrega a página." };
      }

      if (authMode === "authenticated") {
        const token = readToken();
        if (!token) {
          return { success: false, error: "Sessão inválida. Inicia sessão novamente." };
        }
        try {
          console.log("CLICK RESERVAR", `gym:${input.partnerId}`, activityId);
          const now = new Date();
          const dateYMD = now.toISOString().slice(0, 10);
          const timeHM = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

          const raw = (await createReservation({
            activityId,
            token,
            activitySnapshot: normalizeBookingPayload({
              activityId,
              partnerId: input.partnerId,
              categorySlug: "ginasios",
              activityTitle: "Acesso ginásio",
              date: dateYMD,
              time: timeHM,
              creditsRequired: input.creditsRequired,
              location: input.partnerName,
              activitySpots: 1,
            }),
          })) as PostApiBookingResponse & {
            wallet?: { creditsAfter?: number; debited?: number };
            booking?: unknown;
          };

          const after =
            raw.wallet?.creditsAfter ??
            (typeof raw.creditsAfter === "number" ? raw.creditsAfter : null) ??
            (typeof raw.remainingCredits === "number" ? raw.remainingCredits : null);
          if (typeof after === "number" && Number.isFinite(after)) {
            const next = Math.max(0, Math.floor(after));
            mergeStoredUser({ id: effectiveUserId, credits: next });
          }
          await refetchUserState();

          const bookingId =
            raw.booking && typeof raw.booking === "object" && "_id" in raw.booking
              ? String((raw.booking as { _id?: unknown })._id ?? "")
              : "";
          if (!bookingId) {
            console.error("addGymReservation missing booking id", raw);
            return {
              success: false,
              error: "Reserva confirmada mas resposta inválida do servidor.",
            };
          }

          const reservation: UnifiedReservation = {
            id: bookingId,
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
          console.log("RESERVA OK");
          return { success: true, reservation };
        } catch (e) {
          console.error("ERRO RESERVA", e);
          return { success: false, error: reservationErrorMessage(e) };
        }
      }

      return { success: false, error: "Inicia sessão para reservar (JWT necessário)." };
    },
    [effectiveUserId, creditActivity, authMode, refetchUserState]
  );

  const addRestaurantReservation = useCallback(
    (input: AddRestaurantReservationInput): { success: boolean; error?: string } => {
      if (authMode === "authenticated") {
        return {
          success: false,
          error:
            "Com sessão iniciada, reservas de restaurante só podem avançar quando houver endpoint backend dedicado.",
        };
      }

      const userId = effectiveUserId;
      const mode: "credits" | "discount" =
        (input as { bookingMode?: "credits" | "discount" }).bookingMode ?? "discount";

      const dayYMD = normalizeReservationDateYMD({ date: input.date });
      const dayCount = countConfirmedReservationsOnCalendarDay(reservations, dayYMD);
      if (dayCount >= MAX_RESERVATIONS_PER_DAY) {
        return {
          success: false,
          error: "Atingiste o limite de 2 reservas neste dia.",
        };
      }

      let creditsToUse = 0;

      if (mode === "credits") {
        const perPerson = 6;
        creditsToUse = perPerson * (input.partySize ?? 1);

        const wallet = readWalletCreditsFromLocalStorage();
        if (wallet == null) {
          return { success: false, error: "A carregar o saldo. Tenta dentro de momentos." };
        }
        if (wallet < creditsToUse) {
          return { success: false, error: "Créditos insuficientes." };
        }

        const nextWallet = wallet - creditsToUse;
        const mergeId = getStoredUser()?.id ?? userId;
        creditsDebug("addRestaurantReservation: debit", {
          cost: creditsToUse,
          walletBefore: wallet,
          nextWallet,
          dayYMD,
          dayCount,
        });
        setPurchasedCredits(nextWallet);
        syncWalletCreditsToStorage(nextWallet, mergeId);
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
        creditActivity.showToast(
          "Reserva confirmada",
          `-${creditsToUse} créditos usados`
        );
      }

      return { success: true };
    },
    [effectiveUserId, reservations, creditActivity, authMode, creditsReady, purchasedCredits]
  );

  const cancelReservation = useCallback(
    async (id: string): Promise<{ success: boolean; error?: string }> => {
      const r = reservations.find((x) => x.id === id);
      if (!r) return { success: false, error: "Reserva não encontrada." };

      const now = new Date();
      const token = readToken();
      const mongoBookingId = /^[a-f0-9]{24}$/i.test(id);

      /** Reserva real no Mongo: cancelamento e créditos no servidor. */
      if (mongoBookingId && token && authMode === "authenticated" && r.type === "activity") {
        try {
          const apiRes = await deleteApiBooking(id, token);
          const nextBalRaw =
            apiRes.wallet?.creditsAfter ??
            (typeof apiRes.creditsAfter === "number" ? apiRes.creditsAfter : null) ??
            (typeof apiRes.remainingCredits === "number" ? apiRes.remainingCredits : null);
          const nextBal =
            typeof nextBalRaw === "number" && Number.isFinite(nextBalRaw)
              ? Math.max(0, Math.floor(nextBalRaw))
              : null;
          if (nextBal != null) {
            setPurchasedCredits(nextBal);
            syncWalletCreditsToStorage(nextBal, getStoredUser()?.id ?? effectiveUserId ?? null);
          }
          await refetchUserState();

          const restored =
            typeof apiRes.wallet?.restored === "number"
              ? apiRes.wallet.restored
              : Math.max(0, Math.floor(apiRes.restoredCredits ?? 0));
          if (creditActivity && restored > 0) {
            creditActivity.addTransaction({
              type: "credit",
              amount: restored,
              reason: "Reserva cancelada (servidor)",
              activityName: r.activityTitle,
              clubName: r.partnerName,
            });
            creditActivity.showToast(
              "Reserva cancelada",
              `+${restored} créditos devolvidos`
            );
          }

          return { success: true };
        } catch (e) {
          return { success: false, error: bookingApiErrorMessage(e) };
        }
      }

      if (authMode === "authenticated") {
        return {
          success: false,
          error:
            "Com sessão iniciada, só é possível cancelar reservas reais do servidor.",
        };
      }

      if (!canCancelReservation(r, now)) {
        return {
          success: false,
          error:
            "Não é possível cancelar. Só é permitido com mais de 12 horas de antecedência em relação ao início, ou até 5 minutos após a reserva.",
        };
      }

      const userId = effectiveUserId;
      if (getMonthlyCancellationCount(userId, now) >= MONTHLY_CANCELLATION_LIMIT) {
        return {
          success: false,
          error:
            "Não é possível cancelar. Já utilizaste os 3 cancelamentos permitidos este mês.",
        };
      }

      const refundable = canRefundOnCancellation(r, now);
      const refundAmount = refundable && r.creditsUsed > 0 ? r.creditsUsed : 0;

      if (refundAmount > 0) {
        const w = readWalletCreditsFromLocalStorage();
        if (w == null) {
          return { success: false, error: "A carregar o saldo. Tenta dentro de momentos." };
        }
        const nextW = w + refundAmount;
        const mergeId = getStoredUser()?.id ?? userId;
        creditsDebug("cancelReservation: refund", {
          refundAmount,
          walletBefore: w,
          nextWallet: nextW,
        });
        setPurchasedCredits(nextW);
        syncWalletCreditsToStorage(nextW, mergeId);
      }

      if (creditActivity && refundAmount > 0) {
        creditActivity.addTransaction({
          type: "credit",
          amount: refundAmount,
          reason: "Reserva cancelada",
          activityName: r.activityTitle,
          clubName: r.partnerName,
        });
        creditActivity.showToast(
          "Reserva cancelada",
          `+${refundAmount} créditos devolvidos`
        );
      }

      setReservations((prev) => {
        const next = prev.map((res) => {
          if (res.id !== id) return res;
          return {
            ...res,
            status: "cancelled" as const,
            cancelledAt: now.toISOString(),
            creditsRefunded: refundable ? true : Boolean(res.creditsRefunded),
          };
        });
        setStoredUnifiedReservations(userId, next);
        return next;
      });

      const monthKey = getCurrentMonthKey(now);
      const cancelN = incrementMonthlyCancellationCount(userId, monthKey);
      creditsDebug("cancelReservation: monthly cancellation count after success", {
        monthKey,
        count: cancelN,
      });

      return { success: true };
    },
    [
      effectiveUserId,
      reservations,
      creditActivity,
      authMode,
      creditsReady,
      purchasedCredits,
      refetchUserState,
    ]
  );

  const cancelRestaurantReservation = useCallback(
    async (id: string) => cancelReservation(id),
    [cancelReservation]
  );

  const completeReservation = useCallback(
    (id: string) => {
      const userId = effectiveUserId;
      setReservations((prev) => {
        const now = new Date().toISOString();
        const next = prev.map((r) =>
          r.id === id ? { ...r, status: "completed" as const, completedAt: now } : r
        );
        setStoredUnifiedReservations(userId, next);
        return next;
      });
    },
    [effectiveUserId]
  );

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
      const next = prev.filter((r) => r.status === "confirmed" && r.date >= today);
      setStoredUnifiedReservations(userId, next);
      return next;
    });
  }, [effectiveUserId]);

  const addPurchasedCredits = useCallback(
    (amount: number, reason?: string) => {
      const userId =
        authMode === "authenticated"
          ? effectiveUserId
          : effectiveUserId ?? getStoredUser()?.id ?? null;

      const n = Math.max(0, Math.floor(amount));
      if (n <= 0) return;

      if (authMode === "authenticated") {
        setCreditsReady(false);

        const eventId =
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `grant-${Date.now()}-${Math.random()}`;

        apiFetch("/credits/add", {
          method: "POST",
          body: JSON.stringify({ amount: n, eventId }),
        })
          .then(() => fetchCreditsBalance())
          .then((bal) => {
            const next =
              typeof bal?.credits === "number" && Number.isFinite(bal.credits)
                ? Math.max(0, Math.floor(bal.credits))
                : null;
            if (next != null) {
              setPurchasedCredits(next);
              persistCreditsToStorage(next);
              const u = getStoredUser();
              if (u?.id) mergeStoredUser({ id: u.id, credits: next });
            }
          })
          .finally(() => {
            setCreditsReady(true);
          });
      } else if (userId) {
        setPurchasedCredits((prev) => {
          const base = typeof prev === "number" && Number.isFinite(prev) ? prev : 0;
          const next = base + n;
          setStoredPurchasedCredits(userId, next);
          persistCreditsToStorage(next);
          mergeStoredUser({ credits: next });
          return next;
        });
        setCreditsReady(true);
      }

      if (creditActivity) {
        creditActivity.addTransaction({
          type: "credit",
          amount: n,
          reason: reason ?? "Compra de créditos extra",
        });

        if (!reason) {
          creditActivity.showToast("Créditos adicionados", `+${n} créditos`);
        }
      }
    },
    [effectiveUserId, creditActivity, authMode]
  );

  const monthlyCancellationCount = useMemo(
    () => getMonthlyCancellationCount(effectiveUserId),
    [effectiveUserId, reservations]
  );

  const value = useMemo<MockReservationsContextValue>(
    () => ({
      reservations,
      activeReservationCount,
      isAuthenticated: hasToken,
      walletBalance,
      credits,
      creditsReady,
      planId,
      planName,
      planReady,
      monthlyCancellationCount,
      monthlyCancellationLimit: MONTHLY_CANCELLATION_LIMIT,
      addReservation,
      addGymReservation,
      cancelReservation,
      completeReservation,
      clearHistory,
      addPurchasedCredits,
      refetchUserState,
      countReservationsForActivity,
      addRestaurantReservation,
      cancelRestaurantReservation,
    }),
    [
      reservations,
      activeReservationCount,
      hasToken,
      walletBalance,
      credits,
      creditsReady,
      planId,
      planName,
      planReady,
      monthlyCancellationCount,
      addReservation,
      addGymReservation,
      cancelReservation,
      completeReservation,
      clearHistory,
      addPurchasedCredits,
      refetchUserState,
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