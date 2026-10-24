import * as userService from "../../services/admin/user.service.js";
import {
  successResponse,
  successResponseWithPagination,
  errorResponse,
} from "../../utils/response.js";
import logger from "../../utils/logger.js";

export const listUsers = async (req, res) => {
  try {
    const result = await userService.listUsers(req.query);
    return successResponseWithPagination(
      result.rows,
      result.count,
      "Users fetched successfully",
      res,
      result.pagination.page,
      result.pagination.limit
    );
  } catch (error) {
    logger.error("listUsers error:", error);
    return errorResponse(error, res);
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id);
    return successResponse(user, "User details fetched successfully", res);
  } catch (error) {
    logger.error("getUserById error:", error);
    return errorResponse(error, res);
  }
};

export const updateUser = async (req, res) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body);
    return successResponse(user, "User updated successfully", res);
  } catch (error) {
    logger.error("updateUser error:", error);
    return errorResponse(error, res);
  }
};

export const updateUserStatus = async (req, res) => {
  try {
    const user = await userService.updateUserStatus(
      req.params.id,
      req.body.status
    );
    return successResponse(user, "User status updated successfully", res);
  } catch (error) {
    logger.error("updateUserStatus error:", error);
    return errorResponse(error, res);
  }
};

export const deleteUser = async (req, res) => {
  try {
    const result = await userService.deleteUser(req.params.id);
    return successResponse(result, "User deactivated successfully", res);
  } catch (error) {
    logger.error("deleteUser error:", error);
    return errorResponse(error, res);
  }
};
