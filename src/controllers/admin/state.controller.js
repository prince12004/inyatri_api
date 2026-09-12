import * as stateService from "../../services/admin/state.service.js";
import {
  successResponse,
  successResponseWithPagination,
  errorResponse,
} from "../../utils/response.js";
import logger from "../../utils/logger.js";

export const listStates = async (req, res) => {
  try {
    const result = await stateService.listStates(req.query);
    return successResponseWithPagination(
      result.rows,
      result.count,
      "States fetched successfully",
      res,
      result.pagination.page,
      result.pagination.limit
    );
  } catch (error) {
    logger.error("listStates error:", error);
    return errorResponse(error, res);
  }
};

export const createState = async (req, res) => {
  try {
    const state = await stateService.createState(req.body);
    return successResponse(state, "State created successfully", res, 201);
  } catch (error) {
    logger.error("createState error:", error);
    return errorResponse(error, res);
  }
};

export const updateState = async (req, res) => {
  try {
    const state = await stateService.updateState(req.params.id, req.body);
    return successResponse(state, "State updated successfully", res);
  } catch (error) {
    logger.error("updateState error:", error);
    return errorResponse(error, res);
  }
};

export const deleteState = async (req, res) => {
  try {
    const state = await stateService.deleteState(req.params.id);
    return successResponse(state, "State deactivated successfully", res);
  } catch (error) {
    logger.error("deleteState error:", error);
    return errorResponse(error, res);
  }
};
