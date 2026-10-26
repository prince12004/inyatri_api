import express from "express";
const router = express.Router();

import * as authController from "../../controllers/user/auth.controller.js";
import validate from "../../middlewares/validation.js";
import schema from "../../middlewares/joiValidation/user/auth.js";
import auth from "../../middlewares/userAuth.js";
import { otpLimiter } from "../../middlewares/rateLimiter.js";
import { uploadUserDocs } from "../../middlewares/cloudinaryUpload.js";

router.post(
  "/send-otp",
  otpLimiter,
  validate({ body: schema.sendOtp }),
  authController.sendOtpHandler
);

router.post(
  "/verify-otp",
  otpLimiter,
  validate({ body: schema.verifyOtp }),
  authController.verifyOtpHandler
);

router.post(
  "/resend-otp",
  otpLimiter,
  validate({ body: schema.resendOtp }),
  authController.resendOtpHandler
);

router.get("/profile", auth.required, authController.getProfileHandler);
router.get("/me", auth.required, authController.getProfileHandler);

router.post(
  "/complete-profile",
  auth.required,
  uploadUserDocs,
  validate({ body: schema.completeProfile }),
  authController.completeProfileHandler
);


router.patch(
  "/profile",
  auth.required,
  uploadUserDocs,
  validate({ body: schema.completeProfile }),
  authController.completeProfileHandler
);

router.put(
  "/profile",
  auth.required,
  uploadUserDocs,
  validate({ body: schema.completeProfile }),
  authController.completeProfileHandler
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

router.post("/logout", auth.required, authController.logoutHandler);

router.delete(
  "/delete-account",
  auth.required,
  authController.deleteAccountHandler
);

router.post(
  "/delete-account",
  auth.required,
  authController.deleteAccountHandler
);

router.delete(
  "/profile",
  auth.required,
  authController.deleteAccountHandler
);

export default router;
