import { NextResponse } from "next/server";

const COOKIE_NAME = "fitlife_backoffice";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/backoffice",
    expires: new Date(0),
  });
  return res;
}

