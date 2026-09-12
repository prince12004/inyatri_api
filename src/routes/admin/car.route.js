import express from "express";
const router = express.Router();

import * as carController from "../../controllers/admin/car.controller.js";
import validate from "../../middlewares/validation.js";
import schema from "../../middlewares/joiValidation/admin/car.js";
import auth from "../../middlewares/adminAuth.js";
import {
  uploadSingleImage,
  uploadMultipleImages,
} from "../../middlewares/cloudinaryUpload.js";

router.get("/meta", auth.required, carController.getCarMeta);

router.post(
  "/upload/image",
  auth.required,
  uploadSingleImage,
  carController.uploadSingleImage
);

router.post(
  "/upload/images",
  auth.required,
  uploadMultipleImages,
  carController.uploadMultipleImages
);

router.get(
  "/",
  auth.required,
  validate({ query: schema.listQuerySchema }),
  carController.listCars
);

router.post(
  "/",
  auth.required,
  validate({ body: schema.createCarSchema }),
  carController.createCar
);

router.get(
  "/:id",
  auth.required,
  validate({ params: schema.carIdParamSchema }),
  carController.getCarById
);

router.put(
  "/:id",
  auth.required,
  validate({ params: schema.carIdParamSchema, body: schema.updateCarSchema }),
  carController.updateCar
);

router.patch(
  "/:id/status",
  auth.required,
  validate({
    params: schema.carIdParamSchema,
    body: schema.updateCarStatusSchema,
  }),
  carController.updateCarStatus
);

export default router;
