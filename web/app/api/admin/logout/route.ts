import { NextResponse } from "next/server";

const COOKIE_NAME = "fitlife_admin";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/admin",
    expires: new Date(0),
  });
  return res;
}

