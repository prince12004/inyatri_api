import { Op } from "sequelize";
import {
  Booking,
  BookingPayment,
  Coupon,
  CouponUsage,
  Car,
  CarBrand,
  CarType,
  City,
  sequelize,
} from "../../models/index.js";
import {
  BOOKING_STATUS,
  PAYMENT_ATTEMPT_STATUS,
  PAYMENT_STATUS,
} from "../../utils/constants/booking.enums.js";
import { buildPagination } from "../shared/query.util.js";

const bookingIncludes = [
  {
    model: Car,
    as: "car",
    attributes: [
      "id",
      "car_name",
      "model",
      "vehicle_number",
      "transmission",
      "seats",
      "fuel_type",
      "main_image",
      "location",
    ],
    include: [
      { model: CarBrand, as: "brand", attributes: ["id", "brand_name"] },
      { model: CarType, as: "carType", attributes: ["id", "type_name"] },
    ],
  },
  { model: City, as: "city", attributes: ["id", "short_name", "name"] },
  { model: Coupon, as: "coupon", attributes: ["id", "code", "title"] },
];

export const findCouponUsageByUser = async (couponId, userId) =>
  CouponUsage.findOne({
    where: { coupon_id: couponId, user_id: userId },
  });

export const countCouponUsages = async (couponId) =>
  CouponUsage.count({ where: { coupon_id: couponId } });

export const createBooking = async (data, transaction) =>
  Booking.create(data, { transaction });

export const updateBooking = async (id, data, transaction) => {
  const booking = await Booking.findByPk(id, { transaction });
  if (!booking) return null;
  await booking.update(data, { transaction });
  return booking;
};

export const findBookingById = async (id, userId = null) => {
  const where = { id };
  if (userId) where.user_id = userId;

  return Booking.findOne({
    where,
    include: bookingIncludes,
  });
};

export const findBookingByRef = async (bookingRef) =>
  Booking.findOne({
    where: { booking_ref: bookingRef },
    include: bookingIncludes,
  });

export const findBookingByPayuTxnId = async (payuTxnId) =>
  Booking.findOne({
    where: { payu_txn_id: payuTxnId },
    include: bookingIncludes,
  });

export const findBookingsByUser = async ({ userId, page, limit, bookingStatus }) => {
  const pagination = buildPagination(page, limit);
  const where = { user_id: userId };

  if (bookingStatus) {
    where.booking_status = bookingStatus;
  }

  const { rows, count } = await Booking.findAndCountAll({
    where,
    include: bookingIncludes,
    order: [["created_at", "DESC"]],
    limit: pagination.limit,
    offset: pagination.offset,
  });

  return { rows, count, pagination };
};

export const countPaymentAttempts = async (bookingId) =>
  BookingPayment.count({ where: { booking_id: bookingId } });

export const createPaymentAttempt = async (data, transaction) =>
  BookingPayment.create(data, { transaction });

export const updatePaymentAttempt = async (id, data, transaction) => {
  const payment = await BookingPayment.findByPk(id, { transaction });
  if (!payment) return null;
  await payment.update(data, { transaction });
  return payment;
};

export const findLatestPaymentAttempt = async (bookingId) =>
  BookingPayment.findOne({
    where: { booking_id: bookingId },
    order: [["attempt_no", "DESC"]],
  });

export const createCouponUsage = async (data, transaction) =>
  CouponUsage.create(data, { transaction });

export const withTransaction = (callback) => sequelize.transaction(callback);

export const findOverlappingConfirmedBooking = async ({
  carId,
  pickupAt,
  dropAt,
  excludeBookingId = null,
}) => {
  const where = {
    car_id: carId,
    booking_status: BOOKING_STATUS.CONFIRMED,
    [Op.and]: [
      { pickup_at: { [Op.lt]: dropAt } },
      { drop_at: { [Op.gt]: pickupAt } },
    ],
  };

  if (excludeBookingId) {
    where.id = { [Op.ne]: excludeBookingId };
  }

  return Booking.findOne({ where });
};

export const retryableBookingStatuses = [
  BOOKING_STATUS.PENDING_PAYMENT,
  BOOKING_STATUS.PAYMENT_FAILED,
  BOOKING_STATUS.PAYMENT_CANCELLED,
];

export const isPaymentRetryable = (booking) =>
  retryableBookingStatuses.includes(booking.booking_status) &&
  booking.payment_status !== PAYMENT_STATUS.SUCCESS;

export { BOOKING_STATUS, PAYMENT_STATUS, PAYMENT_ATTEMPT_STATUS };
