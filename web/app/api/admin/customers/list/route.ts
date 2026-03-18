import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/adminApiAuth";
import { readCustomerState, readReservations } from "@/lib/adminDataServer";

export async function GET(req: NextRequest) {
  const unauth = requireAdmin(req);
  if (unauth) return unauth;

  const { searchParams } = req.nextUrl;
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") ?? "20", 10)));
  const search = (searchParams.get("search") ?? "").trim().toLowerCase();
  const planFilter = searchParams.get("plan") ?? "";
  const sort = searchParams.get("sort") ?? "newest";

  const store = await readCustomerState();
  const reservations = await readReservations();

  const userEmails = Object.keys(store).filter((k) => k.startsWith("u:")).map((k) => k.replace(/^u:/, ""));

  const resByEmail: Record<string, { count: number; lastDate: string | null }> = {};
  for (const r of reservations) {
    const e = r.userEmail?.toLowerCase() ?? "";
    if (!resByEmail[e]) resByEmail[e] = { count: 0, lastDate: null };
    resByEmail[e].count++;
    const d = r.date;
    if (!resByEmail[e].lastDate || d > resByEmail[e].lastDate!) resByEmail[e].lastDate = d;
  }

  type CustomerRow = {
    userEmail: string;
    fullName: string | null;
    email: string;
    createdAt: string | null;
    currentPlan: string | null;
    purchasedCredits: number;
    totalReservations: number;
    lastActivity: string | null;
    status: string;
    blocked: boolean;
  };

  let rows: CustomerRow[] = userEmails
    .filter((email) => {
      const key = `u:${email}`;
      const state = store[key] ?? {};
      return !(state as { deletedAt?: string | null })?.deletedAt;
    })
    .map((email) => {
      const key = `u:${email}`;
      const state = store[key] ?? {};
      const res = resByEmail[email.toLowerCase()] ?? { count: 0, lastDate: null };
      const blocked = (state as { blocked?: boolean })?.blocked;
      return {
        userEmail: email,
        fullName: (state as { fullName?: string | null })?.fullName ?? null,
        email,
        createdAt: (state as { createdAt?: string })?.createdAt ?? null,
        currentPlan: state.subscriptionPlanName ?? state.subscriptionPlanId ?? null,
        purchasedCredits: typeof state.purchasedCredits === "number" ? state.purchasedCredits : 0,
        totalReservations: res.count,
        lastActivity: res.lastDate,
        status: blocked ? "blocked" : res.count > 0 ? "active" : "inactive",
        blocked: !!blocked,
      };
    });

  if (search) {
    rows = rows.filter(
      (r) =>
        r.email.toLowerCase().includes(search) ||
        (r.fullName ?? "").toLowerCase().includes(search)
    );
  }
  if (planFilter === "with") {
    rows = rows.filter((r) => r.currentPlan != null && r.currentPlan !== "");
  } else if (planFilter === "without") {
    rows = rows.filter((r) => r.currentPlan == null || r.currentPlan === "");
  }

  if (sort === "oldest") {
    rows = [...rows].sort((a, b) => (a.createdAt ?? "").localeCompare(b.createdAt ?? ""));
  } else if (sort === "email") {
    rows = [...rows].sort((a, b) => a.email.localeCompare(b.email));
  } else if (sort === "reservations") {
    rows = [...rows].sort((a, b) => b.totalReservations - a.totalReservations);
  } else {
    rows = [...rows].sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
  }

  const total = rows.length;
  const start = (page - 1) * pageSize;
  const items = rows.slice(start, start + pageSize);

  return Response.json({
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  });
}
