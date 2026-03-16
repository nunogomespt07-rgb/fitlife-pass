const Stripe = require("stripe");

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn("[stripe] STRIPE_SECRET_KEY is not set – Stripe will be disabled.");
}

const stripe =
  process.env.STRIPE_SECRET_KEY
    ? new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: "2025-01-27.acacia",
      })
    : null;

module.exports = {
  stripe,
};

