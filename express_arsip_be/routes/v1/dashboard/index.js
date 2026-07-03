import express from "express";
const router = express.Router();

import dashboardSummary from "./dashboard_summary.js";

// GET /summary — Ringkasan dashboard (metric cards, chart, audit log)
router.get("/summary", dashboardSummary);

export default router;
