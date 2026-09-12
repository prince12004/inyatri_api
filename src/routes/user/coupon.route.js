import express from "express";
const router = express.Router();

import * as bookingController from "../../controllers/user/booking.controller.js";
import validate from "../../middlewares/validation.js";
import schema from "../../middlewares/joiValidation/user/booking.js";
import auth from "../../middlewares/userAuth.js";

router.get(
  "/available",
  auth.required,
  validate({ query: schema.availableCouponsQuerySchema }),
  bookingController.listAvailableCoupons
);

router.post(
  "/validate",
  auth.required,
  validate({ body: schema.validateCouponSchema }),
  bookingController.validateCoupon
);

export default router;
