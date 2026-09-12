import * as cityRepository from "../../repositories/admin/city.repository.js";
import * as carRepository from "../../repositories/admin/car.repository.js";
import ApiError from "../../utils/ApiError.js";
import { STATUS } from "../../utils/constants/car.enums.js";

const findDuplicateCity = async (name, excludeId = null) => {
  const result = await cityRepository.findAll({
    search: name,
    page: 1,
    limit: 20,
  });

  return result.rows.find(
    (row) =>
      row.name.toLowerCase() === name.trim().toLowerCase() && row.id !== excludeId
  );
};

export const listCities = async (query) =>
  cityRepository.findAll({
    status: query.status ?? STATUS.ACTIVE,
    search: query.search,
    page: query.page,
    limit: query.limit,
  });

export const createCity = async (payload) => {
  if (await findDuplicateCity(payload.name)) {
    throw new ApiError(409, "City already exists");
  }

  return cityRepository.create({
    short_name: payload.short_name.trim(),
    name: payload.name.trim(),
    address: payload.address.trim(),
    image: payload.image.trim(),
    status: payload.status ?? STATUS.ACTIVE,
  });
};

export const updateCity = async (id, payload) => {
  const city = await cityRepository.findById(id);
  if (!city) {
    throw new ApiError(404, "City not found");
  }

  if (payload.name) {
    const duplicate = await findDuplicateCity(payload.name, id);
    if (duplicate) {
      throw new ApiError(409, "City already exists");
    }
  }

  const updates = {};
  if (payload.short_name !== undefined) {
    updates.short_name = payload.short_name.trim();
  }
  if (payload.name !== undefined) {
    updates.name = payload.name.trim();
  }
  if (payload.address !== undefined) {
    updates.address = payload.address.trim();
  }
  if (payload.image !== undefined) {
    updates.image = payload.image.trim();
  }
  if (payload.status !== undefined) {
    updates.status = payload.status;
  }

  return cityRepository.update(id, updates);
};

export const deleteCity = async (id) => {
  const city = await cityRepository.findById(id);
  if (!city) {
    throw new ApiError(404, "City not found");
  }

  if (city.status === STATUS.INACTIVE) {
    throw new ApiError(400, "City is already inactive");
  }

  const inUse = await carRepository.countActiveCarsByCityId(id);
  if (inUse > 0) {
    throw new ApiError(400, "Cannot deactivate city linked to active cars");
  }

  return cityRepository.softDelete(id);
};
