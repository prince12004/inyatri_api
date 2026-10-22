import * as cabService from "../../services/user/cab.service.js";
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

// ─── Public Endpoints ──────────────────────────────────────────────────────

export const listCabPackages = async (req, res) => {
  try {
    const data = await cabService.listCabPackages(Number(req.query.city_id));
    return successResponse(data, "Cab packages fetched successfully", res);
  } catch (error) {
    logger.error("listCabPackages error:", error);
    return errorResponse(error, res);
  }
};

export const searchCabs = async (req, res) => {
  try {
    const data = await cabService.searchCabs(req.body);
    return successResponse(data, "Cab search results fetched successfully", res);
  } catch (error) {
    logger.error("searchCabs error:", error);
    return errorResponse(error, res);
  }
};

export const listCabCars = async (req, res) => {
  try {
    const data = await cabService.listCabCars(req.query);
    return successResponseWithPagination(
      data.cars,
      data.pagination,
      "Cab cars fetched successfully",
      res,
      {
        trip_type: data.trip_type,
        pickup_location: data.pickup_location,
        drop_location: data.drop_location,
        distance_km: data.distance_km,
        departure_at: data.departure_at,
        package: data.package,
        total_available: data.total_available,
        airport_name: data.airport_name,
        airport_direction: data.airport_direction,
        note: data.note,
      }
    );
  } catch (error) {
    logger.error("listCabCars error:", error);
    return errorResponse(error, res);
  }
};

export const getCabCarDetail = async (req, res) => {
  try {
    const data = await cabService.getCabCarDetail(Number(req.params.id), req.query);
    return successResponse(data, "Cab car details fetched successfully", res);
  } catch (error) {
    logger.error("getCabCarDetail error:", error);
    return errorResponse(error, res);
  }
};

// ─── Authenticated Endpoints ───────────────────────────────────────────────

export const getCabBookingSummary = async (req, res) => {
  try {
    const data = await cabService.getCabBookingSummary(req.body, req.user.id);
    return successResponse(data, "Cab booking summary fetched successfully", res);
  } catch (error) {
    logger.error("getCabBookingSummary error:", error);
    return errorResponse(error, res);
  }
};

export const validateCabCoupon = async (req, res) => {
  try {
    const data = await cabService.validateCabCoupon(req.body, req.user.id);
    return successResponse(data, "Cab coupon validated successfully", res);
  } catch (error) {
    logger.error("validateCabCoupon error:", error);
    return errorResponse(error, res);
  }
};

export const checkoutCabBooking = async (req, res) => {
  try {
    const rawData = await cabService.checkoutCabBooking(req.body, req.user);
    const data = attachDevPayuRedirect(req, rawData);

    const redirected = maybeAutoRedirectToPayu(req, res, data);
    if (redirected) return redirected;

    return successResponse(data, "Cab booking created successfully", res, 201);
  } catch (error) {
    logger.error("checkoutCabBooking error:", error);
    return errorResponse(error, res);
  }
};

export const listCabBookings = async (req, res) => {
  try {
    const data = await cabService.listCabBookings(req.user.id, req.query);
    return successResponseWithPagination(
      data.rows,
      data.pagination,
      "Cab bookings fetched successfully",
      res
    );
  } catch (error) {
    logger.error("listCabBookings error:", error);
    return errorResponse(error, res);
  }
};

export const getCabBookingById = async (req, res) => {
  try {
    const data = await cabService.getCabBookingById(Number(req.params.id), req.user.id);
    return successResponse(data, "Cab booking fetched successfully", res);
  } catch (error) {
    logger.error("getCabBookingById error:", error);
    return errorResponse(error, res);
  }
};

export const retryCabPayment = async (req, res) => {
  try {
    const rawData = await cabService.retryCabPayment(Number(req.params.id), req.user);
    const data = attachDevPayuRedirect(req, rawData);

    const redirected = maybeAutoRedirectToPayu(req, res, data);
    if (redirected) return redirected;

    return successResponse(data, "Payment initiated successfully", res);
  } catch (error) {
    logger.error("retryCabPayment error:", error);
    return errorResponse(error, res);
  }
};

export const syncCabPayment = async (req, res) => {
  try {
    const data = await cabService.syncCabPayment(Number(req.params.id), req.user);
    return successResponse(data, "Cab payment synced successfully", res);
  } catch (error) {
    logger.error("syncCabPayment error:", error);
    return errorResponse(error, res);
  }
};
