const PLAN_DEFINITIONS = {
  free: {
    id: "free",
    name: "Free",
    amount: 0,
    credits: 15,
    cycle: "none",
  },
  pro: {
    id: "pro",
    name: "Pro",
    amount: 67,
    credits: 500,
    cycle: "monthly",
  },
  annual: {
    id: "annual",
    name: "Anual",
    amount: 247,
    credits: 500,
    cycle: "yearly",
  },
};

const CREDIT_PACK = {
  creditsPerPack: 50,
  pricePerPack: 27,
  minQuantity: 1,
  maxQuantity: 10,
};

const DEFAULT_PAYMENT_METHOD = "pix";

module.exports = {
  PLAN_DEFINITIONS,
  CREDIT_PACK,
  DEFAULT_PAYMENT_METHOD,
};
