import express from "express";

import ArsipRouter from "./arsip/index.js";
import OrganisasiRouter from "./organisasi/index.js";
import VisitPurposeRouter from "./visit_purpose/vp_data.js";
import SuratRouter from "./surat/index.js";

const router = express.Router();

router.use("/arsip", ArsipRouter);
router.use("/organisasi", OrganisasiRouter);
router.use("/visit-purpose", VisitPurposeRouter);
router.use("/surat", SuratRouter);

export default router;
