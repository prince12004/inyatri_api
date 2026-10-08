import {
  MIN_MONTHLY_RENTAL_DAYS,
  SUBSCRIPTION_PLAN_DAYS,
  USER_SUBSCRIPTION_PLAN_TYPES,
} from "../constants/booking.constants.js";

export { USER_SUBSCRIPTION_PLAN_TYPES };

export const DEFAULT_USER_PLAN_TYPE = "1_month";

/** Fixed monthly plans exposed to users (minimum 1 month). */
export const isFixedUserPlanType = (planType) =>
  USER_SUBSCRIPTION_PLAN_TYPES.includes(planType);

export const normalizeUserPlanType = (rawPlanType, { rentalType = "rental" } = {}) => {
  if (rentalType !== "monthly") {
    return null;
  }

  const normalized =
    rawPlanType === undefined || rawPlanType === null || rawPlanType === ""
      ? DEFAULT_USER_PLAN_TYPE
      : String(rawPlanType).toLowerCase();

  if (normalized === "custom") {
    return "custom";
  }

  if (isFixedUserPlanType(normalized)) {
    return normalized;
  }

  return DEFAULT_USER_PLAN_TYPE;
};

/**
 * For fixed plans, pricing duration comes from the plan catalog.
 * For custom / date-only monthly, use computed calendar days (min 1 month).
 */
export const resolveMonthlyRentalDaysForPricing = (planType, daysFromDates) => {
  const safeDays = Math.max(Number(daysFromDates) || 0, MIN_MONTHLY_RENTAL_DAYS);

  if (planType && isFixedUserPlanType(planType)) {
    return SUBSCRIPTION_PLAN_DAYS[planType];
  }

  return safeDays;
};
