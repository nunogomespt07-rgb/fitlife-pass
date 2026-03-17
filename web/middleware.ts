import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const BACKOFFICE_COOKIE = "fitlife_backoffice";

function getCookieSecret(): string {
  return (
    process.env.BACKOFFICE_COOKIE_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    "insecure-dev-secret"
  );
}

function safeBase64UrlDecode(input: string): string | null {
  try {
    const base64 =
      input.replace(/-/g, "+").replace(/_/g, "/") +
      "===".slice((input.length + 3) % 4);
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  } catch {
    return null;
  }
}

function base64UrlEncodeBytes(bytes: ArrayBuffer): string {
  const arr = new Uint8Array(bytes);
  let binary = "";
  for (let i = 0; i < arr.length; i++) binary += String.fromCharCode(arr[i]);
  const base64 = btoa(binary);
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function hmacSha256Base64Url(secret: string, data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return base64UrlEncodeBytes(sig);
}

async function verifyBackofficeCookie(raw: string | undefined): Promise<{ partnerId: string } | null> {
  if (!raw) return null;
  const [payloadB64, sig] = raw.split(".");
  if (!payloadB64 || !sig) return null;

  const secret = getCookieSecret();
  const expected = await hmacSha256Base64Url(secret, payloadB64);
  if (sig !== expected) return null;

  const json = safeBase64UrlDecode(payloadB64);
  if (!json) return null;

  try {
    const parsed = JSON.parse(json) as { partnerId?: string; exp?: number };
    if (!parsed?.partnerId || typeof parsed.partnerId !== "string") return null;
    if (!parsed?.exp || typeof parsed.exp !== "number") return null;
    if (Date.now() > parsed.exp) return null;
    return { partnerId: parsed.partnerId };
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Partner Backoffice protection (demo but server-enforced)
  if (pathname.startsWith("/backoffice")) {
    if (pathname.startsWith("/backoffice/login")) return NextResponse.next();
    const session = await verifyBackofficeCookie(req.cookies.get(BACKOFFICE_COOKIE)?.value);
    if (!session) {
      const url = req.nextUrl.clone();
      url.pathname = "/backoffice/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Customer dashboard protection (NextAuth primary)
  if (pathname.startsWith("/dashboard")) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = "/auth";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/backoffice/:path*"],
};

