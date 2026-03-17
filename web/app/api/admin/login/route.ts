import { NextResponse } from "next/server";
import crypto from "crypto";

const COOKIE_NAME = "fitlife_admin";
const TTL_MS = 12 * 60 * 60 * 1000;

/**
 * DEMO ONLY:
 * Default admin PIN for local/dev/demo so the admin backoffice is accessible
 * without requiring environment variables. Set ADMIN_PIN in production.
 */
const DEFAULT_ADMIN_PIN = "1234";

function getSecret() {
  return (
    process.env.ADMIN_COOKIE_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    "insecure-dev-secret"
  );
}

function sign(payloadB64: string): string {
  return crypto.createHmac("sha256", getSecret()).update(payloadB64).digest("base64url");
}

function base64UrlEncodeJson(obj: unknown): string {
  const json = JSON.stringify(obj);
  return Buffer.from(json, "utf8").toString("base64url");
}

export async function POST(req: Request) {
  const pinExpected = String(process.env.ADMIN_PIN || DEFAULT_ADMIN_PIN).trim();

  try {
    const body = (await req.json().catch(() => null)) as { pin?: string } | null;
    const pin = String(body?.pin ?? "").trim();
    if (!pin) return NextResponse.json({ ok: false, error: "Introduz o PIN admin." }, { status: 400 });
    if (pin !== pinExpected) return NextResponse.json({ ok: false, error: "PIN incorreto." }, { status: 401 });

    const exp = Date.now() + TTL_MS;
    const payloadB64 = base64UrlEncodeJson({ exp });
    const cookieValue = `${payloadB64}.${sign(payloadB64)}`;

    const res = NextResponse.json({ ok: true });
    res.cookies.set(COOKIE_NAME, cookieValue, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/admin",
      expires: new Date(exp),
    });
    return res;
  } catch {
    return NextResponse.json({ ok: false, error: "Erro ao autenticar." }, { status: 500 });
  }
}

