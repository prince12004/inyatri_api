import Joi from "joi";
import {
  idParamSchema,
  listQuerySchema,
} from "./carBrand.js";

export { listQuerySchema, idParamSchema };

export const createTypeSchema = Joi.object({
  type_name: Joi.string().trim().max(100).required(),
  status: Joi.number().valid(1, 2).optional(),
});

export const updateTypeSchema = Joi.object({
  type_name: Joi.string().trim().max(100).optional(),
  status: Joi.number().valid(1, 2).optional(),
}).min(1);

export default {
  listQuerySchema,
  idParamSchema,
  createTypeSchema,
  updateTypeSchema,
};
