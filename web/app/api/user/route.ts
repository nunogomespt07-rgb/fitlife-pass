import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { readCustomerState, updateCustomerState } from "@/lib/adminDataServer";

const AUTH_SECRET =
  process.env.NEXTAUTH_SECRET && process.env.NEXTAUTH_SECRET.trim()
    ? process.env.NEXTAUTH_SECRET
    : "demo-nextauth-secret";

function clampCredits(n: unknown): number {
  if (typeof n !== "number" || !Number.isFinite(n)) return 0;
  return Math.max(0, Math.floor(n));
}

/**
 * GET /api/user — Returns current authenticated user from backend.
 * Credits come ONLY from backend; creates user with credits=0 on first login (find by email, create if not exists).
 */
export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: AUTH_SECRET });
  const email = typeof token?.email === "string" ? token.email.trim().toLowerCase() : "";
  if (!email) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  const key = `u:${email}`;
  const store = await readCustomerState();
  let state = store[key] ?? {};

  if (state.blocked || state.deletedAt) {
    return Response.json({ message: "Forbidden" }, { status: 403 });
  }

  const isNewUser = !state.createdAt;
  if (isNewUser) {
    await updateCustomerState(key, {
      purchasedCredits: 0,
      createdAt: new Date().toISOString(),
      fullName: typeof token?.name === "string" ? token.name.trim() : null,
    });
    state = { ...state, purchasedCredits: 0, createdAt: new Date().toISOString(), fullName: token?.name ?? null };
  }

  const credits = clampCredits(state.purchasedCredits);
  const name = state.fullName ?? (typeof token?.name === "string" ? token.name.trim() : null) ?? email;
  const planId = state.subscriptionPlanId ?? null;
  const planName = state.subscriptionPlanName ?? null;
  const plan = planName ?? planId ?? null;

  return Response.json({
    id: email,
    email,
    name,
    credits,
    plan,
    planId,
    planName,
  });
}
