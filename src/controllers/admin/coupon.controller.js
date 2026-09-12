import * as couponService from "../../services/admin/coupon.service.js";
import {
  successResponse,
  successResponseWithPagination,
  errorResponse,
} from "../../utils/response.js";
import logger from "../../utils/logger.js";

export const listCoupons = async (req, res) => {
  try {
    const result = await couponService.listCoupons(req.query);
    return successResponseWithPagination(
      result.rows,
      result.count,
      "Coupons fetched successfully",
      res,
      result.pagination.page,
      result.pagination.limit
    );
  } catch (error) {
    logger.error("listCoupons error:", error);
    return errorResponse(error, res);
  }
};

export const getCouponById = async (req, res) => {
  try {
    const coupon = await couponService.getCouponById(req.params.id);
    return successResponse(coupon, "Coupon fetched successfully", res);
  } catch (error) {
    logger.error("getCouponById error:", error);
    return errorResponse(error, res);
  }
};

export const createCoupon = async (req, res) => {
  try {
    const coupon = await couponService.createCoupon(req.body);
    return successResponse(coupon, "Coupon created successfully", res, 201);
  } catch (error) {
    logger.error("createCoupon error:", error);
    return errorResponse(error, res);
  }
};

export const updateCoupon = async (req, res) => {
  try {
    const coupon = await couponService.updateCoupon(req.params.id, req.body);
    return successResponse(coupon, "Coupon updated successfully", res);
  } catch (error) {
    logger.error("updateCoupon error:", error);
    return errorResponse(error, res);
  }
};

export const updateCouponStatus = async (req, res) => {
  try {
    const coupon = await couponService.updateCouponStatus(
      req.params.id,
      req.body.status
    );
    return successResponse(coupon, "Coupon status updated successfully", res);
  } catch (error) {
    logger.error("updateCouponStatus error:", error);
    return errorResponse(error, res);
  }
};

export const deleteCoupon = async (req, res) => {
  try {
    const coupon = await couponService.deleteCoupon(req.params.id);
    return successResponse(coupon, "Coupon deactivated successfully", res);
  } catch (error) {
    logger.error("deleteCoupon error:", error);
    return errorResponse(error, res);
  }
};
