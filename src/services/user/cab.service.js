import * as cabRepository from "../../repositories/user/cab.repository.js";
import * as cityRepository from "../../repositories/user/city.repository.js";
import * as couponService from "./coupon.service.js";
import * as payuService from "../payment/payu.service.js";
import ApiError from "../../utils/ApiError.js";
import {
  buildOneWayRoundTripFare,
  buildLocalCabFare,
  fareBreakdownForClient,
} from "../../utils/cab/fare.util.js";
import {
  buildPayuCheckoutPayload,
  generatePayuRequestHash,
} from "../../utils/payment/payu.util.js";
import {
  BOOKING_STATUS,
  PAYMENT_STATUS,
  PAYMENT_ATTEMPT_STATUS,
  BOOKING_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
} from "../../utils/constants/booking.enums.js";
import { CAB_TRIP_TYPES } from "../../utils/constants/cab.enums.js";

// ─── Helpers ──────────────────────────────────────────────────────────────

const generateCabBookingRef = (bookingId) =>
  `IYC-${String(bookingId).padStart(5, "0")}`;

const generatePayuTxnId = (bookingRef, attemptNo) =>
  `${bookingRef.replace("-", "")}-${attemptNo}-${Date.now()}`;

const isLocalTrip = (tripType) => tripType === CAB_TRIP_TYPES.LOCAL;

/**
 * Extract the first active fare slab from a car's cabPricings array.
 */
const getSlabFromCar = (car) => (car.cabPricings ?? [])[0] ?? null;

const formatCabBookingStatus = (booking) => ({
  booking_status: BOOKING_STATUS_LABELS[booking.booking_status],
  payment_status: PAYMENT_STATUS_LABELS[booking.payment_status],
});

const formatCarForListing = (car) => ({
  id: car.id,
  car_name: car.car_name,
  model: car.model,
  seats: car.seats,
  fuel_type: car.fuel_type,
  main_image: car.main_image,
  subtitle: "or similar · driver included",
  brand: car.brand ? { id: car.brand.id, brand_name: car.brand.brand_name } : null,
  car_type: car.carType ? { id: car.carType.id, type_name: car.carType.type_name } : null,
  city: car.city ? { id: car.city.id, short_name: car.city.short_name, name: car.city.name } : null,
});

export const formatCabBooking = (booking) => ({
  id: booking.id,
  booking_ref: booking.booking_ref,
  trip_type: booking.trip_type,
  pickup_location: booking.pickup_location,
  drop_location: booking.drop_location,
  stops: booking.stops ?? [],
  departure_at: booking.departure_at,
  return_at: booking.return_at ?? null,
  distance_km: booking.distance_km !== null ? Number(booking.distance_km) : null,
  contact_number: booking.contact_number,
  ...formatCabBookingStatus(booking),
  total_booking_amount: Number(booking.total_booking_amount),
  paid_amount: Number(booking.paid_amount),
  remaining_amount: Number(booking.remaining_amount),
  fare_breakdown: {
    base_fare: Number(booking.base_fare),
    driver_allowance: Number(booking.driver_allowance),
    gst_amount: Number(booking.gst_amount),
    discount_amount: Number(booking.discount_amount),
    payable_amount: Number(booking.payable_amount),
  },
  car: booking.car
    ? {
        id: booking.car.id,
        car_name: booking.car.car_name,
        model: booking.car.model,
        seats: booking.car.seats,
        fuel_type: booking.car.fuel_type,
        main_image: booking.car.main_image,
        brand: booking.car.brand
          ? { id: booking.car.brand.id, brand_name: booking.car.brand.brand_name }
          : null,
        car_type: booking.car.carType
          ? { id: booking.car.carType.id, type_name: booking.car.carType.type_name }
          : null,
      }
    : null,
  city: booking.city
    ? { id: booking.city.id, short_name: booking.city.short_name, name: booking.city.name }
    : null,
  package: booking.package
    ? {
        id: booking.package.id,
        label: booking.package.label,
        duration_hours: booking.package.duration_hours,
        included_km: booking.package.included_km,
      }
    : null,
  coupon: booking.coupon
    ? { id: booking.coupon.id, code: booking.coupon.code, title: booking.coupon.title }
    : null,
  payu_txn_id: booking.payu_txn_id,
  created_at: booking.created_at,
  updated_at: booking.updated_at,
});

// ─── Fare Resolver ────────────────────────────────────────────────────────

/**
 * Resolve fare slab + package + breakdown for a given car + trip params.
 */
const resolveCabFareContext = async (payload, coupon = null) => {
  const { trip_type, car_id, distance_km, package_id, city_id } = payload;

  // Find car with its fare slab via JOIN
  const car = await cabRepository.findCabCarById({
    carId: car_id,
    tripType: trip_type,
    packageId: package_id ?? null,
  });

  if (!car) {
    throw new ApiError(
      404,
      "Car not found or no active cab pricing configured for this trip type"
    );
  }

  const fareSlab = getSlabFromCar(car);
  if (!fareSlab) {
    throw new ApiError(404, "No active fare configured for this car and trip type");
  }

  let pkg = null;
  if (isLocalTrip(trip_type)) {
    if (!package_id) {
      throw new ApiError(400, "package_id is required for local trips");
    }
    pkg = fareSlab.package ?? null;
    if (!pkg) {
      throw new ApiError(404, "Package not found or inactive for this car");
    }
  }

  const fareBreakdown = isLocalTrip(trip_type)
    ? buildLocalCabFare({ fareSlab, pkg, coupon })
    : buildOneWayRoundTripFare({
        fareSlab,
        distanceKm: distance_km,
        tripType: trip_type,
        coupon,
      });

  return { car, fareSlab, fareBreakdown, pkg };
};

// ─── Public Services ──────────────────────────────────────────────────────

/**
 * GET /cab/packages?city_id=X
 */
export const listCabPackages = async (cityId) => {
  const city = await cityRepository.findActiveCityById(cityId);
  if (!city) throw new ApiError(404, "City not found or inactive");

  const packages = await cabRepository.findActiveCabPackagesByCity(cityId);
  return {
    city: { id: city.id, short_name: city.short_name, name: city.name },
    packages: packages.map((p) => ({
      id: p.id,
      label: p.label,
      duration_hours: p.duration_hours,
      included_km: p.included_km,
    })),
  };
};

/**
 * POST /cab/search
 * Returns all configured cars for the trip type with starting fares.
 */
export const searchCabs = async (payload) => {
  const { trip_type, city_id, package_id } = payload;

  let city = null;
  if (city_id) {
    city = await cityRepository.findActiveCityById(city_id);
    if (!city) throw new ApiError(404, "City not found or inactive");
  }

  let pkg = null;
  if (isLocalTrip(trip_type) && package_id) {
    pkg = await cabRepository.findActiveCabPackageById(package_id, city_id ?? null);
    if (!pkg) throw new ApiError(404, "Package not found or inactive");
  }

  const { rows: cars } = await cabRepository.findCabCarsByTripType({
    tripType: trip_type,
    cityId: city_id ?? null,
    packageId: package_id ?? null,
    page: 1,
    limit: 100,
  });

  const carResults = cars.map((car) => {
    const slab = getSlabFromCar(car);
    if (!slab) return null;

    let startingFare;
    try {
      const preview = isLocalTrip(trip_type)
        ? buildLocalCabFare({ fareSlab: slab, pkg })
        : buildOneWayRoundTripFare({
            fareSlab: slab,
            distanceKm: payload.distance_km ?? 0,
            tripType: trip_type,
          });
      startingFare = preview.total_amount;
    } catch {
      startingFare = Number(slab.base_fare);
    }

    return {
      ...formatCarForListing(car),
      starting_fare: startingFare,
      base_km: Number(slab.base_km),
      per_km_charge: Number(slab.per_km_charge),
    };
  }).filter(Boolean);

  const isAirport = trip_type === CAB_TRIP_TYPES.AIRPORT;

  return {
    trip_type,
    city: city ? { id: city.id, short_name: city.short_name, name: city.name } : null,
    package: pkg ? { id: pkg.id, label: pkg.label, duration_hours: pkg.duration_hours, included_km: pkg.included_km } : null,
    pickup_location: payload.pickup_location,
    drop_location: payload.drop_location ?? null,
    stops: isAirport ? [] : (payload.stops ?? []),
    distance_km: payload.distance_km ?? null,
    departure_at: payload.departure_at,
    return_at: payload.return_at ?? null,
    airport_name: payload.airport_name ?? null,
    airport_direction: payload.airport_direction ?? null,
    total_available: carResults.length,
    cars: carResults,
    note: "Exact driver is assigned by InYatri after booking.",
  };
};

/**
 * GET /cab/cars
 * Car listing page with fare per trip type.
 */
export const listCabCars = async (query) => {
  const { trip_type, city_id, package_id, distance_km, page, limit } = query;

  let pkg = null;
  if (isLocalTrip(trip_type) && package_id) {
    pkg = await cabRepository.findActiveCabPackageById(package_id, city_id ?? null);
  }

  const result = await cabRepository.findCabCarsByTripType({
    tripType: trip_type,
    cityId: city_id ?? null,
    packageId: package_id ?? null,
    page: page ?? 1,
    limit: limit ?? 20,
  });

  const cars = result.rows.map((car) => {
    const slab = getSlabFromCar(car);
    if (!slab) return null;

    let farePreview;
    try {
      farePreview = isLocalTrip(trip_type)
        ? buildLocalCabFare({ fareSlab: slab, pkg })
        : buildOneWayRoundTripFare({ fareSlab: slab, distanceKm: distance_km ?? 0, tripType: trip_type });
    } catch {
      return null;
    }

    return {
      ...formatCarForListing(car),
      fare: {
        total_fare: farePreview.total_amount,
        base_fare: farePreview.base_fare,
        base_km: farePreview.base_km,
        per_km_after: Number(slab.per_km_charge) > 0
          ? `₹${Number(slab.per_km_charge).toFixed(0)}/km`
          : null,
        driver_allowance: farePreview.driver_allowance,
        gst_amount: farePreview.gst_amount,
        fare_includes: farePreview.fare_includes,
      },
    };
  }).filter(Boolean);

  return {
    trip_type,
    pickup_location: query.pickup_location ?? null,
    drop_location: query.drop_location ?? null,
    distance_km: distance_km ?? null,
    departure_at: query.departure_at ?? null,
    package: pkg ? { id: pkg.id, label: pkg.label, duration_hours: pkg.duration_hours, included_km: pkg.included_km } : null,
    airport_name: query.airport_name ?? null,
    airport_direction: query.airport_direction ?? null,
    total_available: result.count,
    cars,
    pagination: result.pagination,
    note: "Exact driver is assigned by InYatri after booking.",
  };
};

/**
 * GET /cab/cars/:carId
 * Car detail page with full fare breakdown.
 */
export const getCabCarDetail = async (carId, query) => {
  const { trip_type, package_id, distance_km } = query;

  let pkg = null;
  if (isLocalTrip(trip_type) && package_id) {
    pkg = await cabRepository.findActiveCabPackageById(package_id, query.city_id ?? null);
    if (!pkg) throw new ApiError(404, "Package not found or inactive");
  }

  const car = await cabRepository.findCabCarById({
    carId,
    tripType: trip_type,
    packageId: package_id ?? null,
  });

  if (!car) {
    throw new ApiError(404, "Car not found or no cab pricing configured for this trip type");
  }

  const slab = getSlabFromCar(car);
  const fareBreakdown = isLocalTrip(trip_type)
    ? buildLocalCabFare({ fareSlab: slab, pkg: pkg ?? slab.package })
    : buildOneWayRoundTripFare({ fareSlab: slab, distanceKm: distance_km ?? 0, tripType: trip_type });

  return {
    trip_type,
    car: formatCarForListing(car),
    package: pkg ?? slab.package
      ? {
          id: (pkg ?? slab.package).id,
          label: (pkg ?? slab.package).label,
          duration_hours: (pkg ?? slab.package).duration_hours,
          included_km: (pkg ?? slab.package).included_km,
        }
      : null,
    airport_name: query.airport_name ?? null,
    airport_direction: query.airport_direction ?? null,
    fare_preview: fareBreakdownForClient(fareBreakdown),
    note: "Exact driver is assigned by InYatri after booking.",
  };
};

/**
 * POST /cab/bookings/summary
 * Review Booking screen.
 */
export const getCabBookingSummary = async (payload, userId) => {
  let coupon = null;
  let couponMessage = null;

  const baseContext = await resolveCabFareContext(payload);

  if (payload.coupon_code) {
    const baseFare = baseContext.fareBreakdown.trip_fare;
    const couponResult = await couponService.validateCouponForUser({
      code: payload.coupon_code,
      userId,
      baseRentalAmount: baseFare,
    });
    coupon = couponResult.coupon;
    couponMessage = couponResult.message;
  }

  const context = coupon ? await resolveCabFareContext(payload, coupon) : baseContext;
  const isAirport = payload.trip_type === CAB_TRIP_TYPES.AIRPORT;

  return {
    trip_type: payload.trip_type,
    car: formatCarForListing(context.car),
    trip_details: {
      trip_type: payload.trip_type,
      pickup_location: payload.pickup_location,
      drop_location: payload.drop_location ?? null,
      stops: isAirport ? [] : (payload.stops ?? []),
      departure_at: payload.departure_at,
      return_at: payload.return_at ?? null,
      distance_km: payload.distance_km ?? null,
      airport_name: payload.airport_name ?? null,
      airport_direction: payload.airport_direction ?? null,
    },
    package: context.pkg
      ? { id: context.pkg.id, label: context.pkg.label, duration_hours: context.pkg.duration_hours, included_km: context.pkg.included_km }
      : null,
    contact_number: payload.contact_number,
    fare_breakdown: fareBreakdownForClient(context.fareBreakdown),
    coupon: coupon
      ? { ...context.fareBreakdown.coupon, is_applicable: true, message: couponMessage }
      : payload.coupon_code
        ? { code: payload.coupon_code, is_applicable: false }
        : null,
  };
};

/**
 * POST /cab/bookings/validate-coupon
 */
export const validateCabCoupon = async (payload, userId) => {
  if (!payload.coupon_code) throw new ApiError(400, "Coupon code is required");

  const baseContext = await resolveCabFareContext(payload);
  const couponResult = await couponService.validateCouponForUser({
    code: payload.coupon_code,
    userId,
    baseRentalAmount: baseContext.fareBreakdown.trip_fare,
  });

  const context = await resolveCabFareContext(payload, couponResult.coupon);
  return {
    coupon: {
      id: couponResult.coupon.id,
      code: couponResult.coupon.code,
      title: couponResult.coupon.title,
      discount_percent: Number(couponResult.coupon.discount_percent),
      is_applicable: true,
      message: couponResult.message,
    },
    fare_breakdown: fareBreakdownForClient(context.fareBreakdown),
  };
};

/**
 * POST /cab/bookings/checkout
 * Creates cab booking + returns PayU payload.
 */
export const checkoutCabBooking = async (payload, user) => {
  let coupon = null;
  const baseContext = await resolveCabFareContext(payload);

  if (payload.coupon_code) {
    const couponResult = await couponService.validateCouponForUser({
      code: payload.coupon_code,
      userId: user.id,
      baseRentalAmount: baseContext.fareBreakdown.trip_fare,
    });
    coupon = couponResult.coupon;
  }

  const context = coupon ? await resolveCabFareContext(payload, coupon) : baseContext;
  const { fareBreakdown, pkg } = context;
  const totalAmount = fareBreakdown.total_amount;
  const isAirport = payload.trip_type === CAB_TRIP_TYPES.AIRPORT;

  return cabRepository.withTransaction(async (transaction) => {
    const booking = await cabRepository.createCabBooking(
      {
        booking_ref: `TMP-${Date.now()}`,
        user_id: user.id,
        car_id: context.car.id,
        city_id: payload.city_id ?? context.car.city_id ?? null,
        coupon_id: coupon?.id ?? null,
        package_id: pkg?.id ?? null,
        trip_type: payload.trip_type,
        pickup_location: payload.pickup_location.trim(),
        drop_location: payload.drop_location?.trim() ?? null,
        stops: isAirport ? [] : (payload.stops ?? []),
        departure_at: payload.departure_at,
        return_at: payload.return_at ?? null,
        distance_km: payload.distance_km ?? null,
        contact_number: payload.contact_number,
        base_fare: fareBreakdown.base_fare,
        driver_allowance: fareBreakdown.driver_allowance,
        gst_amount: fareBreakdown.gst_amount,
        discount_amount: fareBreakdown.discount_amount,
        payable_amount: totalAmount,
        total_booking_amount: totalAmount,
        paid_amount: 0,
        remaining_amount: 0,
        booking_status: BOOKING_STATUS.PENDING_PAYMENT,
        payment_status: PAYMENT_STATUS.NOT_INITIATED,
      },
      transaction
    );

    const bookingRef = generateCabBookingRef(booking.id);
    await cabRepository.updateCabBooking(booking.id, { booking_ref: bookingRef }, transaction);
    booking.booking_ref = bookingRef;

    const payment = await initiateCabPayment(booking, user, transaction);
    return { bookingId: booking.id, payment };
  }).then(async ({ bookingId, payment }) => {
    const fullBooking = await cabRepository.findCabBookingById(bookingId, user.id);
    return { booking: formatCabBooking(fullBooking), payment };
  });
};

/**
 * Internal: initiate PayU payment for a cab booking.
 */
export const initiateCabPayment = async (booking, user, transaction) => {
  if (!process.env.PAYU_MERCHANT_KEY || !process.env.PAYU_MERCHANT_SALT) {
    throw new ApiError(500, "PayU is not configured.");
  }

  if (!cabRepository.isCabPaymentRetryable(booking)) {
    throw new ApiError(400, "Payment cannot be initiated for this booking");
  }

  const attemptNo = (await cabRepository.countCabPaymentAttempts(booking.id)) + 1;
  const txnid = generatePayuTxnId(booking.booking_ref, attemptNo);

  await cabRepository.updateCabBooking(
    booking.id,
    {
      booking_status: BOOKING_STATUS.PAYMENT_PROCESSING,
      payment_status: PAYMENT_STATUS.INITIATED,
      payu_txn_id: txnid,
    },
    transaction
  );

  await cabRepository.createCabPaymentAttempt(
    {
      cab_booking_id: booking.id,
      attempt_no: attemptNo,
      amount: booking.payable_amount,
      payu_txn_id: txnid,
      status: PAYMENT_ATTEMPT_STATUS.INITIATED,
    },
    transaction
  );

  const payableAmount = Number(booking.payable_amount);
  const firstname =
    [user.firstname, user.lastname].filter(Boolean).join(" ").trim() ||
    user.mobile ||
    "Customer";
  const email = user.email || `${user.mobile}@inyatri.local`;
  const productinfo = `Cab Booking ${booking.booking_ref}`;
  const amount = payableAmount.toFixed(2);
  const udf1 = String(booking.id);
  const udf2 = "cab"; // Identifies this as a cab booking in callback

  const { key, successUrl, failureUrl } = {
    key: process.env.PAYU_MERCHANT_KEY,
    successUrl: process.env.PAYU_SUCCESS_URL || `${process.env.BASE_URL || "http://localhost:5000"}/api/user/v1/payments/payu/success`,
    failureUrl: process.env.PAYU_FAILURE_URL || `${process.env.BASE_URL || "http://localhost:5000"}/api/user/v1/payments/payu/failure`,
  };

  const hash = generatePayuRequestHash({ txnid, amount, productinfo, firstname, email, udf1, udf2 });

  const payu = {
    payment_url: process.env.PAYU_ENV === "production"
      ? "https://secure.payu.in/_payment"
      : "https://test.payu.in/_payment",
    key,
    txnid,
    amount,
    productinfo,
    firstname,
    email,
    phone: user.mobile,
    udf1,
    udf2,
    surl: successUrl,
    furl: failureUrl,
    service_provider: "payu_paisa",
    hash,
  };

  return { attempt_no: attemptNo, payable_amount: payableAmount, payu };
};

/**
 * POST /cab/bookings/:id/pay — Retry payment.
 */
export const retryCabPayment = async (bookingId, user) => {
  const booking = await cabRepository.findCabBookingById(bookingId, user.id);
  if (!booking) throw new ApiError(404, "Cab booking not found");
  if (!cabRepository.isCabPaymentRetryable(booking)) {
    throw new ApiError(400, "Payment retry is not allowed for this booking");
  }

  return cabRepository.withTransaction(async (transaction) => {
    const payment = await initiateCabPayment(booking, user, transaction);
    return { bookingId: booking.id, payment };
  }).then(async ({ bookingId: bId, payment }) => {
    const fullBooking = await cabRepository.findCabBookingById(bId, user.id);
    return { booking: formatCabBooking(fullBooking), payment };
  });
};

/**
 * GET /cab/bookings
 */
export const listCabBookings = async (userId, query) =>
  cabRepository
    .findCabBookingsByUser({
      userId,
      page: query.page,
      limit: query.limit,
      tripType: query.trip_type,
      bookingStatus: query.booking_status,
    })
    .then((result) => ({
      rows: result.rows.map(formatCabBooking),
      count: result.count,
      pagination: result.pagination,
    }));

/**
 * GET /cab/bookings/:id
 */
export const getCabBookingById = async (bookingId, userId) => {
  const booking = await cabRepository.findCabBookingById(bookingId, userId);
  if (!booking) throw new ApiError(404, "Cab booking not found");
  return formatCabBooking(booking);
};

/**
 * POST /cab/bookings/:id/payments/sync
 */
export const syncCabPayment = async (bookingId, user) => {
  const result = await payuService.syncCabBookingPaymentFromPayu(bookingId, user.id);
  const updatedBooking = await cabRepository.findCabBookingById(bookingId, user.id);
  return {
    reconciled: true,
    result,
    booking: formatCabBooking(updatedBooking),
  };
};
