import express from "express";
const router = express.Router();
import userAuthRoute from "./auth.route.js";
import selfDriveRoute from "./selfDrive.route.js";
import bookingRoute from "./booking.route.js";
import couponRoute from "./coupon.route.js";
import paymentRoute from "./payment.route.js";

router.use("/auth", userAuthRoute);
router.use("/self-drive", selfDriveRoute);
router.use("/self-drive/bookings", bookingRoute);
router.use("/self-drive/coupons", couponRoute);
router.use("/payments", paymentRoute);

export default router;
