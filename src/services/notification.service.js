import { Op } from "sequelize";
import { Notification, User, Admin, Booking, CabBooking } from "../models/index.js";
import { sendToSingleUser, sendToMultipleUsers } from "../utils/firebase.helper.js";
import logger from "../utils/logger.js";
import { BOOKING_STATUS } from "../utils/constants/booking.enums.js";

/**
 * Save notification record in database and send FCM push notification
 */
export const sendAndSaveNotification = async ({
  userId = null,
  adminId = null,
  recipientRole = "user",
  title,
  body,
  type = "general",
  data = {},
}) => {
  let notificationRecord = null;

  try {
    notificationRecord = await Notification.create({
      user_id: userId,
      admin_id: adminId,
      recipient_role: recipientRole,
      title,
      body,
      type,
      data,
      is_read: 0,
    });
  } catch (dbError) {
    logger.error("Failed to save notification in DB:", dbError);
  }

  // Send push notification via Firebase Admin
  try {
    if (recipientRole === "user" && userId) {
      const user = await User.findByPk(userId, { attributes: ["id", "fcm_token"] });
      if (user?.fcm_token) {
        await sendToSingleUser(user.fcm_token, title, body, {
          ...data,
          notification_id: notificationRecord?.id,
          type,
        });
      }
    } else if (recipientRole === "admin") {
      let tokens = [];
      if (adminId) {
        const admin = await Admin.findByPk(adminId, { attributes: ["id", "fcm_token"] });
        if (admin?.fcm_token) tokens = [admin.fcm_token];
      } else {
        const admins = await Admin.findAll({
          where: { status: 1, fcm_token: { [Op.ne]: null } },
          attributes: ["id", "fcm_token"],
        });
        tokens = admins.map((a) => a.fcm_token).filter(Boolean);
      }

      if (tokens.length === 1) {
        await sendToSingleUser(tokens[0], title, body, {
          ...data,
          notification_id: notificationRecord?.id,
          type,
        });
      } else if (tokens.length > 1) {
        await sendToMultipleUsers(tokens, title, body, {
          ...data,
          notification_id: notificationRecord?.id,
          type,
        });
      }
    }
  } catch (pushError) {
    logger.error("Failed to dispatch push notification:", pushError);
  }

  return notificationRecord;
};

/**
 * Trigger: Booking Confirmation (to both User and Admin)
 */
export const notifyBookingConfirmed = async (booking, isCab = false) => {
  if (!booking) return;

  const bookingRef = booking.booking_ref || `ID-${booking.id}`;
  const amount = Number(booking.paid_amount || booking.payable_amount || booking.total_booking_amount || 0);
  const tripLabel = isCab ? `Cab (${booking.trip_type || "ride"})` : "Self-Drive Rental";

  // 1. Notify User
  await sendAndSaveNotification({
    userId: booking.user_id,
    recipientRole: "user",
    title: "Booking Confirmed! 🎉",
    body: `Your ${tripLabel} booking #${bookingRef} is confirmed. Thank you for booking with InYatri!`,
    type: "booking_confirmed",
    data: {
      booking_id: booking.id,
      booking_ref: bookingRef,
      is_cab: isCab,
      type: "booking_confirmed",
    },
  });

  // 2. Notify Admin(s)
  await sendAndSaveNotification({
    adminId: null, // Broadcast to active admins
    recipientRole: "admin",
    title: "New Booking Confirmed 🚗",
    body: `New ${tripLabel} booking #${bookingRef} confirmed for ₹${amount.toFixed(0)}.`,
    type: "booking_confirmed",
    data: {
      booking_id: booking.id,
      booking_ref: bookingRef,
      is_cab: isCab,
      amount,
      type: "booking_confirmed",
    },
  });
};

/**
 * Trigger: User Account Creation (to both User and Admin)
 */
export const notifyUserAccountCreated = async (user) => {
  if (!user) return;

  const displayName = [user.firstname, user.lastname].filter(Boolean).join(" ").trim() || user.mobile || "Customer";

  // 1. Notify User
  await sendAndSaveNotification({
    userId: user.id,
    recipientRole: "user",
    title: "Welcome to InYatri! 🚗",
    body: `Hello ${displayName}, your InYatri account has been created successfully. Start exploring self-drive cars and cabs today!`,
    type: "account_created",
    data: {
      user_id: user.id,
      type: "account_created",
    },
  });

  // 2. Notify Admin
  await sendAndSaveNotification({
    adminId: null,
    recipientRole: "admin",
    title: "New User Registered 👤",
    body: `New user joined InYatri: ${displayName} (${user.mobile}).`,
    type: "account_created",
    data: {
      user_id: user.id,
      mobile: user.mobile,
      type: "account_created",
    },
  });
};

/**
 * Trigger: Booking Date Reminder (Acknowledged to User on Booking Date)
 */
export const notifyBookingDateReminder = async (booking, isCab = false) => {
  if (!booking) return;

  const bookingRef = booking.booking_ref || `ID-${booking.id}`;
  const tripLabel = isCab ? "Cab ride" : "Self-Drive booking";

  // Check if reminder was already sent today for this booking
  const existingReminder = await Notification.findOne({
    where: {
      user_id: booking.user_id,
      type: "booking_date_reminder",
      data: { booking_id: booking.id, is_cab: isCab },
    },
  });

  if (existingReminder) return existingReminder;

  return sendAndSaveNotification({
    userId: booking.user_id,
    recipientRole: "user",
    title: "Your Trip Starts Today! 🧳",
    body: `Reminder: Your ${tripLabel} #${bookingRef} is scheduled for today. Have a safe and pleasant journey with InYatri!`,
    type: "booking_date_reminder",
    data: {
      booking_id: booking.id,
      booking_ref: bookingRef,
      is_cab: isCab,
      type: "booking_date_reminder",
    },
  });
};

/**
 * Background / Cron check: scan all confirmed bookings starting today and acknowledge users
 */
export const checkAndSendBookingDateReminders = async () => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  let remindersSent = 0;

  try {
    // 1. Self-drive bookings starting today
    const selfDriveBookings = await Booking.findAll({
      where: {
        booking_status: BOOKING_STATUS.CONFIRMED,
        pickup_at: {
          [Op.between]: [startOfDay, endOfDay],
        },
      },
    });

    for (const b of selfDriveBookings) {
      await notifyBookingDateReminder(b, false);
      remindersSent++;
    }

    // 2. Cab bookings starting today
    const cabBookings = await CabBooking.findAll({
      where: {
        booking_status: BOOKING_STATUS.CONFIRMED,
        departure_at: {
          [Op.between]: [startOfDay, endOfDay],
        },
      },
    });

    for (const cb of cabBookings) {
      await notifyBookingDateReminder(cb, true);
      remindersSent++;
    }

    logger.info(`📅 Booking date reminder check completed: ${remindersSent} reminders processed.`);
  } catch (error) {
    logger.error("Error in checkAndSendBookingDateReminders:", error);
  }

  return { remindersSent };
};

/**
 * Update FCM / Device Token for User
 */
export const updateUserFcmToken = async (userId, token) => {
  const user = await User.findByPk(userId);
  if (!user) return null;

  const fcmToken = token ? String(token).trim() : null;
  await user.update({ fcm_token: fcmToken });
  return user;
};

/**
 * Update FCM / Device Token for Admin
 */
export const updateAdminFcmToken = async (adminId, token) => {
  const admin = await Admin.findByPk(adminId);
  if (!admin) return null;

  const fcmToken = token ? String(token).trim() : null;
  await admin.update({ fcm_token: fcmToken });
  return admin;
};

/**
 * Fetch Notifications for User (Bell Icon)
 */
export const getUserNotifications = async (userId, { page = 1, limit = 20, is_read = null } = {}) => {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const offset = (pageNum - 1) * limitNum;

  const where = { user_id: userId, recipient_role: "user" };
  if (is_read !== null && is_read !== undefined && is_read !== "") {
    where.is_read = parseInt(is_read, 10) ? 1 : 0;
  }

  const { rows, count } = await Notification.findAndCountAll({
    where,
    order: [["created_at", "DESC"]],
    limit: limitNum,
    offset,
  });

  const unreadCount = await Notification.count({
    where: { user_id: userId, recipient_role: "user", is_read: 0 },
  });

  return {
    notifications: rows,
    unread_count: unreadCount,
    pagination: {
      totalItems: count,
      currentPage: pageNum,
      totalPages: Math.ceil(count / limitNum),
      limit: limitNum,
    },
  };
};

/**
 * Mark a single User notification as read
 */
export const markUserNotificationAsRead = async (notificationId, userId) => {
  const notification = await Notification.findOne({
    where: { id: notificationId, user_id: userId, recipient_role: "user" },
  });

  if (!notification) return null;

  await notification.update({ is_read: 1, read_at: new Date() });
  return notification;
};

/**
 * Mark all User notifications as read
 */
export const markAllUserNotificationsAsRead = async (userId) => {
  const [affectedCount] = await Notification.update(
    { is_read: 1, read_at: new Date() },
    { where: { user_id: userId, recipient_role: "user", is_read: 0 } }
  );

  return { markedRead: affectedCount };
};

/**
 * Fetch Notifications for Admin (Bell Icon)
 */
export const getAdminNotifications = async (adminId, { page = 1, limit = 20, is_read = null } = {}) => {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const offset = (pageNum - 1) * limitNum;

  const where = {
    recipient_role: "admin",
    [Op.or]: [{ admin_id: adminId }, { admin_id: null }],
  };

  if (is_read !== null && is_read !== undefined && is_read !== "") {
    where.is_read = parseInt(is_read, 10) ? 1 : 0;
  }

  const { rows, count } = await Notification.findAndCountAll({
    where,
    order: [["created_at", "DESC"]],
    limit: limitNum,
    offset,
  });

  const unreadCount = await Notification.count({
    where: {
      recipient_role: "admin",
      is_read: 0,
      [Op.or]: [{ admin_id: adminId }, { admin_id: null }],
    },
  });

  return {
    notifications: rows,
    unread_count: unreadCount,
    pagination: {
      totalItems: count,
      currentPage: pageNum,
      totalPages: Math.ceil(count / limitNum),
      limit: limitNum,
    },
  };
};

/**
 * Mark an Admin notification as read
 */
export const markAdminNotificationAsRead = async (notificationId, adminId) => {
  const notification = await Notification.findOne({
    where: {
      id: notificationId,
      recipient_role: "admin",
      [Op.or]: [{ admin_id: adminId }, { admin_id: null }],
    },
  });

  if (!notification) return null;

  await notification.update({ is_read: 1, read_at: new Date() });
  return notification;
};

/**
 * Mark all Admin notifications as read
 */
export const markAllAdminNotificationsAsRead = async (adminId) => {
  const [affectedCount] = await Notification.update(
    { is_read: 1, read_at: new Date() },
    {
      where: {
        recipient_role: "admin",
        is_read: 0,
        [Op.or]: [{ admin_id: adminId }, { admin_id: null }],
      },
    }
  );

  return { markedRead: affectedCount };
};

/**
 * Admin: Broadcast push and in-app notification to all active users
 */
export const sendBroadcastNotification = async ({
  title,
  body,
  type = "broadcast",
  data = {},
}) => {
  const activeUsers = await User.findAll({
    where: { status: 1 },
    attributes: ["id", "fcm_token"],
  });

  const tokens = activeUsers
    .map((u) => u.fcm_token)
    .filter((t) => typeof t === "string" && t.trim().length > 0);

  let pushResult = null;
  if (tokens.length > 0) {
    try {
      pushResult = await sendToMultipleUsers(tokens, title, body, {
        ...data,
        type,
      });
    } catch (err) {
      logger.error("Failed to broadcast push notification:", err);
    }
  }

  // Save bell icon notifications in bulk for all active users
  try {
    const records = activeUsers.map((u) => ({
      user_id: u.id,
      recipient_role: "user",
      title,
      body,
      type,
      data,
      is_read: 0,
    }));
    if (records.length > 0) {
      await Notification.bulkCreate(records);
    }
  } catch (err) {
    logger.error("Failed to save broadcast notifications in DB:", err);
  }

  return {
    total_users: activeUsers.length,
    push_tokens_targeted: tokens.length,
    push_result: pushResult,
  };
};

/**
 * Admin: Send direct push and in-app notification to a specific user
 */
export const sendDirectUserNotification = async ({
  userId,
  title,
  body,
  type = "general",
  data = {},
}) => {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new Error("User not found");
  }

  const record = await sendAndSaveNotification({
    userId: user.id,
    recipientRole: "user",
    title,
    body,
    type,
    data,
  });

  return {
    user: {
      id: user.id,
      firstname: user.firstname,
      lastname: user.lastname,
      mobile: user.mobile,
      has_fcm_token: Boolean(user.fcm_token),
    },
    notification: record,
  };
};

