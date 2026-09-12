import Joi from "joi";

export const listQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  search: Joi.string().trim().allow("", null).optional(),
  status: Joi.number().valid(1, 2).optional(),
});

export const idParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

export const createBrandSchema = Joi.object({
  brand_name: Joi.string().trim().max(50).required(),
  status: Joi.number().valid(1, 2).optional(),
});

export const updateBrandSchema = Joi.object({
  brand_name: Joi.string().trim().max(50).optional(),
  status: Joi.number().valid(1, 2).optional(),
}).min(1);

export default {
  listQuerySchema,
  idParamSchema,
  createBrandSchema,
  updateBrandSchema,
};
