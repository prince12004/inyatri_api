import Joi from "joi";
import {
  FUEL_TYPES,
  TRANSMISSION_TYPES,
} from "../../../utils/constants/car.enums.js";

const validateFindCarsWindow = (value, helpers) => {
  const pickup = new Date(value.pickup_at);
  const drop = new Date(value.drop_at);

  if (Number.isNaN(pickup.getTime()) || Number.isNaN(drop.getTime())) {
    return helpers.message("Pickup and drop must be valid date-time values");
  }

  if (drop <= pickup) {
    return helpers.message("Drop time must be after pickup time");
  }

  return value;
};

const validateFlexibleRentalQuery = (value, helpers) => {
  const hasPickup = value.pickup_at !== undefined && value.pickup_at !== null && value.pickup_at !== "";
  const hasDrop = value.drop_at !== undefined && value.drop_at !== null && value.drop_at !== "";
  const hasCity = value.city_id !== undefined && value.city_id !== null && value.city_id !== "";

  if (hasPickup || hasDrop) {
    if (!hasPickup || !hasDrop || !hasCity) {
      return helpers.message(
        "city_id, pickup_at and drop_at are required together when searching cars"
      );
    }

    const pickup = new Date(value.pickup_at);
    const drop = new Date(value.drop_at);

    if (Number.isNaN(pickup.getTime()) || Number.isNaN(drop.getTime())) {
      return helpers.message("Pickup and drop must be valid date-time values");
    }

    if (drop <= pickup) {
      return helpers.message("Drop time must be after pickup time");
    }
  }

  return value;
};

/** Mode A — browse categories */
export const browseCategoriesQuerySchema = Joi.object({
  city_id: Joi.number().integer().positive().optional(),
});

/** Mode B — find cars button */
export const searchSelfDriveSchema = Joi.object({
  city_id: Joi.number().integer().positive().required(),
  pickup_at: Joi.date().iso().required(),
  drop_at: Joi.date().iso().required(),
}).custom(validateFindCarsWindow);

/** Mode A or B — list cars */
export const listCarsQuerySchema = Joi.object({
  city_id: Joi.number().integer().positive().optional(),
  pickup_at: Joi.date().iso().optional(),
  drop_at: Joi.date().iso().optional(),
  car_type_id: Joi.number().integer().positive().optional(),
  transmission: Joi.string()
    .valid(...TRANSMISSION_TYPES)
    .optional(),
  fuel_type: Joi.string()
    .valid(...FUEL_TYPES)
    .optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(20),
}).custom(validateFlexibleRentalQuery);

/** Mode A or B — car detail */
export const carDetailQuerySchema = Joi.object({
  city_id: Joi.number().integer().positive().optional(),
  pickup_at: Joi.date().iso().optional(),
  drop_at: Joi.date().iso().optional(),
}).custom(validateFlexibleRentalQuery);

export const listCitiesQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
});

export const carIdParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

export default {
  listCitiesQuerySchema,
  browseCategoriesQuerySchema,
  searchSelfDriveSchema,
  listCarsQuerySchema,
  carDetailQuerySchema,
  carIdParamSchema,
};
