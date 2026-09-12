import {
  DEFAULT_INSURANCE_AMOUNT,
  GST_PERCENT,
} from "../constants/booking.constants.js";
import { getEffectivePricePerDay } from "../selfDrive/rental.util.js";

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
  insuranceSelected = false,
  homeDeliverySelected = false,
  coupon = null,
}) => {
  const pricePerDay = getEffectivePricePerDay(car);
  const baseRentalAmount = roundMoney(rentalDays * pricePerDay);
  const insuranceAmount = insuranceSelected ? DEFAULT_INSURANCE_AMOUNT : 0;
  const deliveryAmount =
    homeDeliverySelected && car.home_delivery_available
      ? Number(car.home_delivery_charge ?? 0)
      : 0;

  const gstBase = baseRentalAmount + insuranceAmount + deliveryAmount;
  const gstAmount = roundMoney((gstBase * GST_PERCENT) / 100);
  const discountAmount = coupon
    ? calculateCouponDiscount(coupon, baseRentalAmount)
    : 0;

  const payableAmount = roundMoney(
    baseRentalAmount - discountAmount + insuranceAmount + deliveryAmount + gstAmount
  );

  return {
    rental_days: rentalDays,
    price_per_day: pricePerDay,
    base_rental_amount: baseRentalAmount,
    insurance_amount: insuranceAmount,
    delivery_amount: deliveryAmount,
    gst_percent: GST_PERCENT,
    gst_amount: gstAmount,
    discount_amount: discountAmount,
    payable_amount: payableAmount,
    security_deposit_amount: Number(car.refundable_deposit ?? 0),
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
