import express from "express";
const router = express.Router();

import documentCreate from "./document_create.js";
import documentUpload from "./document_upload.js";
import { uploadDocument } from "../../../middleware/upload_document.js";
import documentUpdate from "./document_update.js";
import documentDelete from "./document_delete.js";
import documentGet from "./document_get.js";
import documentDetail from "./document_detail.js";
import documentVersionCreate from "./document_version_create.js";
import documentVersionUpload from "./document_version_upload.js";
import documentVersionGet from "./document_version_get.js";
import loanCreate from "./archive_loan_create.js";
import loanGet from "./archive_loan_get.js";
import loanApprove from "./archive_loan_approve.js";
import loanReturn from "./archive_loan_return.js";

// POST /create - Create new document
router.post("/create", documentCreate);


// POST /upload - Upload document file
router.post("/upload", uploadDocument, documentUpload);


// POST /update - Update document metadata
router.post("/update", documentUpdate);


// POST /delete - Soft delete document metadata
router.post("/delete", documentDelete);


// GET /get - Get document metadata
router.get("/get", documentGet);


// GET /detail - Get document detail with versions and loans
router.get("/detail", documentDetail);


// POST /version/create - Create new document version
router.post("/version/create", documentVersionCreate);


// POST /version/upload - Upload document file and create version
router.post("/version/upload", uploadDocument, documentVersionUpload);


// GET /version/get - Get document versions
router.get("/version/get", documentVersionGet);


// POST /loan/create - Create new archive loan
router.post("/loan/create", loanCreate);


// GET /loan/get - Get archive loans
router.get("/loan/get", loanGet);


// POST /loan/approve - Approve or reject archive loan
router.post("/loan/approve", loanApprove);

// POST /loan/return - Mark archive loan as returned
router.post("/loan/return", loanReturn);

export default router;
