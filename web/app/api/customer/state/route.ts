import { NextRequest } from "next/server";

const BACKEND_API_URL = process.env.BACKEND_API_URL?.replace(/\/$/, "");

function isRecord(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === "object" && !Array.isArray(v);
}

function pickAuthHeader(req: NextRequest): string | null {
  const h = req.headers.get("authorization");
  return h && h.trim() ? h : null;
}

/**
 * Compatibility route only.
 * Source of truth is Railway backend User model.
 */
export async function GET(req: NextRequest) {
  if (!BACKEND_API_URL) {
    return Response.json({ message: "Backend API URL não configurada (BACKEND_API_URL)." }, { status: 503 });
  }
  const auth = pickAuthHeader(req);
  if (!auth) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  const upstream = await fetch(`${BACKEND_API_URL}/api/user`, {
    method: "GET",
    headers: { Authorization: auth },
    cache: "no-store",
  });
  const payload = (await upstream.json().catch(() => ({}))) as Record<string, unknown>;
  const purchasedCredits = typeof payload.credits === "number" ? payload.credits : 0;
  return Response.json(
    {
      purchasedCredits,
      subscriptionPlanId: (payload.subscriptionPlanId ?? payload.plan ?? null) as string | null,
      subscriptionPlanName: (payload.subscriptionPlanName ?? payload.plan ?? null) as string | null,
    },
    { status: upstream.status }
  );
}

/**
 * Compatibility route only.
 * Writes are forwarded to Railway API endpoints (never to customers collection).
 */
export async function POST(req: NextRequest) {
  try {
    if (!BACKEND_API_URL) {
      return Response.json({ message: "Backend API URL não configurada (BACKEND_API_URL)." }, { status: 503 });
    }
    const auth = pickAuthHeader(req);
    if (!auth) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json().catch(() => ({}))) as unknown;
    if (!isRecord(body)) {
      return Response.json({ message: "Invalid payload" }, { status: 400 });
    }

    // Credits flow: map incCredits -> Railway /credits/add
    if (typeof body.incCredits === "number" && Number.isFinite(body.incCredits) && body.incCredits > 0) {
      const amount = Math.max(0, Math.floor(body.incCredits));
      const addRes = await fetch(`${BACKEND_API_URL}/credits/add`, {
        method: "POST",
        headers: {
          Authorization: auth,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount }),
      });
      const addData = (await addRes.json().catch(() => ({}))) as Record<string, unknown>;
      return Response.json(
        {
          success: addRes.ok,
          purchasedCredits: typeof addData.credits === "number" ? addData.credits : 0,
        },
        { status: addRes.status }
      );
    }

    // Profile/plan fallback patch: forward to Railway PATCH /api/user
    const patch: Record<string, unknown> = {};
    if ("subscriptionPlanId" in body) patch.plan = body.subscriptionPlanId == null ? null : String(body.subscriptionPlanId);
    if ("subscriptionStatus" in body) patch.planStatus = body.subscriptionStatus == null ? null : String(body.subscriptionStatus);
    if ("subscriptionPlanName" in body && !("subscriptionPlanId" in body)) {
      patch.plan = body.subscriptionPlanName == null ? null : String(body.subscriptionPlanName);
    }
    if ("fullName" in body) patch.name = body.fullName == null ? null : String(body.fullName);
    if ("country" in body) patch.country = body.country == null ? null : String(body.country);
    if ("city" in body) patch.city = body.city == null ? null : String(body.city);
    if ("phone" in body) patch.phone = body.phone == null ? null : String(body.phone);

    if (Object.keys(patch).length === 0) {
      return Response.json({ success: true }, { status: 200 });
    }

    const upRes = await fetch(`${BACKEND_API_URL}/api/user`, {
      method: "PATCH",
      headers: {
        Authorization: auth,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(patch),
    });
    const upData = (await upRes.json().catch(() => ({}))) as Record<string, unknown>;
    return Response.json(
      {
        success: upRes.ok,
        purchasedCredits: typeof upData.credits === "number" ? upData.credits : 0,
        subscriptionPlanId: (upData.subscriptionPlanId ?? upData.plan ?? null) as string | null,
        subscriptionPlanName: (upData.subscriptionPlanName ?? upData.plan ?? null) as string | null,
      },
      { status: upRes.status }
    );
  } catch (err) {
    return Response.json(
      { message: "Internal Server Error", error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
