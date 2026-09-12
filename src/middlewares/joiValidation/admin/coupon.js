import Joi from "joi";
import { listQuerySchema } from "./carBrand.js";
import { STATUS } from "../../../utils/constants/car.enums.js";

export { listQuerySchema };

export const createCouponSchema = Joi.object({
  code: Joi.string().trim().uppercase().max(50).required(),
  title: Joi.string().trim().max(150).required(),
  description: Joi.string().trim().max(500).optional().allow("", null),
  discount_percent: Joi.number().min(0.01).max(100).required(),
  max_discount_amount: Joi.number().min(0).optional().allow(null),
  min_base_rental_amount: Joi.number().min(0).optional().allow(null),
  valid_from: Joi.date().iso().required(),
  valid_to: Joi.date().iso().required(),
  usage_limit: Joi.number().integer().min(0).default(0),
  status: Joi.number().valid(STATUS.ACTIVE, STATUS.INACTIVE).optional(),
}).custom((value, helpers) => {
  if (new Date(value.valid_to) <= new Date(value.valid_from)) {
    return helpers.message("valid_to must be after valid_from");
  }
  return value;
});

export const updateCouponSchema = Joi.object({
  code: Joi.string().trim().uppercase().max(50).optional(),
  title: Joi.string().trim().max(150).optional(),
  description: Joi.string().trim().max(500).optional().allow("", null),
  discount_percent: Joi.number().min(0.01).max(100).optional(),
  max_discount_amount: Joi.number().min(0).optional().allow(null),
  min_base_rental_amount: Joi.number().min(0).optional().allow(null),
  valid_from: Joi.date().iso().optional(),
  valid_to: Joi.date().iso().optional(),
  usage_limit: Joi.number().integer().min(0).optional(),
  status: Joi.number().valid(STATUS.ACTIVE, STATUS.INACTIVE).optional(),
})
  .min(1)
  .custom((value, helpers) => {
    if (value.valid_from && value.valid_to) {
      if (new Date(value.valid_to) <= new Date(value.valid_from)) {
        return helpers.message("valid_to must be after valid_from");
      }
    }
    return value;
  });

export const updateCouponStatusSchema = Joi.object({
  status: Joi.number().valid(STATUS.ACTIVE, STATUS.INACTIVE).required(),
});

export const idParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

export default {
  listQuerySchema,
  createCouponSchema,
  updateCouponSchema,
  updateCouponStatusSchema,
  idParamSchema,
};
