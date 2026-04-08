import { NextRequest } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const url = `${BACKEND_URL}/admin/partners/${params.id}`;
  const res = await fetch(url, { method: "GET" });
  const data = await res.text();
  return new Response(data, { status: res.status, headers: res.headers });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const url = `${BACKEND_URL}/admin/partners/${params.id}`;
  const body = await req.text();
  const res = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body,
  });
  const data = await res.text();
  return new Response(data, { status: res.status, headers: res.headers });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const url = `${BACKEND_URL}/admin/partners/${params.id}`;
  const res = await fetch(url, { method: "DELETE" });
  const data = await res.text();
  return new Response(data, { status: res.status, headers: res.headers });
}
