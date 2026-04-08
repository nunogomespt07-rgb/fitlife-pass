import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/adminApiAuth";
import {
  fetchAdminBackend,
  resolveAdminBackendBase,
} from "@/lib/adminBackendProxy";

const EMPTY_METRICS = {
  success: false as const,
  metrics: {
    totalUsers: 0,
    newToday: 0,
    newWeek: 0,
    newMonth: 0,
    withPlan: 0,
    withoutPlan: 0,
    activeUsers: 0,
  },
  totalUsers: 0,
  newToday: 0,
  newWeek: 0,
  newMonth: 0,
  withPlan: 0,
  withoutPlan: 0,
  activeUsers: 0,
};

/**
 * GET /api/admin/customers/metrics → Express GET /admin/customers/metrics
 */
export async function GET(_req: NextRequest) {
  const unauth = requireAdmin(_req);
  if (unauth) return unauth;

  const base = resolveAdminBackendBase();
  const secret = process.env.ADMIN_API_SECRET?.trim() ?? "";

  if (!base) {
    return Response.json(
      {
        ...EMPTY_METRICS,
        message:
          "Define BACKEND_API_URL no servidor Next para proxy admin → Express.",
      },
      { status: 503 }
    );
  }

  if (!secret) {
    return Response.json(
      {
        ...EMPTY_METRICS,
        message:
          "Define ADMIN_API_SECRET no Next (igual ao Express). O proxy envia o header x-admin-secret.",
      },
      { status: 503 }
    );
  }

  try {
    const upstream = await fetchAdminBackend("/admin/customers/metrics");
    const text = await upstream.text();
    return new Response(text, {
      status: upstream.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[admin/customers/metrics] proxy", e);
    return Response.json(
      {
        ...EMPTY_METRICS,
        message: e instanceof Error ? e.message : "Proxy falhou",
      },
      { status: 502 }
    );
  }
}
