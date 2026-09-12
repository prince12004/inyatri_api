import express from "express";
const router = express.Router();

import adminAuthRoute from "./auth.route.js";
import carBrandRoute from "./carBrand.route.js";
import carFeatureRoute from "./carFeature.route.js";
import stateRoute from "./state.route.js";
import cityRoute from "./city.route.js";
import carTypeRoute from "./carType.route.js";
import carRoute from "./car.route.js";
import couponRoute from "./coupon.route.js";

router.use("/auth", adminAuthRoute);
router.use("/car-brands", carBrandRoute);
router.use("/car-features", carFeatureRoute);
router.use("/states", stateRoute);
router.use("/cities", cityRoute);
router.use("/car-types", carTypeRoute);
router.use("/cars", carRoute);
router.use("/coupons", couponRoute);

export default router;
