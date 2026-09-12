import express from "express";
const router = express.Router();

import * as stateController from "../../controllers/admin/state.controller.js";
import validate from "../../middlewares/validation.js";
import schema from "../../middlewares/joiValidation/admin/state.js";
import auth from "../../middlewares/adminAuth.js";

router.get(
  "/",
  auth.required,
  validate({ query: schema.listQuerySchema }),
  stateController.listStates
);

router.post(
  "/",
  auth.required,
  validate({ body: schema.createStateSchema }),
  stateController.createState
);

router.put(
  "/:id",
  auth.required,
  validate({ params: schema.idParamSchema, body: schema.updateStateSchema }),
  stateController.updateState
);

router.delete(
  "/:id",
  auth.required,
  validate({ params: schema.idParamSchema }),
  stateController.deleteState
);

export default router;
