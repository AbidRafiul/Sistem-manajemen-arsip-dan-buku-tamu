import express from "express";
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
        "mp.visit_purpose_name as VisitPurposeName",
        "u.fullname as Hostnama_lengkap",
      )
      .leftJoin(
        "mst_visit_purpose as mp",
        "t.visit_purpose_id",
        "mp.visit_purpose_id",
      )
      .leftJoin("mst_pengguna as u", "t.host_user_id", "u.user_id");

    const qCount = DB("trx_visitations as t").count({ total: "*" });

    if (oPayload.Status) {
      q.where("t.status", oPayload.Status);
      qCount.where("t.status", oPayload.Status);
    }
    if (oPayload.ApprovalStatus) {
      q.where("t.approval_status", oPayload.ApprovalStatus);
      qCount.where("t.approval_status", oPayload.ApprovalStatus);
    }
    if (oPayload.GuestName) {
      q.where("t.guest_name", "like", `%${oPayload.GuestName}%`);
      qCount.where("t.guest_name", "like", `%${oPayload.GuestName}%`);
    }
    if (oPayload.VisitPurposeId) {
      q.where("t.visit_purpose_id", oPayload.VisitPurposeId);
      qCount.where("t.visit_purpose_id", oPayload.VisitPurposeId);
    }

    if (oPayload.TanggalMulai && oPayload.TanggalSelesai) {
      const start = oPayload.TanggalMulai + " 00:00:00";
      const end = oPayload.TanggalSelesai + " 23:59:59";
      q.whereBetween("t.check_in_time", [start, end]);
      qCount.whereBetween("t.check_in_time", [start, end]);
    }

    const totalObj = await qCount.first();
    const rows = await q
      .orderBy("t.check_in_time", "desc")
      .limit(limit)
      .offset(offset);

    const cBaseUrl = `${process.env.APP_SERVER || "http://localhost"}:${process.env.APP_PORT || "8000"}`;
    for (const r of rows) {
      if (r.photo_face) {
        r.PhotoFaceUrl = r.photo_face.startsWith("http")
          ? r.photo_face
          : `${cBaseUrl}/uploads/${r.photo_face}`;
      } else {
        r.PhotoFaceUrl = null;
      }

      if (r.photo_identity) {
        r.PhotoIdentityUrl = r.photo_identity.startsWith("http")
          ? r.photo_identity
          : `${cBaseUrl}/uploads/${r.photo_identity}`;
      } else {
        r.PhotoIdentityUrl = null;
      }
    }

    return res.status(200).json({
      status: "00",
      message: "OK",
      data: { total: totalObj?.total || 0, page, limit, rows },
      datetime: formatDateSystem(),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "01",
      message: "Sistem error",
      datetime: formatDateSystem(),
    });
  }
});

export default router;
