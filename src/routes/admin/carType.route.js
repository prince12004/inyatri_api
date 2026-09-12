import express from "express";
const router = express.Router();

import * as carTypeController from "../../controllers/admin/carType.controller.js";
import validate from "../../middlewares/validation.js";
import schema from "../../middlewares/joiValidation/admin/carType.js";
import auth from "../../middlewares/adminAuth.js";

router.get(
  "/",
  auth.required,
  validate({ query: schema.listQuerySchema }),
  carTypeController.listCarTypes
);

router.post(
  "/",
  auth.required,
  validate({ body: schema.createTypeSchema }),
  carTypeController.createCarType
);

router.put(
  "/:id",
  auth.required,
  validate({ params: schema.idParamSchema, body: schema.updateTypeSchema }),
  carTypeController.updateCarType
);

router.delete(
  "/:id",
  auth.required,
  validate({ params: schema.idParamSchema }),
  carTypeController.deleteCarType
);

export default router;
