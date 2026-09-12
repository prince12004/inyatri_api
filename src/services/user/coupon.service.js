import * as couponRepository from "../../repositories/admin/coupon.repository.js";
import * as bookingRepository from "../../repositories/user/booking.repository.js";
import ApiError from "../../utils/ApiError.js";
import { STATUS } from "../../utils/constants/car.enums.js";
import { calculateCouponDiscount } from "../../utils/booking/fareBreakdown.util.js";

const isCouponWithinValidity = (coupon, now = new Date()) => {
  const start = new Date(coupon.valid_from);
  const end = new Date(coupon.valid_to);
  return start <= now && end >= now;
};

const hasRemainingUsage = (coupon) => {
  if (!coupon.usage_limit || coupon.usage_limit <= 0) return true;
  return coupon.used_count < coupon.usage_limit;
};

export const validateCouponForUser = async ({
  code,
  userId,
  baseRentalAmount,
}) => {
  const coupon = await couponRepository.findActiveByCode(code);
  if (!coupon) {
    throw new ApiError(404, "Coupon not found or inactive");
  }

  if (!isCouponWithinValidity(coupon)) {
    throw new ApiError(400, "Coupon is expired or not yet active");
  }

  if (!hasRemainingUsage(coupon)) {
    throw new ApiError(400, "Coupon usage limit reached");
  }

  const existingUsage = await bookingRepository.findCouponUsageByUser(
    coupon.id,
    userId
  );
  if (existingUsage) {
    throw new ApiError(400, "Coupon already used by this user");
  }

  if (
    coupon.min_base_rental_amount !== null &&
    baseRentalAmount < Number(coupon.min_base_rental_amount)
  ) {
    throw new ApiError(
      400,
      `Minimum base rental amount for this coupon is ₹${Number(coupon.min_base_rental_amount)}`
    );
  }

  const discountAmount = calculateCouponDiscount(coupon, baseRentalAmount);

  return {
    coupon,
    discount_amount: discountAmount,
    message: discountAmount
      ? `You saved ₹${discountAmount} with ${coupon.code}`
      : "Coupon applied",
  };
};

export const listAvailableCoupons = async ({
  userId,
  baseRentalAmount,
}) => {
  const coupons = await couponRepository.findAvailableForUser({
    userId,
    baseRentalAmount,
  });

  const available = [];

  for (const coupon of coupons) {
    if (!hasRemainingUsage(coupon)) continue;

    const existingUsage = await bookingRepository.findCouponUsageByUser(
      coupon.id,
      userId
    );
    if (existingUsage) continue;

    if (
      coupon.min_base_rental_amount !== null &&
      baseRentalAmount < Number(coupon.min_base_rental_amount)
    ) {
      continue;
    }

    const discountAmount = calculateCouponDiscount(coupon, baseRentalAmount);

    available.push({
      id: coupon.id,
      code: coupon.code,
      title: coupon.title,
      description: coupon.description,
      discount_percent: Number(coupon.discount_percent),
      max_discount_amount:
        coupon.max_discount_amount !== null
          ? Number(coupon.max_discount_amount)
          : null,
      min_base_rental_amount:
        coupon.min_base_rental_amount !== null
          ? Number(coupon.min_base_rental_amount)
          : null,
      valid_from: coupon.valid_from,
      valid_to: coupon.valid_to,
      estimated_discount: discountAmount,
      is_applicable: true,
    });
  }

  return available;
};

export const getActiveCouponByCode = async (code) => {
  const coupon = await couponRepository.findActiveByCode(code);
  if (!coupon || coupon.status !== STATUS.ACTIVE) {
    return null;
  }
  return coupon;
};
