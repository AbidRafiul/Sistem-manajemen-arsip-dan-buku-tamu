import express from "express";
import Joi from "joi";
import DB from "../../../core/config/knex.js";
import { formatDateSystem } from "../components/tools/general.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { body: oPayload } = req;
  try {
    const page = parseInt(oPayload.page || 1, 10) || 1;
    const limit = parseInt(oPayload.limit || 20, 10) || 20;
    const offset = (page - 1) * limit;

    const q = DB("trx_visitations as t")
      .select(
        "t.*",
        "mp.VisitPurposeName as VisitPurposeName", // 🎯 FIX: mp.Name -> mp.VisitPurposeName
        "u.Fullname as HostFullname"
      )
      .leftJoin("mst_visit_purpose as mp", "t.VisitPurposeId", "mp.VisitPurposeId") // 🎯 FIX: mp.Id -> mp.VisitPurposeId
      .leftJoin("user_credential as u", "t.HostUserId", "u.UniqueId");

    if (oPayload.Status) q.where("t.Status", oPayload.Status);
    if (oPayload.ApprovalStatus) q.where("t.ApprovalStatus", oPayload.ApprovalStatus);
    if (oPayload.GuestName) q.whereILike("t.GuestName", `%${oPayload.GuestName}%`);
    if (oPayload.VisitPurposeId) q.where("t.VisitPurposeId", oPayload.VisitPurposeId);

    if (oPayload.TanggalMulai && oPayload.TanggalSelesai) {
      const start = oPayload.TanggalMulai + " 00:00:00";
      const end = oPayload.TanggalSelesai + " 23:59:59";
      q.whereBetween("t.CheckInTime", [start, end]);
    }

    const totalObj = await DB("trx_visitations as t").count({ total: '*' }).first();
    const rows = await q.orderBy("t.CheckInTime", "desc").limit(limit).offset(offset);

    // 🎯 BYPASS MINIO: Mengubah path gambar langsung ke URL lokal folder uploads statis
    for (const r of rows) {
      if (r.PhotoFace) {
        r.PhotoFaceUrl = `http://localhost:8000/uploads/${r.PhotoFace}`;
      } else {
        r.PhotoFaceUrl = null;
      }
      
      if (r.PhotoIdentity) {
        r.PhotoIdentityUrl = `http://localhost:8000/uploads/${r.PhotoIdentity}`;
      } else {
        r.PhotoIdentityUrl = null;
      }
    }

    return res.status(200).json({ 
      status: "00", 
      message: "OK", 
      data: { total: totalObj.total || 0, page, limit, rows }, 
      datetime: formatDateSystem() 
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: "01", message: "Sistem error", datetime: formatDateSystem() });
  }
});

export default router;