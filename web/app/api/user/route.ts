import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { getCustomersCollection } from "@/lib/db";

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

    const email = normalizeEmail(token?.email);
    console.log("EMAIL:", email);

    if (!email) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();

    const safeSet: Record<string, any> = {
      updatedAt: now.toISOString(),
    };

    if (email) {
      safeSet.email = email;
    }

    // TEMPORARY: update-only to isolate Mongo update crashes.
    const collection = await getCustomersCollection();
    try {
      const update = {
        $set: safeSet,
        $setOnInsert: {
          email,
          credits: 0,
          createdAt: now.toISOString(),
        },
      };
      console.log("FINAL UPDATE /api/user", JSON.stringify(update, null, 2));
      await collection.updateOne(
        { email },
        update,
        { upsert: true }
      );
      console.log("UPDATE OK");
    } catch (e) {
      console.error("UPDATE ERROR", e);
    }

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
