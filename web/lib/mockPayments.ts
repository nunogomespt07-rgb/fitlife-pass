/**
 * Mock subscription and payment data for the Pagamentos (Payments) demo.
 * No real payment processing.
 */

export type UserSubscription = {
  planName: string;
  monthlyPrice: number;
  creditsIncluded: number;
  renewalDate: string; // e.g. "01 Abril 2026"
  currency: string;
};

export type PaymentMethodType = "card" | "mbway" | "apple_pay" | "google_pay";

export type BasePaymentMethod = {
  id: string;
  type: PaymentMethodType;
  isDefault?: boolean;
};

export type CardPaymentMethod = BasePaymentMethod & {
  type: "card";
  brand: string;
  last4: string;
  expiry: string; // e.g. "06/27"
};

export type MbWayPaymentMethod = BasePaymentMethod & {
  type: "mbway";
  phone: string;
  label?: string;
};

export type ApplePayPaymentMethod = BasePaymentMethod & {
  type: "apple_pay";
  label?: string;
};

export type GooglePayPaymentMethod = BasePaymentMethod & {
  type: "google_pay";
  label?: string;
};

export type PaymentMethod =
  | CardPaymentMethod
  | MbWayPaymentMethod
  | ApplePayPaymentMethod
  | GooglePayPaymentMethod;

export type PaymentHistoryEntry = {
  id: string;
  date: string; // e.g. "01 Mar 2026"
  description: string;
  amount: number;
  currency: string;
  status: "completed" | "pending" | "refunded";
};

export type CreditPack = {
  id: string;
  credits: number;
  price: number;
  label: string;
};

export type SubscriptionPlan = {
  id: string;
  planName: string;
  monthlyPrice: number;
  creditsIncluded: number;
  benefits: string[];
  isPopular?: boolean;
  currency: string;
};

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "START",
    planName: "FitLife Start",
    monthlyPrice: 59,
    creditsIncluded: 50,
    currency: "€",
    benefits: [
      "50 créditos mensais incluídos",
      "Acesso a ginásios e estúdios parceiros",
      "Ideal para utilizadores regulares",
    ],
  },
  {
    id: "CORE",
    planName: "FitLife Core",
    monthlyPrice: 89,
    creditsIncluded: 100,
    currency: "€",
    isPopular: true,
    benefits: [
      "100 créditos mensais incluídos",
      "Acesso a todos os parceiros",
      "Melhor valor por crédito",
    ],
  },
  {
    id: "PRO",
    planName: "FitLife Pro",
    monthlyPrice: 129,
    creditsIncluded: 110,
    currency: "€",
    benefits: [
      "110 créditos mensais incluídos",
      "Acesso a todos os parceiros",
      "Reservas prioritárias",
      "Ideal para utilizadores muito ativos",
    ],
  },
];

/** Demo only — do NOT use as current user state. Use getStoredUser() for real plan/credits. */
export const CURRENT_PLAN_ID = "PRO";

/** Demo only — do NOT use for real user subscription. Use getStoredUser() for active plan. */
export const MOCK_SUBSCRIPTION: UserSubscription = {
  planName: "FitLife Pro",
  monthlyPrice: 129,
  creditsIncluded: 110,
  renewalDate: "01 Abril 2026",
  currency: "€",
};

export const MOCK_PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "pm-card-1",
    type: "card",
    brand: "Visa",
    last4: "4582",
    expiry: "06/27",
    isDefault: true,
  },
  {
    id: "pm-mbway-1",
    type: "mbway",
    phone: "+351912345678",
    label: "MB WAY",
    isDefault: false,
  },
  {
    id: "pm-apple-1",
    type: "apple_pay",
    label: "Apple Pay",
    isDefault: false,
  },
  {
    id: "pm-google-1",
    type: "google_pay",
    label: "Google Pay",
    isDefault: false,
  },
];

export const MOCK_CREDIT_PACKS: CreditPack[] = [
  { id: "pack-10", credits: 10, price: 10, label: "10 créditos" },
  { id: "pack-20", credits: 20, price: 18, label: "20 créditos" },
  { id: "pack-50", credits: 50, price: 40, label: "50 créditos" },
];
