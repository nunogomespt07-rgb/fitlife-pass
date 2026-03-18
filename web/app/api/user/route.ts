import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { readCustomerState } from "@/lib/adminDataServer";

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
  try {
    console.log("START /api/user");

    const token = await getToken({ req, secret: AUTH_SECRET });
    console.log("TOKEN OK");

    const email = typeof token?.email === "string" ? token.email : null;
    console.log("EMAIL:", email);

    if (!email) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    // TEMPORARY: read-only customer state (no writes/operators yet)
    let customer: unknown = null;
    try {
      const store = await readCustomerState();
      const key = `u:${email.trim().toLowerCase()}`;
      customer = (store as Record<string, unknown>)[key] ?? null;
      console.log("CUSTOMER OK", { key, customer });
    } catch (e) {
      console.error("CUSTOMER READ ERROR", e);
    }

    return Response.json({ ok: true, email, customer }, { status: 200 });
  } catch (err) {
    console.error("ERROR /api/user:", err);
    return Response.json(
      {
        message: "Internal Server Error",
        error: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
