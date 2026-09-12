import * as stateRepository from "../../repositories/admin/state.repository.js";
import ApiError from "../../utils/ApiError.js";
import { STATUS } from "../../utils/constants/car.enums.js";

const findDuplicateState = async (stateName, excludeId = null) => {
  const result = await stateRepository.findAll({
    search: stateName,
    page: 1,
    limit: 20,
  });

  return result.rows.find(
    (row) =>
      row.state_name.toLowerCase() === stateName.trim().toLowerCase() &&
      row.id !== excludeId
  );
};

export const listStates = async (query) =>
  stateRepository.findAll({
    status: query.status ?? STATUS.ACTIVE,
    search: query.search,
    page: query.page,
    limit: query.limit,
  });

export const createState = async (payload) => {
  if (await findDuplicateState(payload.state_name)) {
    throw new ApiError(409, "State already exists");
  }

  return stateRepository.create({
    state_name: payload.state_name.trim(),
    country_code: (payload.country_code || "IN").toUpperCase(),
    status: payload.status ?? STATUS.ACTIVE,
  });
};

export const updateState = async (id, payload) => {
  const state = await stateRepository.findById(id);
  if (!state) {
    throw new ApiError(404, "State not found");
  }

  if (payload.state_name) {
    const duplicate = await findDuplicateState(payload.state_name, id);
    if (duplicate) {
      throw new ApiError(409, "State already exists");
    }
  }

  const updates = {};
  if (payload.state_name !== undefined) {
    updates.state_name = payload.state_name.trim();
  }
  if (payload.country_code !== undefined) {
    updates.country_code = payload.country_code.toUpperCase();
  }
  if (payload.status !== undefined) {
    updates.status = payload.status;
  }

  return stateRepository.update(id, updates);
};

export const deleteState = async (id) => {
  const state = await stateRepository.findById(id);
  if (!state) {
    throw new ApiError(404, "State not found");
  }

  if (state.status === STATUS.INACTIVE) {
    throw new ApiError(400, "State is already inactive");
  }

  return stateRepository.softDelete(id);
};
