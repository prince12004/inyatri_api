import * as cabService from "../../services/admin/cab.service.js";
import {
  successResponse,
  successResponseWithPagination,
  errorResponse,
} from "../../utils/response.js";
import logger from "../../utils/logger.js";

// ─── Dashboard ─────────────────────────────────────────────────────────────

export const getCabDashboard = async (req, res) => {
  try {
    const result = await cabService.getCabDashboard(req.query);
    return successResponse(result, "Cab dashboard fetched successfully", res);
  } catch (error) {
    logger.error("getCabDashboard error:", error);
    return errorResponse(error, res);
  }
};

// ─── Cab Pricing ───────────────────────────────────────────────────────────

export const listCabPricings = async (req, res) => {
  try {
    const result = await cabService.listCabPricings(req.query);
    return successResponseWithPagination(
      result.rows,
      result.count,
      "Cab pricings fetched successfully",
      res,
      result.pagination.page,
      result.pagination.limit
    );
  } catch (error) {
    logger.error("listCabPricings error:", error);
    return errorResponse(error, res);
  }
};

export const createCabPricing = async (req, res) => {
  try {
    const slab = await cabService.createCabPricing(req.body);
    return successResponse(slab, "Cab pricing created successfully", res, 201);
  } catch (error) {
    logger.error("createCabPricing error:", error);
    return errorResponse(error, res);
  }
};

export const updateCabPricing = async (req, res) => {
  try {
    const slab = await cabService.updateCabPricing(req.params.id, req.body);
    return successResponse(slab, "Cab pricing updated successfully", res);
  } catch (error) {
    logger.error("updateCabPricing error:", error);
    return errorResponse(error, res);
  }
};

export const updateCabPricingStatus = async (req, res) => {
  try {
    const result = await cabService.updateCabPricingStatus(
      req.params.id,
      req.body.status
    );
    return successResponse(result.slab, result.message, res);
  } catch (error) {
    logger.error("updateCabPricingStatus error:", error);
    return errorResponse(error, res);
  }
};

export const deleteCabPricing = async (req, res) => {
  try {
    const result = await cabService.deleteCabPricing(req.params.id);
    return successResponse(null, result.message, res);
  } catch (error) {
    logger.error("deleteCabPricing error:", error);
    return errorResponse(error, res);
  }
};

export const listCarsForDropdown = async (req, res) => {
  try {
    const cars = await cabService.listCarsForDropdown();
    return successResponse(cars, "Cars fetched successfully", res);
  } catch (error) {
    logger.error("listCarsForDropdown error:", error);
    return errorResponse(error, res);
  }
};

// ─── Cab Packages ─────────────────────────────────────────────────────────

export const listCabPackages = async (req, res) => {
  try {
    const result = await cabService.listCabPackages(req.query);
    return successResponseWithPagination(
      result.rows,
      result.count,
      "Cab packages fetched successfully",
      res,
      result.pagination.page,
      result.pagination.limit
    );
  } catch (error) {
    logger.error("listCabPackages error:", error);
    return errorResponse(error, res);
  }
};

export const createCabPackage = async (req, res) => {
  try {
    const pkg = await cabService.createCabPackage(req.body);
    return successResponse(pkg, "Cab package created successfully", res, 201);
  } catch (error) {
    logger.error("createCabPackage error:", error);
    return errorResponse(error, res);
  }
};

export const updateCabPackage = async (req, res) => {
  try {
    const pkg = await cabService.updateCabPackage(req.params.id, req.body);
    return successResponse(pkg, "Cab package updated successfully", res);
  } catch (error) {
    logger.error("updateCabPackage error:", error);
    return errorResponse(error, res);
  }
};

export const updateCabPackageStatus = async (req, res) => {
  try {
    const result = await cabService.updateCabPackageStatus(
      req.params.id,
      req.body.status
    );
    return successResponse(result.package, result.message, res);
  } catch (error) {
    logger.error("updateCabPackageStatus error:", error);
    return errorResponse(error, res);
  }
};
