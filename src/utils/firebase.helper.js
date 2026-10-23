import { messaging } from "../config/firebaseConfig.js";
import logger from "./logger.js";

const sanitizeDataPayload = (data = {}) => {
  const sanitized = {};
  if (!data || typeof data !== "object") return sanitized;

  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined && value !== null) {
      sanitized[key] = typeof value === "object" ? JSON.stringify(value) : String(value);
    }
  }
  return sanitized;
};

/**
 * Send notification to a single device token
 */
export const sendToSingleUser = async (token, title, body, data = {}) => {
  if (!token || typeof token !== "string" || !token.trim()) {
    logger.warn("⚠️ No valid FCM token provided for push notification");
    return { success: false, reason: "missing_token" };
  }

  if (!messaging) {
    logger.warn("⚠️ Firebase Messaging is not initialized; skipping push notification");
    return { success: false, reason: "messaging_not_initialized" };
  }

  try {
    const message = {
      token: token.trim(),
      notification: {
        title: String(title || "Notification"),
        body: String(body || ""),
      },
      data: sanitizeDataPayload(data),
    };

    const response = await messaging.send(message);
    logger.info(`✅ Firebase notification sent successfully: ${response}`);
    return { success: true, messageId: response };
  } catch (error) {
    logger.error("🔥 Firebase Single Send Error:", error.message || error);
    return { success: false, error: error.message || error };
  }
};

/**
 * Send notification to multiple device tokens
 */
export const sendToMultipleUsers = async (tokens = [], title, body, data = {}) => {
  const validTokens = (tokens || []).filter((t) => typeof t === "string" && t.trim().length > 0);
  if (!validTokens.length) {
    return { success: false, reason: "no_valid_tokens" };
  }

  if (!messaging) {
    logger.warn("⚠️ Firebase Messaging is not initialized; skipping multicast push notification");
    return { success: false, reason: "messaging_not_initialized" };
  }

  try {
    const message = {
      tokens: validTokens,
      notification: {
        title: String(title || "Notification"),
        body: String(body || ""),
      },
      data: sanitizeDataPayload(data),
    };

    const response = await messaging.sendEachForMulticast(message);
    logger.info(
      `✅ Firebase Multicast sent: ${response.successCount} succeeded, ${response.failureCount} failed`
    );
    return {
      success: true,
      successCount: response.successCount,
      failureCount: response.failureCount,
      responses: response.responses,
    };
  } catch (error) {
    logger.error("🔥 Firebase Multicast Send Error:", error.message || error);
    return { success: false, error: error.message || error };
  }
};

export default {
  sendToSingleUser,
  sendToMultipleUsers,
};



