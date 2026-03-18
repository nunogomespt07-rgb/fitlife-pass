import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/adminApiAuth";
import { readCustomerState } from "@/lib/adminDataServer";

export async function GET(req: NextRequest) {
  const unauth = requireAdmin(req);
  if (unauth) return unauth;

  const store = await readCustomerState();
  const keys = Object.keys(store).filter((k) => k.startsWith("u:"));
  const totalUsers = keys.length;

  const now = new Date();
  const todayStart = now.toISOString().slice(0, 10);
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  const weekStartStr = weekStart.toISOString().slice(0, 10);
  const monthStart = now.toISOString().slice(0, 7);

  let newToday = 0;
  let newWeek = 0;
  let newMonth = 0;
  let withPlan = 0;
  let withoutPlan = 0;

  for (const key of keys) {
    const state = store[key];
    const createdAt = (state as { createdAt?: string })?.createdAt;
    if (createdAt) {
      const d = createdAt.slice(0, 10);
      if (d >= todayStart) newToday++;
      if (d >= weekStartStr) newWeek++;
      if (d.slice(0, 7) >= monthStart) newMonth++;
    } else {
      newMonth++;
    }
    if (state?.subscriptionPlanId || state?.subscriptionPlanName) withPlan++;
    else withoutPlan++;
  }

  return Response.json({
    totalUsers,
    newToday,
    newWeek,
    newMonth,
    withPlan,
    withoutPlan,
    activeUsers: totalUsers,
  });
}
