import { NextRequest } from "next/server";

const BACKEND_API_URL = process.env.BACKEND_API_URL?.replace(/\/$/, "");

/** Lista pública de atividades (Express GET /api/activities). */
export async function GET(_req: NextRequest) {
  try {
    if (!BACKEND_API_URL) {
      return Response.json({ message: "BACKEND_API_URL não configurada." }, { status: 503 });
    }
    const upstream = await fetch(`${BACKEND_API_URL}/activities`, {
      method: "GET",
      cache: "no-store",
    });
    const text = await upstream.text();
    let data: unknown;
    try {
      data = text ? JSON.parse(text) : [];
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
