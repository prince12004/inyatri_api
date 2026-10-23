import * as unifiedBookingService from "../../services/user/unifiedBooking.service.js";
import {
  successResponse,
  successResponseWithPagination,
  errorResponse,
} from "../../utils/response.js";
import logger from "../../utils/logger.js";

export const listBookings = async (req, res) => {
  try {
    const result = await unifiedBookingService.listUnifiedBookings(
      req.user.id,
      req.query
    );
    return successResponseWithPagination(
      result.rows,
      result.count,
      "Bookings fetched successfully",
      res,
      result.pagination.page,
      result.pagination.limit
    );
  } catch (error) {
    logger.error("listUnifiedBookings error:", error);
    return errorResponse(error, res);
  }
};

export const getBookingDetail = async (req, res) => {
  try {
    const typeHint = req.query.type || req.query.category || null;
    const detail = await unifiedBookingService.getUnifiedBookingDetail(
      req.params.id,
      req.user.id,
      typeHint
    );
    return successResponse(detail, "Booking details fetched successfully", res);
  } catch (error) {
    logger.error("getUnifiedBookingDetail error:", error);
    return errorResponse(error, res);
  }
};
