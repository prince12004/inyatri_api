import * as cityService from "../../services/admin/city.service.js";
import {
  successResponse,
  successResponseWithPagination,
  errorResponse,
} from "../../utils/response.js";
import logger from "../../utils/logger.js";

export const listCities = async (req, res) => {
  try {
    const result = await cityService.listCities(req.query);
    return successResponseWithPagination(
      result.rows,
      result.count,
      "Cities fetched successfully",
      res,
      result.pagination.page,
      result.pagination.limit
    );
  } catch (error) {
    logger.error("listCities error:", error);
    return errorResponse(error, res);
  }
};

export const createCity = async (req, res) => {
  try {
    const city = await cityService.createCity(req.body);
    return successResponse(city, "City created successfully", res, 201);
  } catch (error) {
    logger.error("createCity error:", error);
    return errorResponse(error, res);
  }
};

export const updateCity = async (req, res) => {
  try {
    const city = await cityService.updateCity(req.params.id, req.body);
    return successResponse(city, "City updated successfully", res);
  } catch (error) {
    logger.error("updateCity error:", error);
    return errorResponse(error, res);
  }
};

export const deleteCity = async (req, res) => {
  try {
    const city = await cityService.deleteCity(req.params.id);
    return successResponse(city, "City deactivated successfully", res);
  } catch (error) {
    logger.error("deleteCity error:", error);
    return errorResponse(error, res);
  }
};
