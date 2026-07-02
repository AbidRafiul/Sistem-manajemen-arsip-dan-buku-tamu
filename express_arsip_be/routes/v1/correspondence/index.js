import express from "express";

// Endpoint Post - incoming-letter-data
import incomingLetterData from "./incoming_letter_data.js";

// Endpoint POST - incoming-letter-create
import incomingLetterCreate from "./incoming_letter_create.js";

//Endpoint POST - incoming-letter-detail
import incomingLetterDetail from "./incoming_letter_detail.js";

import incomingLetterUpdate from "./incoming_letter_update.js";

//Endpoint POST - incoming-letter-delete
import incomingLetterDelete from "./incoming_letter_delete.js";

//Endpoint POST - incoming-file-upload
import incomingLetterUpload from "./incoming_letter_upload.js";

//Endpoint POST - incoming-file-download
import incomingLetterFileDownload from "./incoming_letter_file_download.js";

//Endpoint POST - incoming-letter-archive
import incomingLetterArchive from "./incoming_letter_archive.js";

//Endpoint POST - disposition-reference-data
import dispositionReferenceData from "./disposition_reference_data.js";

//Endpoint POST - letter-type-data
import letterTypeData from "./letter_type_data.js";

//Endpoint - letter-diposition-create
import letterDispositionCreate from "./letter_disposition_create.js";

//Endpoint - incoming_letter_tracking_data
import incomingLetterTrackingData from "./incoming_letter_tracking_data.js"

//Endpoint - letter-disposition-data
import letterDispositionData from "./letter_disposition_data.js"

//Endpoint - letter-disposition-process
import letterDispositionProcess from "./letter_disposition_process.js"

//Endpoint - letter-disposition-complete
import letterDispositionComplete from "./letter_disposition_complete.js"


const router = express.Router();

router.use("/incoming-letter-data", incomingLetterData);
router.use("/incoming-letter-create", incomingLetterCreate);
router.use("/incoming-letter-detail", incomingLetterDetail);
router.use("/incoming-letter-update", incomingLetterUpdate);
router.use("/incoming-letter-delete", incomingLetterDelete);
router.use("/incoming-file-upload", incomingLetterUpload);
router.use("/incoming-file-download", incomingLetterFileDownload);
router.use("/incoming-letter-archive", incomingLetterArchive);
router.use("/disposition-reference-data", dispositionReferenceData);
router.use("/letter-type-data", letterTypeData);
router.use("/letter-disposition-create", letterDispositionCreate)
router.use("/incoming-letter-tracking-data", incomingLetterTrackingData)
router.use("/letter-disposition-data", letterDispositionData)
router.use("/letter-disposition-process", letterDispositionProcess)
router.use("/letter-disposition-complete", letterDispositionComplete)

export default router;
