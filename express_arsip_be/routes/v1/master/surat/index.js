import express from "express";

import templateSuratGet from "./template_surat_get.js";
import templateSuratDetail from "./template_surat_detail.js";
import templateSuratCreate from "./template_surat_create.js";
import templateSuratUpdate from "./template_surat_update.js";
import templateSuratDelete from "./template_surat_delete.js";
import penomoranSuratTokens from "./penomoran_surat_tokens.js";
import penomoranSuratPreview from "./penomoran_surat_preview.js";
import penomoranSuratPreviewAktif from "./penomoran_surat_preview_aktif.js";
import penomoranSuratGet from "./penomoran_surat_get.js";
import penomoranSuratDetail from "./penomoran_surat_detail.js";
import penomoranSuratCreate from "./penomoran_surat_create.js";
import penomoranSuratUpdate from "./penomoran_surat_update.js";
import penomoranSuratDelete from "./penomoran_surat_delete.js";

const router = express.Router();

router.use("/template-surat", templateSuratGet);
router.use("/template-surat", templateSuratDetail);
router.use("/template-surat", templateSuratCreate);
router.use("/template-surat", templateSuratUpdate);
router.use("/template-surat", templateSuratDelete);

router.use("/penomoran-surat/tokens", penomoranSuratTokens);
router.use("/penomoran-surat/preview-aktif", penomoranSuratPreviewAktif);
router.use("/penomoran-surat/preview", penomoranSuratPreview);
router.use("/penomoran-surat", penomoranSuratGet);
router.use("/penomoran-surat", penomoranSuratDetail);
router.use("/penomoran-surat", penomoranSuratCreate);
router.use("/penomoran-surat", penomoranSuratUpdate);
router.use("/penomoran-surat", penomoranSuratDelete);

export default router;
