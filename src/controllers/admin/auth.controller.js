import * as authService from "../../services/admin/auth.service.js";
import {
  successResponse,
  unauthorizedResponse,
  badRequestError,
  errorResponse,
} from "../../utils/response.js";
import logger from "../../utils/logger.js";
import ApiError from "../../utils/ApiError.js";

const adminLoginHandler = async (req, res) => {
  try {
    const result = await authService.loginAdmin({
      email: req.body.email,
      password: req.body.password,
    });

    return successResponse(result, "Admin logged in successfully", res);
  } catch (error) {
    logger.error("adminLogin error:", error);

    if (error instanceof ApiError) {
      if (error.statusCode === 401) {
        return unauthorizedResponse(error.message, res);
      }
      if (error.statusCode === 400) {
        return badRequestError(error.message, res);
      }
      return errorResponse(error, res);
    }

    return errorResponse(error, res);
  }
};

const updateFcmTokenHandler = async (req, res) => {
  try {
    const adminId = req.payload?.id;
    const fcmToken = (req.body.fcm_token || req.body.device_token)?.trim() || null;
    await authService.updateAdminFcmToken(adminId, fcmToken);
    return successResponse(
      { fcm_token: fcmToken },
      "Admin FCM device token updated successfully",
      res
    );
  } catch (error) {
    logger.error("admin updateFcmToken error:", error);
    return errorResponse(error, res);
  }
};

export { adminLoginHandler, updateFcmTokenHandler };
