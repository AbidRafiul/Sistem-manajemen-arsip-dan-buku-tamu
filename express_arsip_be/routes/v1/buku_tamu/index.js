import express from "express";

import VisitCheckinCreate from "./visit_checkin_create.js";
import VisitCheckinUpdate from "./visit_checkin_update.js";
import VisitCheckout from "./visit_checkout.js";
import VisitRegistrasi from "./visit_registrasi.js";
import VisitDataList from "./visit_data_list.js";
import VisitDataPurposes from "./visit_data_purposes.js";
import VisitDataBranches from "./visit_data_branches.js";
import VisitDataUsers from "./visit_data_users.js";
import VisitDetail from "./visit_detail.js";
import VisitMonitoring from "./visit_monitoring.js";
import VisitApproval from "./visit_approval.js";
import VisitQRScan from "./visit_qr_scan.js";
import VisitBookingStatus from "./visit_booking_status.js";

const router = express.Router();

router.use("/visit-checkin", VisitCheckinCreate);
router.use("/visit-checkin", VisitCheckinUpdate);
router.use("/visit-checkout", VisitCheckout);
router.use("/visit-registrasi", VisitRegistrasi);
router.use("/visit-booking", VisitRegistrasi);
router.use("/visit-data", VisitDataList);
router.use("/visit-data", VisitDataPurposes);
router.use("/visit-data", VisitDataBranches);
router.use("/visit-data", VisitDataUsers);
router.use("/visit-detail", VisitDetail);
router.use("/visit-monitoring", VisitMonitoring);
router.use("/visit-approval", VisitApproval);
router.use("/visit-qr-scan", VisitQRScan);
router.use("/visit-booking/status", VisitBookingStatus);

export default router;
