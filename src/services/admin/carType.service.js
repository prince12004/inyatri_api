import * as carTypeRepository from "../../repositories/admin/carType.repository.js";
import * as carRepository from "../../repositories/admin/car.repository.js";
import ApiError from "../../utils/ApiError.js";
import { STATUS } from "../../utils/constants/car.enums.js";

const findDuplicateType = async (typeName, excludeId = null) => {
  const result = await carTypeRepository.findAll({
    search: typeName,
    page: 1,
    limit: 20,
  });

  return result.rows.find(
    (row) =>
      row.type_name.toLowerCase() === typeName.trim().toLowerCase() &&
      row.id !== excludeId
  );
};

export const listCarTypes = async (query) =>
  carTypeRepository.findAll({
    status: query.status ?? STATUS.ACTIVE,
    search: query.search,
    page: query.page,
    limit: query.limit,
  });

export const createCarType = async (payload) => {
  if (await findDuplicateType(payload.type_name)) {
    throw new ApiError(409, "Car type already exists");
  }

  return carTypeRepository.create({
    type_name: payload.type_name.trim(),
    status: payload.status ?? STATUS.ACTIVE,
  });
};

export const updateCarType = async (id, payload) => {
  const carType = await carTypeRepository.findById(id);
  if (!carType) {
    throw new ApiError(404, "Car type not found");
  }

  if (payload.type_name) {
    const duplicate = await findDuplicateType(payload.type_name, id);
    if (duplicate) {
      throw new ApiError(409, "Car type already exists");
    }
  }

  const updates = {};
  if (payload.type_name !== undefined) {
    updates.type_name = payload.type_name.trim();
  }
  if (payload.status !== undefined) {
    updates.status = payload.status;
  }

  return carTypeRepository.update(id, updates);
};

export const deleteCarType = async (id) => {
  const carType = await carTypeRepository.findById(id);
  if (!carType) {
    throw new ApiError(404, "Car type not found");
  }

  if (carType.status === STATUS.INACTIVE) {
    throw new ApiError(400, "Car type is already inactive");
  }

  const inUse = await carRepository.countActiveCarsByCarTypeId(id);
  if (inUse > 0) {
    throw new ApiError(400, "Cannot deactivate car type linked to active cars");
  }

  return carTypeRepository.softDelete(id);
};
