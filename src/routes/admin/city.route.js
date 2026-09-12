import express from "express";
const router = express.Router();

import * as cityController from "../../controllers/admin/city.controller.js";
import validate from "../../middlewares/validation.js";
import schema from "../../middlewares/joiValidation/admin/city.js";
import auth from "../../middlewares/adminAuth.js";

router.get(
  "/",
  auth.required,
  validate({ query: schema.listQuerySchema }),
  cityController.listCities
);

router.post(
  "/",
  auth.required,
  validate({ body: schema.createCitySchema }),
  cityController.createCity
);

router.put(
  "/:id",
  auth.required,
  validate({ params: schema.idParamSchema, body: schema.updateCitySchema }),
  cityController.updateCity
);

router.delete(
  "/:id",
  auth.required,
  validate({ params: schema.idParamSchema }),
  cityController.deleteCity
);

export default router;
