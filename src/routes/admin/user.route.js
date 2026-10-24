import express from "express";
const router = express.Router();

import * as userController from "../../controllers/admin/user.controller.js";
import validate from "../../middlewares/validation.js";
import schema from "../../middlewares/joiValidation/admin/user.js";
import auth from "../../middlewares/adminAuth.js";

router.get(
  "/",
  auth.required,
  validate({ query: schema.listUsersQuery }),
  userController.listUsers
);

router.get("/:id", auth.required, userController.getUserById);

router.patch(
  "/:id",
  auth.required,
  validate({ body: schema.updateUserBody }),
  userController.updateUser
);

router.patch(
  "/:id/status",
  auth.required,
  validate({ body: schema.updateStatusBody }),
  userController.updateUserStatus
);

router.delete("/:id", auth.required, userController.deleteUser);

export default router;
