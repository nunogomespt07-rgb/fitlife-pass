import { NextRequest } from "next/server";

const BACKEND_API_BASE =
  process.env.BACKEND_API_URL?.replace(/\/$/, "") ||
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??
  "";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const targetUrl = `${BACKEND_API_BASE}/auth/register`;
    const upstreamRes = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const text = await upstreamRes.text();
    let json: unknown;
    try {
      json = text ? JSON.parse(text) : {};
    } catch {
      json = { message: text || "Erro ao processar resposta do servidor." };
    }

    // Reencaminha o status original, mas garante sempre JSON com mensagem
    if (!upstreamRes.ok) {
      const message =
        json && typeof json === "object" && typeof (json as { message?: string }).message === "string"
          ? (json as { message: string }).message
          : "Não foi possível criar a conta. Tenta novamente.";
      return Response.json({ message }, { status: upstreamRes.status });
    }

    // Sucesso: passa a resposta tal como veio (ou objeto vazio)
    if (!text) {
      return Response.json({ success: true }, { status: upstreamRes.status });
    }
    if (typeof json === "object" && json !== null) {
      return Response.json(json, { status: upstreamRes.status });
    }
    return Response.json({ success: true }, { status: upstreamRes.status });
  } catch (err) {
    console.error("[api/register] upstream request failed:", err);
    return Response.json(
      { message: "Não foi possível criar a conta. Tenta novamente." },
      { status: 502 }
    );
  }
}

