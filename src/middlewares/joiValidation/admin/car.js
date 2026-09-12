import Joi from "joi";
import {
  FUEL_TYPES,
  SEAT_OPTIONS,
  TRANSMISSION_TYPES,
} from "../../../utils/constants/car.enums.js";
import { listQuerySchema } from "./carBrand.js";

export { listQuerySchema };

const carFieldsSchema = {
  car_name: Joi.string().trim().max(200).required(),
  vehicle_number: Joi.string().trim().max(50).required(),
  brand_id: Joi.number().integer().positive().required(),
  city_id: Joi.number().integer().positive().required(),
  location: Joi.string().trim().max(300).required(),
  latitude: Joi.number().optional().allow(null),
  longitude: Joi.number().optional().allow(null),
  fuel_type: Joi.string()
    .valid(...FUEL_TYPES)
    .required(),
  feature_ids: Joi.array()
    .items(Joi.number().integer().positive())
    .min(1)
    .required(),
  made_year: Joi.number()
    .integer()
    .min(1980)
    .max(new Date().getFullYear() + 1)
    .required(),
  model: Joi.string().trim().max(100).optional().allow("", null),
  mileage: Joi.string().trim().max(50).optional().allow("", null),
  horsepower: Joi.string().trim().max(50).optional().allow("", null),
  car_condition: Joi.string().trim().max(100).optional().allow("", null),
  version: Joi.string().trim().max(100).optional().allow("", null),
  travelled_km: Joi.number().integer().min(0).required(),
  travelling_allowed_per_day: Joi.number().integer().min(1).required(),
  extra_charge_per_km: Joi.number().min(0).required(),
  seats: Joi.number()
    .valid(...SEAT_OPTIONS)
    .required(),
  car_type_id: Joi.number().integer().positive().required(),
  transmission: Joi.string()
    .valid(...TRANSMISSION_TYPES)
    .required(),
  price_per_hour: Joi.number().min(0).optional().allow(null),
  price_per_day: Joi.number().min(0).optional().allow(null),
  weekend_price_per_hour: Joi.number().min(0).optional().allow(null),
  short_description: Joi.string().trim().optional().allow("", null),
  main_image: Joi.string().uri().required(),
  additional_images: Joi.array().items(Joi.string().uri()).length(4).required(),
  enable_monthly_subscription: Joi.boolean().optional(),
  discount_15_days: Joi.number().min(0).max(100).optional(),
  discount_1_month: Joi.number().min(0).max(100).optional(),
  discount_3_months: Joi.number().min(0).max(100).optional(),
  discount_6_months: Joi.number().min(0).max(100).optional(),
  sold_from: Joi.date().iso().optional().allow(null),
  sold_to: Joi.date().iso().optional().allow(null),
  sold_remark: Joi.string().trim().optional().allow("", null),
  refundable_deposit: Joi.number().min(0).optional(),
  home_delivery_charge: Joi.number().min(0).optional(),
  show_on_top: Joi.boolean().optional(),
  home_delivery_available: Joi.boolean().optional(),
  status: Joi.number().valid(1, 2).optional(),
};

export const createCarSchema = Joi.object(carFieldsSchema);

export const updateCarSchema = Joi.object(
  Object.fromEntries(
    Object.entries(carFieldsSchema).map(([key, schema]) => [
      key,
      schema.optional(),
    ])
  )
).min(1);

export const updateCarStatusSchema = Joi.object({
  status: Joi.number().valid(1, 2).required(),
});

export const carIdParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

export default {
  listQuerySchema,
  createCarSchema,
  updateCarSchema,
  updateCarStatusSchema,
  carIdParamSchema,
};
