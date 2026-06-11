import express from "express";
import DB from "../../../../../core/config/knex.js";
import { status, formatDateSystem, datetime } from "../../../components/tools/general.js";
import { Logging } from "../../../components/tools/servertool.js";

const router = express.Router();

router.delete("/:PositionId", async (req, res) => {
  const cPositionId = req.params.PositionId;
  const cUsername = req?.auth?.username || "";
  const oPayload = { id: cPositionId };

  try {
    const nUpdated = await DB("mst_positions")
      .where("PositionId", cPositionId)
      .update({ Status: "nonactive", UpdatedAt: new Date() });

    if (!nUpdated) return res.status(404).json({ message: "Data tidak ditemukan", datetime: formatDateSystem() });
    return res.status(200).json({ status: status.SUKSES, message: "Berhasil dihapus!", datetime: formatDateSystem() });

  } catch (error) {
    const oResult = { status: status.BAD_REQUEST, message: "Gagal menghapus", datetime: datetime() };
    Logging(error, { file: "position_delete.js", func: "delete", request: oPayload, response: oResult, user: cUsername });
    return res.status(500).json(oResult);
  }
});

export default router;