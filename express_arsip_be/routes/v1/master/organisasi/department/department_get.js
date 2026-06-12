import express from "express";
import DB from "../../../../../core/config/knex.js";
import { status, formatDateSystem, datetime } from "../../../components/tools/general.js";
import { Logging } from "../../../components/tools/servertool.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const oPayload = req.body;
  const cUsername = req?.auth?.username || "";

  try {
    const vaData = await DB("mst_departments")
      .select("DepartmentId", "DepartmentCode", "DepartmentName", "Status")
      .where("Status", "active");

    return res.status(200).json({
      status: status.SUKSES,
      message: "Data departemen berhasil ditarik",
      datetime: formatDateSystem(),
      data: vaData,
    });
  } catch (error) {
    const oResult = { status: status.BAD_REQUEST, message: "Terjadi kesalahan sistem", datetime: formatDateSystem() };
    Logging(error, { file: "department_get.js", func: "get", request: oPayload, response: oResult, user: cUsername });
    return res.status(500).json(oResult);
  }
});

export default router;