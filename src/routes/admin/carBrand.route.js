import express from "express";
const router = express.Router();

import * as carBrandController from "../../controllers/admin/carBrand.controller.js";
import validate from "../../middlewares/validation.js";
import schema from "../../middlewares/joiValidation/admin/carBrand.js";
import auth from "../../middlewares/adminAuth.js";

router.get(
  "/",
  auth.required,
  validate({ query: schema.listQuerySchema }),
  carBrandController.listCarBrands
);

router.post(
  "/",
  auth.required,
  validate({ body: schema.createBrandSchema }),
  carBrandController.createCarBrand
);

router.put(
  "/:id",
  auth.required,
  validate({ params: schema.idParamSchema, body: schema.updateBrandSchema }),
  carBrandController.updateCarBrand
);

router.delete(
  "/:id",
  auth.required,
  validate({ params: schema.idParamSchema }),
  carBrandController.deleteCarBrand
);

export default router;
