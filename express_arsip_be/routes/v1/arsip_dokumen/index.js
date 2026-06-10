import express from "express";
const router = express.Router();

import documentCreate from "./document_create.js";

// POST /create - Create new document
router.post("/create", documentCreate);

import documentUpdate from "./document_update.js";

// POST /update - Update document metadata
router.post("/update", documentUpdate);

import documentDelete from "./document_delete.js";

// POST /delete - Soft delete document metadata
router.post("/delete", documentDelete);

import documentGet from "./document_get.js";

// GET /get - Get document metadata
router.get("/get", documentGet);

import documentDetail from "./document_detail.js";

// GET /detail - Get document detail with versions and loans
router.get("/detail", documentDetail);

import documentVersionCreate from "./document_version_create.js";

// POST /version/create - Create new document version
router.post("/version/create", documentVersionCreate);

import documentVersionGet from "./document_version_get.js";

// GET /version/get - Get document versions
router.get("/version/get", documentVersionGet);

import loanCreate from "./archive_loan_create.js";

// POST /loan/create - Create new archive loan
router.post("/loan/create", loanCreate);

import loanGet from "./archive_loan_get.js";

// GET /loan/get - Get archive loans
router.get("/loan/get", loanGet);

import loanApprove from "./archive_loan_approve.js";

// POST /loan/approve - Approve or reject archive loan
router.post("/loan/approve", loanApprove);

export default router;
