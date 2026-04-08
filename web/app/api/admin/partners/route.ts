import { NextRequest } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";

export async function GET(req: NextRequest) {
  const url = `${BACKEND_URL}/admin/partners${req.nextUrl.search}`;
  const res = await fetch(url, { method: "GET" });
  const data = await res.text();
  return new Response(data, { status: res.status, headers: res.headers });
}

export async function POST(req: NextRequest) {
  const url = `${BACKEND_URL}/admin/partners`;
  const body = await req.text();
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });
  const data = await res.text();
  return new Response(data, { status: res.status, headers: res.headers });
}
