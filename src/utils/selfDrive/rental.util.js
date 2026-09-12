import ApiError from "../ApiError.js";

const MS_PER_HOUR = 1000 * 60 * 60;

export const DEFAULT_BROWSE_RENTAL_DAYS = 1;

export const parseRentalDate = (value, fieldLabel) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new ApiError(400, `${fieldLabel} must be a valid date-time`);
  }

  return date;
};

export const validateRentalWindow = (pickupAt, dropAt) => {
  const pickup = parseRentalDate(pickupAt, "Pickup time");
  const drop = parseRentalDate(dropAt, "Drop time");

  if (drop <= pickup) {
    throw new ApiError(400, "Drop time must be after pickup time");
  }

  const minDurationMs = MS_PER_HOUR;
  if (drop.getTime() - pickup.getTime() < minDurationMs) {
    throw new ApiError(400, "Minimum rental duration is 1 hour");
  }

  const now = Date.now();
  if (pickup.getTime() < now - 5 * 60 * 1000) {
    throw new ApiError(400, "Pickup time cannot be in the past");
  }

  return { pickup, drop };
};

/** Partial calendar days count as full rental days (self-drive standard). */
export const calculateRentalDays = (pickupAt, dropAt) => {
  const { pickup, drop } = validateRentalWindow(pickupAt, dropAt);
  const diffHours = (drop.getTime() - pickup.getTime()) / MS_PER_HOUR;
  return Math.max(1, Math.ceil(diffHours / 24));
};

export const getEffectivePricePerDay = (car) => {
  if (car.price_per_day !== null && car.price_per_day !== undefined) {
    const daily = Number(car.price_per_day);
    if (daily > 0) return daily;
  }

  if (car.price_per_hour !== null && car.price_per_hour !== undefined) {
    const hourly = Number(car.price_per_hour);
    if (hourly > 0) return Math.round(hourly * 24 * 100) / 100;
  }

  return null;
};

export const resolveRentalMode = (input = {}) => {
  const hasPickup = input.pickup_at !== undefined && input.pickup_at !== null && input.pickup_at !== "";
  const hasDrop = input.drop_at !== undefined && input.drop_at !== null && input.drop_at !== "";
  const hasCity = input.city_id !== undefined && input.city_id !== null && input.city_id !== "";

  if (hasPickup || hasDrop) {
    if (!hasPickup || !hasDrop || !hasCity) {
      throw new ApiError(
        400,
        "city_id, pickup_at and drop_at are required together when searching cars"
      );
    }

    return {
      mode: "find",
      city_id: Number(input.city_id),
      pickup_at: input.pickup_at,
      drop_at: input.drop_at,
      rental_days: calculateRentalDays(input.pickup_at, input.drop_at),
      is_estimated: false,
    };
  }

  return {
    mode: "browse",
    city_id: hasCity ? Number(input.city_id) : null,
    pickup_at: null,
    drop_at: null,
    rental_days: DEFAULT_BROWSE_RENTAL_DAYS,
    is_estimated: true,
  };
};

export const resolveBrowseMode = (input = {}) => {
  const hasCity = input.city_id !== undefined && input.city_id !== null && input.city_id !== "";

  return {
    mode: "browse",
    city_id: hasCity ? Number(input.city_id) : null,
    pickup_at: null,
    drop_at: null,
    rental_days: DEFAULT_BROWSE_RENTAL_DAYS,
    is_estimated: true,
  };
};
