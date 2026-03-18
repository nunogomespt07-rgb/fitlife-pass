import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { appendReservation } from "@/lib/adminDataServer";
import type { ServerReservation } from "@/lib/adminDataServer";

const AUTH_SECRET =
  process.env.NEXTAUTH_SECRET && process.env.NEXTAUTH_SECRET.trim()
    ? process.env.NEXTAUTH_SECRET
    : "demo-nextauth-secret";

function isRecord(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === "object" && !Array.isArray(v);
}

/** Register one reservation server-side so admin has real data. Canonical key = session email. */
export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: AUTH_SECRET });
  const email = typeof token?.email === "string" ? token.email.trim().toLowerCase() : "";
  if (!email) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as unknown;
  if (!isRecord(body)) {
    return Response.json({ message: "Invalid payload" }, { status: 400 });
  }

  const id = String(body.id ?? "").trim();
  const partnerId = String(body.partnerId ?? "").trim();
  const partnerName = String(body.partnerName ?? "").trim();
  const type = (["activity", "restaurant", "gym"].includes(String(body.type)) ? body.type : "activity") as "activity" | "restaurant" | "gym";
  const date = String(body.date ?? "").trim();
  const time = String(body.time ?? "").trim();
  const status = String(body.status ?? "confirmed").trim();
  const creditsUsed = typeof body.creditsUsed === "number" ? Math.max(0, body.creditsUsed) : 0;
  const activityTitle = body.activityTitle != null ? String(body.activityTitle) : null;
  const activityId = body.activityId != null ? String(body.activityId) : null;

  if (!id || !partnerId || !partnerName || !date || !time) {
    return Response.json({ message: "Missing required fields" }, { status: 400 });
  }

  const record: ServerReservation = {
    id,
    userEmail: email,
    customerName: (token as { name?: string })?.name ?? null,
    partnerId,
    partnerName,
    activityId,
    activityTitle,
    type,
    date,
    time,
    status,
    creditsUsed,
    createdAt: new Date().toISOString(),
  };

  await appendReservation(record);
  return Response.json({ ok: true });
}
