import * as bookingService from "../../services/user/booking.service.js";
import {
  buildDevPayuRedirectUrl,
  extractBearerToken,
  isDevPaymentToolsEnabled,
} from "../../utils/payment/payu.util.js";
import {
  successResponse,
  successResponseWithPagination,
  errorResponse,
} from "../../utils/response.js";
import logger from "../../utils/logger.js";

const attachDevPayuRedirect = (req, data) => {
  if (!isDevPaymentToolsEnabled()) {
    return data;
  }

  const token = extractBearerToken(req);
  const bookingId = data?.booking?.id;
  if (!token || !bookingId) {
    return data;
  }

  return {
    ...data,
    payu_redirect_url: buildDevPayuRedirectUrl(bookingId, token),
  };
};

const maybeAutoRedirectToPayu = (req, res, data) => {
  if (
    isDevPaymentToolsEnabled() &&
    req.query.auto_redirect === "true" &&
    data.payu_redirect_url
  ) {
    return res.redirect(302, data.payu_redirect_url);
  }
  return null;
};

export const getBookingSummary = async (req, res) => {
  try {
    const data = await bookingService.getBookingSummary(req.body, req.user.id);
    return successResponse(data, "Booking summary fetched successfully", res);
  } catch (error) {
    logger.error("getBookingSummary error:", error);
    return errorResponse(error, res);
  }
};

export const validateCoupon = async (req, res) => {
  try {
    const data = await bookingService.validateCoupon(req.body, req.user.id);
    return successResponse(data, "Coupon validated successfully", res);
  } catch (error) {
    logger.error("validateCoupon error:", error);
    return errorResponse(error, res);
  }
};

export const listAvailableCoupons = async (req, res) => {
  try {
    const data = await bookingService.listAvailableCoupons(
      req.query,
      req.user.id
    );
    return successResponse(data, "Available coupons fetched successfully", res);
  } catch (error) {
    logger.error("listAvailableCoupons error:", error);
    return errorResponse(error, res);
  }
};

export const checkoutBooking = async (req, res) => {
  try {
    const data = attachDevPayuRedirect(
      req,
      await bookingService.checkoutBooking(req.body, req.user)
    );
    const redirect = maybeAutoRedirectToPayu(req, res, data);
    if (redirect) {
      return redirect;
    }
    return successResponse(data, "Checkout initiated successfully", res, 201);
  } catch (error) {
    logger.error("checkoutBooking error:", error);
    return errorResponse(error, res);
  }
};

export const retryBookingPayment = async (req, res) => {
  try {
    const data = attachDevPayuRedirect(
      req,
      await bookingService.retryBookingPayment(req.params.id, req.user)
    );
    const redirect = maybeAutoRedirectToPayu(req, res, data);
    if (redirect) {
      return redirect;
    }
    return successResponse(data, "Payment retry initiated successfully", res);
  } catch (error) {
    logger.error("retryBookingPayment error:", error);
    return errorResponse(error, res);
  }
};

export const listBookings = async (req, res) => {
  try {
    const result = await bookingService.listBookings(req.user.id, req.query);
    return successResponseWithPagination(
      result.rows,
      result.count,
      "Bookings fetched successfully",
      res,
      result.pagination.page,
      result.pagination.limit
    );
  } catch (error) {
    logger.error("listBookings error:", error);
    return errorResponse(error, res);
  }
};

export const getBookingById = async (req, res) => {
  try {
    const booking = await bookingService.getBookingById(
      req.params.id,
      req.user.id
    );
    return successResponse(booking, "Booking fetched successfully", res);
  } catch (error) {
    logger.error("getBookingById error:", error);
    return errorResponse(error, res);
  }
};
