import Joi from "joi";

const schema = {
  sendOtp: Joi.object({
    country_code: Joi.string()
      .pattern(/^\+\d{1,4}$/)
      .default("+91")
      .messages({
        "string.pattern.base": "Country code must start with + followed by digits",
      }),
    mobile: Joi.string()
      .pattern(/^\d{10}$/)
      .required()
      .messages({
        "any.required": "Mobile number is required",
        "string.pattern.base": "Mobile number must be exactly 10 digits",
      }),
  }),

  verifyOtp: Joi.object({
    country_code: Joi.string()
      .pattern(/^\+\d{1,4}$/)
      .default("+91")
      .messages({
        "string.pattern.base": "Country code must start with + followed by digits",
      }),
    mobile: Joi.string()
      .pattern(/^\d{10}$/)
      .required()
      .messages({
        "any.required": "Mobile number is required",
        "string.pattern.base": "Mobile number must be exactly 10 digits",
      }),
    otp: Joi.string()
      .length(6)
      .pattern(/^\d+$/)
      .required()
      .messages({
        "any.required": "OTP is required",
        "string.length": "OTP must be exactly 6 digits",
        "string.pattern.base": "OTP must be 6 digits",
      }),
    fcm_token: Joi.string().trim().max(512).optional().allow("", null),
    device_token: Joi.string().trim().max(512).optional().allow("", null),
  }),

  resendOtp: Joi.object({
    country_code: Joi.string()
      .pattern(/^\+\d{1,4}$/)
      .default("+91"),
    mobile: Joi.string()
      .pattern(/^\d{10}$/)
      .required()
      .messages({
        "any.required": "Mobile number is required",
        "string.pattern.base": "Mobile number must be exactly 10 digits",
      }),
  }),

  completeProfile: Joi.object({
    full_name: Joi.string().max(80).optional().allow("", null),
    email: Joi.string().email().max(60).optional().allow("", null),
    dob: Joi.date().iso().optional().allow("", null),
    referral_code: Joi.string().max(50).optional().allow("", null),
    city: Joi.string().max(200).optional().allow("", null),
    address: Joi.string().max(300).optional().allow("", null),
    picture: Joi.string().max(500).optional().allow("", null),
    driving_license_front: Joi.string().max(500).optional().allow("", null),
    driving_license_back: Joi.string().max(500).optional().allow("", null),
    government_id: Joi.string().max(500).optional().allow("", null),
    agreed_to_terms: Joi.boolean().optional(),
    marketing_opt_in: Joi.boolean().optional(),
    fcm_token: Joi.string().trim().max(512).optional().allow("", null),
    device_token: Joi.string().trim().max(512).optional().allow("", null),
  }),

  updateProfile: Joi.object({
    full_name: Joi.string().max(80).optional().allow("", null),
    email: Joi.string().email().max(60).optional().allow("", null),
    dob: Joi.date().iso().optional().allow("", null),
    referral_code: Joi.string().max(50).optional().allow("", null),
    city: Joi.string().max(200).optional().allow("", null),
    address: Joi.string().max(300).optional().allow("", null),
    picture: Joi.string().max(500).optional().allow("", null),
    driving_license_front: Joi.string().max(500).optional().allow("", null),
    driving_license_back: Joi.string().max(500).optional().allow("", null),
    government_id: Joi.string().max(500).optional().allow("", null),
    agreed_to_terms: Joi.boolean().optional(),
    marketing_opt_in: Joi.boolean().optional(),
    fcm_token: Joi.string().trim().max(512).optional().allow("", null),
    device_token: Joi.string().trim().max(512).optional().allow("", null),
  }),

  updateFcmToken: Joi.object({
    fcm_token: Joi.string().trim().max(512).optional(),
    device_token: Joi.string().trim().max(512).optional(),
  })
    .or("fcm_token", "device_token")
    .messages({
      "object.missing": "Either fcm_token or device_token must be provided",
    }),
};

export default schema;
