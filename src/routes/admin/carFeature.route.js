import express from "express";
const router = express.Router();

import * as carFeatureController from "../../controllers/admin/carFeature.controller.js";
import validate from "../../middlewares/validation.js";
import schema from "../../middlewares/joiValidation/admin/carFeature.js";
import auth from "../../middlewares/adminAuth.js";

router.get(
  "/",
  auth.required,
  validate({ query: schema.listQuerySchema }),
  carFeatureController.listCarFeatures
);

router.post(
  "/",
  auth.required,
  validate({ body: schema.createFeatureSchema }),
  carFeatureController.createCarFeature
);

router.put(
  "/:id",
  auth.required,
  validate({ params: schema.idParamSchema, body: schema.updateFeatureSchema }),
  carFeatureController.updateCarFeature
);

router.delete(
  "/:id",
  auth.required,
  validate({ params: schema.idParamSchema }),
  carFeatureController.deleteCarFeature
);

export default router;
