import Joi from "joi";
import { CAB_TRIP_TYPE_LIST } from "../../../utils/constants/cab.enums.js";

// ─── Dashboard ─────────────────────────────────────────────────────────────

export const cabDashboardQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  search: Joi.string().optional().allow(""),
  city_id: Joi.number().integer().positive().optional(),
});

// ─── Pricing ───────────────────────────────────────────────────────────────

export const createCabPricingSchema = Joi.object({
  car_id: Joi.number().integer().positive().required(),
  trip_type: Joi.string()
    .valid(...CAB_TRIP_TYPE_LIST)
    .required(),
  package_id: Joi.number().integer().positive().optional().allow(null),
  base_km: Joi.number().integer().min(0).required(),
  base_fare: Joi.number().positive().required(),
  per_km_charge: Joi.number().min(0).required(),
  driver_allowance: Joi.number().min(0).required(),
}).custom((value, helpers) => {
  if (value.trip_type === "local" && !value.package_id) {
    return helpers.message("package_id is required for local trip type");
  }
  return value;
});

export const updateCabPricingSchema = Joi.object({
  base_km: Joi.number().integer().min(0).optional(),
  base_fare: Joi.number().positive().optional(),
  per_km_charge: Joi.number().min(0).optional(),
  driver_allowance: Joi.number().min(0).optional(),
}).min(1);

export const updateStatusSchema = Joi.object({
  status: Joi.number().valid(1, 2).required(),
});

export const listCabPricingsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  car_id: Joi.number().integer().positive().optional(),
  trip_type: Joi.string()
    .valid(...CAB_TRIP_TYPE_LIST)
    .optional(),
  status: Joi.number().valid(1, 2).optional(),
});

export const idParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

// ─── Packages ──────────────────────────────────────────────────────────────

export const createCabPackageSchema = Joi.object({
  city_id: Joi.number().integer().positive().required(),
  duration_hours: Joi.number().integer().min(1).required(),
  included_km: Joi.number().integer().min(1).required(),
  label: Joi.string().max(100).optional().allow(""),
  sort_order: Joi.number().integer().min(0).default(0),
});

export const updateCabPackageSchema = Joi.object({
  duration_hours: Joi.number().integer().min(1).optional(),
  included_km: Joi.number().integer().min(1).optional(),
  label: Joi.string().max(100).optional(),
  sort_order: Joi.number().integer().min(0).optional(),
}).min(1);

export const listCabPackagesQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(50),
  city_id: Joi.number().integer().positive().optional(),
  status: Joi.number().valid(1, 2).optional(),
});

export default {
  cabDashboardQuerySchema,
  createCabPricingSchema,
  updateCabPricingSchema,
  updateStatusSchema,
  listCabPricingsQuerySchema,
  idParamSchema,
  createCabPackageSchema,
  updateCabPackageSchema,
  listCabPackagesQuerySchema,
};
