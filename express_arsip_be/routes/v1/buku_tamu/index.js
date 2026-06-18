import express from "express";

import VisitCheckin from "./visit_checkin.js";
import VisitCheckout from "./visit_checkout.js";
import VisitRegistrasi from "./visit_registrasi.js";
import VisitData from "./visit_data.js";
import VisitDetail from "./visit_detail.js";
import VisitMonitoring from "./visit_monitoring.js";
import VisitApproval from "./visit_approval.js";
import VisitQRScan from "./visit_qr_scan.js";

const router = express.Router();

router.use("/visit_checkin", VisitCheckin);
router.use("/visit_checkout", VisitCheckout);
router.use("/visit_registrasi", VisitRegistrasi);
router.use("/visit_data", VisitData);
router.use("/visit_detail", VisitDetail);
router.use("/visit_monitoring", VisitMonitoring);
router.use("/visit_approval", VisitApproval);
router.use("/visit_qr_scan", VisitQRScan);

export default router;