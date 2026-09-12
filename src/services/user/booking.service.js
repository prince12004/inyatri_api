import * as bookingRepository from "../../repositories/user/booking.repository.js";
import * as selfDriveRepository from "../../repositories/user/selfDrive.repository.js";
import * as cityRepository from "../../repositories/user/city.repository.js";
import * as couponService from "./coupon.service.js";
import ApiError from "../../utils/ApiError.js";
import { buildBookingFareBreakdown } from "../../utils/booking/fareBreakdown.util.js";
import { buildPayuCheckoutPayload } from "../../utils/payment/payu.util.js";
import { calculateRentalDays } from "../../utils/selfDrive/rental.util.js";
import {
  BOOKING_STATUS,
  BOOKING_STATUS_LABELS,
  PAYMENT_STATUS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_ATTEMPT_STATUS,
} from "../../utils/constants/booking.enums.js";

const generateBookingRef = (bookingId) =>
  `IY-${String(bookingId).padStart(5, "0")}`;

const generatePayuTxnId = (bookingRef, attemptNo) =>
  `${bookingRef.replace("-", "")}-${attemptNo}-${Date.now()}`;

const formatBookingStatus = (booking) => ({
  booking_status: BOOKING_STATUS_LABELS[booking.booking_status],
  payment_status: PAYMENT_STATUS_LABELS[booking.payment_status],
});

const formatBooking = (booking) => ({
  id: booking.id,
  booking_ref: booking.booking_ref,
  ...formatBookingStatus(booking),
  pickup_at: booking.pickup_at,
  drop_at: booking.drop_at,
  rental_days: booking.rental_days,
  pickup_location: booking.pickup_location,
  drop_location: booking.drop_location,
  insurance_selected: Boolean(booking.insurance_selected),
  home_delivery_selected: Boolean(booking.home_delivery_selected),
  fare_breakdown: {
    base_rental_amount: Number(booking.base_rental_amount),
    insurance_amount: Number(booking.insurance_amount),
    delivery_amount: Number(booking.delivery_amount),
    gst_amount: Number(booking.gst_amount),
    discount_amount: Number(booking.discount_amount),
    payable_amount: Number(booking.payable_amount),
    security_deposit_amount: Number(booking.security_deposit_amount),
  },
  coupon: booking.coupon
    ? {
        id: booking.coupon.id,
        code: booking.coupon.code,
        title: booking.coupon.title,
      }
    : null,
  car: booking.car
    ? {
        id: booking.car.id,
        car_name: booking.car.car_name,
        model: booking.car.model,
        vehicle_number: booking.car.vehicle_number,
        transmission: booking.car.transmission,
        seats: booking.car.seats,
        fuel_type: booking.car.fuel_type,
        main_image: booking.car.main_image,
        location: booking.car.location,
        brand: booking.car.brand
          ? {
              id: booking.car.brand.id,
              brand_name: booking.car.brand.brand_name,
            }
          : null,
        car_type: booking.car.carType
          ? {
              id: booking.car.carType.id,
              type_name: booking.car.carType.type_name,
            }
          : null,
      }
    : null,
  city: booking.city
    ? {
        id: booking.city.id,
        short_name: booking.city.short_name,
        name: booking.city.name,
      }
    : null,
  payu_txn_id: booking.payu_txn_id,
  created_at: booking.created_at,
  updated_at: booking.updated_at,
});

const resolveBookingContext = async (payload, userId) => {
  const rentalDays = calculateRentalDays(payload.pickup_at, payload.drop_at);

  const city = await cityRepository.findActiveCityById(payload.city_id);
  if (!city) {
    throw new ApiError(404, "City not found or inactive");
  }

  const car = await selfDriveRepository.findAvailableCarById(
    payload.car_id,
    payload.city_id
  );
  if (!car) {
    throw new ApiError(404, "Car not found or unavailable in selected city");
  }

  if (payload.home_delivery_selected && !car.home_delivery_available) {
    throw new ApiError(400, "Home delivery is not available for this car");
  }

  let coupon = null;
  let couponMessage = null;

  if (payload.coupon_code) {
    const previewFare = buildBookingFareBreakdown({
      car,
      rentalDays,
      insuranceSelected: payload.insurance_selected,
      homeDeliverySelected: payload.home_delivery_selected,
    });

    const couponResult = await couponService.validateCouponForUser({
      code: payload.coupon_code,
      userId,
      baseRentalAmount: previewFare.base_rental_amount,
    });

    coupon = couponResult.coupon;
    couponMessage = couponResult.message;
  }

  const fareBreakdown = buildBookingFareBreakdown({
    car,
    rentalDays,
    insuranceSelected: payload.insurance_selected,
    homeDeliverySelected: payload.home_delivery_selected,
    coupon,
  });

  return {
    car,
    city,
    rentalDays,
    fareBreakdown,
    coupon,
    couponMessage,
  };
};

export const getBookingSummary = async (payload, userId) => {
  const context = await resolveBookingContext(payload, userId);

  return {
    car: {
      id: context.car.id,
      car_name: context.car.car_name,
      model: context.car.model,
      vehicle_number: context.car.vehicle_number,
      transmission: context.car.transmission,
      seats: context.car.seats,
      fuel_type: context.car.fuel_type,
      main_image: context.car.main_image,
    },
    city: {
      id: context.city.id,
      short_name: context.city.short_name,
      name: context.city.name,
    },
    pickup_at: payload.pickup_at,
    drop_at: payload.drop_at,
    pickup_location: payload.pickup_location,
    drop_location: payload.drop_location,
    fare_breakdown: context.fareBreakdown,
    coupon: context.fareBreakdown.coupon
      ? {
          ...context.fareBreakdown.coupon,
          is_applicable: true,
          message: context.couponMessage,
        }
      : payload.coupon_code
        ? { code: payload.coupon_code, is_applicable: false }
        : null,
  };
};

export const validateCoupon = async (payload, userId) => {
  const context = await resolveBookingContext(payload, userId);

  if (!payload.code) {
    throw new ApiError(400, "Coupon code is required");
  }

  const couponResult = await couponService.validateCouponForUser({
    code: payload.code,
    userId,
    baseRentalAmount: context.fareBreakdown.base_rental_amount,
  });

  const fareBreakdown = buildBookingFareBreakdown({
    car: context.car,
    rentalDays: context.rentalDays,
    insuranceSelected: payload.insurance_selected,
    homeDeliverySelected: payload.home_delivery_selected,
    coupon: couponResult.coupon,
  });

  return {
    coupon: {
      id: couponResult.coupon.id,
      code: couponResult.coupon.code,
      title: couponResult.coupon.title,
      discount_percent: Number(couponResult.coupon.discount_percent),
      is_applicable: true,
      message: couponResult.message,
    },
    fare_breakdown: fareBreakdown,
  };
};

export const listAvailableCoupons = async (payload, userId) => {
  const context = await resolveBookingContext(
    { ...payload, coupon_code: null },
    userId
  );

  const coupons = await couponService.listAvailableCoupons({
    userId,
    baseRentalAmount: context.fareBreakdown.base_rental_amount,
  });

  return {
    base_rental_amount: context.fareBreakdown.base_rental_amount,
    coupons,
  };
};

export const checkoutBooking = async (payload, user) => {
  const context = await resolveBookingContext(payload, user.id);

  const overlap = await bookingRepository.findOverlappingConfirmedBooking({
    carId: payload.car_id,
    pickupAt: payload.pickup_at,
    dropAt: payload.drop_at,
  });
  if (overlap) {
    throw new ApiError(409, "Car is already booked for the selected dates");
  }

  return bookingRepository.withTransaction(async (transaction) => {
    const booking = await bookingRepository.createBooking(
      {
        booking_ref: `TMP-${Date.now()}`,
        user_id: user.id,
        car_id: payload.car_id,
        city_id: payload.city_id,
        coupon_id: context.coupon?.id ?? null,
        pickup_at: payload.pickup_at,
        drop_at: payload.drop_at,
        rental_days: context.rentalDays,
        pickup_location: payload.pickup_location.trim(),
        drop_location: payload.drop_location.trim(),
        insurance_selected: payload.insurance_selected,
        home_delivery_selected: payload.home_delivery_selected,
        base_rental_amount: context.fareBreakdown.base_rental_amount,
        insurance_amount: context.fareBreakdown.insurance_amount,
        delivery_amount: context.fareBreakdown.delivery_amount,
        gst_amount: context.fareBreakdown.gst_amount,
        discount_amount: context.fareBreakdown.discount_amount,
        payable_amount: context.fareBreakdown.payable_amount,
        security_deposit_amount: context.fareBreakdown.security_deposit_amount,
        booking_status: BOOKING_STATUS.PENDING_PAYMENT,
        payment_status: PAYMENT_STATUS.NOT_INITIATED,
      },
      transaction
    );

    const bookingRef = generateBookingRef(booking.id);
    await bookingRepository.updateBooking(
      booking.id,
      { booking_ref: bookingRef },
      transaction
    );
    booking.booking_ref = bookingRef;

    const payment = await initiatePaymentForBooking(booking, user, transaction);

    return {
      bookingId: booking.id,
      payment,
    };
  }).then(async ({ bookingId, payment }) => {
    const fullBooking = await bookingRepository.findBookingById(
      bookingId,
      user.id
    );

    return {
      booking: formatBooking(fullBooking),
      payment,
    };
  });
};

export const initiatePaymentForBooking = async (booking, user, transaction) => {
  if (!process.env.PAYU_MERCHANT_KEY || !process.env.PAYU_MERCHANT_SALT) {
    throw new ApiError(
      500,
      "PayU is not configured. Set PAYU_MERCHANT_KEY and PAYU_MERCHANT_SALT."
    );
  }

  if (!bookingRepository.isPaymentRetryable(booking)) {
    throw new ApiError(400, "Payment cannot be initiated for this booking");
  }

  const attemptNo =
    (await bookingRepository.countPaymentAttempts(booking.id)) + 1;
  const txnid = generatePayuTxnId(booking.booking_ref, attemptNo);

  await bookingRepository.updateBooking(
    booking.id,
    {
      booking_status: BOOKING_STATUS.PAYMENT_PROCESSING,
      payment_status: PAYMENT_STATUS.INITIATED,
      payu_txn_id: txnid,
    },
    transaction
  );

  await bookingRepository.createPaymentAttempt(
    {
      booking_id: booking.id,
      attempt_no: attemptNo,
      amount: booking.payable_amount,
      payu_txn_id: txnid,
      status: PAYMENT_ATTEMPT_STATUS.INITIATED,
    },
    transaction
  );

  booking.payable_amount = Number(booking.payable_amount);
  const payu = buildPayuCheckoutPayload({ booking, user, txnid });

  return {
    attempt_no: attemptNo,
    payable_amount: Number(booking.payable_amount),
    payu,
  };
};

export const retryBookingPayment = async (bookingId, user) => {
  const booking = await bookingRepository.findBookingById(bookingId, user.id);
  if (!booking) {
    throw new ApiError(404, "Booking not found");
  }

  if (!bookingRepository.isPaymentRetryable(booking)) {
    throw new ApiError(400, "Payment retry is not allowed for this booking");
  }

  return bookingRepository.withTransaction(async (transaction) => {
    const payment = await initiatePaymentForBooking(booking, user, transaction);
    return { bookingId: booking.id, payment };
  }).then(async ({ bookingId, payment }) => {
    const fullBooking = await bookingRepository.findBookingById(
      bookingId,
      user.id
    );

    return {
      booking: formatBooking(fullBooking),
      payment,
    };
  });
};

export const listBookings = async (userId, query) =>
  bookingRepository.findBookingsByUser({
    userId,
    page: query.page,
    limit: query.limit,
    bookingStatus: query.booking_status,
  }).then((result) => ({
    rows: result.rows.map(formatBooking),
    count: result.count,
    pagination: result.pagination,
  }));

export const getBookingById = async (bookingId, userId) => {
  const booking = await bookingRepository.findBookingById(bookingId, userId);
  if (!booking) {
    throw new ApiError(404, "Booking not found");
  }
  return formatBooking(booking);
};

export { formatBooking };
