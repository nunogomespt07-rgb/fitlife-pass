import type { ActivitySnapshotPayload } from "@/lib/normalize";
import { createReservation } from "@/lib/reservationFlow";

export type { ActivitySnapshotPayload };

/**
 * Rota Next (App Router) que faz proxy para Express `POST /reservations`.
 * Nunca usar `/reservations` no browser — isso bate no origin do Next e devolve "Cannot POST /reservations".
 */
export const API_RESERVATIONS_CREATE_PATH = "/api/reservations" as const;

export async function apiFetch<T = unknown>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "";
  const token =
  typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const isProd = process.env.NODE_ENV === "production";
  // If base is set, always use it. If not set, allow relative URLs (dev/local).
  if (isProd && !base) {
    throw new Error("NEXT_PUBLIC_API_URL is missing");
  }
  if (isProd && /localhost|127\.0\.0\.1/i.test(base)) {
    throw new Error("NEXT_PUBLIC_API_URL must not point to localhost in production");
  }
  const trimmed = path.trim();
  const normalizedPath = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  /**
   * Rotas /api/* são handlers do Next (proxy/server routes) e devem ser sempre same-origin.
   * Evita apontar /api/reservations para o backend diretamente (erro "Cannot POST /api/reservations").
   */
  // Same-origin Next: nunca prefixar /api/* com NEXT_PUBLIC_API_URL (não enviar para backend externo).
  const useNextApiRoute = normalizedPath.startsWith("/api/");
  const url = useNextApiRoute
    ? normalizedPath
    : base
      ? `${base}${normalizedPath}`
      : normalizedPath;

  const headers = new Headers(init?.headers || {});
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (
    typeof window !== "undefined" &&
    process.env.NODE_ENV === "development" &&
    process.env.NEXT_PUBLIC_DEBUG_AUTH === "1"
  ) {
    console.log("AUTH DEBUG", {
      tokenExists: Boolean(token),
      tokenPrefix: token ? token.slice(0, 12) : null,
      hasAuthHeader: headers.has("Authorization"),
      finalUrl: url,
    });
  }

  const res = await fetch(url, { cache: "no-store", ...init, headers });

  const text = await res.text().catch(() => "");
  let data: unknown = text;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    // se não for JSON fica como texto simples
  }

  if (!res.ok) {
    const error = new Error(
      `API ${res.status} ${res.statusText} - ${typeof data === "string" ? data : ""}`.trim()
    ) as Error & { status?: number; data?: unknown };
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data as T;
}

export type Activity = {
  _id: string;
  title: string;
  type?: string;
  creditsCost?: number;
  city?: string;
  address?: string;
  partnerName?: string;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

// Aceita array direto OU { activities: [] }
export async function getActivities(): Promise<Activity[]> {
  const data = await apiFetch<unknown>("/activities");

  if (Array.isArray(data)) return data as Activity[];
  if (data && typeof data === "object" && "activities" in data) {
    const maybeActivities = (data as { activities?: unknown }).activities;
    if (Array.isArray(maybeActivities)) {
      return maybeActivities as Activity[];
    }
  }

  return [];
}

/** Activity shape from GET /api/activities (sport activities) */
export type ApiActivity = {
  _id: string;
  title: string;
  sportType?: string;
  location?: string;
  date?: string;
  maxParticipants?: number;
  creditsCost?: number;
  creator?: unknown;
  participants?: unknown[];
};

export async function getApiActivities(): Promise<ApiActivity[]> {
  const data = await apiFetch<unknown>("/api/activities");
  if (Array.isArray(data)) return data as ApiActivity[];
  return [];
}

export async function getApiActivityById(id: string): Promise<ApiActivity | null> {
  try {
    const data = await apiFetch<ApiActivity | null>(`/api/activities/${id}`);
    return data;
  } catch (e) {
    const status: number | undefined =
      typeof e === "object" && e && "status" in e
        ? (e as { status?: number }).status
        : undefined;
    if (status === 404) return null;
    throw e;
  }
}

export type PostApiBookingResponse = {
  success?: boolean;
  message: string;
  booking?: unknown;
  user?: { id?: string; credits?: number };
  credits?: number;
  /** Saldo antes do débito (Express POST /reservations ou /api/bookings). */
  creditsBefore?: number;
  debited?: number;
  creditsAfter?: number;
  remainingCredits?: number;
  wallet?: {
    userId: string;
    creditsBefore: number;
    creditsAfter: number;
    debited: number;
  };
  reservation?: unknown;
};

/** Cria reserva com débito transacional no Express (proxy Next → POST /reservations). */
export async function postApiBooking(
  activityId: string,
  token: string,
  options?: { activitySnapshot?: ActivitySnapshotPayload }
): Promise<PostApiBookingResponse> {
  const data = await createReservation({
    activityId,
    token,
    activitySnapshot: options?.activitySnapshot,
  });
  return data as PostApiBookingResponse;
}

export type MeUser = {
  _id: string;
  name: string;
  email: string;
  credits?: number;
};

export async function getMe(token: string): Promise<MeUser> {
  const data = await apiFetch<MeUser>("/users/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
}

/** Saldo real no Mongo (após reset mensal no servidor, se aplicável). */
export async function fetchCreditsBalance(): Promise<{ credits: number }> {
  const data = await apiFetch<{ credits?: number }>("/credits/balance", {
    cache: "no-store",
  });
  const c = data?.credits;
  if (typeof c !== "number" || !Number.isFinite(c)) {
    throw new Error("Resposta de /credits/balance sem credits numérico");
  }
  return { credits: Math.max(0, Math.floor(c)) };
}

/** Perfil completo — mesmo payload que GET /api/user (proxy Next → backend). */
export async function fetchCurrentUserProfile(): Promise<Record<string, unknown>> {
  const data = await apiFetch<Record<string, unknown>>("/users/me", {
    cache: "no-store",
  });
  return data && typeof data === "object" ? data : {};
}

/** PATCH /users/me (backend Mongo). */
export async function patchCurrentUser(
  body: Record<string, unknown>
): Promise<Record<string, unknown>> {
  console.log("[API] patchCurrentUser called", body);
  const data = await apiFetch<Record<string, unknown>>("/users/me", {
    method: "PATCH",
    cache: "no-store",
    body: JSON.stringify(body),
  });
  console.log("[API] patchCurrentUser response", data);
  return data && typeof data === "object" ? data : {};
}

export type ApiBooking = {
  _id: string;
  activity: ApiActivity;
  creditsUsed: number;
  status: string;
  bookingDate?: string;
  createdAt?: string;
};

/** Reservas do utilizador autenticado (Mongo). Proxy Next → Express GET /reservations/my. */
export async function getMyReservations(token: string): Promise<ApiBooking[]> {
  const data = await apiFetch<ApiBooking[]>("/api/reservations/my", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return Array.isArray(data) ? data : [];
}

/** @deprecated Prefer getMyReservations — usa GET /api/reservations/my. */
export async function getApiBookings(token: string): Promise<ApiBooking[]> {
  return getMyReservations(token);
}

export type CancelBookingResponse = {
  message: string;
  restoredCredits: number;
  remainingCredits: number;
  creditsBefore?: number;
  creditsAfter?: number;
  wallet?: {
    creditsBefore: number;
    creditsAfter: number;
    debited?: number;
    restored?: number;
  };
};

export async function deleteApiBooking(
  bookingId: string,
  token: string
): Promise<CancelBookingResponse> {
  const data = await apiFetch<CancelBookingResponse>(
    `/api/bookings/${encodeURIComponent(bookingId)}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return data;
}

export async function getActivityById(id: string): Promise<Activity | null> {
  try {
    const data = await apiFetch<Activity | null>(`/activities/${id}`);
    return data;
  } catch (e) {
    const status: number | undefined =
      typeof e === "object" && e && "status" in e
        ? (e as { status?: number }).status
        : undefined;
    if (status === 404) return null;
    throw e;
  }
}

export async function login(
  email: string,
  password: string
): Promise<{
  token: string;
  user: { id: string; name: string; email: string; credits?: number; plan?: string | null };
  /** When present, server-reported wallet balance (optional). */
  credits?: number;
  plan?: string | null;
}> {
  const raw = await apiFetch<unknown>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  if (!raw || typeof raw !== "object") {
    throw new Error("Resposta inválida do servidor no login");
  }

  const obj = raw as Record<string, unknown>;
  const token =
    (typeof obj.token === "string" && obj.token) ||
    (typeof obj.accessToken === "string" && obj.accessToken) ||
    (typeof obj.jwt === "string" && obj.jwt) ||
    (() => {
      const data = obj.data;
      if (!data || typeof data !== "object") return "";
      const tokenFromData = (data as Record<string, unknown>).token;
      return typeof tokenFromData === "string" ? tokenFromData : "";
    })();

  const userObj = (obj.user && typeof obj.user === "object" ? obj.user : null) as
    | { id?: unknown; name?: unknown; email?: unknown; credits?: unknown }
    | null;

  const user = {
    id: typeof userObj?.id === "string" ? userObj.id : "",
    name: typeof userObj?.name === "string" ? userObj.name : "",
    email: typeof userObj?.email === "string" ? userObj.email : email,
    credits:
      typeof userObj?.credits === "number" && Number.isFinite(userObj.credits)
        ? Math.max(0, Math.floor(userObj.credits))
        : undefined,
    plan: userObj && "plan" in userObj ? (userObj as { plan?: string | null }).plan ?? null : undefined,
  };

  let credits: number | undefined;
  if (typeof obj.credits === "number" && Number.isFinite(obj.credits)) {
    credits = Math.max(0, Math.floor(obj.credits));
  } else if (typeof userObj?.credits === "number" && Number.isFinite(userObj.credits)) {
    credits = Math.max(0, Math.floor(userObj.credits));
  }

  const plan =
    user.plan !== undefined
      ? user.plan
      : userObj && "plan" in userObj
        ? ((userObj as { plan?: string | null }).plan ?? null)
        : undefined;

  if (!token) {
    throw new Error("Login sem token (token/jwt/accessToken ausente)");
  }

  /**
   * Não gravar token aqui: o fluxo de UI (completeJwtSession) grava token + credits em sequência.
   * Gravar só o token antes dos créditos fazia o contexto/refetch ler LS inconsistente no mesmo tick.
   */

  return { token, user, credits, plan };
}

/** Change password. Backend should implement POST /auth/change-password with { currentPassword, newPassword } and Authorization: Bearer <token>. */
export async function changePassword(
  token: string,
  currentPassword: string,
  newPassword: string
): Promise<{ message?: string }> {
  const data = await apiFetch<{ message?: string }>("/auth/change-password", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  return data;
}
