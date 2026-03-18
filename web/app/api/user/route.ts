import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { ensureCustomerWithMeta } from "@/lib/customerDb";

const AUTH_SECRET =
  process.env.NEXTAUTH_SECRET && process.env.NEXTAUTH_SECRET.trim()
    ? process.env.NEXTAUTH_SECRET
    : "demo-nextauth-secret";

function normalizeEmail(v: unknown): string {
  if (typeof v !== "string") return "";
  return v.trim().toLowerCase();
}

/**
 * GET /api/user — Returns current authenticated user from DB.
 * Creates user with credits=0 on first login (find by email, create if not exists).
 */
export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: AUTH_SECRET });
  const email = normalizeEmail(token?.email);
  if (!email) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { customer: user, created } = await ensureCustomerWithMeta({
    email,
    name: typeof token?.name === "string" ? token.name.trim() : null,
  });
  console.log("[api/user] canonicalEmail", email, "created", created);

  if (user.blocked || user.deletedAt) {
    return Response.json({ message: "Forbidden" }, { status: 403 });
  }

  const credits = typeof user.credits === "number" && Number.isFinite(user.credits) ? Math.max(0, Math.floor(user.credits)) : 0;
  const name = user.name ?? (typeof token?.name === "string" ? token.name.trim() : null) ?? email;
  const planId = user.planId ?? null;
  const planName = user.planName ?? null;
  const plan = planName ?? planId ?? null;

  console.log("[api/user] return credits", { email, credits });

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
