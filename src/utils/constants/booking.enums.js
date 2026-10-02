export const BOOKING_STATUS = {
  PENDING_PAYMENT: 1,
  PAYMENT_PROCESSING: 2,
  PAYMENT_FAILED: 3,
  PAYMENT_CANCELLED: 4,
  CONFIRMED: 5,
  CANCELLED: 6,
};

export const BOOKING_STATUS_LABELS = {
  1: "pending_payment",
  2: "payment_processing",
  3: "payment_failed",
  4: "payment_cancelled",
  5: "confirmed",
  6: "cancelled",
};

export const PAYMENT_STATUS = {
  NOT_INITIATED: 1,
  INITIATED: 2,
  SUCCESS: 3,
  FAILED: 4,
  CANCELLED: 5,
  PARTIALLY_PAID: 6,
};

export const PAYMENT_STATUS_LABELS = {
  1: "not_initiated",
  2: "initiated",
  3: "success",
  4: "failed",
  5: "cancelled",
  6: "partially_paid",
};

export const PAYMENT_ATTEMPT_STATUS = {
  INITIATED: 2,
  SUCCESS: 3,
  FAILED: 4,
  CANCELLED: 5,
};

export const RENTAL_TYPES = {
  RENTAL: "rental",
  MONTHLY: "monthly",
};

export const PAYMENT_OPTIONS = {
  FULL: "full",
  PART: "part",
};

export const SUBSCRIPTION_PLANS = {
  PLAN_15_DAYS: "15_days",
  PLAN_1_MONTH: "1_month",
  PLAN_3_MONTHS: "3_months",
  PLAN_6_MONTHS: "6_months",
};
