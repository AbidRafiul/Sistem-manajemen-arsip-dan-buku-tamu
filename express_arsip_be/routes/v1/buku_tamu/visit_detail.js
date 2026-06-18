import express from "express";
import DB from "../../../core/config/knex.js";
import { formatDateSystem } from "../components/tools/general.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { body: oPayload } = req;
  try {
    if (!oPayload.VisitationId) {
      return res.status(400).json({ status: "01", message: "VisitationId wajib diisi" });
    }

    const row = await DB("tr_visitations as t")
      .select(
        "t.*",
        "mp.visit_purpose_name as VisitPurposeName",
        "u.Fullname as HostFullname"
      )
      .leftJoin("mst_visit_purpose as mp", "t.visit_purpose_id", "mp.visit_purpose_id")
      .leftJoin("user_credential as u", "t.host_user_id", "u.UniqueId")
      .where("t.visitation_id", oPayload.VisitationId)
      .first();

    if (!row) {
      return res.status(404).json({ status: "01", message: "Data tidak ditemukan" });
    }

    const cBaseUrl = `${process.env.APP_SERVER || 'http://localhost'}:${process.env.APP_PORT || '8000'}`;
    
    if (row.photo_face) {
      row.PhotoFaceUrl = row.photo_face.startsWith('http') ? row.photo_face : `${cBaseUrl}/uploads/${row.photo_face}`;
    } else {
      row.PhotoFaceUrl = null;
    }

    if (row.photo_identity) {
      row.PhotoIdentityUrl = row.photo_identity.startsWith('http') ? row.photo_identity : `${cBaseUrl}/uploads/${row.photo_identity}`;
    } else {
      row.PhotoIdentityUrl = null;
    }

    return res.status(200).json({ status: "00", message: "OK", data: row, datetime: formatDateSystem() });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: "01", message: "Sistem error", datetime: formatDateSystem() });
  }
});

export default router;