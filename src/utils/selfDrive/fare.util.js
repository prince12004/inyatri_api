import ApiError from "../ApiError.js";
import { getEffectivePricePerDay } from "./rental.util.js";

export const DEFAULT_BROWSE_RENTAL_DAYS = 1;

export const buildFarePreview = (car, rentalDays, { isEstimated = false } = {}) => {
  const pricePerDay = getEffectivePricePerDay(car);

  if (!pricePerDay) {
    throw new ApiError(400, "Car pricing is not configured");
  }

  const rentalTotal = Math.round(rentalDays * pricePerDay * 100) / 100;

  return {
    rental_days: rentalDays,
    price_per_day: pricePerDay,
    rental_total: rentalTotal,
    refundable_deposit: Number(car.refundable_deposit ?? 0),
    travelling_allowed_per_day: car.travelling_allowed_per_day,
    extra_charge_per_km: Number(car.extra_charge_per_km ?? 0),
    is_estimated: isEstimated,
  };
};
