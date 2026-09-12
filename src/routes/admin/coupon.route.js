import express from "express";
const router = express.Router();

import * as couponController from "../../controllers/admin/coupon.controller.js";
import validate from "../../middlewares/validation.js";
import schema from "../../middlewares/joiValidation/admin/coupon.js";
import auth from "../../middlewares/adminAuth.js";

router.get(
  "/",
  auth.required,
  validate({ query: schema.listQuerySchema }),
  couponController.listCoupons
);

router.get(
  "/:id",
  auth.required,
  validate({ params: schema.idParamSchema }),
  couponController.getCouponById
);

router.post(
  "/",
  auth.required,
  validate({ body: schema.createCouponSchema }),
  couponController.createCoupon
);

router.put(
  "/:id",
  auth.required,
  validate({ params: schema.idParamSchema, body: schema.updateCouponSchema }),
  couponController.updateCoupon
);

router.patch(
  "/:id/status",
  auth.required,
  validate({
    params: schema.idParamSchema,
    body: schema.updateCouponStatusSchema,
  }),
  couponController.updateCouponStatus
);

router.delete(
  "/:id",
  auth.required,
  validate({ params: schema.idParamSchema }),
  couponController.deleteCoupon
);

export default router;
