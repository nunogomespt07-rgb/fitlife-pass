import type { ActivitySnapshotPayload } from "@/lib/normalize";

export type CreateReservationPayload = {
  activityId: string;
  /** Opcional — se omitido, usa `localStorage.token` no browser */
  token?: string;
  activitySnapshot?: ActivitySnapshotPayload;
};

/**
 * Reserva real: POST same-origin `/api/reservations` (Next → Express).
 */
export async function createReservation(
  payload: CreateReservationPayload
): Promise<unknown> {
  const activityId = String(payload.activityId ?? "").trim();
  if (!activityId) {
    console.error("createReservation missing activityId", payload);
    throw new Error("activityId é obrigatório");
  }

  const body: Record<string, unknown> = {
    activityId,
  };
  if (payload.activitySnapshot) {
    body.activitySnapshot = payload.activitySnapshot;
  }
  console.log("POST /api/reservations payload", body);
  console.log("CALLING API /api/reservations", { activityId });

  const token =
    payload.token ??
    (typeof window !== "undefined" ? localStorage.getItem("token") : null);

  const res = await fetch("/api/reservations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text);
  }

  return res.json();
}

export function reservationErrorMessage(error: unknown): string {
  if (error && typeof error === "object") {
    const status = "status" in error ? (error as { status?: unknown }).status : undefined;
    const data = "data" in error ? (error as { data?: unknown }).data : undefined;

    if (typeof data === "string") {
      const s = data.trim();
      if (/cannot post\s+\/api\/reservations/i.test(s) || /cannot post\s+\/reservations/i.test(s)) {
        return "Não foi possível concluir a reserva. A rota de reservas não está configurada.";
      }
      if (s.length > 0) return s;
    }
    if (data && typeof data === "object" && "message" in data) {
      const msg = (data as { message?: unknown }).message;
      if (typeof msg === "string" && msg.trim()) return msg.trim();
    }

    if (status === 404) {
      return "Não foi possível concluir a reserva. A rota de reservas não está configurada.";
    }
  }

  if (error instanceof Error) {
    const msg = error.message || "";
    if (
      /cannot post\s+\/api\/reservations/i.test(msg) ||
      /cannot post\s+\/reservations/i.test(msg)
    ) {
      return "Não foi possível concluir a reserva. A rota de reservas não está configurada.";
    }
    if (msg.trim()) return msg;
  }

  return "Não foi possível concluir a reserva neste momento.";
}
