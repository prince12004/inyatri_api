import { Op } from "sequelize";
import {
  Booking,
  CabBooking,
  Car,
  CarBrand,
  CarType,
  City,
  Coupon,
  BookingPayment,
  CabBookingPayment,
} from "../../models/index.js";
import {
  BOOKING_STATUS,
  BOOKING_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
} from "../../utils/constants/booking.enums.js";
import ApiError from "../../utils/ApiError.js";

const TRIP_TYPE_LABELS = {
  one_way: "One Way",
  round_trip: "Round Trip",
  local: "Local / Rental",
  airport: "Airport",
  self_drive: "Self Drive",
  rental: "Self Drive",
  monthly: "Monthly Subscription",
};

export const formatBookingDateTime = (date) => {
  if (!date) return null;
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;

  try {
    const datePart = new Intl.DateTimeFormat("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      timeZone: "Asia/Kolkata",
    }).format(d);

    const timePart = new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    }).format(d);

    return `${datePart} · ${timePart}`;
  } catch {
    return d.toLocaleString("en-IN");
  }
};

const formatLocationPreview = (pickupLocation, cityName) => {
  if (cityName && cityName.trim()) {
    const cleanCity = cityName.trim();
    return cleanCity.length > 14
      ? `${cleanCity.slice(0, 11)}...`
      : `${cleanCity}...`;
  }

  if (!pickupLocation || !pickupLocation.trim()) {
    return "";
  }

  const firstPart = pickupLocation.split(",")[0].trim();
  return firstPart.length > 14
    ? `${firstPart.slice(0, 11)}...`
    : `${firstPart}...`;
};

export const determineBookingStatus = (booking, isCab = false) => {
  const statusNum = Number(booking.booking_status);
  const now = new Date();

  if (
    [
      BOOKING_STATUS.CANCELLED,
      BOOKING_STATUS.PAYMENT_CANCELLED,
      BOOKING_STATUS.PAYMENT_FAILED,
    ].includes(statusNum)
  ) {
    return "cancelled";
  }

  const scheduledEnd = isCab
    ? booking.return_at
      ? new Date(booking.return_at)
      : new Date(booking.departure_at)
    : new Date(booking.drop_at || booking.pickup_at);

  if (statusNum === BOOKING_STATUS.CONFIRMED && scheduledEnd < now) {
    return "completed";
  }

  if (
    [
      BOOKING_STATUS.CONFIRMED,
      BOOKING_STATUS.PENDING_PAYMENT,
      BOOKING_STATUS.PAYMENT_PROCESSING,
    ].includes(statusNum)
  ) {
    return scheduledEnd >= now ? "upcoming" : "completed";
  }

  return "completed";
};

const getStatusBadgeColor = (status) => {
  switch (status) {
    case "upcoming":
      return "#FF7A00"; // Orange (matches screenshot)
    case "completed":
      return "#10B981"; // Emerald green
    case "cancelled":
      return "#EF4444"; // Red
    default:
      return "#6B7280";
  }
};

export const formatUnifiedCard = (booking, isCab = false) => {
  const status = determineBookingStatus(booking, isCab);
  const scheduledAt = isCab ? booking.departure_at : booking.pickup_at;
  const endsAt = isCab ? booking.return_at : booking.drop_at;
  const tripType = isCab ? booking.trip_type : "self_drive";
  const tripTypeLabel = TRIP_TYPE_LABELS[tripType] || (isCab ? "Cab" : "Self Drive");

  const price = Number(
    booking.total_booking_amount || booking.payable_amount || 0
  );

  const cityName = booking.city?.name || booking.car?.city?.name || "";
  const locationPreview = formatLocationPreview(
    booking.pickup_location,
    cityName
  );

  return {
    id: booking.id,
    booking_ref: booking.booking_ref,
    category: isCab ? "cab" : "self_drive",
    category_label: isCab ? "Cab" : "Self Drive",
    trip_type: tripType,
    trip_type_label: tripTypeLabel,
    car_name: booking.car?.car_name || "Car",
    car_image: booking.car?.main_image || null,
    status,
    status_label: status,
    status_badge_color: getStatusBadgeColor(status),
    price,
    currency: "₹",
    formatted_price: `₹${Math.round(price)}`,
    location: locationPreview,
    pickup_location: booking.pickup_location,
    drop_location: booking.drop_location || null,
    scheduled_at: scheduledAt,
    scheduled_at_formatted: formatBookingDateTime(scheduledAt),
    ends_at: endsAt || null,
    ends_at_formatted: endsAt ? formatBookingDateTime(endsAt) : null,
    booking_status_raw: booking.booking_status,
    booking_status_label: BOOKING_STATUS_LABELS[booking.booking_status] || "unknown",
    payment_status_raw: booking.payment_status,
    payment_status_label: PAYMENT_STATUS_LABELS[booking.payment_status] || "unknown",
    created_at: booking.created_at,
  };
};

export const listUnifiedBookings = async (userId, query = {}) => {
  const statusFilter = (query.status || "all").toLowerCase().trim();
  const tripTypeFilter = (query.trip_type || query.category || "all")
    .toLowerCase()
    .trim();
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));

  const shouldFetchSelfDrive =
    tripTypeFilter === "all" ||
    tripTypeFilter === "self_drive";

  const shouldFetchCab =
    tripTypeFilter === "all" ||
    ["one_way", "round_trip", "local", "local_rental", "airport", "cab"].includes(
      tripTypeFilter
    );

  const cabTripTypeWhere = {};
  if (
    tripTypeFilter !== "all" &&
    tripTypeFilter !== "cab" &&
    tripTypeFilter !== "self_drive"
  ) {
    const mappedType =
      tripTypeFilter === "local_rental" ? "local" : tripTypeFilter;
    cabTripTypeWhere.trip_type = mappedType;
  }

  const carInclude = {
    model: Car,
    as: "car",
    attributes: ["id", "car_name", "main_image", "vehicle_number", "fuel_type", "transmission", "seats"],
  };

  const cityInclude = {
    model: City,
    as: "city",
    attributes: ["id", "name", "short_name"],
  };

  const [selfDriveRows, cabRows] = await Promise.all([
    shouldFetchSelfDrive
      ? Booking.findAll({
          where: { user_id: userId },
          include: [carInclude, cityInclude],
          order: [["created_at", "DESC"]],
        })
      : Promise.resolve([]),
    shouldFetchCab
      ? CabBooking.findAll({
          where: { user_id: userId, ...cabTripTypeWhere },
          include: [carInclude, cityInclude],
          order: [["created_at", "DESC"]],
        })
      : Promise.resolve([]),
  ]);

  const cards = [];

  for (const b of selfDriveRows) {
    const card = formatUnifiedCard(b, false);
    if (statusFilter === "all" || card.status === statusFilter) {
      cards.push(card);
    }
  }

  for (const c of cabRows) {
    const card = formatUnifiedCard(c, true);
    if (statusFilter === "all" || card.status === statusFilter) {
      cards.push(card);
    }
  }

  // Sort unified cards:
  // If "upcoming", order by scheduled_at ASC (nearest trip first)
  // Else order by scheduled_at DESC or created_at DESC (most recent first)
  cards.sort((a, b) => {
    if (statusFilter === "upcoming") {
      const timeA = new Date(a.scheduled_at || 0).getTime();
      const timeB = new Date(b.scheduled_at || 0).getTime();
      return timeA - timeB;
    }
    const timeA = new Date(a.created_at || a.scheduled_at || 0).getTime();
    const timeB = new Date(b.created_at || b.scheduled_at || 0).getTime();
    return timeB - timeA;
  });

  const total = cards.length;
  const offset = (page - 1) * limit;
  const paginatedRows = cards.slice(offset, offset + limit);

  return {
    rows: paginatedRows,
    count: total,
    pagination: {
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
      totalRecords: total,
    },
  };
};

export const getUnifiedBookingDetail = async (idOrRef, userId, typeHint = null) => {
  const isRef = isNaN(Number(idOrRef));
  const numericId = isRef ? null : parseInt(idOrRef, 10);
  const refString = String(idOrRef).trim();

  const carInclude = {
    model: Car,
    as: "car",
    include: [
      { model: CarBrand, as: "brand", attributes: ["id", "brand_name"] },
      { model: CarType, as: "carType", attributes: ["id", "type_name"] },
    ],
  };

  const cityInclude = {
    model: City,
    as: "city",
    attributes: ["id", "name", "short_name"],
  };

  const couponInclude = {
    model: Coupon,
    as: "coupon",
    attributes: ["id", "code", "title", "discount_percent", "max_discount_amount"],
  };

  // Helper search for Cab Booking
  const findCab = async () => {
    const where = { user_id: userId };
    if (numericId) where.id = numericId;
    else where.booking_ref = refString;

    return CabBooking.findOne({
      where,
      include: [
        carInclude,
        cityInclude,
        couponInclude,
        { model: CabBookingPayment, as: "payments" },
      ],
    });
  };

  // Helper search for Self-Drive Booking
  const findSelfDrive = async () => {
    const where = { user_id: userId };
    if (numericId) where.id = numericId;
    else where.booking_ref = refString;

    return Booking.findOne({
      where,
      include: [
        carInclude,
        cityInclude,
        couponInclude,
        { model: BookingPayment, as: "payments" },
      ],
    });
  };

  let booking = null;
  let isCab = false;

  if (typeHint === "cab" || refString.toUpperCase().includes("CAB") || refString.startsWith("IYC-")) {
    booking = await findCab();
    if (booking) isCab = true;
  } else if (typeHint === "self_drive" || refString.toUpperCase().includes("SD") || refString.startsWith("IYS-")) {
    booking = await findSelfDrive();
    if (booking) isCab = false;
  }

  // If not found yet, check both
  if (!booking) {
    booking = await findCab();
    if (booking) {
      isCab = true;
    } else {
      booking = await findSelfDrive();
      if (booking) {
        isCab = false;
      }
    }
  }

  if (!booking) {
    throw new ApiError(404, "Booking not found");
  }

  const baseCard = formatUnifiedCard(booking, isCab);

  const carData = booking.car
    ? {
        id: booking.car.id,
        car_name: booking.car.car_name,
        vehicle_number: booking.car.vehicle_number,
        seats: booking.car.seats,
        fuel_type: booking.car.fuel_type,
        transmission: booking.car.transmission,
        made_year: booking.car.made_year,
        main_image: booking.car.main_image,
        brand: booking.car.brand
          ? { id: booking.car.brand.id, name: booking.car.brand.brand_name }
          : null,
        car_type: booking.car.carType
          ? { id: booking.car.carType.id, name: booking.car.carType.type_name }
          : null,
      }
    : null;

  const fareBreakdown = isCab
    ? {
        base_fare: Number(booking.base_fare || 0),
        driver_allowance: Number(booking.driver_allowance || 0),
        gst_amount: Number(booking.gst_amount || 0),
        discount_amount: Number(booking.discount_amount || 0),
        payable_amount: Number(booking.payable_amount || 0),
        total_booking_amount: Number(booking.total_booking_amount || 0),
        paid_amount: Number(booking.paid_amount || 0),
        remaining_amount: Number(booking.remaining_amount || 0),
      }
    : {
        base_rental_amount: Number(booking.base_rental_amount || 0),
        insurance_amount: Number(booking.insurance_amount || 0),
        delivery_amount: Number(booking.delivery_amount || 0),
        plan_discount_amount: Number(booking.plan_discount_amount || 0),
        gst_amount: Number(booking.gst_amount || 0),
        discount_amount: Number(booking.discount_amount || 0),
        security_deposit_amount: Number(booking.security_deposit_amount || 0),
        payable_amount: Number(booking.payable_amount || 0),
        total_booking_amount: Number(booking.total_booking_amount || 0),
        paid_amount: Number(booking.paid_amount || 0),
        remaining_amount: Number(booking.remaining_amount || 0),
      };

  return {
    ...baseCard,
    car: carData,
    trip_details: {
      pickup_location: booking.pickup_location,
      drop_location: booking.drop_location || null,
      stops: booking.stops || [],
      scheduled_at: baseCard.scheduled_at,
      scheduled_at_formatted: baseCard.scheduled_at_formatted,
      ends_at: baseCard.ends_at,
      ends_at_formatted: baseCard.ends_at_formatted,
      distance_km: booking.distance_km ? Number(booking.distance_km) : null,
      rental_days: booking.rental_days || null,
      rental_type: booking.rental_type || null,
      subscription_plan: booking.subscription_plan || null,
      insurance_selected: Boolean(booking.insurance_selected),
      home_delivery_selected: Boolean(booking.home_delivery_selected),
    },
    contact_number: booking.contact_number || null,
    fare_breakdown: fareBreakdown,
    coupon: booking.coupon
      ? {
          id: booking.coupon.id,
          code: booking.coupon.code,
          title: booking.coupon.title,
          discount_percent: Number(booking.coupon.discount_percent || 0),
          max_discount_amount: booking.coupon.max_discount_amount
            ? Number(booking.coupon.max_discount_amount)
            : null,
        }
      : null,
    payment_summary: {
      payment_option: booking.payment_option || "full",
      payment_status: baseCard.payment_status_label,
      payu_txn_id: booking.payu_txn_id || null,
      payments: (booking.payments || []).map((p) => ({
        id: p.id,
        attempt_no: p.attempt_no,
        amount: Number(p.amount || 0),
        status: PAYMENT_STATUS_LABELS[p.status] || "unknown",
        payu_txn_id: p.payu_txn_id,
        created_at: p.created_at,
      })),
    },
  };
};
