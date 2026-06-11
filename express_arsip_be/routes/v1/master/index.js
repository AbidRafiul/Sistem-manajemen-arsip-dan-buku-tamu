import express from "express";

import ArsipRouter from "./arsip/index.js";
import OrganisasiRouter from "./organisasi/index.js";

const router = express.Router();

router.use("/arsip", ArsipRouter);
router.use("/organisasi", OrganisasiRouter);

export default router;