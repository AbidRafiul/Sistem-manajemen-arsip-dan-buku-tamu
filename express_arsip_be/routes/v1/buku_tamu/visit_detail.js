import express from "express";
import Joi from "joi";
import DB from "../../../core/config/knex.js";
import { formatDateSystem } from "../components/tools/general.js";
import { getPresignedUrl } from "../../../core/components/tools/minio_helper.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { body: oPayload } = req;
  try {
    const { VisitationId, VisitCode, QRToken } = oPayload;
    if (!VisitationId && !VisitCode && !QRToken) {
      return res.status(400).json({ status: "99", message: "VisitationId atau VisitCode atau QRToken wajib" , datetime: formatDateSystem() });
    }

    const q = DB("trx_visitations as t")
      .select("t.*", "mp.Name as VisitPurposeName", "u.Fullname as HostFullname")
      .leftJoin("mst_visit_purposes as mp", "t.VisitPurposeId", "mp.Id")
      .leftJoin("user_credential as u", "t.HostUserId", "u.UniqueId");

    if (VisitationId) q.where("t.VisitationId", VisitationId);
    if (VisitCode) q.where("t.VisitCode", VisitCode);
    if (QRToken) q.where("t.QRToken", QRToken);

    const record = await q.first();
    if (!record) {
      return res.status(404).json({ status: "03", message: "Tamu tidak ditemukan", datetime: formatDateSystem() });
    }

    if (record.PhotoFace) {
      try { record.PhotoFaceUrl = await getPresignedUrl("buku-tamu", record.PhotoFace); } catch (e) { record.PhotoFaceUrl = null; }
    }
    if (record.PhotoIdentity) {
      try { record.PhotoIdentityUrl = await getPresignedUrl("buku-tamu", record.PhotoIdentity); } catch (e) { record.PhotoIdentityUrl = null; }
    }

    return res.status(200).json({ status: "00", message: "OK", data: record, datetime: formatDateSystem() });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: "01", message: "Sistem error", datetime: formatDateSystem() });
  }
});

export default router;
