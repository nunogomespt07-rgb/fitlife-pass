import { NextResponse } from "next/server";
import { getAllPartnersWithCategory } from "@/lib/activitiesData";
import { getDemoPinForPartner } from "@/lib/backofficeAuth";
import crypto from "crypto";

const COOKIE_NAME = "fitlife_backoffice";
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12h

function getSecret() {
  return (
    process.env.BACKOFFICE_COOKIE_SECRET ||
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
  try {
    const body = (await req.json().catch(() => null)) as { partnerId?: string; pin?: string } | null;
    const partnerId = String(body?.partnerId ?? "").trim();
    const pin = String(body?.pin ?? "").trim();

    if (!partnerId) return NextResponse.json({ ok: false, error: "Seleciona um parceiro." }, { status: 400 });
    if (!pin) return NextResponse.json({ ok: false, error: "Introduz o PIN de acesso." }, { status: 400 });

    const exists = getAllPartnersWithCategory().some((p) => p.id === partnerId);
    if (!exists) return NextResponse.json({ ok: false, error: "Parceiro inválido." }, { status: 400 });

    const expected = getDemoPinForPartner(partnerId);
    if (pin !== expected) return NextResponse.json({ ok: false, error: "PIN incorreto." }, { status: 401 });

    const exp = Date.now() + SESSION_TTL_MS;
    const payload = { partnerId, exp };
    const payloadB64 = base64UrlEncodeJson(payload);
    const cookieValue = `${payloadB64}.${sign(payloadB64)}`;

    const res = NextResponse.json({ ok: true });
    res.cookies.set(COOKIE_NAME, cookieValue, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/backoffice",
      expires: new Date(exp),
    });
    return res;
  } catch {
    return NextResponse.json({ ok: false, error: "Erro ao autenticar." }, { status: 500 });
  }
}

