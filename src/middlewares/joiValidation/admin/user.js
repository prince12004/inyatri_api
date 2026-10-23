import Joi from "joi";

const schema = {
  listUsersQuery: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    search: Joi.string().trim().max(100).optional().allow(""),
    status: Joi.number().integer().valid(1, 2).optional(),
    has_documents: Joi.boolean().optional(),
  }),

  updateStatusBody: Joi.object({
    status: Joi.number().integer().valid(1, 2).required().messages({
      "any.required": "Status is required (1 = Active, 2 = Inactive)",
      "any.only": "Status must be 1 (Active) or 2 (Inactive)",
    }),
  }),

  updateUserBody: Joi.object({
    firstname: Joi.string().max(40).optional().allow("", null),
    lastname: Joi.string().max(40).optional().allow("", null),
    email: Joi.string().email().max(60).optional().allow("", null),
    mobile: Joi.string()
      .pattern(/^\d{10}$/)
      .optional()
      .messages({
        "string.pattern.base": "Mobile number must be exactly 10 digits",
      }),
    country_code: Joi.string()
      .pattern(/^\+\d{1,4}$/)
      .optional(),
    dob: Joi.date().iso().optional().allow("", null),
    city: Joi.string().max(200).optional().allow("", null),
    address: Joi.string().max(300).optional().allow("", null),
    picture: Joi.string().max(500).optional().allow("", null),
    driving_license_front: Joi.string().max(500).optional().allow("", null),
    driving_license_back: Joi.string().max(500).optional().allow("", null),
    government_id: Joi.string().max(500).optional().allow("", null),
    status: Joi.number().integer().valid(1, 2).optional(),
  }),
};

export default schema;
