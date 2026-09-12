import * as authRepository from "../../repositories/admin/auth.repository.js";
import {
  formatAdminResponse,
  signAdminToken,
  verifyAdminPassword,
} from "../../utils/auth.util.js";
import ApiError from "../../utils/ApiError.js";

export const loginAdmin = async ({ email, password }) => {
  const normalizedEmail = String(email).trim().toLowerCase();
  const admin = await authRepository.findAdminByEmail(normalizedEmail);

  if (!admin) {
    throw new ApiError(401, "Invalid email or password");
  }

  if (admin.status !== 1) {
    throw new ApiError(400, "Account is inactive. Please contact the super admin.");
  }

  const passwordValid = await verifyAdminPassword(password, admin.password);

  if (!passwordValid) {
    throw new ApiError(401, "Invalid email or password");
  }

  const token = signAdminToken(admin);

  return {
    token,
    admin: formatAdminResponse(admin),
  };
};
