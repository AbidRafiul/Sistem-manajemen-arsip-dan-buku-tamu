import express from "express";
import AccessToken from "./auth/token_get.js";
import Login from "./auth/login.js";
import Setup from "./setup/index.js";
import Function from "./components/index.js";
import MasterData from "./master/index.js";
import ResetPassword from "./auth/reset_password.js";
import ArsipDokumen from "./arsip_dokumen/index.js";
import BukuTamu from "./buku_tamu/index.js"; 

import {
  contextMiddleware,
  validateAccessToken,
  validateBaseToken,
  validateSignature,
} from "../../middleware/validate_header.js";
const router = express.Router();

// Auth
router.use("/auth/token", AccessToken);
router.use("/auth/login", [validateAccessToken], Login);
router.use("/auth/reset-password", [validateAccessToken], ResetPassword);

// Modul-Modul Aplikasi

// Setup (Dibuat loss-dol tanpa middleware agar menu user-data langsung muncul)
router.use(
  "/setup",
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
)

// Arsip Dokumen
router.use(
  "/arsip-dokumen",
  [validateAccessToken, validateSignature, contextMiddleware],
  ArsipDokumen
);

// Buku Tamu
router.use(
  "/buku-tamu", 
  BukuTamu     
);

export default router;