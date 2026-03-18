import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/adminApiAuth";
import { readReservations } from "@/lib/adminDataServer";

export async function GET(req: NextRequest) {
  const unauth = requireAdmin(req);
  if (unauth) return unauth;

  const reservations = await readReservations();
  const now = new Date();
  const today = now.toISOString().slice(0, 10);

  const upcoming = reservations.filter((r) => r.status === "confirmed" && r.date >= today);
  const completed = reservations.filter((r) => r.status === "completed");
  const cancelled = reservations.filter((r) => r.status === "cancelled");
  const noShow = reservations.filter((r) => r.status === "no_show");

  const byPartner: Record<string, number> = {};
  const byActivity: Record<string, number> = {};
  const byDay: Record<string, number> = {};
  const byWeek: Record<string, number> = {};
  const byMonth: Record<string, number> = {};

  for (const r of reservations) {
    byPartner[r.partnerId] = (byPartner[r.partnerId] ?? 0) + 1;
    const actKey = r.activityTitle || r.partnerName;
    byActivity[actKey] = (byActivity[actKey] ?? 0) + 1;
    byDay[r.date] = (byDay[r.date] ?? 0) + 1;
    const d = new Date(r.date);
    const weekStart = new Date(d);
    weekStart.setDate(d.getDate() - d.getDay());
    const weekKey = weekStart.toISOString().slice(0, 10);
    byWeek[weekKey] = (byWeek[weekKey] ?? 0) + 1;
    const monthKey = r.date.slice(0, 7);
    byMonth[monthKey] = (byMonth[monthKey] ?? 0) + 1;
  }

  return Response.json({
    total: reservations.length,
    upcoming: upcoming.length,
    completed: completed.length,
    cancelled: cancelled.length,
    noShow: noShow.length,
    byPartner,
    byActivity,
    byDay,
    byWeek,
    byMonth,
  });
}
