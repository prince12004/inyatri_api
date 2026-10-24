import * as notificationService from "../../services/notification.service.js";
import {
  successResponse,
  errorResponse,
  notExistsResponse,
} from "../../utils/response.js";
import logger from "../../utils/logger.js";

export const listNotifications = async (req, res) => {
  try {
    const adminId = req.payload?.id;
    const data = await notificationService.getAdminNotifications(adminId, req.query);
    return res.status(200).json({
      code: 200,
      status: true,
      message: "Admin notifications fetched successfully",
      data: data.notifications,
      unread_count: data.unread_count,
      pagination: data.pagination,
    });
  } catch (error) {
    logger.error("admin listNotifications error:", error);
    return errorResponse(error, res);
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    const adminId = req.payload?.id;
    const data = await notificationService.getAdminNotifications(adminId, { limit: 1 });
    return successResponse(
      { unread_count: data.unread_count },
      "Unread count fetched successfully",
      res
    );
  } catch (error) {
    logger.error("admin getUnreadCount error:", error);
    return errorResponse(error, res);
  }
};

export const markAsRead = async (req, res) => {
  try {
    const adminId = req.payload?.id;
    const updated = await notificationService.markAdminNotificationAsRead(
      Number(req.params.id),
      adminId
    );
    if (!updated) {
      return notExistsResponse("Notification not found", res);
    }
    return successResponse(updated, "Notification marked as read", res);
  } catch (error) {
    logger.error("admin markAsRead error:", error);
    return errorResponse(error, res);
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    const adminId = req.payload?.id;
    const result = await notificationService.markAllAdminNotificationsAsRead(adminId);
    return successResponse(result, "All notifications marked as read", res);
  } catch (error) {
    logger.error("admin markAllAsRead error:", error);
    return errorResponse(error, res);
  }
};

export const updateFcmToken = async (req, res) => {
  try {
    const adminId = req.payload?.id;
    const fcmToken = (req.body.fcm_token || req.body.device_token)?.trim() || null;
    await notificationService.updateAdminFcmToken(adminId, fcmToken);
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

export const triggerBookingDateReminders = async (req, res) => {
  try {
    const result = await notificationService.checkAndSendBookingDateReminders();
    return successResponse(
      result,
      "Booking date reminders triggered successfully",
      res
    );
  } catch (error) {
    logger.error("triggerBookingDateReminders error:", error);
    return errorResponse(error, res);
  }
};

export const sendBroadcastNotification = async (req, res) => {
  try {
    const result = await notificationService.sendBroadcastNotification(req.body);
    return successResponse(
      result,
      "Broadcast notification sent successfully",
      res
    );
  } catch (error) {
    logger.error("sendBroadcastNotification error:", error);
    return errorResponse(error, res);
  }
};

export const sendDirectUserNotification = async (req, res) => {
  try {
    const result = await notificationService.sendDirectUserNotification({
      userId: req.body.user_id,
      title: req.body.title,
      body: req.body.body,
      type: req.body.type,
      data: req.body.data,
    });
    return successResponse(
      result,
      "Direct notification sent successfully",
      res
    );
  } catch (error) {
    logger.error("sendDirectUserNotification error:", error);
    return errorResponse(error, res);
  }
};

