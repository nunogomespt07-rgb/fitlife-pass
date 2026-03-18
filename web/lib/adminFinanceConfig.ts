/**
 * Centralized admin-level finance: credit economics and payout.
 * Single source of truth for revenue, cost, and margin.
 */

/** Preço por crédito (€) — receita por cada crédito consumido. */
export const PRICE_PER_CREDIT = 1.0;

/** Custo por crédito (€) pago ao parceiro. Margem plataforma = receita - custo. */
export const COST_PER_CREDIT = 0.5;

/** Platform share of revenue (0–1). Alternative to cost-based margin. */
export const PLATFORM_SHARE = 0.2;

/** Partner share of revenue (0–1). */
export const PARTNER_SHARE = 1 - PLATFORM_SHARE;

/** Credit packs for display / average price. */
export const CREDIT_PACKS = [
  { id: "pack-10", credits: 10, price: 10 },
  { id: "pack-20", credits: 20, price: 18 },
  { id: "pack-50", credits: 50, price: 40 },
] as const;

/** Receita total = créditos consumidos × preço por crédito. */
export function revenueFromCreditsConsumed(creditsConsumed: number): number {
  return creditsConsumed * PRICE_PER_CREDIT;
}

/** Custo parceiros = créditos consumidos × custo por crédito. */
export function partnerCostFromCreditsConsumed(creditsConsumed: number): number {
  return creditsConsumed * COST_PER_CREDIT;
}

/** Margem plataforma = receita - custo parceiros. */
export function platformMargin(revenue: number, partnerCost: number): number {
  return revenue - partnerCost;
}

/** Legacy: revenue from credits sold (for customer-state-based totals). */
export function revenueFromCredits(credits: number): number {
  if (credits <= 0) return 0;
  const avg = CREDIT_PACKS.reduce((s, p) => s + p.price / p.credits, 0) / CREDIT_PACKS.length;
  return credits * avg;
}

export function platformRevenueFromTotal(totalRevenue: number): number {
  return totalRevenue * PLATFORM_SHARE;
}

export function partnerPayoutFromTotal(totalRevenue: number): number {
  return totalRevenue * PARTNER_SHARE;
}
