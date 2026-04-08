import { NextRequest } from "next/server";
import { resolveBackendApiBase } from "@/lib/adminBackendProxy";

function pickAuthHeader(req: NextRequest): string | null {
  const h = req.headers.get("authorization");
  return h && h.trim() ? h : null;
}

async function forwardJson(upstream: Response) {
  const text = await upstream.text();
  let data: unknown;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { message: text || "Erro ao processar resposta do backend." };
  }
  return Response.json(data, { status: upstream.status });
}

/** Proxy para Express: GET/POST /api/bookings (reservas reais + débito Mongo). */
export async function GET(req: NextRequest) {
  try {
    const base = resolveBackendApiBase();
    if (!base) {
      return Response.json(
        { message: "URL do backend não configurada (BACKEND_API_URL ou NEXT_PUBLIC_API_URL)." },
        { status: 503 }
      );
    }
    const auth = pickAuthHeader(req);
    if (!auth) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }
    const upstream = await fetch(`${base}/api/bookings`, {
      method: "GET",
      headers: { Authorization: auth },
      cache: "no-store",
    });
    return forwardJson(upstream);
  } catch (err) {
    return Response.json(
      { message: err instanceof Error ? err.message : "Erro ao contactar o backend." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const base = resolveBackendApiBase();
    if (!base) {
      return Response.json(
        { message: "URL do backend não configurada (BACKEND_API_URL ou NEXT_PUBLIC_API_URL)." },
        { status: 503 }
      );
    }
    const auth = pickAuthHeader(req);
    if (!auth) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }
    const body = await req.text();
    const upstream = await fetch(`${base}/api/bookings`, {
      method: "POST",
      headers: {
        Authorization: auth,
        "Content-Type": "application/json",
      },
      body,
      cache: "no-store",
    });
    return forwardJson(upstream);
  } catch (err) {
    return Response.json(
      { message: err instanceof Error ? err.message : "Erro ao contactar o backend." },
      { status: 500 }
    );
  }
}
