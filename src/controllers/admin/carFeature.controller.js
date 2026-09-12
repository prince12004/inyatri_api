import * as carFeatureService from "../../services/admin/carFeature.service.js";
import {
  successResponse,
  successResponseWithPagination,
  errorResponse,
} from "../../utils/response.js";
import logger from "../../utils/logger.js";

export const listCarFeatures = async (req, res) => {
  try {
    const result = await carFeatureService.listCarFeatures(req.query);
    return successResponseWithPagination(
      result.rows,
      result.count,
      "Car features fetched successfully",
      res,
      result.pagination.page,
      result.pagination.limit
    );
  } catch (error) {
    logger.error("listCarFeatures error:", error);
    return errorResponse(error, res);
  }
};

export const createCarFeature = async (req, res) => {
  try {
    const feature = await carFeatureService.createCarFeature(req.body);
    return successResponse(feature, "Car feature created successfully", res, 201);
  } catch (error) {
    logger.error("createCarFeature error:", error);
    return errorResponse(error, res);
  }
};

export const updateCarFeature = async (req, res) => {
  try {
    const feature = await carFeatureService.updateCarFeature(req.params.id, req.body);
    return successResponse(feature, "Car feature updated successfully", res);
  } catch (error) {
    logger.error("updateCarFeature error:", error);
    return errorResponse(error, res);
  }
};

export const deleteCarFeature = async (req, res) => {
  try {
    const feature = await carFeatureService.deleteCarFeature(req.params.id);
    return successResponse(feature, "Car feature deactivated successfully", res);
  } catch (error) {
    logger.error("deleteCarFeature error:", error);
    return errorResponse(error, res);
  }
};
