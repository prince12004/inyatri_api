import express from "express";
const router = express.Router();

import * as paymentController from "../../controllers/user/payment.controller.js";
import { requiredDevWithQueryToken } from "../../middlewares/userAuth.js";
import validate from "../../middlewares/validation.js";
import schema from "../../middlewares/joiValidation/user/booking.js";

router.post("/payu/success", paymentController.payuSuccessCallback);
router.post("/payu/failure", paymentController.payuFailureCallback);

/** Dev/local only — auto-POST HTML form to PayU for browser testing */
router.get(
  "/payu/redirect/:id",
  requiredDevWithQueryToken,
  validate({ params: schema.bookingIdParamSchema }),
  paymentController.payuRedirectToCheckout
);

export default router;
