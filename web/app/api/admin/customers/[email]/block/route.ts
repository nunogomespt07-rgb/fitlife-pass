import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/adminApiAuth";
import { updateCustomerState } from "@/lib/adminDataServer";

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
  await updateCustomerState(`u:${canonicalEmail}`, { blocked: true });
  return Response.json({ ok: true });
}
