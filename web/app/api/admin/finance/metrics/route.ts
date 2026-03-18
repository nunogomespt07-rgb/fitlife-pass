import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/adminApiAuth";
import { readCustomerState, readReservations } from "@/lib/adminDataServer";
import {
  revenueFromCredits,
  platformRevenueFromTotal,
  partnerPayoutFromTotal,
  CREDIT_PACKS,
} from "@/lib/adminFinanceConfig";

export async function GET(req: NextRequest) {
  const unauth = requireAdmin(req);
  if (unauth) return unauth;

  const { searchParams } = req.nextUrl;
  const period = searchParams.get("period") ?? "month";
  const dateFrom = searchParams.get("dateFrom") ?? "";
  const dateTo = searchParams.get("dateTo") ?? "";

  const store = await readCustomerState();
  const reservations = await readReservations();

  const now = new Date();
  let filterFrom = "";
  let filterTo = "";
  if (period === "today") {
    filterFrom = now.toISOString().slice(0, 10);
    filterTo = filterFrom;
  } else if (period === "yesterday") {
    const y = new Date(now);
    y.setDate(y.getDate() - 1);
    filterFrom = y.toISOString().slice(0, 10);
    filterTo = filterFrom;
  } else if (period === "week") {
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay());
    filterFrom = start.toISOString().slice(0, 10);
    filterTo = now.toISOString().slice(0, 10);
  } else if (period === "month") {
    filterFrom = now.toISOString().slice(0, 7) + "-01";
    filterTo = now.toISOString().slice(0, 10);
  } else if (dateFrom && dateTo) {
    filterFrom = dateFrom;
    filterTo = dateTo;
  }

  const keys = Object.keys(store).filter((k) => k.startsWith("u:"));
  let totalCreditsSold = 0;
  let totalRevenue = 0;
  const byPartner: Record<string, { credits: number; revenue: number }> = {};
  const byPlan: Record<string, number> = {};

  for (const key of keys) {
    const state = store[key] ?? {};
    const credits = typeof state.purchasedCredits === "number" ? state.purchasedCredits : 0;
    totalCreditsSold += credits;
    const rev = revenueFromCredits(credits);
    totalRevenue += rev;
    const plan = state.subscriptionPlanName ?? state.subscriptionPlanId ?? "none";
    byPlan[plan] = (byPlan[plan] ?? 0) + 1;
  }

  let creditsConsumed = 0;
  for (const r of reservations) {
    if (r.status === "completed" || r.status === "confirmed") {
      creditsConsumed += r.creditsUsed ?? 0;
    }
  }

  const platformRevenue = platformRevenueFromTotal(totalRevenue);
  const partnerPayoutTotal = partnerPayoutFromTotal(totalRevenue);
  const userCount = keys.length;
  const avgRevenuePerUser = userCount > 0 ? totalRevenue / userCount : 0;
  const purchaseCount = keys.filter((k) => (store[k]?.purchasedCredits ?? 0) > 0).length;
  const avgCreditsPerPurchase = purchaseCount > 0 ? totalCreditsSold / purchaseCount : 0;

  for (const r of reservations) {
    if (filterFrom && r.date < filterFrom) continue;
    if (filterTo && r.date > filterTo) continue;
    const cred = r.creditsUsed ?? 0;
    const rev = revenueFromCredits(cred);
    if (!byPartner[r.partnerId]) byPartner[r.partnerId] = { credits: 0, revenue: 0 };
    byPartner[r.partnerId].credits += cred;
    byPartner[r.partnerId].revenue += rev;
  }

  const creditsRemainingLiability = Math.max(0, totalCreditsSold - creditsConsumed);
  const valuePerCredit = CREDIT_PACKS.reduce((s, p) => s + p.price / p.credits, 0) / CREDIT_PACKS.length;

  return Response.json({
    totalRevenue,
    platformRevenue,
    partnerPayoutTotal,
    creditsSold: totalCreditsSold,
    creditsConsumed,
    creditsRemainingLiability,
    averageRevenuePerUser: Math.round(avgRevenuePerUser * 100) / 100,
    averageCreditsPerPurchase: Math.round(avgCreditsPerPurchase * 100) / 100,
    valuePerCredit: Math.round(valuePerCredit * 100) / 100,
    byPartner,
    byPlan,
    period: period || (dateFrom && dateTo ? "custom" : "all"),
    dateFrom: filterFrom || null,
    dateTo: filterTo || null,
  });
}
