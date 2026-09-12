import express from "express";
const router = express.Router();

import * as selfDriveController from "../../controllers/user/selfDrive.controller.js";
import validate from "../../middlewares/validation.js";
import schema from "../../middlewares/joiValidation/user/selfDrive.js";

router.get(
  "/cities",
  validate({ query: schema.listCitiesQuerySchema }),
  selfDriveController.listCities
);

router.post(
  "/search",
  validate({ body: schema.searchSelfDriveSchema }),
  selfDriveController.searchSelfDrive
);

router.get(
  "/categories",
  validate({ query: schema.browseCategoriesQuerySchema }),
  selfDriveController.listCategories
);

router.get(
  "/cars",
  validate({ query: schema.listCarsQuerySchema }),
  selfDriveController.listCars
);

router.get(
  "/cars/:id",
  validate({
    params: schema.carIdParamSchema,
    query: schema.carDetailQuerySchema,
  }),
  selfDriveController.getCarById
);

export default router;
