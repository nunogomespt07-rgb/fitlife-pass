export async function apiFetch<T = unknown>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "";
  const isProd = process.env.NODE_ENV === "production";
  // If base is set, always use it. If not set, allow relative URLs (dev/local).
  if (isProd && !base) {
    throw new Error("NEXT_PUBLIC_API_URL is missing");
  }
  if (isProd && /localhost|127\.0\.0\.1/i.test(base)) {
    throw new Error("NEXT_PUBLIC_API_URL must not point to localhost in production");
  }
  const url = base
    ? `${base}${path.startsWith("/") ? path : `/${path}`}`
    : path.startsWith("/")
      ? path
      : `/${path}`;

  const existingHeaders = (init?.headers ?? {}) as Record<string, string>;
  const hasAuthHeader =
    Object.keys(existingHeaders).some((k) => k.toLowerCase() === "authorization");
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const res = await fetch(url, {
    cache: "no-store",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token && !hasAuthHeader ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers || {}),
    },
  });

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

export async function postApiBooking(
  activityId: string,
  token: string
): Promise<{ message: string; remainingCredits: number }> {
  const data = await apiFetch<{ message: string; remainingCredits: number }>(
    "/api/bookings",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ activityId }),
    }
  );
  return data;
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

export type ApiBooking = {
  _id: string;
  activity: ApiActivity;
  creditsUsed: number;
  status: string;
  bookingDate?: string;
  createdAt?: string;
};

export async function getApiBookings(token: string): Promise<ApiBooking[]> {
  const data = await apiFetch<ApiBooking[]>("/api/bookings", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return Array.isArray(data) ? data : [];
}

export type CancelBookingResponse = {
  message: string;
  restoredCredits: number;
  remainingCredits: number;
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
): Promise<{ token: string; user: { id: string; name: string; email: string } }> {
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
    | { id?: unknown; name?: unknown; email?: unknown }
    | null;

  const user = {
    id: typeof userObj?.id === "string" ? userObj.id : "",
    name: typeof userObj?.name === "string" ? userObj.name : "",
    email: typeof userObj?.email === "string" ? userObj.email : email,
  };

  if (!token) {
    throw new Error("Login sem token (token/jwt/accessToken ausente)");
  }

  return { token, user };
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
