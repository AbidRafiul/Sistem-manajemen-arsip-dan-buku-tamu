import express from "express";
import Joi from "joi";
import DB from "../../../../../core/config/knex.js";
import { status, formatDateSystem, datetime } from "../../../components/tools/general.js";
import { Logging, validatePayload } from "../../../components/tools/servertool.js";

const router = express.Router();

router.put("/:work_unit_id", async (req, res) => {
  const { body: oPayload } = req;
  const cWorkUnitId = req.params.work_unit_id;
  const cUsername = req?.auth?.username || "";

  try {
    if (!oPayload || Object.keys(oPayload).length < 1) {
      return res.status(400).json({ status: status.BAD_REQUEST, message: "Invalid request body", datetime: formatDateSystem() });
    }

    const cValidation = await validatePayload(
      {
        department_id: Joi.number().required().label("ID Departemen"),
        work_unit_code: Joi.string().max(45).required().label("Kode Unit Kerja"),
        work_unit_name: Joi.string().max(45).required().label("Nama Unit Kerja"),
        description: Joi.string().max(45).optional().allow(null, "").label("Deskripsi"),
      },
      { "string.empty": "{#label} tidak boleh kosong", "any.required": "{#label} wajib diisi" },
      oPayload
    );

    if (cValidation) {
      const oResult = { status: status.BAD_REQUEST, message: cValidation, datetime: datetime() };
      Logging(null, { file: "work_unit_update.js", func: "update", request: oPayload, response: oResult, user: cUsername });
      return res.status(422).json(oResult);
    }

    const nUpdated = await DB("mst_work_units")
      .where("work_unit_id", cWorkUnitId)
      .update({
        department_id: oPayload.department_id,
        work_unit_code: oPayload.work_unit_code,
        work_unit_name: oPayload.work_unit_name,
        description: oPayload.description || null,
        updated_at: new Date(),
      });

    if (!nUpdated) return res.status(404).json({ message: "Data tidak ditemukan", datetime: formatDateSystem() });
    return res.status(200).json({ status: status.SUKSES, message: "Berhasil diupdate!", datetime: formatDateSystem() });

  } catch (error) {
    const oResult = { status: status.BAD_REQUEST, message: "Gagal mengupdate", datetime: datetime() };
    Logging(error, { file: "work_unit_update.js", func: "update", request: oPayload, response: oResult, user: cUsername });
    return res.status(500).json(oResult);
  }
});

export default router;