import Joi from "joi";
import {
  BOOKING_STATUS,
} from "../../../utils/constants/booking.enums.js";
import { MIN_MONTHLY_RENTAL_DAYS } from "../../../utils/constants/booking.constants.js";

const bookingWindowFields = {
  car_id: Joi.number().integer().positive().required(),
  city_id: Joi.number().integer().positive().required(),
  rental_type: Joi.string().valid("rental", "monthly").optional(),
  type: Joi.string().valid("rental", "monthly").optional(),
  plan_type: Joi.string()
    .valid("15_days", "1_month", "3_months", "6_months", "custom")
    .optional()
    .allow(null, ""),
  payment_option: Joi.string().valid("full", "part").default("full"),
  pickup_at: Joi.date().iso().required(),
  drop_at: Joi.date().iso().required(),
  pickup_location: Joi.string().trim().max(300).required(),
  drop_location: Joi.string().trim().max(300).required(),
  insurance_selected: Joi.boolean().default(false),
  home_delivery_selected: Joi.boolean().default(false),
  coupon_code: Joi.string().trim().uppercase().max(50).optional().allow("", null),
};

const validateBookingWindow = (value, helpers) => {
  const pickup = new Date(value.pickup_at);
  const drop = new Date(value.drop_at);

  if (Number.isNaN(pickup.getTime()) || Number.isNaN(drop.getTime())) {
    return helpers.message("Pickup and drop must be valid date-time values");
  }

  if (drop <= pickup) {
    return helpers.message("Drop time must be after pickup time");
  }

  const rentalType = (value.rental_type || value.type || "rental").toLowerCase();
  value.rental_type = rentalType;

  if (rentalType === "monthly") {
    const diffHours = (drop.getTime() - pickup.getTime()) / (1000 * 60 * 60);
    const rentalDays = Math.ceil(diffHours / 24);
    if (rentalDays < MIN_MONTHLY_RENTAL_DAYS) {
      return helpers.message(
        `Minimum duration for monthly subscription is ${MIN_MONTHLY_RENTAL_DAYS} days`
      );
    }
  }

  return value;
};

export const bookingSummarySchema = Joi.object(bookingWindowFields).custom(
  validateBookingWindow
);

export const validateCouponSchema = Joi.object({
  code: Joi.string().trim().uppercase().max(50).required(),
  ...bookingWindowFields,
}).custom(validateBookingWindow);

export const checkoutSchema = Joi.object({
  ...bookingWindowFields,
  payment_option: Joi.string().valid("full", "part").default("full"),
}).custom(validateBookingWindow);

export const availableCouponsQuerySchema = Joi.object({
  car_id: Joi.number().integer().positive().required(),
  city_id: Joi.number().integer().positive().required(),
  rental_type: Joi.string().valid("rental", "monthly").optional(),
  type: Joi.string().valid("rental", "monthly").optional(),
  plan_type: Joi.string()
    .valid("15_days", "1_month", "3_months", "6_months", "custom")
    .optional(),
  pickup_at: Joi.date().iso().required(),
  drop_at: Joi.date().iso().required(),
  insurance_selected: Joi.boolean().default(false),
  home_delivery_selected: Joi.boolean().default(false),
}).custom(validateBookingWindow);

export const listBookingsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(20),
  booking_status: Joi.number()
    .valid(...Object.values(BOOKING_STATUS))
    .optional(),
});

export const checkoutQuerySchema = Joi.object({
  auto_redirect: Joi.boolean().truthy("true").falsy("false").default(false),
});

export const bookingIdParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

export default {
  bookingSummarySchema,
  validateCouponSchema,
  checkoutSchema,
  checkoutQuerySchema,
  availableCouponsQuerySchema,
  listBookingsQuerySchema,
  bookingIdParamSchema,
};
