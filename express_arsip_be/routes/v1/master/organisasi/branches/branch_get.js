import express from "express";
import DB from "../../../../../core/config/knex.js";
import { status, formatDateSystem, datetime } from "../../../components/tools/general.js";
import { Logging } from "../../../components/tools/servertool.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const oPayload = req.body;
  const cUsername = req?.auth?.username || "";

  try {
    const vaData = await DB("mst_branches")
      .select("branch_id as id", "branch_code", "branch_name as name", "status")
      .where("status", "active");

    return res.status(200).json({
      status: status.SUKSES,
      message: "Data branch berhasil ditarik",
      datetime: formatDateSystem(),
      data: vaData,
    });
  } catch (error) {
    const oResult = { status: status.BAD_REQUEST, message: "Terjadi kesalahan sistem", datetime: formatDateSystem() };
    Logging(error, { file: "branch_get.js", func: "get", request: oPayload, response: oResult, user: cUsername });
    return res.status(500).json(oResult);
  }
});

export default router;