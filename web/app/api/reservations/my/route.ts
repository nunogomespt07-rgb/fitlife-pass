import { NextRequest } from "next/server";
import { resolveBackendApiBase } from "@/lib/adminBackendProxy";

function pickAuthHeader(req: NextRequest): string | null {
  const h = req.headers.get("authorization");
  return h && h.trim() ? h : null;
}

async function forwardJson(upstream: Response) {
  if (upstream.status === 404 || upstream.status === 204) {
    return Response.json([], { status: 200 });
  }

  const text = await upstream.text();
  let data: unknown;
  try {
    data = text ? JSON.parse(text) : [];
  } catch {
    data = { message: text || "Erro ao processar resposta do backend." };
  }
  return Response.json(data, { status: upstream.status });
}

/** Proxy → Express GET /reservations/my (reservas reais do utilizador, sem mock). */
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
    const upstream = await fetch(`${base}/reservations/my`, {
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
