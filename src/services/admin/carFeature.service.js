import * as carFeatureRepository from "../../repositories/admin/carFeature.repository.js";
import * as carRepository from "../../repositories/admin/car.repository.js";
import ApiError from "../../utils/ApiError.js";
import { STATUS } from "../../utils/constants/car.enums.js";

const findDuplicateFeature = async (name, excludeId = null) => {
  const result = await carFeatureRepository.findAll({
    search: name,
    page: 1,
    limit: 20,
  });

  return result.rows.find(
    (row) =>
      row.name.toLowerCase() === name.trim().toLowerCase() &&
      row.id !== excludeId
  );
};

export const listCarFeatures = async (query) =>
  carFeatureRepository.findAll({
    status: query.status ?? STATUS.ACTIVE,
    search: query.search,
    page: query.page,
    limit: query.limit,
  });

export const createCarFeature = async (payload) => {
  if (await findDuplicateFeature(payload.name)) {
    throw new ApiError(409, "Car feature already exists");
  }

  return carFeatureRepository.create({
    name: payload.name.trim(),
    status: payload.status ?? STATUS.ACTIVE,
  });
};

export const updateCarFeature = async (id, payload) => {
  const feature = await carFeatureRepository.findById(id);
  if (!feature) {
    throw new ApiError(404, "Car feature not found");
  }

  if (payload.name) {
    const duplicate = await findDuplicateFeature(payload.name, id);
    if (duplicate) {
      throw new ApiError(409, "Car feature already exists");
    }
  }

  const updates = {};
  if (payload.name !== undefined) {
    updates.name = payload.name.trim();
  }
  if (payload.status !== undefined) {
    updates.status = payload.status;
  }

  return carFeatureRepository.update(id, updates);
};

export const deleteCarFeature = async (id) => {
  const feature = await carFeatureRepository.findById(id);
  if (!feature) {
    throw new ApiError(404, "Car feature not found");
  }

  if (feature.status === STATUS.INACTIVE) {
    throw new ApiError(400, "Car feature is already inactive");
  }

  const inUse = await carRepository.countActiveCarsByFeatureId(id);
  if (inUse > 0) {
    throw new ApiError(400, "Cannot deactivate feature linked to active cars");
  }

  return carFeatureRepository.softDelete(id);
};
