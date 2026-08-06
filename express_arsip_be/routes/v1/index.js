import express from "express";
// Auth
import AccessToken from "./auth/token_get.js";
import Login from "./auth/login.js";
import ResetPassword from "./auth/reset_password.js";
import ProfileGet from "./auth/profile_get.js";
import ProfileUpdate from "./auth/profile_update.js";

// Modul-Modul Aplikasi
import Setup from "./setup/index.js";
import Function from "./components/index.js";
import MasterData from "./master/index.js";
import ArsipDokumen from "./arsip_dokumen/index.js";
import SuratMasuk from "./correspondence/index.js"
import BukuTamu from "./buku_tamu/index.js"
import Dashboard from "./dashboard/index.js"
import VerifikasiDokumen from "./verifikasi_dokumen/index.js";

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
router.use("/auth/profile", [validateAccessToken, validateSignature, contextMiddleware], ProfileGet);
router.use("/auth/profile/update", [validateAccessToken, validateSignature, contextMiddleware], ProfileUpdate);

// Modul-Modul Aplikasi
router.use("/verifikasi-dokumen", VerifikasiDokumen);

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

// Arsip Dokumen
router.use(
  "/arsip-dokumen",
  [validateAccessToken, validateSignature, contextMiddleware],
  ArsipDokumen
);

// Buku Tamu
router.use(
  "/buku-tamu",
  [validateAccessToken, validateSignature, contextMiddleware],
  BukuTamu
);
//Surat Masuk (Correspondence)
router.use(
  "/correspondence",
  [validateAccessToken, validateSignature, contextMiddleware],
  SuratMasuk
);

// Dashboard
router.use(
  "/dashboard",
  [validateAccessToken, validateSignature, contextMiddleware],
  Dashboard
);

export default router;

