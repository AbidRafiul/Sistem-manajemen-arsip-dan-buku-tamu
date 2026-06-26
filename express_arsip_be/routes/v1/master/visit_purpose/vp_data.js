import express from "express";
import DB from "../../../../core/config/knex.js";
import { formatDateSystem, status } from "../../components/tools/general.js";
import { Logging } from "../../components/tools/servertool.js";

const router = express.Router();

router.post("/vp-data", async (req, res) => {
  try {
    const vaData = await DB("mst_visit_purpose")
      .select(
        "visit_purpose_id as VisitPurposeId",
        "visit_purpose_code as VisitPurposeCode",
        "visit_purpose_name as VisitPurposeName",
        "description as Description",
        "status",
      )
      .where("status", "active")
      .orderBy("visit_purpose_id", "asc");

    return res.status(200).json({
      status: status.SUKSES,
      message: "Data ditemukan",
      datetime: formatDateSystem(),
      data: vaData,
      total_data: vaData.length,
    });
  } catch (error) {
    const oResult = {
      status: status.BAD_REQUEST,
      message: "Data tujuan kunjungan gagal diambil",
      datetime: formatDateSystem(),
    };

    Logging(error, {
      file: "vp_data.js",
      func: "post",
      request: req.body,
      response: oResult,
      user: req?.auth?.nama_pengguna || "",
    });

    return res.status(500).json(oResult);
  }
});

export default router;
