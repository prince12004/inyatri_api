import ApiError from "../ApiError.js";
import { getEffectivePricePerDay } from "./rental.util.js";
import {
  DEFAULT_PART_PAYMENT_PERCENT,
  SUBSCRIPTION_PLAN_DAYS,
} from "../constants/booking.constants.js";

export const DEFAULT_BROWSE_RENTAL_DAYS = 1;

const roundMoney = (val) => Math.round(Number(val) * 100) / 100;

export const resolveMonthlyDiscountPercent = (car, rentalDays, planType = null) => {
  if (planType) {
    if (planType === "15_days") return Number(car.discount_15_days ?? 0);
    if (planType === "1_month") return Number(car.discount_1_month ?? 0);
    if (planType === "3_months") return Number(car.discount_3_months ?? 0);
    if (planType === "6_months") return Number(car.discount_6_months ?? 0);
  }

  if (rentalDays >= 180) return Number(car.discount_6_months ?? 0);
  if (rentalDays >= 90) return Number(car.discount_3_months ?? 0);
  if (rentalDays >= 30) return Number(car.discount_1_month ?? 0);
  if (rentalDays >= 15) return Number(car.discount_15_days ?? 0);
  return 0;
};

export const buildMonthlyPlansPreview = (car) => {
  const pricePerDay = getEffectivePricePerDay(car);
  if (!pricePerDay) return null;

  const kmPerDay = Number(car.travelling_allowed_per_day || 250);
  const refundableDeposit = Number(car.refundable_deposit ?? 0);

  const plans = [
    {
      key: "15_days",
      label: "15 Days",
      duration_days: SUBSCRIPTION_PLAN_DAYS["15_days"],
      discount_percent: Number(car.discount_15_days ?? 0),
    },
    {
      key: "1_month",
      label: "1 Month",
      duration_days: SUBSCRIPTION_PLAN_DAYS["1_month"],
      discount_percent: Number(car.discount_1_month ?? 0),
    },
    {
      key: "3_months",
      label: "3 Months",
      duration_days: SUBSCRIPTION_PLAN_DAYS["3_months"],
      discount_percent: Number(car.discount_3_months ?? 0),
    },
    {
      key: "6_months",
      label: "6 Months",
      duration_days: SUBSCRIPTION_PLAN_DAYS["6_months"],
      discount_percent: Number(car.discount_6_months ?? 0),
    },
  ];

  return plans.map((plan) => {
    const originalFare = roundMoney(plan.duration_days * pricePerDay);
    const discountAmount = roundMoney((originalFare * plan.discount_percent) / 100);
    const tripFare = roundMoney(originalFare - discountAmount);
    const totalAmount = roundMoney(tripFare + refundableDeposit);
    const partPaymentAmount = roundMoney((totalAmount * DEFAULT_PART_PAYMENT_PERCENT) / 100);

    return {
      plan_key: plan.key,
      label: plan.label,
      duration_days: plan.duration_days,
      discount_percent: plan.discount_percent,
      price_per_day: pricePerDay,
      original_fare: originalFare,
      discount_amount: discountAmount,
      trip_fare: tripFare,
      security_deposit: refundableDeposit,
      total_amount: totalAmount,
      km_allowed: kmPerDay * plan.duration_days,
      part_payment: {
        percentage: DEFAULT_PART_PAYMENT_PERCENT,
        amount: partPaymentAmount,
        remaining_amount: roundMoney(totalAmount - partPaymentAmount),
      },
      effective_daily_rate: roundMoney(tripFare / plan.duration_days),
    };
  });
};

export const buildFarePreview = (
  car,
  rentalDays,
  { isEstimated = false, rentalType = "rental", planType = null } = {}
) => {
  const pricePerDay = getEffectivePricePerDay(car);

  if (!pricePerDay) {
    throw new ApiError(400, "Car pricing is not configured");
  }

  const isMonthly = rentalType === "monthly";
  const discountPercent = isMonthly
    ? resolveMonthlyDiscountPercent(car, rentalDays, planType)
    : 0;

  const baseRentalAmount = roundMoney(rentalDays * pricePerDay);
  const planDiscountAmount = isMonthly
    ? roundMoney((baseRentalAmount * discountPercent) / 100)
    : 0;
  const rentalTotal = roundMoney(baseRentalAmount - planDiscountAmount);
  const refundableDeposit = Number(car.refundable_deposit ?? 0);
  const estimatedTotal = roundMoney(rentalTotal + refundableDeposit);
  const partPaymentAmount = roundMoney((estimatedTotal * DEFAULT_PART_PAYMENT_PERCENT) / 100);

  const preview = {
    rental_type: rentalType,
    rental_days: rentalDays,
    price_per_day: pricePerDay,
    base_rental_amount: baseRentalAmount,
    refundable_deposit: refundableDeposit,
    travelling_allowed_per_day: car.travelling_allowed_per_day,
    extra_charge_per_km: Number(car.extra_charge_per_km ?? 0),
    is_estimated: isEstimated,
    estimated_total: estimatedTotal,
    payment_preview: {
      part_payment_percent: DEFAULT_PART_PAYMENT_PERCENT,
      part_payment_amount: partPaymentAmount,
      remaining_amount: roundMoney(estimatedTotal - partPaymentAmount),
      full_payment_amount: estimatedTotal,
    },
  };

  if (isMonthly) {
    preview.plan_discount_percent = discountPercent;
    preview.plan_discount_amount = planDiscountAmount;
    preview.trip_fare = rentalTotal;
    preview.rental_total = rentalTotal;
    preview.subscription_plans = buildMonthlyPlansPreview(car);
  } else {
    preview.rental_total = baseRentalAmount;
  }

  return preview;
};
