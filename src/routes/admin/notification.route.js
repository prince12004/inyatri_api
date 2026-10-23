import express from "express";
const router = express.Router();

import * as notificationController from "../../controllers/admin/notification.controller.js";
import auth from "../../middlewares/adminAuth.js";
import validate from "../../middlewares/validation.js";
import schema from "../../middlewares/joiValidation/notification.js";

router.use(auth.required);

router.get(
  "/",
  validate({ query: schema.listNotificationsQuerySchema }),
  notificationController.listNotifications
);

router.get("/unread-count", notificationController.getUnreadCount);

router.patch(
  "/read-all",
  notificationController.markAllAsRead
);

router.patch(
  "/:id/read",
  validate({ params: schema.notificationIdParamSchema }),
  notificationController.markAsRead
);

router.post(
  "/fcm-token",
  validate({ body: schema.updateFcmTokenSchema }),
  notificationController.updateFcmToken
);

router.patch(
  "/fcm-token",
  validate({ body: schema.updateFcmTokenSchema }),
  notificationController.updateFcmToken
);

router.post(
  "/trigger-date-reminders",
  notificationController.triggerBookingDateReminders
);

router.post(
  "/send-broadcast",
  validate({ body: schema.sendBroadcastSchema }),
  notificationController.sendBroadcastNotification
);

router.post(
  "/send-user",
  validate({ body: schema.sendUserSchema }),
  notificationController.sendDirectUserNotification
);

export default router;
