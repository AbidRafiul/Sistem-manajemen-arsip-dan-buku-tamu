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

//Endpoint - letter-type-management
import letterTypeManagement from "./letter_type_management.js";

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

//Endpoint GET - outgoing-letter-data
import outgoingLetterData from "./outgoing_letter_data.js";

//Endpoint POST - outgoing-letter-create
import outgoingLetterCreate from "./outgoing_letter_create.js";

//Endpoint GET - outgoing-letter-detail
import outgoingLetterDetail from "./outgoing_letter_detail.js";

//Endpoint PUT - outgoing-letter-update
import outgoingLetterUpdate from "./outgoing_letter_update.js";

//Endpoint DELETE - outgoing-letter-delete
import outgoingLetterDelete from "./outgoing_letter_delete.js";

//Endpoint GET/POST - outgoing-letter-approval-data
import outgoingLetterApprovalData from "./outgoing_letter_approval_data.js";

//Endpoint POST - outgoing-letter-approve
import outgoingLetterApprove from "./outgoing_letter_approve.js";

//Endpoint POST - outgoing-letter-reject
import outgoingLetterReject from "./outgoing_letter_reject.js";

//Endpoint GET/POST - outgoing-letter-dashboard-stats
import outgoingLetterDashboard from "./outgoing_letter_dashboard.js";

//Endpoint POST - outgoing-file-upload
import outgoingLetterUpload from "./outgoing_letter_upload.js";

//Endpoint POST - outgoing-letter-archive
import outgoingLetterArchive from "./outgoing_letter_archive.js";
import outgoingLetterDocument from "./outgoing_letter_document.js";
import LetterTypeManagementGet from "./letter_type_management_get.js";
import LetterTypeManagementCreate from "./letter_type_management_create.js";
import LetterTypeManagementUpdate from "./letter_type_management_update.js";
import LetterTypeManagementDelete from "./letter_type_management_delete.js";
import OutgoingLetterApprovalDataGet from "./outgoing_letter_approval_data_get.js";
import OutgoingLetterApprovalDataPost from "./outgoing_letter_approval_data_post.js";
import OutgoingLetterDashboardGet from "./outgoing_letter_dashboard_get.js";
import OutgoingLetterDashboardPost from "./outgoing_letter_dashboard_post.js";
import TtePendingGet from "./tte_pending_get.js";
import TteSignedGet from "./tte_signed_get.js";
import TteTandaTanganGet from "./tte_surat_keluar_tanda_tangan_get.js";
import TteFinalisasiPost from "./tte_surat_keluar_finalisasi_post.js";
import TteTandaTanganPost from "./tte_surat_keluar_tanda_tangan_post.js";
import TteRiwayatGet from "./tte_surat_keluar_riwayat_get.js";
import TteVerifikasiPost from "./tte_verifikasi_post.js";
import TteSertifikatGet from "./tte_sertifikat_get.js";
import TteSertifikatPost from "./tte_sertifikat_post.js";
import TteSertifikatPut from "./tte_sertifikat_put.js";


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
router.use("/letter-type-management", letterTypeManagement);
router.use("/letter-disposition-create", letterDispositionCreate)
router.use("/incoming-letter-tracking-data", incomingLetterTrackingData)
router.use("/letter-disposition-data", letterDispositionData)
router.use("/letter-disposition-process", letterDispositionProcess)
router.use("/letter-disposition-complete", letterDispositionComplete)
router.use("/outgoing-letter-data", outgoingLetterData);
router.use("/outgoing-letter-create", outgoingLetterCreate);
router.use("/outgoing-letter-detail", outgoingLetterDetail);
router.use("/outgoing-letter-update", outgoingLetterUpdate);
router.use("/outgoing-letter-delete", outgoingLetterDelete);
router.use("/letter-type-management", LetterTypeManagementGet);
router.use("/letter-type-management", LetterTypeManagementCreate);
router.use("/letter-type-management", LetterTypeManagementUpdate);
router.use("/letter-type-management", LetterTypeManagementDelete);

router.use("/outgoing-letter-approval-data", OutgoingLetterApprovalDataGet);
router.use("/outgoing-letter-approval-data", OutgoingLetterApprovalDataPost);
router.use("/outgoing-letter-approve", outgoingLetterApprove);
router.use("/outgoing-letter-reject", outgoingLetterReject);

router.use("/outgoing-letter-dashboard", OutgoingLetterDashboardGet);
router.use("/outgoing-letter-dashboard", OutgoingLetterDashboardPost);
router.use("/outgoing-file-upload", outgoingLetterUpload);
router.use("/outgoing-letter-archive", outgoingLetterArchive);
router.use("/outgoing-letter-document", outgoingLetterDocument);
router.use("/outgoing-letter-tte", TtePendingGet);
router.use("/outgoing-letter-tte", TteSignedGet);
router.use("/outgoing-letter-tte", TteTandaTanganGet);
router.use("/outgoing-letter-tte", TteFinalisasiPost);
router.use("/outgoing-letter-tte", TteTandaTanganPost);
router.use("/outgoing-letter-tte", TteRiwayatGet);
router.use("/outgoing-letter-tte", TteVerifikasiPost);
router.use("/outgoing-letter-tte", TteSertifikatGet);
router.use("/outgoing-letter-tte", TteSertifikatPost);
router.use("/outgoing-letter-tte", TteSertifikatPut);

export default router;


