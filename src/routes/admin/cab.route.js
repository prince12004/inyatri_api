import express from "express";
const router = express.Router();

import * as cabController from "../../controllers/admin/cab.controller.js";
import validate from "../../middlewares/validation.js";
import schema from "../../middlewares/joiValidation/admin/cab.js";

// ─── Dashboard ─────────────────────────────────────────────────────────────

router.get(
  "/dashboard",
  validate({ query: schema.cabDashboardQuerySchema }),
  cabController.getCabDashboard
);

// ─── Car Dropdown for Pricing Form ─────────────────────────────────────────

router.get("/cars", cabController.listCarsForDropdown);

// ─── Cab Pricing CRUD ──────────────────────────────────────────────────────

router.get(
  "/pricing",
  validate({ query: schema.listCabPricingsQuerySchema }),
  cabController.listCabPricings
);

router.post(
  "/pricing",
  validate({ body: schema.createCabPricingSchema }),
  cabController.createCabPricing
);

router.put(
  "/pricing/:id",
  validate({ params: schema.idParamSchema, body: schema.updateCabPricingSchema }),
  cabController.updateCabPricing
);

router.patch(
  "/pricing/:id/status",
  validate({ params: schema.idParamSchema, body: schema.updateStatusSchema }),
  cabController.updateCabPricingStatus
);

router.delete(
  "/pricing/:id",
  validate({ params: schema.idParamSchema }),
  cabController.deleteCabPricing
);

// ─── Cab Packages (Local trip type) ────────────────────────────────────────

router.get(
  "/packages",
  validate({ query: schema.listCabPackagesQuerySchema }),
  cabController.listCabPackages
);

router.post(
  "/packages",
  validate({ body: schema.createCabPackageSchema }),
  cabController.createCabPackage
);

router.put(
  "/packages/:id",
  validate({ params: schema.idParamSchema, body: schema.updateCabPackageSchema }),
  cabController.updateCabPackage
);

router.patch(
  "/packages/:id/status",
  validate({ params: schema.idParamSchema, body: schema.updateStatusSchema }),
  cabController.updateCabPackageStatus
);

export default router;
