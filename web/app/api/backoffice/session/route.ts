import { NextResponse } from "next/server";
import crypto from "crypto";

const COOKIE_NAME = "fitlife_backoffice";

function getSecret() {
  return (
    process.env.BACKOFFICE_COOKIE_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    "insecure-dev-secret"
  );
}

function verify(raw: string | undefined): { partnerId: string } | null {
  if (!raw) return null;
  const [payloadB64, sig] = raw.split(".");
  if (!payloadB64 || !sig) return null;
  const expected = crypto.createHmac("sha256", getSecret()).update(payloadB64).digest("base64url");
  if (sig !== expected) return null;
  try {
    const json = Buffer.from(payloadB64, "base64url").toString("utf8");
    const parsed = JSON.parse(json) as { partnerId?: string; exp?: number };
    if (!parsed?.partnerId || typeof parsed.partnerId !== "string") return null;
    if (!parsed?.exp || typeof parsed.exp !== "number") return null;
    if (Date.now() > parsed.exp) return null;
    return { partnerId: parsed.partnerId };
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  const cookie = req.headers.get("cookie") || "";
  const match = cookie.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]+)`));
  const value = match?.[1] ? decodeURIComponent(match[1]) : undefined;
  const session = verify(value);
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });
  return NextResponse.json({ ok: true, partnerId: session.partnerId });
}

