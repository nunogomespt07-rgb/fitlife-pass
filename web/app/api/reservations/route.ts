import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("RESERVATION BODY", body);

    const backendUrl = (
      process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || ""
    ).replace(/\/$/, "");

    if (!backendUrl) {
      return NextResponse.json(
        {
          success: false,
          message: "BACKEND_API_URL ou NEXT_PUBLIC_API_URL não definido.",
        },
        { status: 500 }
      );
    }

    const upstream = await fetch(`${backendUrl}/api/bookings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: req.headers.get("authorization") || "",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const text = await upstream.text();
    let data: unknown = null;

    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = {
        success: false,
        message: text || "Resposta inválida do backend.",
      };
    }

    return NextResponse.json(data, { status: upstream.status });
  } catch (err: unknown) {
    console.error("API reservations error:", err);
    const message =
      err instanceof Error
        ? err.message
        : "Erro interno na rota /api/reservations";

    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}