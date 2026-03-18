import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { ensureCustomerWithMeta, findCustomerByEmail, grantCreditsIdempotent, updateCustomerByEmail } from "@/lib/customerDb";

const AUTH_SECRET =
  process.env.NEXTAUTH_SECRET && process.env.NEXTAUTH_SECRET.trim()
    ? process.env.NEXTAUTH_SECRET
    : "demo-nextauth-secret";

function isRecord(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === "object" && !Array.isArray(v);
}

function clampCredits(n: unknown): number | undefined {
  if (typeof n !== "number" || !Number.isFinite(n)) return undefined;
  return Math.max(0, Math.floor(n));
}

async function getCanonicalEmail(req: NextRequest): Promise<string | null> {
  const token = await getToken({ req, secret: AUTH_SECRET });
  const email = typeof token?.email === "string" ? token.email.trim().toLowerCase() : "";
  return email || null;
}

/** GET /api/customer/state — Returns customer state from DB (same shape as before). */
export async function GET(req: NextRequest) {
  const email = await getCanonicalEmail(req);
  if (!email) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { customer: user, created } = await ensureCustomerWithMeta({
    email,
    name: null,
  });
  console.log("[api/customer/state][GET] canonicalEmail", email, "created", created);

  if (user.blocked || user.deletedAt) {
    return Response.json({ message: "Forbidden" }, { status: 403 });
  }

  const purchasedCredits = typeof user.credits === "number" && Number.isFinite(user.credits) ? Math.max(0, Math.floor(user.credits)) : 0;
  return Response.json(
    {
      purchasedCredits,
      subscriptionPlanId: user.planId ?? null,
      subscriptionPlanName: user.planName ?? null,
    },
    { status: 200 }
  );
}

/** POST /api/customer/state — Updates customer state in DB (e.g. credits, plan). */
export async function POST(req: NextRequest) {
  const email = await getCanonicalEmail(req);
  if (!email) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as unknown;
  if (!isRecord(body)) return Response.json({ message: "Invalid payload" }, { status: 400 });

  const { customer: user, created } = await ensureCustomerWithMeta({ email, name: null });
  console.log("[api/customer/state][POST] canonicalEmail", email, "created", created);
  if (user.blocked || user.deletedAt) {
    return Response.json({ message: "Forbidden" }, { status: 403 });
  }

  const patch: { purchasedCredits?: number; subscriptionPlanId?: string | null; subscriptionPlanName?: string | null } = {};
  const incCredits =
    "incCredits" in body && typeof body.incCredits === "number" && Number.isFinite(body.incCredits)
      ? Math.max(0, Math.floor(body.incCredits))
      : null;
  const eventId = "eventId" in body && typeof body.eventId === "string" ? body.eventId : null;

  // Preferred authenticated credit grant path: atomic increment (idempotent if eventId provided).
  if (incCredits != null && incCredits > 0) {
    console.log("[api/customer/state][POST] grant credits", { email, incCredits, eventId: eventId ? String(eventId).slice(0, 80) : null });
    const result = await grantCreditsIdempotent({ email, amount: incCredits, eventId });
    console.log("[api/customer/state][POST] grant result", { email, applied: result.applied, credits: result.credits });
  }
  if ("purchasedCredits" in body) {
    const v = clampCredits(body.purchasedCredits);
    if (v !== undefined) patch.purchasedCredits = v;
  }
  if ("subscriptionPlanId" in body) patch.subscriptionPlanId = body.subscriptionPlanId == null ? null : String(body.subscriptionPlanId);
  if ("subscriptionPlanName" in body) patch.subscriptionPlanName = body.subscriptionPlanName == null ? null : String(body.subscriptionPlanName);

  // Back-compat: allow absolute set. For authenticated purchases we should prefer incCredits above.
  if (Object.keys(patch).length > 0 && incCredits == null) {
    console.log("[api/customer/state][POST] write patch keys", Object.keys(patch));
    await updateCustomerByEmail(email, patch);
  }

  const updated = await findCustomerByEmail(email);
  const purchasedCredits = updated && typeof updated.credits === "number" && Number.isFinite(updated.credits)
    ? Math.max(0, Math.floor(updated.credits))
    : user.credits ?? 0;

  return Response.json(
    {
      success: true,
      purchasedCredits,
      subscriptionPlanId: updated?.planId ?? user.planId ?? null,
      subscriptionPlanName: updated?.planName ?? user.planName ?? null,
    },
    { status: 200 }
  );
}
