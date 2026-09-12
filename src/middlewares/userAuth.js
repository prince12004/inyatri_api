import jwt from 'jsonwebtoken';
import ENV from '../config/env.js';
import { User } from "../models/index.js";
import { unauthorizedResponse } from '../utils/response.js';
import { isDevPaymentToolsEnabled } from '../utils/payment/payu.util.js';

/************************* Authentication (USER) **************************/
const auth = {
  required: async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;

      // Header check
      if (!authHeader) {
        return unauthorizedResponse("Authorization header missing", res);
      }

      // Bearer format validation
      const parts = authHeader.split(" ");

      if (parts.length !== 2 || parts[0].toLowerCase() !== "bearer") {
        return unauthorizedResponse("Invalid authorization format", res);
      }

      const token = parts[1];

      if (!token) {
        return unauthorizedResponse("Token not provided", res);
      }

      let decoded;

      // 🔐 JWT verify (inner try-catch)
      try {
        decoded = jwt.verify(token, ENV.JWT.SECRET_USER);
      } catch (error) {
        if (error.name === "TokenExpiredError") {
          return unauthorizedResponse("Token expired", res);
        }

        if (error.name === "JsonWebTokenError") {
          return unauthorizedResponse("Invalid token", res);
        }

        if (error.name === "NotBeforeError") {
          return unauthorizedResponse("Token not active yet", res);
        }

        return unauthorizedResponse("Authentication failed", res);
      }

      // 👤 User existence check
      const userData = await User.findOne({
        where: {
          id: decoded.id,
        }
      });

      if (!userData) {
        return unauthorizedResponse("Unauthorized request", res);
      }

      if (!userData.token || userData.token !== token) {
        return unauthorizedResponse("Unauthorized request", res);
      }

      if (userData.status !== 1) {
        return unauthorizedResponse(
          "Account is currently deactivated. Please contact the admin.",
          res
        );
      }

      // Attach data
      req.user = userData;
      req.payload = decoded;

      return next();

    } catch (error) {
      return unauthorizedResponse("Unauthorized request", res);
    }
  }
};

/** Dev-only: allow Bearer token via ?token= for browser PayU redirect testing */
const requiredDevWithQueryToken = async (req, res, next) => {
  if (!isDevPaymentToolsEnabled()) {
    return unauthorizedResponse("Not found", res);
  }

  if (!req.headers.authorization && req.query.token) {
    req.headers.authorization = `Bearer ${req.query.token}`;
  }

  return auth.required(req, res, next);
};

export { requiredDevWithQueryToken };
export default auth;