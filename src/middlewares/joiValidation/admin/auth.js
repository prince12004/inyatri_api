import Joi from "joi";

/*************************** Admin API Validation ****************************/
const schema = {
  // Admin Signup
  adminSignup: Joi.object().keys({
    first_name: Joi.string().max(50).required().messages({
      "any.required": "First name is required",
      "string.empty": "First name cannot be empty",
      "string.max": "First name cannot exceed 50 characters",
    }),

    last_name: Joi.string().max(50).optional().allow(null, "").messages({
      "string.max": "Last name cannot exceed 50 characters",
    }),

    email: Joi.string().email().max(100).required().messages({
      "any.required": "Email is required",
      "string.email": "Please enter a valid email address",
      "string.empty": "Email cannot be empty",
      "string.max": "Email cannot exceed 100 characters",
    }),

    password: Joi.string()
      .min(8)
      .max(20)
      .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])"))
      .required()
      .messages({
        "any.required": "Password is required",
        "string.empty": "Password cannot be empty",
        "string.min": "Password must be at least 8 characters long",
        "string.max": "Password cannot exceed 20 characters",
        "string.pattern.base":
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      }),
  }),

  adminLogin: Joi.object({
    email: Joi.string().email().required().messages({
      "any.required": "Email is required",
      "string.email": "Please enter a valid email",
    }),
    password: Joi.string().required().messages({
      "any.required": "Password is required",
    }),
  }).required(),

  adminForgotPassword: Joi.object({
    email: Joi.string().email().required().messages({
      "any.required": "Email is required",
      "string.email": "Please enter a valid email",
    }),
  }).required(),

  adminResetPasswordQuery: Joi.object({
    token: Joi.string().required().messages({
      "any.required": "Reset token is required",
    }),
  }),

  adminUpdateProfile: Joi.object({
    name: Joi.string().trim().max(100).optional().messages({
      "string.max": "Name cannot exceed 100 characters",
    }),

    email: Joi.string().email().max(100).optional().messages({
      "string.email": "Please enter a valid email",
      "string.max": "Email cannot exceed 100 characters",
    }),

    oldPassword: Joi.string().min(8).max(20).when("newPassword", {
      is: Joi.exist(),
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),

    newPassword: Joi.string()
      .min(8)
      .max(20)
      .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])"))
      .optional()
      .messages({
        "string.min": "Password must be at least 8 characters long",
        "string.max": "Password cannot exceed 20 characters",
        "string.pattern.base":
          "Password must contain uppercase, lowercase, number and special character",
      }),
  }).min(1),

  adminResetPasswordBody: Joi.object({
    password: Joi.string()
      .min(8)
      .max(20)
      .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])"))
      .required()
      .messages({
        "any.required": "Password is required",
        "string.min": "Password must be at least 8 characters long",
        "string.max": "Password cannot exceed 20 characters",
        "string.pattern.base":
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      }),
  }),
  confirmPassword: Joi.object({
    password: Joi.string().required().messages({
      "any.required": "Password is required",
      "string.empty": "Password cannot be empty",
    }),
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
