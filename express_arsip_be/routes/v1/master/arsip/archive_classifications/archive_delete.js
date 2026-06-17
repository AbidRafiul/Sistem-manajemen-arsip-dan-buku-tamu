import express from "express";
import DB from "../../../../../core/config/knex.js";
import { datetime, formatDateSystem, status } from "../../../components/tools/general.js";
import { Logging } from "../../../components/tools/servertool.js";

const router = express.Router();

router.delete("/:ArchiveClassificationId", async (req, res) => {
  const cArchiveClassificationId = req.params.ArchiveClassificationId;
  const username = req?.auth?.username || "";
  const oPayload = { id: cArchiveClassificationId };

  try {
    const nUpdated = await DB("mst_archive_classifications")
      .where("archive_classification_id", cArchiveClassificationId)
      .update({ status: "nonactive", updated_at: new Date() });

    if (!nUpdated) return res.status(404).json({ status: status.NOT_FOUND, message: "Data tidak ditemukan", datetime: formatDateSystem() });
    return res.status(200).json({ status: status.SUKSES, message: "Berhasil dihapus!", datetime: formatDateSystem() });

  } catch (error) {
    const oResult = { status: status.BAD_REQUEST, message: "Sistem sedang maintenance", datetime: datetime() };
    Logging(error, { file: "archive_delete.js", func: "delete", request: oPayload, response: oResult, user: username });
    return res.status(500).json(oResult);
  }
});

export default router;