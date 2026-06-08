import express from "express";
const router = express.Router();

import documentCreate from "./document_create.js";

// POST /create - Create new document
router.post("/create", documentCreate);

import documentGet from "./document_get.js";

// GET /get - Get document metadata
router.get("/get", documentGet);

import documentVersionCreate from "./document_version_create.js";

// POST /version/create - Create new document version
router.post("/version/create", documentVersionCreate);

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
