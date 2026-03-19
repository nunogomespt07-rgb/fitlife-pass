import { NextRequest } from "next/server";

const BACKEND_API_URL = process.env.BACKEND_API_URL?.replace(/\/$/, "");

function pickAuthHeader(req: NextRequest): string | null {
  const h = req.headers.get("authorization");
  return h && h.trim() ? h : null;
}

/**
 * Compatibility route only.
 * Source of truth is Railway backend User model (GET /api/user).
 */
export async function GET(req: NextRequest) {
  try {
    if (!BACKEND_API_URL) {
      return Response.json({ message: "Backend API URL não configurada (BACKEND_API_URL)." }, { status: 503 });
    }
    const auth = pickAuthHeader(req);
    if (!auth) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    const upstream = await fetch(`${BACKEND_API_URL}/api/user`, {
      method: "GET",
      headers: {
        Authorization: auth,
      },
      cache: "no-store",
    });

    const text = await upstream.text();
    let data: unknown;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { message: text || "Erro ao processar resposta do backend." };
    }

    return Response.json(data, { status: upstream.status });
  } catch (err) {
    return Response.json(
      { message: "Internal Server Error", error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
