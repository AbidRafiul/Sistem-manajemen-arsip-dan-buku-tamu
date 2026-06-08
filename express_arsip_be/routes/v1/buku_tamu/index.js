import express from "express";

// Import sub-router modular hasil bentukan VS Code AI
import VisitCheckin from "./visit_checkin.js";
import VisitCheckout from "./visit_checkout.js";
import VisitRegistrasi from "./visit_registrasi.js";
import VisitData from "./visit_data.js";
import VisitDetail from "./visit_detail.js";
import VisitMonitoring from "./visit_monitoring.js";
import VisitApproval from "./visit_approval.js";
import VisitQRScan from "./visit_qr_scan.js";

const router = express.Router();

// Menghubungkan alamat URL endpoint sesuai instruksi spesifikasi dokumen Page 9
router.use("/visit-checkin", VisitCheckin);
router.use("/visit-checkout", VisitCheckout);
router.use("/visit-registrasi", VisitRegistrasi);
router.use("/visit-data", VisitData);
router.use("/visit-detail", VisitDetail);
router.use("/visit-monitoring", VisitMonitoring);
router.use("/visit-approval", VisitApproval);
router.use("/visit-qr-scan", VisitQRScan);

export default router;