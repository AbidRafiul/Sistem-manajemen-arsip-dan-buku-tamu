import express from "express";
import AccessToken from "./auth/token_get.js";
import Login from "./auth/login.js";
import Setup from "./setup/index.js";
import Function from "./components/index.js";
import MasterData from "./master/index.js";
import ResetPassword from "./auth/reset_password.js";
import ArsipDokumen from "./arsip_dokumen/index.js";
import SuratMasuk from "./correspondence/index.js"
import BukuTamu from "./buku_tamu/index.js"
import Dashboard from "./dashboard/index.js"
import VerifikasiDokumen from "./verifikasi_dokumen.js";

import {
  contextMiddleware,
  validateAccessToken,
  validateBaseToken,
  validateSignature,
} from "../../middleware/validate_header.js";

const router = express.Router();

// Auth
router.use("/auth/token", AccessToken);
router.use("/auth/login", Login);
router.use("/auth/reset-password", [validateAccessToken], ResetPassword);

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
  "/buku_tamu",
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
