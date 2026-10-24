import express from "express";
const router = express.Router();

import * as cabController from "../../controllers/user/cab.controller.js";
import * as unifiedBookingController from "../../controllers/user/unifiedBooking.controller.js";
import validate from "../../middlewares/validation.js";
import schema from "../../middlewares/joiValidation/user/cab.js";
import unifiedSchema from "../../middlewares/joiValidation/user/unifiedBooking.js";
import auth from "../../middlewares/userAuth.js";

// ─── Public Routes ─────────────────────────────────────────────────────────

router.get(
  "/packages",
  validate({ query: schema.listCabPackagesQuerySchema }),
  cabController.listCabPackages
);

router.post(
  "/search",
  validate({ body: schema.searchCabSchema }),
  cabController.searchCabs
);

router.get(
  "/cars",
  validate({ query: schema.listCabCarsQuerySchema }),
  cabController.listCabCars
);

router.get(
  "/cars/:id",
  validate({
    params: schema.cabCarIdParamSchema,
    query: schema.cabCarDetailQuerySchema,
  }),
  cabController.getCabCarDetail
);

// ─── Authenticated Routes ──────────────────────────────────────────────────

router.post(
  "/bookings/summary",
  auth.required,
  validate({ body: schema.cabBookingSummarySchema }),
  cabController.getCabBookingSummary
);

router.post(
  "/bookings/validate-coupon",
  auth.required,
  validate({ body: schema.validateCabCouponSchema }),
  cabController.validateCabCoupon
);

router.post(
  "/bookings/checkout",
  auth.required,
  validate({
    body: schema.cabCheckoutSchema,
    query: schema.cabCheckoutQuerySchema,
  }),
  cabController.checkoutCabBooking
);

router.get(
  "/bookings",
  auth.required,
  validate({ query: schema.listCabBookingsQuerySchema }),
  cabController.listCabBookings
);

router.get(
  "/bookings/:id",
  auth.required,
  validate({ params: schema.cabBookingIdParamSchema }),
  cabController.getCabBookingById
);

router.post(
  "/bookings/:id/pay",
  auth.required,
  validate({
    params: schema.cabBookingIdParamSchema,
    query: schema.cabCheckoutQuerySchema,
  }),
  cabController.retryCabPayment
);

router.post(
  "/bookings/:id/payments/sync",
  auth.required,
  validate({ params: schema.cabBookingIdParamSchema }),
  cabController.syncCabPayment
);

router.post(
  "/bookings/:id/cancel",
  auth.required,
  validate({
    params: schema.cabBookingIdParamSchema,
    body: unifiedSchema.cancelBookingBody,
  }),
  unifiedBookingController.cancelBooking
);

export default router;

