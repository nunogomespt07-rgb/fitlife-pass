import { NextRequest } from "next/server";

const BACKEND_API_URL = process.env.BACKEND_API_URL?.replace(/\/$/, "");

/** Proxy to backend GET /api/backoffice/public-availability */
export async function GET(req: NextRequest) {
  try {
    if (!BACKEND_API_URL) {
      return Response.json({ message: "BACKEND_API_URL not configured" }, { status: 503 });
    }
    const url = new URL(req.url);
    const searchParams = url.searchParams;
    const upstreamUrl = `${BACKEND_API_URL}/api/backoffice/public-availability?${searchParams.toString()}`;
    const upstream = await fetch(upstreamUrl, {
      method: "GET",
      cache: "no-store",
    });
    const text = await upstream.text();
    let data: unknown;
    try {
      data = text ? JSON.parse(text) : [];
    } catch {
      data = { message: text || "Error parsing response" };
    }
    return Response.json(data, { status: upstream.status });
  } catch (err) {
    return Response.json(
      { message: err instanceof Error ? err.message : "Error contacting backend" },
      { status: 500 }
    );
  }
}