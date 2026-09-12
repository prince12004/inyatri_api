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
};

export const PAYMENT_STATUS_LABELS = {
  1: "not_initiated",
  2: "initiated",
  3: "success",
  4: "failed",
  5: "cancelled",
};

export const PAYMENT_ATTEMPT_STATUS = {
  INITIATED: 2,
  SUCCESS: 3,
  FAILED: 4,
  CANCELLED: 5,
};
