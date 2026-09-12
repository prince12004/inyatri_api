import * as carBrandRepository from "../../repositories/admin/carBrand.repository.js";
import * as carRepository from "../../repositories/admin/car.repository.js";
import ApiError from "../../utils/ApiError.js";
import { STATUS } from "../../utils/constants/car.enums.js";

const findDuplicateBrand = async (brandName, excludeId = null) => {
  const result = await carBrandRepository.findAll({
    search: brandName,
    page: 1,
    limit: 20,
  });

  return result.rows.find(
    (row) =>
      row.brand_name.toLowerCase() === brandName.trim().toLowerCase() &&
      row.id !== excludeId
  );
};

export const listCarBrands = async (query) =>
  carBrandRepository.findAll({
    status: query.status ?? STATUS.ACTIVE,
    search: query.search,
    page: query.page,
    limit: query.limit,
  });

export const createCarBrand = async (payload) => {
  if (await findDuplicateBrand(payload.brand_name)) {
    throw new ApiError(409, "Car brand already exists");
  }

  return carBrandRepository.create({
    brand_name: payload.brand_name.trim(),
    status: payload.status ?? STATUS.ACTIVE,
  });
};

export const updateCarBrand = async (id, payload) => {
  const brand = await carBrandRepository.findById(id);
  if (!brand) {
    throw new ApiError(404, "Car brand not found");
  }

  if (payload.brand_name) {
    const duplicate = await findDuplicateBrand(payload.brand_name, id);
    if (duplicate) {
      throw new ApiError(409, "Car brand already exists");
    }
  }

  const updates = {};
  if (payload.brand_name !== undefined) {
    updates.brand_name = payload.brand_name.trim();
  }
  if (payload.status !== undefined) {
    updates.status = payload.status;
  }

  return carBrandRepository.update(id, updates);
};

export const deleteCarBrand = async (id) => {
  const brand = await carBrandRepository.findById(id);
  if (!brand) {
    throw new ApiError(404, "Car brand not found");
  }

  if (brand.status === STATUS.INACTIVE) {
    throw new ApiError(400, "Car brand is already inactive");
  }

  const inUse = await carRepository.countActiveCarsByBrandId(id);
  if (inUse > 0) {
    throw new ApiError(400, "Cannot deactivate brand linked to active cars");
  }

  return carBrandRepository.softDelete(id);
};
