import * as carBrandService from "../../services/admin/carBrand.service.js";
import {
  successResponse,
  successResponseWithPagination,
  errorResponse,
} from "../../utils/response.js";
import logger from "../../utils/logger.js";

export const listCarBrands = async (req, res) => {
  try {
    const result = await carBrandService.listCarBrands(req.query);
    return successResponseWithPagination(
      result.rows,
      result.count,
      "Car brands fetched successfully",
      res,
      result.pagination.page,
      result.pagination.limit
    );
  } catch (error) {
    logger.error("listCarBrands error:", error);
    return errorResponse(error, res);
  }
};

export const createCarBrand = async (req, res) => {
  try {
    const brand = await carBrandService.createCarBrand(req.body);
    return successResponse(brand, "Car brand created successfully", res, 201);
  } catch (error) {
    logger.error("createCarBrand error:", error);
    return errorResponse(error, res);
  }
};

export const updateCarBrand = async (req, res) => {
  try {
    const brand = await carBrandService.updateCarBrand(req.params.id, req.body);
    return successResponse(brand, "Car brand updated successfully", res);
  } catch (error) {
    logger.error("updateCarBrand error:", error);
    return errorResponse(error, res);
  }
};

export const deleteCarBrand = async (req, res) => {
  try {
    const brand = await carBrandService.deleteCarBrand(req.params.id);
    return successResponse(brand, "Car brand deactivated successfully", res);
  } catch (error) {
    logger.error("deleteCarBrand error:", error);
    return errorResponse(error, res);
  }
};
