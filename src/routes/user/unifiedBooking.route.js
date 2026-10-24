import express from "express";
const router = express.Router();

import * as unifiedBookingController from "../../controllers/user/unifiedBooking.controller.js";
import validate from "../../middlewares/validation.js";
import schema from "../../middlewares/joiValidation/user/unifiedBooking.js";
import auth from "../../middlewares/userAuth.js";

router.get(
  "/",
  auth.required,
  validate({ query: schema.listBookingsQuery }),
  unifiedBookingController.listBookings
);

router.get(
  "/:id",
  auth.required,
  validate({
    params: schema.bookingDetailParams,
    query: schema.bookingDetailQuery,
  }),
  unifiedBookingController.getBookingDetail
);

router.post(
  "/:id/cancel",
  auth.required,
  validate({
    params: schema.bookingDetailParams,
    body: schema.cancelBookingBody,
  }),
  unifiedBookingController.cancelBooking
);

router.patch(
  "/:id/cancel",
  auth.required,
  validate({
    params: schema.bookingDetailParams,
    body: schema.cancelBookingBody,
  }),
  unifiedBookingController.cancelBooking
);

export default router;

