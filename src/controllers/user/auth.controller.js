import { User, sequelize } from "../../models/index.js";
import {
  assertUserAuthConfig,
  formatUserResponse,
  normalizeCountryCode,
  normalizeMobile,
  signUserToken,
  splitFullName,
} from "../../utils/auth.util.js";
import {
  consumeOtp,
  getOtpCooldown,
  storeOtp,
  verifyStoredOtp,
} from "../../services/otp.service.js";
import { notifyUserAccountCreated } from "../../services/notification.service.js";
import { sendOtpSms } from "../../utils/sms/twilioService.js";
import { shouldUseStaticPhoneOtp } from "../../utils/otp.util.js";
import ApiError from "../../utils/ApiError.js";
import { uploadBufferToCloudinary } from "../../services/admin/upload.service.js";
import {
  successResponse,
  tooManyRequestResponse,
  badRequestError,
  errorResponse,
} from "../../utils/response.js";
import logger from "../../utils/logger.js";

const findUserByMobile = async (mobile, options = {}) =>
  User.findOne({ where: { mobile }, ...options });

const sendOtpHandler = async (req, res) => {
  try {
    const countryCode = normalizeCountryCode(req.body.country_code);
    const mobile = normalizeMobile(req.body.mobile);

    const cooldown = await getOtpCooldown(countryCode, mobile);
    if (cooldown.blocked) {
      return tooManyRequestResponse(
        "Too many failed attempts. Try again in 10 minutes.",
        res,
        { cooldownSeconds: cooldown.cooldownSeconds }
      );
    }

    const existingUser = await findUserByMobile(mobile);
    if (existingUser && existingUser.status !== User.STATUS.ACTIVE) {
      return badRequestError(
        "Account is currently deactivated. Please contact the admin.",
        res
      );
    }

    const { code, expiresIn } = await storeOtp(countryCode, mobile);

    if (!shouldUseStaticPhoneOtp()) {
      try {
        await sendOtpSms({
          to: `${countryCode}${mobile}`,
          code,
          purposeLabel: "InYatri verification",
        });
      } catch (smsError) {
        logger.error("Failed to send OTP SMS:", smsError);
        return errorResponse(smsError, res);
      }
    }

    return successResponse(
      {
        isExistingUser: Boolean(existingUser),
        expiresIn,
      },
      "OTP sent successfully",
      res
    );
  } catch (error) {
    logger.error("sendOtp error:", error);
    return errorResponse(error, res);
  }
};

const verifyOtpHandler = async (req, res) => {
  const countryCode = normalizeCountryCode(req.body.country_code);
  const mobile = normalizeMobile(req.body.mobile);
  const otp = String(req.body.otp).trim();
  const fcmToken = (req.body.fcm_token || req.body.device_token)?.trim() || null;

  try {
    const cooldown = await getOtpCooldown(countryCode, mobile);
    if (cooldown.blocked) {
      return tooManyRequestResponse(
        "Too many failed attempts. Try again in 10 minutes.",
        res,
        { cooldownSeconds: cooldown.cooldownSeconds }
      );
    }

    const existingUser = await findUserByMobile(mobile);
    if (existingUser && existingUser.status !== User.STATUS.ACTIVE) {
      return badRequestError(
        "Account is currently deactivated. Please contact the admin.",
        res
      );
    }

    try {
      assertUserAuthConfig();
    } catch (configError) {
      return errorResponse(configError, res);
    }

    const verification = await verifyStoredOtp(countryCode, mobile, otp);

    if (!verification.valid) {
      if (verification.blocked) {
        return tooManyRequestResponse(verification.message, res, {
          cooldownSeconds: verification.cooldownSeconds,
        });
      }

      return badRequestError(verification.message, res);
    }

    const transaction = await sequelize.transaction();
    let user;
    let isNewUser = false;

    try {
      user = await User.findOne({
        where: { mobile },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (user && user.status !== User.STATUS.ACTIVE) {
        await transaction.rollback();
        return badRequestError(
          "Account is currently deactivated. Please contact the admin.",
          res
        );
      }

      if (!user) {
        isNewUser = true;
        user = await User.create(
          {
            mobile,
            country_code: countryCode,
            firstname: "",
            lastname: "",
            email: "",
            city: "",
            address: "",
            password: "",
            fcm_token: fcmToken,
            is_google_user: User.USER_TYPES.NORMAL,
            status: User.STATUS.ACTIVE,
          },
          { transaction }
        );
      }

      const token = signUserToken(user);
      const userUpdates = { token };
      if (fcmToken) {
        userUpdates.fcm_token = fcmToken;
      }
      await user.update(userUpdates, { transaction });

      await transaction.commit();
    } catch (dbError) {
      await transaction.rollback();
      throw dbError;
    }

    try {
      await consumeOtp(countryCode, mobile);
    } catch (consumeError) {
      logger.warn("OTP consumed in DB but failed to clear from Redis:", consumeError);
    }

    await user.reload();

    if (isNewUser) {
      notifyUserAccountCreated(user).catch((err) =>
        logger.error("Failed to trigger account creation notification:", err)
      );
    }

    const userResponse = formatUserResponse(user);

    return successResponse(
      {
        isNewUser,
        isExistingUser: !isNewUser,
        requiresProfile: userResponse.requires_profile,
        token: user.token,
        user: userResponse,
      },
      "OTP verified successfully",
      res
    );
  } catch (error) {
    logger.error("verifyOtp error:", error);

    if (error instanceof ApiError) {
      return errorResponse(error, res);
    }

    return errorResponse(
      new ApiError(500, "Unable to complete login. Please try again."),
      res
    );
  }
};

const resendOtpHandler = async (req, res) => {
  return sendOtpHandler(req, res);
};

const getProfileHandler = async (req, res) => {
  try {
    return successResponse(
      formatUserResponse(req.user),
      "User profile fetched successfully",
      res
    );
  } catch (error) {
    logger.error("getProfile error:", error);
    return errorResponse(error, res);
  }
};

const completeProfileHandler = async (req, res) => {
  try {
    const user = req.user;
    const updates = {};

    if (req.body.full_name !== undefined) {
      const { firstname, lastname } = splitFullName(req.body.full_name);
      updates.firstname = firstname;
      updates.lastname = lastname;
    }

    if (req.body.email !== undefined && req.body.email !== "") {
      updates.email = req.body.email;
    }

    if (req.body.dob !== undefined && req.body.dob !== "") {
      updates.dob = req.body.dob;
    }

    if (req.body.referral_code !== undefined && req.body.referral_code !== "") {
      updates.referral_code = req.body.referral_code;
    }

    if (req.body.city !== undefined) {
      updates.city = req.body.city;
    }

    if (req.body.address !== undefined) {
      updates.address = req.body.address;
    }

    if (req.body.picture !== undefined) {
      updates.picture = req.body.picture;
    }

    if (req.body.driving_license_front !== undefined) {
      updates.driving_license_front = req.body.driving_license_front;
    }

    if (req.body.driving_license_back !== undefined) {
      updates.driving_license_back = req.body.driving_license_back;
    }

    if (req.body.government_id !== undefined) {
      updates.government_id = req.body.government_id;
    }

    // Process file uploads if uploaded via multipart/form-data
    if (req.files) {
      if (req.files.driving_license_front?.[0]) {
        const uploadRes = await uploadBufferToCloudinary(
          req.files.driving_license_front[0].buffer,
          "inyatri/user_docs"
        );
        updates.driving_license_front = uploadRes.secure_url;
      }
      if (req.files.driving_license_back?.[0]) {
        const uploadRes = await uploadBufferToCloudinary(
          req.files.driving_license_back[0].buffer,
          "inyatri/user_docs"
        );
        updates.driving_license_back = uploadRes.secure_url;
      }
      if (req.files.government_id?.[0]) {
        const uploadRes = await uploadBufferToCloudinary(
          req.files.government_id[0].buffer,
          "inyatri/user_docs"
        );
        updates.government_id = uploadRes.secure_url;
      }
      if (req.files.picture?.[0]) {
        const uploadRes = await uploadBufferToCloudinary(
          req.files.picture[0].buffer,
          "inyatri/profile"
        );
        updates.picture = uploadRes.secure_url;
      }
    }

    if (req.body.agreed_to_terms !== undefined) {
      updates.agreed_to_terms = req.body.agreed_to_terms ? 1 : 0;
    }

    if (req.body.marketing_opt_in !== undefined) {
      updates.marketing_opt_in = req.body.marketing_opt_in ? 1 : 0;
    }

    if (req.body.fcm_token !== undefined || req.body.device_token !== undefined) {
      updates.fcm_token = (req.body.fcm_token || req.body.device_token)?.trim() || null;
    }

    if (Object.keys(updates).length === 0) {
      return successResponse(
        formatUserResponse(user),
        "No profile changes provided",
        res
      );
    }

    await user.update(updates);
    await user.reload();

    return successResponse(
      formatUserResponse(user),
      "Profile updated successfully",
      res
    );
  } catch (error) {
    logger.error("completeProfile error:", error);
    return errorResponse(error, res);
  }
};

const updateFcmTokenHandler = async (req, res) => {
  try {
    const fcmToken = (req.body.fcm_token || req.body.device_token)?.trim() || null;
    await req.user.update({ fcm_token: fcmToken });
    return successResponse(
      { fcm_token: fcmToken },
      "FCM device token updated successfully",
      res
    );
  } catch (error) {
    logger.error("updateFcmToken error:", error);
    return errorResponse(error, res);
  }
};

const logoutHandler = async (req, res) => {
  try {
    await req.user.update({ token: null });
    return successResponse([], "Logged out successfully", res);
  } catch (error) {
    logger.error("logout error:", error);
    return errorResponse(error, res);
  }
};

export {
  sendOtpHandler,
  verifyOtpHandler,
  resendOtpHandler,
  getProfileHandler,
  completeProfileHandler,
  completeProfileHandler as updateProfileHandler,
  updateFcmTokenHandler,
  logoutHandler,
};
