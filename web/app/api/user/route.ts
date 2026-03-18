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
  try {
    console.log("START /api/user");

    const token = await getToken({ req, secret: AUTH_SECRET });
    console.log("TOKEN OK");

    const email = typeof token?.email === "string" ? token.email : null;
    console.log("EMAIL:", email);

    if (!email) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    // TEMPORARY: comment out helper/db calls one by one
    // const customer = await ensureCustomerWithMeta(email);
    // console.log("CUSTOMER OK", customer);

    // const state = await readCustomerState(email);
    // console.log("STATE OK", state);

    return Response.json({ ok: true, email }, { status: 200 });
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
