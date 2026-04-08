import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/adminApiAuth";
import {
  fetchAdminBackend,
  resolveAdminBackendBase,
} from "@/lib/adminBackendProxy";

const EMPTY_LIST = {
  success: false as const,
  customers: [] as unknown[],
  items: [] as unknown[],
  pagination: { page: 1, limit: 20, total: 0, pages: 0 },
  total: 0,
  page: 1,
  pageSize: 20,
  totalPages: 1,
};

/**
 * GET /api/admin/customers → Express GET /admin/customers
 * (BACKEND_API_URL no servidor + x-admin-secret)
 */
export async function GET(req: NextRequest) {
  const unauth = requireAdmin(req);
  if (unauth) return unauth;

  const base = resolveAdminBackendBase();
  const secret = process.env.ADMIN_API_SECRET?.trim() ?? "";

  if (!base) {
    return Response.json(
      {
        ...EMPTY_LIST,
        message:
          "Define BACKEND_API_URL no servidor Next (variável privada) para proxy admin → Express.",
      },
      { status: 503 }
    );
  }

  if (!secret) {
    return Response.json(
      {
        ...EMPTY_LIST,
        message:
          "Define ADMIN_API_SECRET no Next (igual ao Express). O proxy envia o header x-admin-secret.",
      },
      { status: 503 }
    );
  }

  try {
    const upstream = await fetchAdminBackend(`/admin/customers${req.nextUrl.search}`);
    const text = await upstream.text();
    return new Response(text, {
      status: upstream.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[api/admin/customers] proxy", e);
    return Response.json(
      {
        ...EMPTY_LIST,
        success: false,
        message:
          e instanceof Error
            ? e.message
            : "Não foi possível contactar o Express (BACKEND_API_URL + ADMIN_API_SECRET).",
      },
      { status: 502 }
    );
  }
}
