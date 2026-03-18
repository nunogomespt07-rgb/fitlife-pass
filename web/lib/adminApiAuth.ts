import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const COOKIE_NAME = "fitlife_admin";

function getSecret(): string {
  return (
    process.env.ADMIN_COOKIE_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    "insecure-dev-secret"
  );
}

function verify(raw: string | undefined): boolean {
  if (!raw) return false;
  const [payloadB64, sig] = raw.split(".");
  if (!payloadB64 || !sig) return false;
  const expected = crypto.createHmac("sha256", getSecret()).update(payloadB64).digest("base64url");
  if (sig !== expected) return false;
  try {
    const json = Buffer.from(payloadB64, "base64url").toString("utf8");
    const parsed = JSON.parse(json) as { exp?: number };
    if (!parsed?.exp || typeof parsed.exp !== "number") return false;
    return Date.now() <= parsed.exp;
  } catch {
    return false;
  }
}

/** Use in admin API routes. Returns 401 response if not admin, null if ok to proceed. */
export function requireAdmin(req: NextRequest): NextResponse | null {
  const cookie = req.cookies.get(COOKIE_NAME)?.value;
  if (!verify(cookie)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  return null;
}
