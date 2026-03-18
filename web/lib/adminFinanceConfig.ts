/**
 * Centralized admin-level finance/payout configuration.
 * Used by admin finance metrics and partner payout estimates.
 */

/** Platform share of revenue (0–1). Remainder is partner share. */
export const PLATFORM_SHARE = 0.2;

/** Partner share of revenue (0–1). */
export const PARTNER_SHARE = 1 - PLATFORM_SHARE;

/** Cost per credit (€) for platform. */
export const COST_PER_CREDIT = 0.5;

/** Revenue per credit sold (€) — average. */
export const REVENUE_PER_CREDIT = 1.0;

/** Credit packs for revenue calculation (id, credits, price). */
export const CREDIT_PACKS = [
  { id: "pack-10", credits: 10, price: 10 },
  { id: "pack-20", credits: 20, price: 18 },
  { id: "pack-50", credits: 50, price: 40 },
] as const;

export function revenueFromCredits(credits: number): number {
  if (credits <= 0) return 0;
  const avgPricePerCredit = CREDIT_PACKS.reduce((s, p) => s + p.price / p.credits, 0) / CREDIT_PACKS.length;
  return credits * avgPricePerCredit;
}

export function platformRevenueFromTotal(totalRevenue: number): number {
  return totalRevenue * PLATFORM_SHARE;
}

export function partnerPayoutFromTotal(totalRevenue: number): number {
  return totalRevenue * PARTNER_SHARE;
}
