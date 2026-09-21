import {
  DEFAULT_INSURANCE_AMOUNT,
  DEFAULT_PART_PAYMENT_PERCENT,
  GST_PERCENT,
} from "../constants/booking.constants.js";
import { getEffectivePricePerDay } from "../selfDrive/rental.util.js";
import { resolveMonthlyDiscountPercent } from "../selfDrive/fare.util.js";

const roundMoney = (value) => Math.round(Number(value) * 100) / 100;

export const calculateCouponDiscount = (
  coupon,
  baseRentalAmount
) => {
  if (!coupon) return 0;

  const rawDiscount = roundMoney(
    (baseRentalAmount * Number(coupon.discount_percent)) / 100
  );

  if (
    coupon.max_discount_amount !== null &&
    coupon.max_discount_amount !== undefined
  ) {
    return Math.min(rawDiscount, Number(coupon.max_discount_amount));
  }

  return rawDiscount;
};

export const buildBookingFareBreakdown = ({
  car,
  rentalDays,
  rentalType = "rental",
  planType = null,
  insuranceSelected = false,
  homeDeliverySelected = false,
  coupon = null,
}) => {
  const isMonthly = rentalType === "monthly";
  const pricePerDay = getEffectivePricePerDay(car);
  const baseRentalAmount = roundMoney(rentalDays * pricePerDay);

  const planDiscountPercent = isMonthly
    ? resolveMonthlyDiscountPercent(car, rentalDays, planType)
    : 0;
  const planDiscountAmount = isMonthly
    ? roundMoney((baseRentalAmount * planDiscountPercent) / 100)
    : 0;

  const tripFare = roundMoney(baseRentalAmount - planDiscountAmount);

  const insuranceAmount = insuranceSelected ? DEFAULT_INSURANCE_AMOUNT : 0;
  const deliveryAmount =
    homeDeliverySelected && car.home_delivery_available
      ? Number(car.home_delivery_charge ?? 0)
      : 0;

  const discountableAmount = tripFare;
  const discountAmount = coupon
    ? calculateCouponDiscount(coupon, discountableAmount)
    : 0;

  const gstBase = roundMoney(
    tripFare - discountAmount + insuranceAmount + deliveryAmount
  );
  const gstAmount = roundMoney((gstBase * GST_PERCENT) / 100);

  const securityDepositAmount = Number(car.refundable_deposit ?? 0);

  const totalAmount = roundMoney(
    gstBase + gstAmount + securityDepositAmount
  );

  const partPaymentAmount = roundMoney(
    (totalAmount * DEFAULT_PART_PAYMENT_PERCENT) / 100
  );
  const remainingAmountOnPickup = roundMoney(totalAmount - partPaymentAmount);

  return {
    rental_type: rentalType,
    plan_type: isMonthly ? (planType || "custom") : null,
    rental_days: rentalDays,
    price_per_day: pricePerDay,
    base_rental_amount: baseRentalAmount,
    plan_discount_percent: planDiscountPercent,
    plan_discount_amount: planDiscountAmount,
    trip_fare: tripFare,
    insurance_amount: insuranceAmount,
    delivery_amount: deliveryAmount,
    gst_percent: GST_PERCENT,
    gst_amount: gstAmount,
    discount_amount: discountAmount,
    security_deposit_amount: securityDepositAmount,
    total_amount: totalAmount,
    payable_amount: totalAmount,
    payment_options: {
      full_payment: {
        payment_option: "full",
        amount: totalAmount,
        label: "Make full payment now",
      },
      part_payment: {
        payment_option: "part",
        allowed: true,
        percentage: DEFAULT_PART_PAYMENT_PERCENT,
        amount: partPaymentAmount,
        remaining_amount: remainingAmountOnPickup,
        label: "Make part payment now",
        sub_label: "Pay remaining on pickup",
      },
    },
    coupon: coupon
      ? {
          id: coupon.id,
          code: coupon.code,
          title: coupon.title,
          discount_percent: Number(coupon.discount_percent),
          max_discount_amount:
            coupon.max_discount_amount !== null
              ? Number(coupon.max_discount_amount)
              : null,
        }
      : null,
  };
};
