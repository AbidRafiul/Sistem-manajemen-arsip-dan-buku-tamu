import express from "express";
const router = express.Router();

// ── Existing imports ──────────────────────────────────────────────────────────
import documentCreate from "./document_create.js";
import documentUpload from "./document_upload.js";
import documentUpdate from "./document_update.js";
import documentDelete from "./document_delete.js";
import documentGet from "./document_get.js";
import documentDetail from "./document_detail.js";
import documentPreview from "./document_preview.js";

import documentVersionCreate from "./document_version_create.js";
import documentVersionUpload from "./document_version_upload.js";
import documentVersionGet from "./document_version_get.js";

import loanCreate from "./archive_loan_create.js";
import loanGet from "./archive_loan_get.js";
import loanApprove from "./archive_loan_approve.js";
import loanReturn from "./archive_loan_return.js";

// ── New imports (Phase 1 — Master Data) ──────────────────────────────────────
import documentCategoryGet from "./document_category_get.js";
import documentTypeGet from "./document_type_get.js";
import confidentialityLevelGet from "./confidentiality_level_get.js";
import retentionScheduleGet from "./retention_schedule_get.js";

// ── New imports (Phase 2 — Versioning Upgrade) ───────────────────────────────
import documentVersionApprove from "./document_version_approve.js";
import documentVersionRollback from "./document_version_rollback.js";
import documentVersionDownload from "./document_version_download.js";

// ── New imports (Phase 2 — Loan Upgrade) ─────────────────────────────────────
import loanOverdueGet from "./archive_loan_overdue_get.js";

// ── New imports (Phase 3 — JRA & Pemusnahan) ─────────────────────────────────
import destructionProposalCreate from "./destruction_proposal_create.js";
import destructionProposalGet from "./destruction_proposal_get.js";
import destructionProposalReview from "./destruction_proposal_review.js";
import destructionProposalExecute from "./destruction_proposal_execute.js";
import retentionExpiredGet from "./retention_expired_get.js";

// ── New imports (Phase 4 — QR Code) ──────────────────────────────────────────
import documentQrGenerate from "./document_qr_generate.js";
import documentQrScan from "./document_qr_scan.js";
import documentLocationUpdate from "./document_location_update.js";

import { uploadDocument } from "../../../middleware/upload_document.js";
import dashboardSummary from "./dashboard_summary.js";

// Mount dashboard routes
router.use("/dashboard", dashboardSummary);

// ════════════════════════════════════════════════════════════════════════════
// DOCUMENT CRUD
// ════════════════════════════════════════════════════════════════════════════

// POST /create — Create new document (with full metadata + auto QR)
router.post("/create", documentCreate);

// POST /upload — Upload dokumen file (standalone, tanpa auto-version)
router.post("/upload", uploadDocument, documentUpload);

// POST /update — Update document metadata
router.post("/update", documentUpdate);

// POST /delete — Soft delete document
router.post("/delete", documentDelete);

// GET /get — List documents with filters + JOIN master
router.get("/get", documentGet);

// GET /detail — Document detail + versions + loans + proposal
router.get("/detail", documentDetail);

// GET /preview — Document preview url generator
router.get("/preview", documentPreview);

// ════════════════════════════════════════════════════════════════════════════
// MASTER DATA (Dropdown data untuk FE)
// ════════════════════════════════════════════════════════════════════════════

// GET /master/category — List kategori dokumen
router.get("/master/category", documentCategoryGet);

// GET /master/type — List jenis dokumen
router.get("/master/type", documentTypeGet);

// GET /master/confidentiality — List tingkat kerahasiaan
router.get("/master/confidentiality", confidentialityLevelGet);

// GET /master/retention — List jadwal retensi
router.get("/master/retention", retentionScheduleGet);

// ════════════════════════════════════════════════════════════════════════════
// DOCUMENT VERSIONING
// ════════════════════════════════════════════════════════════════════════════

// POST /version/create — Buat versi baru (tanpa file)
router.post("/version/create", documentVersionCreate);

// POST /version/upload — Upload file + buat versi otomatis (pending approval)
router.post("/version/upload", uploadDocument, documentVersionUpload);

// GET /version/get — List versi dokumen
router.get("/version/get", documentVersionGet);

// POST /version/approve — Approve / reject versi dokumen
router.post("/version/approve", documentVersionApprove);

// POST /version/rollback — Rollback ke versi sebelumnya
router.post("/version/rollback", documentVersionRollback);

// GET & POST /version/download — Download file versi dokumen
router.get("/version/download", documentVersionDownload);
router.post("/version/download", documentVersionDownload);

// ════════════════════════════════════════════════════════════════════════════
// ARCHIVE LOAN (Peminjaman Arsip)
// ════════════════════════════════════════════════════════════════════════════

// POST /loan/create — Buat pengajuan peminjaman (pending → needs approval)
router.post("/loan/create", loanCreate);

// GET /loan/get — List peminjaman dengan filter
router.get("/loan/get", loanGet);

// POST /loan/approve — Approve / reject peminjaman (→ borrowed / rejected)
router.post("/loan/approve", loanApprove);

// POST /loan/return — Tandai dokumen dikembalikan + overdue detection
router.post("/loan/return", loanReturn);

// GET /loan/overdue — List peminjaman yang terlambat
router.get("/loan/overdue", loanOverdueGet);

// ════════════════════════════════════════════════════════════════════════════
// JRA & PEMUSNAHAN ARSIP
// ════════════════════════════════════════════════════════════════════════════

// POST /destruction/create — Buat proposal pemusnahan
router.post("/destruction/create", destructionProposalCreate);

// GET /destruction/get — List proposal pemusnahan
router.get("/destruction/get", destructionProposalGet);

// POST /destruction/review — Review (approve/reject) proposal
router.post("/destruction/review", destructionProposalReview);

// POST /destruction/execute — Eksekusi pemusnahan arsip
router.post("/destruction/execute", destructionProposalExecute);

// GET /retention/expired — List dokumen yang masa retensinya sudah habis
router.get("/retention/expired", retentionExpiredGet);

// ════════════════════════════════════════════════════════════════════════════
// QR CODE & BARCODE
// ════════════════════════════════════════════════════════════════════════════

// POST /qr/generate — Generate QR Code (return base64 PNG)
router.post("/qr/generate", documentQrGenerate);

// GET /qr/scan — Scan QR Code → cari dokumen
router.get("/qr/scan", documentQrScan);

// POST /location/update — Update lokasi fisik arsip
router.post("/location/update", documentLocationUpdate);

export default router;
