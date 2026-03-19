const mongoose = require("mongoose");
const User = require("../models/User");
const CreditTransaction = require("../models/CreditTransaction");

const PLAN_CREDITS = {
  start: 50,
  core: 100,
  pro: 110,
};

const CREDIT_EXPIRY_DAYS = 30;

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function normalizePlan(raw) {
  const v = String(raw || "").trim().toLowerCase();
  return v === "start" || v === "core" || v === "pro" ? v : null;
}

async function ensureUser(userId, session) {
  const query = User.findById(userId);
  if (session) query.session(session);
  const user = await query;
  if (!user) throw new Error("USER_NOT_FOUND");
  return user;
}

async function computeAvailableCredits(userId, at = new Date(), session) {
  const now = new Date(at);
  const q = CreditTransaction.find({
    user: userId,
    expiresAt: { $ne: null, $gt: now },
    remaining: { $gt: 0 },
  });
  if (session) q.session(session);
  const lots = await q;
  return lots.reduce((sum, tx) => sum + (tx.remaining || 0), 0);
}

async function expireCreditsIfNeeded(userId, at = new Date(), session) {
  const now = new Date(at);
  const q = CreditTransaction.find({
    user: userId,
    expiresAt: { $ne: null, $lte: now },
    remaining: { $gt: 0 },
  });
  if (session) q.session(session);
  const expiredLots = await q;
  let expiredTotal = 0;
  for (const lot of expiredLots) {
    const rem = Math.max(0, Number(lot.remaining) || 0);
    if (rem <= 0) continue;
    lot.remaining = 0;
    if (session) await lot.save({ session }); else await lot.save();
    expiredTotal += rem;
  }
  if (expiredTotal > 0) {
    const user = await ensureUser(userId, session);
    user.credits = Math.max(0, (user.credits || 0) - expiredTotal);
    if (session) await user.save({ session }); else await user.save();
    const tx = new CreditTransaction({
      user: user._id,
      type: "EXPIRATION",
      amount: -expiredTotal,
      balanceAfter: user.credits,
      remaining: 0,
      expiresAt: null,
      description: "Expiração automática de créditos",
      meta: { expiredAt: now.toISOString() },
    });
    if (session) await tx.save({ session }); else await tx.save();
  }
}

async function grantCredits({
  userId,
  amount,
  type,
  relatedPlan = null,
  relatedBookingId = null,
  description,
  metadata = {},
  expiresInDays = CREDIT_EXPIRY_DAYS,
  session,
}) {
  const safeAmount = Math.max(0, Math.floor(Number(amount) || 0));
  if (safeAmount <= 0) throw new Error("INVALID_CREDIT_AMOUNT");
  const user = await ensureUser(userId, session);
  const expiresAt = addDays(new Date(), expiresInDays);
  user.credits = (user.credits || 0) + safeAmount;
  if (session) await user.save({ session }); else await user.save();
  const tx = new CreditTransaction({
    user: user._id,
    type,
    amount: safeAmount,
    balanceAfter: user.credits,
    remaining: safeAmount,
    expiresAt,
    relatedPlan,
    relatedBookingId,
    description,
    meta: metadata,
  });
  if (session) await tx.save({ session }); else await tx.save();
  return { user, tx };
}

async function debitCredits({
  userId,
  amount,
  relatedBookingId = null,
  description = "Débito de créditos por reserva",
  metadata = {},
  session,
}) {
  const safeAmount = Math.max(0, Math.floor(Number(amount) || 0));
  if (safeAmount <= 0) throw new Error("INVALID_DEBIT_AMOUNT");
  await expireCreditsIfNeeded(userId, new Date(), session);
  const user = await ensureUser(userId, session);
  const available = await computeAvailableCredits(userId, new Date(), session);
  if (available < safeAmount) throw new Error("INSUFFICIENT_CREDITS");

  let remainingToDebit = safeAmount;
  const lotsQ = CreditTransaction.find({
    user: user._id,
    expiresAt: { $gt: new Date() },
    remaining: { $gt: 0 },
  }).sort({ expiresAt: 1, createdAt: 1 });
  if (session) lotsQ.session(session);
  const lots = await lotsQ;
  for (const lot of lots) {
    if (remainingToDebit <= 0) break;
    const canUse = Math.min(remainingToDebit, Math.max(0, Number(lot.remaining) || 0));
    if (canUse <= 0) continue;
    lot.remaining = Math.max(0, (lot.remaining || 0) - canUse);
    if (session) await lot.save({ session }); else await lot.save();
    remainingToDebit -= canUse;
  }
  if (remainingToDebit > 0) throw new Error("LEDGER_DEBIT_MISMATCH");

  user.credits = Math.max(0, (user.credits || 0) - safeAmount);
  if (session) await user.save({ session }); else await user.save();
  const tx = new CreditTransaction({
    user: user._id,
    type: "BOOKING_DEBIT",
    amount: -safeAmount,
    balanceAfter: user.credits,
    remaining: 0,
    expiresAt: null,
    relatedBookingId,
    description,
    meta: metadata,
  });
  if (session) await tx.save({ session }); else await tx.save();
  return { user, tx };
}

async function applyPlan(userId, planRaw, session) {
  const plan = normalizePlan(planRaw);
  if (!plan) throw new Error("INVALID_PLAN");
  const planCredits = PLAN_CREDITS[plan];
  const now = new Date();
  await expireCreditsIfNeeded(userId, now, session);
  const user = await ensureUser(userId, session);
  user.plan = plan;
  user.planStatus = "active";
  user.planRenewAt = addDays(now, 30);
  if (session) await user.save({ session }); else await user.save();
  const granted = await grantCredits({
    userId: user._id,
    amount: planCredits,
    type: "PLAN_GRANT",
    relatedPlan: plan,
    description: `Créditos do plano ${plan}`,
    metadata: { plan },
    session,
  });
  return { user: granted.user, plan, grantedCredits: planCredits };
}

module.exports = {
  PLAN_CREDITS,
  normalizePlan,
  computeAvailableCredits,
  expireCreditsIfNeeded,
  grantCredits,
  debitCredits,
  applyPlan,
};

