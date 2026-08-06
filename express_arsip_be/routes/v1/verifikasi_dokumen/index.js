import express from "express";
const router = express.Router();

import verifikasiGet from "./verifikasi_get.js";

router.get("/:token_verifikasi", verifikasiGet);

export default router;
