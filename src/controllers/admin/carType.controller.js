import * as carTypeService from "../../services/admin/carType.service.js";
import {
  successResponse,
  successResponseWithPagination,
  errorResponse,
} from "../../utils/response.js";
import logger from "../../utils/logger.js";

export const listCarTypes = async (req, res) => {
  try {
    const result = await carTypeService.listCarTypes(req.query);
    return successResponseWithPagination(
      result.rows,
      result.count,
      "Car types fetched successfully",
      res,
      result.pagination.page,
      result.pagination.limit
    );
  } catch (error) {
    logger.error("listCarTypes error:", error);
    return errorResponse(error, res);
  }
};

export const createCarType = async (req, res) => {
  try {
    const carType = await carTypeService.createCarType(req.body);
    return successResponse(carType, "Car type created successfully", res, 201);
  } catch (error) {
    logger.error("createCarType error:", error);
    return errorResponse(error, res);
  }
};

export const updateCarType = async (req, res) => {
  try {
    const carType = await carTypeService.updateCarType(req.params.id, req.body);
    return successResponse(carType, "Car type updated successfully", res);
  } catch (error) {
    logger.error("updateCarType error:", error);
    return errorResponse(error, res);
  }
};

export const deleteCarType = async (req, res) => {
  try {
    const carType = await carTypeService.deleteCarType(req.params.id);
    return successResponse(carType, "Car type deactivated successfully", res);
  } catch (error) {
    logger.error("deleteCarType error:", error);
    return errorResponse(error, res);
  }
};
