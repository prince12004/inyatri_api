import * as notificationService from "../../services/notification.service.js";
import {
  successResponse,
  successResponseWithPagination,
  errorResponse,
  notExistsResponse,
} from "../../utils/response.js";
import logger from "../../utils/logger.js";

export const listNotifications = async (req, res) => {
  try {
    const data = await notificationService.getUserNotifications(req.user.id, req.query);
    return res.status(200).json({
      code: 200,
      status: true,
      message: "Notifications fetched successfully",
      data: data.notifications,
      unread_count: data.unread_count,
      pagination: data.pagination,
    });
  } catch (error) {
    logger.error("listNotifications error:", error);
    return errorResponse(error, res);
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    const data = await notificationService.getUserNotifications(req.user.id, { limit: 1 });
    return successResponse(
      { unread_count: data.unread_count },
      "Unread count fetched successfully",
      res
    );
  } catch (error) {
    logger.error("getUnreadCount error:", error);
    return errorResponse(error, res);
  }
};

export const markAsRead = async (req, res) => {
  try {
    const updated = await notificationService.markUserNotificationAsRead(
      Number(req.params.id),
      req.user.id
    );
    if (!updated) {
      return notExistsResponse("Notification not found", res);
    }
    return successResponse(updated, "Notification marked as read", res);
  } catch (error) {
    logger.error("markAsRead error:", error);
    return errorResponse(error, res);
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    const result = await notificationService.markAllUserNotificationsAsRead(req.user.id);
    return successResponse(result, "All notifications marked as read", res);
  } catch (error) {
    logger.error("markAllAsRead error:", error);
    return errorResponse(error, res);
  }
};

export const updateFcmToken = async (req, res) => {
  try {
    const fcmToken = (req.body.fcm_token || req.body.device_token)?.trim() || null;
    await notificationService.updateUserFcmToken(req.user.id, fcmToken);
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
