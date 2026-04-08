import { NextRequest } from "next/server";
import { resolveBackendApiBase } from "@/lib/adminBackendProxy";

function pickAuthHeader(req: NextRequest): string | null {
  const h = req.headers.get("authorization");
  return h && h.trim() ? h : null;
}

export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ bookingId: string }> }
) {
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
    const { bookingId } = await ctx.params;
    const upstream = await fetch(
      `${base}/api/bookings/${encodeURIComponent(bookingId)}`,
      {
        method: "DELETE",
        headers: { Authorization: auth },
        cache: "no-store",
      }
    );
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
      { message: err instanceof Error ? err.message : "Erro ao contactar o backend." },
      { status: 500 }
    );
  }
}
