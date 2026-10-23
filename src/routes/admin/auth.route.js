import express from "express";
const router = express.Router();

import * as authController from "../../controllers/admin/auth.controller.js";
import validate from "../../middlewares/validation.js";
import schema from "../../middlewares/joiValidation/admin/auth.js";
import auth from "../../middlewares/adminAuth.js";
import { authLimiter } from "../../middlewares/rateLimiter.js";

router.post(
  "/admin-login",
  authLimiter,
  validate({ body: schema.adminLogin }),
  authController.adminLoginHandler
);

router.post(
  "/fcm-token",
  auth.required,
  validate({ body: schema.updateFcmToken }),
  authController.updateFcmTokenHandler
);

router.patch(
  "/fcm-token",
  auth.required,
  validate({ body: schema.updateFcmToken }),
  authController.updateFcmTokenHandler
);

export default router;
