import express from "express";
const router = express.Router();

// 1.ARCHIVE CLASSIFICATIONS
import archiveGet from "./archive_classifications/archive_get.js";
import archiveCreate from "./archive_classifications/archive_create.js";
import archiveUpdate from "./archive_classifications/archive_update.js";
import archiveDelete from "./archive_classifications/archive_delete.js";

router.use("/archive-classifications", archiveGet);
router.use("/archive-classifications", archiveCreate);
router.use("/archive-classifications", archiveUpdate);
router.use("/archive-classifications", archiveDelete);

// 2.DOCUMENT CATEGORIES
import categoryGet from "./document_categories/category_get.js";
import categoryCreate from "./document_categories/category_create.js";
import categoryUpdate from "./document_categories/category_update.js";
import categoryDelete from "./document_categories/category_delete.js";

router.use("/document-categories", categoryGet);
router.use("/document-categories", categoryCreate);
router.use("/document-categories", categoryUpdate);
router.use("/document-categories", categoryDelete);

// 3.RETENTION SCHEDULES
import retentionGet from "./retention_schedules/retention_get.js";
import retentionCreate from "./retention_schedules/retention_create.js";
import retentionUpdate from "./retention_schedules/retention_update.js";
import retentionDelete from "./retention_schedules/retention_delete.js";

router.use("/retention-schedules", retentionGet);
router.use("/retention-schedules", retentionCreate);
router.use("/retention-schedules", retentionUpdate);
router.use("/retention-schedules", retentionDelete);

// 4. DOCUMENT TYPES
import typeGet from "./document_types/type_get.js";
import typeCreate from "./document_types/type_create.js";
import typeUpdate from "./document_types/type_update.js";
import typeDelete from "./document_types/type_delete.js";

router.use("/document-types", typeGet);
router.use("/document-types", typeCreate);
router.use("/document-types", typeUpdate);
router.use("/document-types", typeDelete);

// 5. CONFIDENTIALITY LEVELS
import levelGet from "./confidentiality_levels/level_get.js";
import levelCreate from "./confidentiality_levels/level_create.js";
import levelUpdate from "./confidentiality_levels/level_update.js";
import levelDelete from "./confidentiality_levels/level_delete.js";

router.use("/confidentiality-levels", levelGet);
router.use("/confidentiality-levels", levelCreate);
router.use("/confidentiality-levels", levelUpdate);
router.use("/confidentiality-levels", levelDelete);

export default router;
