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

    const row = await DB("trx_visitations as t")
      .select(
        "t.*",
        "mp.Name as VisitPurposeName",
        "u.Fullname as HostFullname"
      )
      .leftJoin("mst_visit_purposes as mp", "t.VisitPurposeId", "mp.Id")
      .leftJoin("user_credential as u", "t.HostUserId", "u.UniqueId")
      .where("t.VisitationId", oPayload.VisitationId)
      .first();

    if (!row) {
      return res.status(404).json({ status: "01", message: "Data tidak ditemukan" });
    }

    if (row.PhotoFace) {
      row.PhotoFaceUrl = `http://localhost:8000/uploads/${row.PhotoFace}`;
    } else {
      row.PhotoFaceUrl = null;
    }

    if (row.PhotoIdentity) {
      row.PhotoIdentityUrl = `http://localhost:8000/uploads/${row.PhotoIdentity}`;
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