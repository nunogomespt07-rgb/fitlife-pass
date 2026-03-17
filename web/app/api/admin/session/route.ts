import { NextResponse } from "next/server";
import crypto from "crypto";

const COOKIE_NAME = "fitlife_admin";

function getSecret() {
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

export async function GET(req: Request) {
  const cookie = req.headers.get("cookie") || "";
  const match = cookie.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]+)`));
  const value = match?.[1] ? decodeURIComponent(match[1]) : undefined;
  const ok = verify(value);
  if (!ok) return NextResponse.json({ ok: false }, { status: 401 });
  return NextResponse.json({ ok: true });
}

