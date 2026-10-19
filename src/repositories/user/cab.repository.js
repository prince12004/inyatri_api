import { Op } from "sequelize";
import {
  Car,
  CabBooking,
  CabBookingPayment,
  CabFareSlab,
  CabPackage,
  CarBrand,
  CarType,
  Coupon,
  City,
  sequelize,
} from "../../models/index.js";
import {
  BOOKING_STATUS,
  PAYMENT_ATTEMPT_STATUS,
  PAYMENT_STATUS,
} from "../../utils/constants/booking.enums.js";
import { buildPagination } from "../shared/query.util.js";

// ─── Cab Car Includes (for listing) ───────────────────────────────────────

const carIncludes = [
  { model: CarBrand, as: "brand", attributes: ["id", "brand_name"] },
  { model: CarType, as: "carType", attributes: ["id", "type_name"] },
  { model: City, as: "city", attributes: ["id", "short_name", "name"] },
];

// ─── Cab Booking Includes ──────────────────────────────────────────────────

const cabBookingIncludes = [
  {
    model: Car,
    as: "car",
    attributes: ["id", "car_name", "model", "seats", "fuel_type", "main_image", "location"],
    include: [
      { model: CarBrand, as: "brand", attributes: ["id", "brand_name"] },
      { model: CarType, as: "carType", attributes: ["id", "type_name"] },
    ],
  },
  { model: City, as: "city", attributes: ["id", "short_name", "name"] },
  { model: Coupon, as: "coupon", attributes: ["id", "code", "title"] },
  {
    model: CabPackage,
    as: "package",
    attributes: ["id", "label", "duration_hours", "included_km"],
  },
];

// ─── Fare Slab Queries ─────────────────────────────────────────────────────

/**
 * Find fare slab for a specific car + trip_type combination.
 * Used in booking summary and checkout to validate + compute fare.
 */
export const findFareSlabByCarAndTripType = async ({
  carId,
  tripType,
  packageId = null,
}) => {
  const where = { car_id: carId, trip_type: tripType, status: 1 };
  if (packageId) where.package_id = packageId;

  return CabFareSlab.findOne({ where });
};

/**
 * Find all active cars that have a cab fare slab for the given trip type.
 * Used for search results and car listing page.
 */
export const findCabCarsByTripType = async ({
  tripType,
  cityId = null,
  packageId = null,
  page,
  limit,
}) => {
  const pagination = buildPagination(page, limit);

  // Find all active slabs for this trip type → get their car_ids
  const slabWhere = { trip_type: tripType, status: 1 };
  if (packageId) slabWhere.package_id = packageId;

  // Build car where
  const carWhere = { status: 1 };
  if (cityId) carWhere.city_id = cityId;

  const { rows, count } = await Car.findAndCountAll({
    where: carWhere,
    include: [
      ...carIncludes,
      {
        model: CabFareSlab,
        as: "cabPricings",
        where: slabWhere,
        required: true, // INNER JOIN — only cars WITH active pricing
        attributes: [
          "id", "trip_type", "package_id",
          "base_km", "base_fare", "per_km_charge", "driver_allowance",
        ],
        include: [
          {
            model: CabPackage,
            as: "package",
            attributes: ["id", "label", "duration_hours", "included_km"],
            required: false,
          },
        ],
      },
    ],
    order: [["created_at", "DESC"]],
    limit: pagination.limit,
    offset: pagination.offset,
    distinct: true,
  });

  return { rows, count, pagination };
};

/**
 * Find a single car with its fare slab for a specific trip type.
 * Used on the car detail page and booking summary.
 */
export const findCabCarById = async ({ carId, tripType, packageId = null }) => {
  const slabWhere = { trip_type: tripType, status: 1 };
  if (packageId) slabWhere.package_id = packageId;

  return Car.findOne({
    where: { id: carId, status: 1 },
    include: [
      ...carIncludes,
      {
        model: CabFareSlab,
        as: "cabPricings",
        where: slabWhere,
        required: true,
        attributes: [
          "id", "trip_type", "package_id",
          "base_km", "base_fare", "per_km_charge", "driver_allowance",
        ],
        include: [
          {
            model: CabPackage,
            as: "package",
            attributes: ["id", "label", "duration_hours", "included_km"],
            required: false,
          },
        ],
      },
    ],
  });
};

// ─── Cab Package Queries ───────────────────────────────────────────────────

export const findActiveCabPackagesByCity = async (cityId) =>
  CabPackage.findAll({
    where: { city_id: cityId, status: 1 },
    order: [["sort_order", "ASC"], ["duration_hours", "ASC"]],
  });

export const findActiveCabPackageById = async (packageId, cityId = null) => {
  const where = { id: packageId, status: 1 };
  if (cityId) where.city_id = cityId;
  return CabPackage.findOne({ where });
};

// ─── Cab Booking CRUD ──────────────────────────────────────────────────────

export const createCabBooking = async (data, transaction) =>
  CabBooking.create(data, { transaction });

export const updateCabBooking = async (id, data, transaction) => {
  const booking = await CabBooking.findByPk(id, { transaction });
  if (!booking) return null;
  await booking.update(data, { transaction });
  return booking;
};

export const findCabBookingById = async (id, userId = null) => {
  const where = { id };
  if (userId) where.user_id = userId;
  return CabBooking.findOne({ where, include: cabBookingIncludes });
};

export const findCabBookingByPayuTxnId = async (payuTxnId) =>
  CabBooking.findOne({
    where: { payu_txn_id: payuTxnId },
    include: cabBookingIncludes,
  });

export const findCabBookingsByUser = async ({
  userId,
  page,
  limit,
  tripType,
  bookingStatus,
}) => {
  const pagination = buildPagination(page, limit);
  const where = { user_id: userId };
  if (tripType) where.trip_type = tripType;
  if (bookingStatus) where.booking_status = bookingStatus;

  const { rows, count } = await CabBooking.findAndCountAll({
    where,
    include: cabBookingIncludes,
    order: [["created_at", "DESC"]],
    limit: pagination.limit,
    offset: pagination.offset,
  });

  return { rows, count, pagination };
};

// ─── Payment Attempts ──────────────────────────────────────────────────────

export const countCabPaymentAttempts = async (cabBookingId) =>
  CabBookingPayment.count({ where: { cab_booking_id: cabBookingId } });

export const createCabPaymentAttempt = async (data, transaction) =>
  CabBookingPayment.create(data, { transaction });

export const updateCabPaymentAttempt = async (id, data, transaction) => {
  const payment = await CabBookingPayment.findByPk(id, { transaction });
  if (!payment) return null;
  await payment.update(data, { transaction });
  return payment;
};

export const findLatestCabPaymentAttempt = async (cabBookingId) =>
  CabBookingPayment.findOne({
    where: { cab_booking_id: cabBookingId },
    order: [["attempt_no", "DESC"]],
  });

// ─── Retryability ──────────────────────────────────────────────────────────

export const retryableCabBookingStatuses = [
  BOOKING_STATUS.PENDING_PAYMENT,
  BOOKING_STATUS.PAYMENT_FAILED,
  BOOKING_STATUS.PAYMENT_CANCELLED,
];

export const isCabPaymentRetryable = (booking) =>
  retryableCabBookingStatuses.includes(booking.booking_status) &&
  booking.payment_status !== PAYMENT_STATUS.SUCCESS;

// ─── Shared ────────────────────────────────────────────────────────────────

export const withTransaction = (callback) => sequelize.transaction(callback);

export { BOOKING_STATUS, PAYMENT_STATUS, PAYMENT_ATTEMPT_STATUS };
