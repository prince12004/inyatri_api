import * as selfDriveService from "../../services/user/selfDrive.service.js";
import {
  successResponse,
  successResponseWithPagination,
  errorResponse,
} from "../../utils/response.js";
import logger from "../../utils/logger.js";

export const listCities = async (req, res) => {
  try {
    const result = await selfDriveService.listCities(req.query);
    return successResponseWithPagination(
      result.rows.map((city) => ({
        id: city.id,
        short_name: city.short_name,
        name: city.name,
        address: city.address,
        image: city.image,
      })),
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

export const searchSelfDrive = async (req, res) => {
  try {
    const data = await selfDriveService.searchSelfDrive(req.body);
    return successResponse(data, "Search completed successfully", res);
  } catch (error) {
    logger.error("searchSelfDrive error:", error);
    return errorResponse(error, res);
  }
};

export const listCategories = async (req, res) => {
  try {
    const data = await selfDriveService.listCategories(req.query);
    return successResponse(data, "Categories fetched successfully", res);
  } catch (error) {
    logger.error("listCategories error:", error);
    return errorResponse(error, res);
  }
};

export const listCars = async (req, res) => {
  try {
    const result = await selfDriveService.listCars(req.query);
    const { page, limit } = result.pagination;

    return successResponse(
      {
        mode: result.mode,
        city: result.city,
        pickup_at: result.pickup_at,
        drop_at: result.drop_at,
        rental_days: result.rental_days,
        is_estimated: result.is_estimated,
        cars: result.rows,
        pagination: {
          totalItems: result.count || 0,
          currentPage: page,
          totalPages: Math.ceil((result.count || 0) / limit) || 0,
          limit,
        },
      },
      "Cars fetched successfully",
      res
    );
  } catch (error) {
    logger.error("listCars error:", error);
    return errorResponse(error, res);
  }
};

export const getCarById = async (req, res) => {
  try {
    const car = await selfDriveService.getCarById(req.params.id, req.query);

    return successResponse(
      {
        mode: car.fare_preview.is_estimated ? "browse" : "find",
        city: car.city,
        pickup_at: req.query.pickup_at ?? null,
        drop_at: req.query.drop_at ?? null,
        rental_days: car.fare_preview.rental_days,
        is_estimated: car.fare_preview.is_estimated,
        car,
      },
      "Car fetched successfully",
      res
    );
  } catch (error) {
    logger.error("getCarById error:", error);
    return errorResponse(error, res);
  }
};
