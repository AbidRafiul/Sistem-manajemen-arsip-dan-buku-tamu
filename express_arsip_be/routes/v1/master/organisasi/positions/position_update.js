import express from "express";
import Joi from "joi";
import DB from "../../../../../core/config/knex.js";
import { status, formatDateSystem, datetime } from "../../../components/tools/general.js";
import { Logging, validatePayload } from "../../../components/tools/servertool.js";

const router = express.Router();

router.put("/:PositionId", async (req, res) => {
  const { body: oPayload } = req;
  const cPositionId = req.params.PositionId;
  const cUsername = req?.auth?.username || "";

  try {
    if (!oPayload || Object.keys(oPayload).length < 1) {
      return res.status(400).json({ status: status.BAD_REQUEST, message: "Invalid request body", datetime: formatDateSystem() });
    }

    const cValidation = await validatePayload(
      {
        PositionCode: Joi.string().max(50).required().label("Kode Jabatan"),
        PositionName: Joi.string().max(100).required().label("Nama Jabatan"),
        PositionLevel: Joi.number().required().label("Level Jabatan"),
        Description: Joi.string().optional().allow(null, "").label("Deskripsi"),
      },
      { "string.empty": "{#label} tidak boleh kosong", "any.required": "{#label} wajib diisi" },
      oPayload
    );

    if (cValidation) {
      const oResult = { status: status.BAD_REQUEST, message: cValidation, datetime: datetime() };
      Logging(null, { file: "position_update.js", func: "update", request: oPayload, response: oResult, user: cUsername });
      return res.status(422).json(oResult);
    }

    const nUpdated = await DB("mst_positions")
      .where("PositionId", cPositionId)
      .update({
        PositionCode: oPayload.PositionCode,
        PositionName: oPayload.PositionName,
        PositionLevel: oPayload.PositionLevel,
        Description: oPayload.Description || null,
        UpdatedAt: new Date(),
      });

    if (!nUpdated) return res.status(404).json({ message: "Data tidak ditemukan", datetime: formatDateSystem() });
    return res.status(200).json({ status: status.SUKSES, message: "Berhasil diupdate!", datetime: formatDateSystem() });

  } catch (error) {
    const oResult = { status: status.BAD_REQUEST, message: "Gagal mengupdate", datetime: datetime() };
    Logging(error, { file: "position_update.js", func: "update", request: oPayload, response: oResult, user: cUsername });
    return res.status(500).json(oResult);
  }
});

export default router;