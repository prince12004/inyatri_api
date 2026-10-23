import Joi from "joi";

export const updateFcmTokenSchema = Joi.object({
  fcm_token: Joi.string().trim().max(512).optional(),
  device_token: Joi.string().trim().max(512).optional(),
})
  .or("fcm_token", "device_token")
  .messages({
    "object.missing": "Either fcm_token or device_token must be provided",
  });

export const listNotificationsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  is_read: Joi.number().valid(0, 1).optional(),
});

export const notificationIdParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

export const sendBroadcastSchema = Joi.object({
  title: Joi.string().trim().max(255).required(),
  body: Joi.string().trim().required(),
  type: Joi.string().trim().max(50).optional().default("broadcast"),
  data: Joi.object().optional().default({}),
});

export const sendUserSchema = Joi.object({
  user_id: Joi.number().integer().positive().required(),
  title: Joi.string().trim().max(255).required(),
  body: Joi.string().trim().required(),
  type: Joi.string().trim().max(50).optional().default("general"),
  data: Joi.object().optional().default({}),
});

export default {
  updateFcmTokenSchema,
  listNotificationsQuerySchema,
  notificationIdParamSchema,
  sendBroadcastSchema,
  sendUserSchema,
};
