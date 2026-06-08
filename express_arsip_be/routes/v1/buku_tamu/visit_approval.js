import express from "express";
import Joi from "joi";
import DB from "../../../core/config/knex.js";
import { formatDateSystem } from "../components/tools/general.js";
import { Logging } from "../components/tools/servertool.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { body: oPayload } = req;
  const username = req?.auth?.username || "";
  const userRole = req?.auth?.role || "";

  try {
    const { VisitationId, action, ApprovalNotes } = oPayload;
    if (!VisitationId || !action) {
      return res.status(400).json({ status: "99", message: "VisitationId dan action wajib", datetime: formatDateSystem() });
    }

    if (!["master", "admin", "resepsionis"].includes(userRole)) {
      return res.status(403).json({ status: "99", message: "Akses ditolak", datetime: formatDateSystem() });
    }

    if (!["approved", "rejected"].includes(action)) {
      return res.status(400).json({ status: "99", message: "Action tidak valid", datetime: formatDateSystem() });
    }

    await DB("trx_visitations").where("VisitationId", VisitationId).update({ ApprovalStatus: action, ApprovalNotes: ApprovalNotes, UpdatedAt: formatDateSystem() });

    return res.status(200).json({ status: "00", message: "OK", datetime: formatDateSystem() });
  } catch (error) {
    Logging(error, { file: "visit_approval.js", func: "approval", request: req.body, response: "error", user: username });
    return res.status(500).json({ status: "01", message: "Sistem error", datetime: formatDateSystem() });
  }
});

export default router;
