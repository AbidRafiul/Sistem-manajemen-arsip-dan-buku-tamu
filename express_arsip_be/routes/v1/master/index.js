import express from "express";

import ArsipRouter from "./arsip/index.js";
import OrganisasiRouter from "./organisasi/index.js";
import VisitPurposeRouter from "./visit_purpose/vp_data.js";

const router = express.Router();

router.use("/arsip", ArsipRouter);
router.use("/organisasi", OrganisasiRouter);
router.use("/visit-purpose", VisitPurposeRouter);

export default router;
