import express from "express";
const router = express.Router();

import * as bookingController from "../../controllers/user/booking.controller.js";
import validate from "../../middlewares/validation.js";
import schema from "../../middlewares/joiValidation/user/booking.js";
import auth from "../../middlewares/userAuth.js";

router.post(
  "/summary",
  auth.required,
  validate({ body: schema.bookingSummarySchema }),
  bookingController.getBookingSummary
);

router.post(
  "/checkout",
  auth.required,
  validate({ body: schema.checkoutSchema, query: schema.checkoutQuerySchema }),
  bookingController.checkoutBooking
);

router.get(
  "/",
  auth.required,
  validate({ query: schema.listBookingsQuerySchema }),
  bookingController.listBookings
);

router.get(
  "/:id",
  auth.required,
  validate({ params: schema.bookingIdParamSchema }),
  bookingController.getBookingById
);

router.post(
  "/:id/pay",
  auth.required,
  validate({
    params: schema.bookingIdParamSchema,
    query: schema.checkoutQuerySchema,
  }),
  bookingController.retryBookingPayment
);

export default router;
