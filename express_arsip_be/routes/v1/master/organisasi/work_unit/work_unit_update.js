import express from "express";
import Joi from "joi";
import DB from "../../../../../core/config/knex.js";
import { status, formatDateSystem, datetime } from "../../../components/tools/general.js";
import { Logging, validatePayload } from "../../../components/tools/servertool.js";

const router = express.Router();

router.put("/:WorkUnitId", async (req, res) => {
  const { body: oPayload } = req;
  const cWorkUnitId = req.params.WorkUnitId;
  const cUsername = req?.auth?.username || "";

  try {
    if (!oPayload || Object.keys(oPayload).length < 1) {
      return res.status(400).json({ status: status.BAD_REQUEST, message: "Invalid request body", datetime: formatDateSystem() });
    }

    const cValidation = await validatePayload(
      {
        DepartmentId: Joi.number().required().label("ID Departemen"),
        WorkUnitCode: Joi.string().max(45).required().label("Kode Unit Kerja"),
        WorkUnitName: Joi.string().max(45).required().label("Nama Unit Kerja"),
        Description: Joi.string().max(45).optional().allow(null, "").label("Deskripsi"),
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
      .where("WorkUnitId", cWorkUnitId)
      .update({
        DepartmentId: oPayload.DepartmentId,
        WorkUnitCode: oPayload.WorkUnitCode,
        WorkUnitName: oPayload.WorkUnitName,
        Description: oPayload.Description || null,
        UpdatedAt: new Date(),
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