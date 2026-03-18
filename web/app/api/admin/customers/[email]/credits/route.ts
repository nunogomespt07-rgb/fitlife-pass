import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/adminApiAuth";
import { readCustomerState, updateCustomerState } from "@/lib/adminDataServer";

function isRecord(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === "object" && !Array.isArray(v);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ email: string }> }
) {
  const unauth = requireAdmin(req);
  if (unauth) return unauth;

  const { email } = await params;
  const canonicalEmail = email?.trim().toLowerCase();
  if (!canonicalEmail) {
    return Response.json({ message: "Missing email" }, { status: 400 });
  }
  const key = `u:${canonicalEmail}`;

  const body = (await req.json().catch(() => null)) as unknown;
  if (!isRecord(body)) {
    return Response.json({ message: "Invalid payload" }, { status: 400 });
  }
  const add = typeof body.add === "number" ? Math.max(0, Math.floor(body.add)) : 0;
  const remove = typeof body.remove === "number" ? Math.max(0, Math.floor(body.remove)) : 0;
  if (add === 0 && remove === 0) {
    return Response.json({ message: "Provide add or remove" }, { status: 400 });
  }

  const store = await readCustomerState();
  const state = store[key] ?? {};
  const current = typeof state.purchasedCredits === "number" ? state.purchasedCredits : 0;
  const next = Math.max(0, current + add - remove);
  await updateCustomerState(key, { purchasedCredits: next });
  return Response.json({ ok: true, previous: current, purchasedCredits: next });
}
