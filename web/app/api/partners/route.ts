import { NextResponse } from "next/server";

export async function GET() {
  try {
    const backendUrl = process.env.BACKEND_URL;

    if (!backendUrl) {
      console.error("Missing BACKEND_URL");
      return NextResponse.json([], { status: 200 });
    }

    const res = await fetch(`${backendUrl}/api/partners`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    const text = await res.text();

    let data = [];
    try {
      data = text ? JSON.parse(text) : [];
    } catch {
      console.error("Invalid JSON from backend:", text);
      data = [];
    }

    if (!res.ok) {
      console.error("Partners API error:", res.status);
      return NextResponse.json([], { status: 200 });
    }

    return NextResponse.json(Array.isArray(data) ? data : []);
  } catch (err) {
    console.error("Proxy /api/partners failed:", err);
    return NextResponse.json([], { status: 200 });
  }
}