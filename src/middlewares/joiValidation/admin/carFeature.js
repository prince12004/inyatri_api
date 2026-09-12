import Joi from "joi";
import {
  idParamSchema,
  listQuerySchema,
} from "./carBrand.js";

export { listQuerySchema, idParamSchema };

export const createFeatureSchema = Joi.object({
  name: Joi.string().trim().max(200).required(),
  status: Joi.number().valid(1, 2).optional(),
});

export const updateFeatureSchema = Joi.object({
  name: Joi.string().trim().max(200).optional(),
  status: Joi.number().valid(1, 2).optional(),
}).min(1);

export default {
  listQuerySchema,
  idParamSchema,
  createFeatureSchema,
  updateFeatureSchema,
};
