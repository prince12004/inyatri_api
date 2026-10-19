import Joi from "joi";
import { CAB_TRIP_TYPE_LIST, CAB_TRIP_TYPES } from "../../../utils/constants/cab.enums.js";

const mobileRegex = /^[6-9]\d{9}$/;

// ─── Search ────────────────────────────────────────────────────────────────

export const searchCabSchema = Joi.object({
  trip_type: Joi.string()
    .valid(...CAB_TRIP_TYPE_LIST)
    .required(),
  city_id: Joi.number().integer().positive().optional().allow(null),
  pickup_location: Joi.string().trim().max(300).required(),
  drop_location: Joi.string().trim().max(300).optional().allow(null, ""),
  stops: Joi.array().items(Joi.string().trim().max(300)).max(5).optional().default([]),
  distance_km: Joi.number().positive().optional().allow(null),
  departure_at: Joi.date().iso().required(),
  return_at: Joi.date().iso().optional().allow(null),
  package_id: Joi.number().integer().positive().optional().allow(null),
  contact_number: Joi.string().pattern(mobileRegex).optional(),
}).custom((value, helpers) => {
  if (value.trip_type === CAB_TRIP_TYPES.LOCAL) {
    if (!value.package_id) {
      return helpers.message("package_id is required for local trip type");
    }
  } else {
    if (!value.drop_location) {
      return helpers.message("drop_location is required for one_way and round_trip");
    }
    if (value.distance_km === undefined || value.distance_km === null || value.distance_km <= 0) {
      return helpers.message("distance_km is required and must be greater than 0");
    }
  }

  if (value.trip_type === CAB_TRIP_TYPES.ROUND_TRIP && !value.return_at) {
    return helpers.message("return_at is required for round_trip");
  }

  return value;
});

// ─── Car Listing ───────────────────────────────────────────────────────────

export const listCabCarsQuerySchema = Joi.object({
  trip_type: Joi.string()
    .valid(...CAB_TRIP_TYPE_LIST)
    .required(),
  city_id: Joi.number().integer().positive().optional(),
  package_id: Joi.number().integer().positive().optional(),
  distance_km: Joi.number().positive().optional(),
  pickup_location: Joi.string().trim().max(300).optional(),
  drop_location: Joi.string().trim().max(300).optional(),
  departure_at: Joi.date().iso().optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});

// ─── Car Detail ────────────────────────────────────────────────────────────

export const cabCarIdParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

export const cabCarDetailQuerySchema = Joi.object({
  trip_type: Joi.string()
    .valid(...CAB_TRIP_TYPE_LIST)
    .required(),
  city_id: Joi.number().integer().positive().optional(),
  package_id: Joi.number().integer().positive().optional(),
  distance_km: Joi.number().positive().optional(),
});

// ─── Booking Summary & Checkout ───────────────────────────────────────────

export const cabBookingSummarySchema = Joi.object({
  car_id: Joi.number().integer().positive().required(),
  trip_type: Joi.string()
    .valid(...CAB_TRIP_TYPE_LIST)
    .required(),
  city_id: Joi.number().integer().positive().optional().allow(null),
  package_id: Joi.number().integer().positive().optional().allow(null),
  pickup_location: Joi.string().trim().max(300).required(),
  drop_location: Joi.string().trim().max(300).optional().allow(null, ""),
  stops: Joi.array().items(Joi.string().trim().max(300)).max(5).optional().default([]),
  distance_km: Joi.number().positive().optional().allow(null),
  departure_at: Joi.date().iso().required(),
  return_at: Joi.date().iso().optional().allow(null),
  contact_number: Joi.string().pattern(mobileRegex).required().messages({
    "string.pattern.base": "contact_number must be a valid 10-digit Indian mobile number",
  }),
  coupon_code: Joi.string().trim().uppercase().optional().allow(null, ""),
}).custom((value, helpers) => {
  if (value.trip_type === CAB_TRIP_TYPES.LOCAL) {
    if (!value.package_id) {
      return helpers.message("package_id is required for local trip type");
    }
  } else {
    if (!value.drop_location) {
      return helpers.message("drop_location is required for one_way and round_trip");
    }
    if (value.distance_km === undefined || value.distance_km === null || value.distance_km <= 0) {
      return helpers.message("distance_km is required and must be greater than 0");
    }
  }

  if (value.trip_type === CAB_TRIP_TYPES.ROUND_TRIP && !value.return_at) {
    return helpers.message("return_at is required for round_trip");
  }

  return value;
});

export const validateCabCouponSchema = cabBookingSummarySchema.keys({
  coupon_code: Joi.string().trim().uppercase().required().messages({
    "any.required": "coupon_code is required",
  }),
});

export const cabCheckoutSchema = cabBookingSummarySchema;

export const cabCheckoutQuerySchema = Joi.object({
  auto_redirect: Joi.string().valid("true", "false").optional(),
});

// ─── Booking List & ID ─────────────────────────────────────────────────────

export const listCabBookingsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  trip_type: Joi.string().valid(...CAB_TRIP_TYPE_LIST).optional(),
  booking_status: Joi.number().integer().optional(),
});

export const cabBookingIdParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

// ─── Packages ──────────────────────────────────────────────────────────────

export const listCabPackagesQuerySchema = Joi.object({
  city_id: Joi.number().integer().positive().required(),
});

export default {
  searchCabSchema,
  listCabCarsQuerySchema,
  cabCarIdParamSchema,
  cabCarDetailQuerySchema,
  cabBookingSummarySchema,
  validateCabCouponSchema,
  cabCheckoutSchema,
  cabCheckoutQuerySchema,
  listCabBookingsQuerySchema,
  cabBookingIdParamSchema,
  listCabPackagesQuerySchema,
};
