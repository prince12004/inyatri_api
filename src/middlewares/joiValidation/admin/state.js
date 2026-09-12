import Joi from "joi";
import {
  idParamSchema,
  listQuerySchema,
} from "./carBrand.js";

export { listQuerySchema, idParamSchema };

export const createStateSchema = Joi.object({
  state_name: Joi.string().trim().max(100).required(),
  country_code: Joi.string().trim().length(2).uppercase().default("IN"),
  status: Joi.number().valid(1, 2).optional(),
});

export const updateStateSchema = Joi.object({
  state_name: Joi.string().trim().max(100).optional(),
  country_code: Joi.string().trim().length(2).uppercase().optional(),
  status: Joi.number().valid(1, 2).optional(),
}).min(1);

export default {
  listQuerySchema,
  idParamSchema,
  createStateSchema,
  updateStateSchema,
};
