import express from "express";
import DB from "../../../../../core/config/knex.js";
import {
  status,
  formatDateSystem,
  datetime,
} from "../../../components/tools/general.js";
import { Logging } from "../../../components/tools/servertool.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const oPayload = req.body;
  const cUsername = req?.auth?.username || "";

  try {
    const vaData = await DB("mst_divisions")
      .select("DivisionId as id", "DivisionName as name", "Status")
      .where("Status", "active");

    return res.status(200).json({
      status: status.SUKSES,
      message: "Data divisi berhasil ditarik",
      datetime: formatDateSystem(),
      data: vaData,
    });
  } catch (error) {
    const oResult = {
      status: status.BAD_REQUEST,
      message: "Terjadi kesalahan sistem",
      datetime: formatDateSystem(),
    };
    Logging(error, {
      file: "division_get.js",
      func: "get",
      request: oPayload,
      response: oResult,
      user: cUsername,
    });
    return res.status(500).json(oResult);
  }
});

export default router;
