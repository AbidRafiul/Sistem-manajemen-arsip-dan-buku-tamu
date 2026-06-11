import express from "express";
import AccessToken from "./auth/token_get.js";
import Login from "./auth/login.js";
import Setup from "./setup/index.js";
import Function from "./components/index.js";
import MasterData from "./master/index.js";
import ResetPassword from "./auth/reset_password.js";

import {
  contextMiddleware,
  validateAccessToken,
  validateBaseToken,
  validateSignature,
} from "../../middleware/validate_header.js";
const router = express.Router();

//auth
router.use("/auth/token", AccessToken);
router.use("/auth/login", [validateAccessToken], Login);
router.use("/auth/reset-password", [validateAccessToken], ResetPassword);

// Modul
// Setup
router.use(
  "/setup",
  [validateAccessToken, validateSignature, contextMiddleware],
  Setup
);

// Function
router.use(
  "/function",
  [validateAccessToken, validateSignature, contextMiddleware],
  Function
);

router.use(
  "/master",
  [validateAccessToken, validateSignature, contextMiddleware],
  MasterData
);

export default router;
