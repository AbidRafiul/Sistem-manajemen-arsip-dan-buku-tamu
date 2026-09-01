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
import documentNumberGenerate from "./document_number_generate.js";

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

// ── New imports (Phase 5 — OCR, Full-Text Search & Audit Trail) ──────────────
import { processOcrManual } from "./document_ocr_process_manual.js";
import { getOcrStatus } from "./document_ocr_status.js";
import documentContentGet from "./document_content_get.js";
import documentSearch from "./document_search.js";
import documentHistoryGet from "./document_history_get.js";

import { uploadDocument } from "../../../middleware/upload_document.js";
import dashboardSummary from "./dashboard_summary.js";

// Mount dashboard routes
router.use("/dashboard", dashboardSummary);

// ════════════════════════════════════════════════════════════════════════════
// DOCUMENT CRUD
// ════════════════════════════════════════════════════════════════════════════

// POST /create — Create new document (with full metadata + auto QR)
router.use("/create", documentCreate);

// POST /upload — Upload dokumen file (standalone, tanpa auto-version)
router.use("/upload", documentUpload);

// POST /update — Update document metadata
router.use("/update", documentUpdate);

// POST /delete — Soft delete document
router.use("/delete", documentDelete);

// GET /get — List documents with filters + JOIN master
router.use("/get", documentGet);

// GET /detail — Document detail + versions + loans + proposal
router.use("/detail", documentDetail);

// GET /preview — Document preview url generator
router.use("/preview", documentPreview);

// GET /number/generate — Auto-generate document number based on branch, classification, category, date, seq
router.use("/number/generate", documentNumberGenerate);

// GET /search — Unified Full-Text & Metadata Search
router.use("/search", documentSearch);

// GET /history/get — Audit trail changelog per dokumen
router.use("/history/get", documentHistoryGet);

// ════════════════════════════════════════════════════════════════════════════
// OCR & FULL-TEXT CONTENT
// ════════════════════════════════════════════════════════════════════════════

// POST /ocr/process — Trigger manual OCR process
router.use("/ocr/process", processOcrManual);

// GET /ocr/status — Check OCR status per document version
router.use("/ocr/status", getOcrStatus);

// GET /content/get — Get extracted text content
router.use("/content/get", documentContentGet);

// ════════════════════════════════════════════════════════════════════════════
// MASTER DATA (Dropdown data untuk FE)
// ════════════════════════════════════════════════════════════════════════════

// GET /master/category — List kategori dokumen
router.use("/master/category", documentCategoryGet);

// GET /master/type — List jenis dokumen
router.use("/master/type", documentTypeGet);

// GET /master/confidentiality — List tingkat kerahasiaan
router.use("/master/confidentiality", confidentialityLevelGet);

// GET /master/retention — List jadwal retensi
router.use("/master/retention", retentionScheduleGet);

// ════════════════════════════════════════════════════════════════════════════
// DOCUMENT VERSIONING
// ════════════════════════════════════════════════════════════════════════════

// POST /version/create — Buat versi baru (tanpa file)
router.use("/version/create", documentVersionCreate);

// POST /version/upload — Upload file + buat versi otomatis (pending approval)
router.use("/version/upload", documentVersionUpload);

// GET /version/get — List versi dokumen
router.use("/version/get", documentVersionGet);

// POST /version/approve — Approve / reject versi dokumen
router.use("/version/approve", documentVersionApprove);

// POST /version/rollback — Rollback ke versi sebelumnya
router.use("/version/rollback", documentVersionRollback);

// GET & POST /version/download — Download file versi dokumen
router.use("/version/download", documentVersionDownload);

// ════════════════════════════════════════════════════════════════════════════
// ARCHIVE LOAN (Peminjaman Arsip)
// ════════════════════════════════════════════════════════════════════════════

// POST /loan/create — Buat pengajuan peminjaman (pending → needs approval)
router.use("/loan/create", loanCreate);

// GET /loan/get — List peminjaman dengan filter
router.use("/loan/get", loanGet);

// POST /loan/approve — Approve / reject peminjaman (→ borrowed / rejected)
router.use("/loan/approve", loanApprove);

// POST /loan/return — Tandai dokumen dikembalikan + overdue detection
router.use("/loan/return", loanReturn);

// GET /loan/overdue — List peminjaman yang terlambat
router.use("/loan/overdue", loanOverdueGet);

// ════════════════════════════════════════════════════════════════════════════
// JRA & PEMUSNAHAN ARSIP
// ════════════════════════════════════════════════════════════════════════════

// POST /destruction/create — Buat proposal pemusnahan
router.use("/destruction/create", destructionProposalCreate);

// GET /destruction/get — List proposal pemusnahan
router.use("/destruction/get", destructionProposalGet);

// POST /destruction/review — Review (approve/reject) proposal
router.use("/destruction/review", destructionProposalReview);

// POST /destruction/execute — Eksekusi pemusnahan arsip
router.use("/destruction/execute", destructionProposalExecute);

// GET /retention/expired — List dokumen yang masa retensinya sudah habis
router.use("/retention/expired", retentionExpiredGet);

// ════════════════════════════════════════════════════════════════════════════
// QR CODE & BARCODE
// ════════════════════════════════════════════════════════════════════════════

// POST /qr/generate — Generate QR Code (return base64 PNG)
router.use("/qr/generate", documentQrGenerate);

// GET /qr/scan — Scan QR Code → cari dokumen
router.use("/qr/scan", documentQrScan);

// POST /location/update — Update lokasi fisik arsip
router.use("/location/update", documentLocationUpdate);

export default router;

