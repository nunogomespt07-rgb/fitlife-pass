const express = require("express");
const router = express.Router();
const { stripe } = require("../lib/stripe");
const User = require("../models/User");
const Subscription = require("../models/Subscription");
const CreditTransaction = require("../models/CreditTransaction");

if (!process.env.NEXT_PUBLIC_APP_URL) {
  console.warn("[stripe] NEXT_PUBLIC_APP_URL is not set – checkout URLs will be incorrect.");
}

// Simple auth middleware reusing JWT logic from other routes
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/create-checkout-session", authMiddleware, async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({ message: "Stripe não está configurado." });
    }

    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilizador não encontrado" });
    }

    const priceId = process.env.STRIPE_PRICE_ID_PRO;
    if (!priceId) {
      return res.status(500).json({ message: "Preço Stripe não configurado." });
    }

    const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || "").replace(/\/$/, "");
    const successUrl = `${baseUrl}/dashboard?checkout=success`;
    const cancelUrl = `${baseUrl}/dashboard/pagamentos?checkout=cancel`;

    const customer = await stripe.customers.create({
      email: user.email,
      metadata: {
        app_user_id: user._id.toString(),
      },
    });

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer: customer.id,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        app_user_id: user._id.toString(),
      },
    });

    return res.json({ id: session.id });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return res.status(500).json({ message: "Erro ao criar sessão de pagamento" });
  }
});

router.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !webhookSecret) {
    console.warn("[stripe] Webhook called but Stripe/Webhook secret not configured.");
    return res.status(200).send("ok");
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error("Stripe webhook signature error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const appUserId = session.metadata?.app_user_id;
        const subscriptionId = session.subscription;
        const customerId = session.customer;

        if (appUserId && subscriptionId && customerId) {
          await handleSubscriptionActivated(appUserId, customerId, subscriptionId);
        }
        break;
      }
      case "invoice.paid": {
        const invoice = event.data.object;
        const subscriptionId = invoice.subscription;
        if (subscriptionId) {
          await handleInvoicePaid(subscriptionId);
        }
        break;
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object;
        const subscriptionId = invoice.subscription;
        if (subscriptionId) {
          await handleInvoiceFailed(subscriptionId);
        }
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const subscriptionId = subscription.id;
        if (subscriptionId) {
          await handleSubscriptionCancelled(subscriptionId);
        }
        break;
      }
      default:
        break;
    }

    res.json({ received: true });
  } catch (err) {
    console.error("Stripe webhook handler error:", err);
    res.status(500).send("Webhook handler error");
  }
});

async function handleSubscriptionActivated(appUserId, stripeCustomerId, stripeSubscriptionId) {
  const PLAN_CREDITS = 40; // PRO plan default for MVP
  const now = new Date();
  const end = new Date(now);
  end.setMonth(end.getMonth() + 1);

  const session = await User.startSession();
  session.startTransaction();

  try {
    const user = await User.findById(appUserId).session(session);
    if (!user) {
      throw new Error("User not found in webhook activation");
    }

    user.stripeCustomerId = stripeCustomerId;
    user.stripeSubscriptionId = stripeSubscriptionId;
    user.plan = "PRO";
    user.planStatus = "active";
    user.planRenewAt = end;
    user.credits = (user.credits || 0) + PLAN_CREDITS;
    await user.save({ session });

    await Subscription.findOneAndUpdate(
      { user: user._id },
      {
        user: user._id,
        plan: "PRO",
        status: "active",
        creditsPerPeriod: PLAN_CREDITS,
        currentPeriodStart: now,
        currentPeriodEnd: end,
        stripeSubscriptionId,
        stripeCustomerId,
      },
      { upsert: true, new: true, session }
    );

    await CreditTransaction.create(
      [
        {
          user: user._id,
          type: "subscription",
          amount: PLAN_CREDITS,
          balanceAfter: user.credits,
          description: "Ativação plano PRO via Stripe",
          meta: { source: "stripe", stripeSubscriptionId, stripeCustomerId },
        },
      ],
      { session }
    );

    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
}

async function handleInvoicePaid(stripeSubscriptionId) {
  const PLAN_CREDITS = 40;
  const now = new Date();
  const end = new Date(now);
  end.setMonth(end.getMonth() + 1);

  const session = await User.startSession();
  session.startTransaction();

  try {
    const subscription = await Subscription.findOne({ stripeSubscriptionId }).session(session);
    if (!subscription) {
      throw new Error("Subscription not found for invoice.paid");
    }

    const user = await User.findById(subscription.user).session(session);
    if (!user) {
      throw new Error("User not found for invoice.paid");
    }

    user.planStatus = "active";
    user.planRenewAt = end;
    user.credits = (user.credits || 0) + PLAN_CREDITS;
    await user.save({ session });

    subscription.status = "active";
    subscription.currentPeriodStart = now;
    subscription.currentPeriodEnd = end;
    subscription.creditsPerPeriod = PLAN_CREDITS;
    await subscription.save({ session });

    await CreditTransaction.create(
      [
        {
          user: user._id,
          type: "subscription",
          amount: PLAN_CREDITS,
          balanceAfter: user.credits,
          description: "Renovação plano PRO via Stripe",
          meta: { source: "stripe", stripeSubscriptionId },
        },
      ],
      { session }
    );

    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
}

async function handleInvoiceFailed(stripeSubscriptionId) {
  const subscription = await Subscription.findOne({ stripeSubscriptionId });
  if (!subscription) return;

  const user = await User.findById(subscription.user);
  if (!user) return;

  user.planStatus = "canceled";
  await user.save();

  subscription.status = "past_due";
  await subscription.save();
}

async function handleSubscriptionCancelled(stripeSubscriptionId) {
  const subscription = await Subscription.findOne({ stripeSubscriptionId });
  if (!subscription) return;

  const user = await User.findById(subscription.user);
  if (!user) return;

  user.planStatus = "canceled";
  await user.save();

  subscription.status = "cancelled";
  await subscription.save();
}

module.exports = router;

