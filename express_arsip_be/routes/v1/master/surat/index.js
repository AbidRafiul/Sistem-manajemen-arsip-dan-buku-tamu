import express from "express";

import templateSuratGet from "./template_surat_get.js";
import templateSuratDetail from "./template_surat_detail.js";
import templateSuratCreate from "./template_surat_create.js";
import templateSuratUpdate from "./template_surat_update.js";
import templateSuratDelete from "./template_surat_delete.js";

const router = express.Router();

router.use("/template-surat", templateSuratGet);
router.use("/template-surat", templateSuratDetail);
router.use("/template-surat", templateSuratCreate);
router.use("/template-surat", templateSuratUpdate);
router.use("/template-surat", templateSuratDelete);

export default router;
