import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const token = body?.token as string | undefined;

    if (!token) {
      return NextResponse.json({ message: "Token em falta" }, { status: 401 });
    }

    const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
    if (!base) {
      return NextResponse.json({ message: "NEXT_PUBLIC_API_URL em falta" }, { status: 500 });
    }

    const res = await fetch(`${base}/stripe/create-checkout-session`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({}),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      return NextResponse.json(data || { message: "Erro ao criar sessão Stripe" }, { status: res.status });
    }

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ message: "Erro ao criar sessão Stripe" }, { status: 500 });
  }
}

