import express from "express";
const router = express.Router();

import * as notificationController from "../../controllers/user/notification.controller.js";
import auth from "../../middlewares/userAuth.js";
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

export default router;
