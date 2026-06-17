import express from "express";
import DB from "../../../../../core/config/knex.js";
import { datetime, formatDateSystem, status } from "../../../components/tools/general.js";
import { Logging } from "../../../components/tools/servertool.js";

const router = express.Router();

router.delete("/:ConfidentialityLevelId", async (req, res) => {
  const cConfidentialityLevelId = req.params.ConfidentialityLevelId;
  const username = req?.auth?.username || "";
  const oPayload = { id: cConfidentialityLevelId };

  try {
    const nUpdated = await DB("mst_confidentiality_levels")
      .where("confidentiality_level_id", cConfidentialityLevelId)
      .update({ status: "nonactive", updated_at: new Date() });

    if (!nUpdated) {
      return res.status(404).json({
        status: status.NOT_FOUND,
        message: "Data tidak ditemukan",
        datetime: formatDateSystem(),
      });
    }

    return res.status(200).json({
      status: status.SUKSES,
      message: "Data berhasil dihapus",
      datetime: formatDateSystem(),
    });
  } catch (error) {
    const oResult = {
      status: status.BAD_REQUEST,
      message: "Sistem sedang maintenance harap tunggu sebentar",
      datetime: datetime(),
    };

    Logging(error, {
      file: "level_delete.js",
      func: "delete",
      request: oPayload,
      response: oResult,
      user: username,
    });

    return res.status(500).json(oResult);
  }
});

export default router;