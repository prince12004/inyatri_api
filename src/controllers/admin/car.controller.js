import * as carService from "../../services/admin/car.service.js";
import * as uploadService from "../../services/admin/upload.service.js";
import {
  successResponse,
  successResponseWithPagination,
  errorResponse,
} from "../../utils/response.js";
import logger from "../../utils/logger.js";

export const getCarMeta = async (req, res) => {
  try {
    return successResponse(
      carService.getCarMeta(),
      "Car metadata fetched successfully",
      res
    );
  } catch (error) {
    logger.error("getCarMeta error:", error);
    return errorResponse(error, res);
  }
};

export const listCars = async (req, res) => {
  try {
    const result = await carService.listCars(req.query);
    return successResponseWithPagination(
      result.rows,
      result.count,
      "Cars fetched successfully",
      res,
      result.pagination.page,
      result.pagination.limit
    );
  } catch (error) {
    logger.error("listCars error:", error);
    return errorResponse(error, res);
  }
};

export const getCarById = async (req, res) => {
  try {
    const car = await carService.getCarById(req.params.id);
    return successResponse(car, "Car fetched successfully", res);
  } catch (error) {
    logger.error("getCarById error:", error);
    return errorResponse(error, res);
  }
};

export const createCar = async (req, res) => {
  try {
    const car = await carService.createCar(req.body);
    return successResponse(car, "Car created successfully", res, 201);
  } catch (error) {
    logger.error("createCar error:", error);
    return errorResponse(error, res);
  }
};

export const updateCar = async (req, res) => {
  try {
    const car = await carService.updateCar(req.params.id, req.body);
    return successResponse(car, "Car updated successfully", res);
  } catch (error) {
    logger.error("updateCar error:", error);
    return errorResponse(error, res);
  }
};

export const updateCarStatus = async (req, res) => {
  try {
    const result = await carService.updateCarStatus(req.params.id, req.body.status);
    return successResponse(result.car, result.message, res);
  } catch (error) {
    logger.error("updateCarStatus error:", error);
    return errorResponse(error, res);
  }
};

export const uploadSingleImage = async (req, res) => {
  try {
    const result = await uploadService.uploadSingleImage(req.file);
    return successResponse(result, "Image uploaded successfully", res);
  } catch (error) {
    logger.error("uploadSingleImage error:", error);
    return errorResponse(error, res);
  }
};

export const uploadMultipleImages = async (req, res) => {
  try {
    const result = await uploadService.uploadMultipleImages(req.files);
    return successResponse(result, "Images uploaded successfully", res);
  } catch (error) {
    logger.error("uploadMultipleImages error:", error);
    return errorResponse(error, res);
  }
};
