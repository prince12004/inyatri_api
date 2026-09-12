import Joi from "joi";
import { idParamSchema, listQuerySchema } from "./carBrand.js";

export { listQuerySchema, idParamSchema };

export const createCitySchema = Joi.object({
  short_name: Joi.string().trim().max(100).required(),
  name: Joi.string().trim().max(100).required(),
  address: Joi.string().trim().required(),
  image: Joi.string().trim().max(200).required(),
  status: Joi.number().valid(1, 2).optional(),
});

export const updateCitySchema = Joi.object({
  short_name: Joi.string().trim().max(100).optional(),
  name: Joi.string().trim().max(100).optional(),
  address: Joi.string().trim().optional(),
  image: Joi.string().trim().max(200).optional(),
  status: Joi.number().valid(1, 2).optional(),
}).min(1);

export default {
  listQuerySchema,
  idParamSchema,
  createCitySchema,
  updateCitySchema,
};
