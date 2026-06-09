import express from "express";
import Joi from "joi";
import DB from "../../../../core/config/knex.js";
import { status, formatDateSystem } from "../../components/tools/general.js";
import { validatePayload, Logging } from "../../components/tools/servertool.js";

const router = express.Router();

// [READ] GET ALL DATA
router.get("/", async (req, res) => {
  try {
    const aData = await DB("mst_work_units")
      .select(
        "WorkUnitId",
        "DepartmentId", 
        "WorkUnitCode",
        "WorkUnitName",
        "Description",
        "Status"
      )
      .where("Status", "active");

    return res.status(200).json({
      status: status.SUKSES,
      message: "Data unit kerja berhasil ditarik",
      datetime: formatDateSystem(),
      data: aData,
    });
  } catch (error) {
    Logging(error, { file: "work_unit_get.js", func: "getAllWorkUnit" });
    return res.status(500).json({
      status: status.BAD_REQUEST,
      message: "Terjadi kesalahan sistem",
      datetime: formatDateSystem(),
    });
  }
});

// [CREATE / POST] INPUT DATA
router.post("/", async (req, res) => {
  const oPayload = req.body;
  const dNow = new Date();

  try {
    const cValidation = await validatePayload(
      {
        DepartmentId: Joi.number().required().label("ID Departemen"), 
        WorkUnitCode: Joi.string().max(45).required().label("Kode Unit Kerja"),
        WorkUnitName: Joi.string().max(45).required().label("Nama Unit Kerja"),
        Description: Joi.string().max(45).optional().allow(null, "").label("Deskripsi"),
      },
      {
        "string.empty": "{#label} tidak boleh kosong",
        "any.required": "{#label} wajib diisi",
      },
      oPayload,
    );

    if (cValidation)
      return res.status(422).json({
        status: status.BAD_REQUEST,
        message: cValidation,
        datetime: formatDateSystem(),
      });

    await DB("mst_work_units").insert({
      DepartmentId: oPayload.DepartmentId,
      WorkUnitCode: oPayload.WorkUnitCode,
      WorkUnitName: oPayload.WorkUnitName,
      Description: oPayload.Description || null,
      Status: "active",
      CreatedAt: dNow,
      UpdatedAt: dNow,
    });

    return res.status(201).json({
      status: status.SUKSES,
      message: "Berhasil ditambahkan!",
      datetime: formatDateSystem(),
    });
  } catch (error) {
    Logging(error, {
      file: "work_unit_create.js",
      func: "createWorkUnit",
      request: oPayload,
    });
    return res.status(500).json({
      status: status.BAD_REQUEST,
      message: "Gagal menyimpan",
      datetime: formatDateSystem(),
    });
  }
});

// [UPDATE] EDIT DATA
router.put("/:WorkUnitId", async (req, res) => {
  const oPayload = req.body;
  const cWorkUnitId = req.params.WorkUnitId;
  const dNow = new Date();

  try {
    const nUpdated = await DB("mst_work_units")
      .where("WorkUnitId", cWorkUnitId)
      .update({
        DepartmentId: oPayload.DepartmentId, 
        WorkUnitCode: oPayload.WorkUnitCode,
        WorkUnitName: oPayload.WorkUnitName,
        Description: oPayload.Description || null,
        UpdatedAt: dNow,
      });

    if (!nUpdated)
      return res.status(404).json({ message: "Data tidak ditemukan" });
    return res
      .status(200)
      .json({ status: status.SUKSES, message: "Berhasil diupdate!" });
  } catch (error) {
    Logging(error, {
      file: "work_unit_update.js",
      func: "updateWorkUnit",
      request: oPayload,
    });
    return res.status(500).json({ message: "Gagal mengupdate" });
  }
});

// [DELETE] SOFT DELETE
router.delete("/:WorkUnitId", async (req, res) => {
  const cWorkUnitId = req.params.WorkUnitId;
  const dNow = new Date();

  try {
    const nUpdated = await DB("mst_work_units")
      .where("WorkUnitId", cWorkUnitId)
      .update({ Status: "nonactive", UpdatedAt: dNow });

    if (!nUpdated)
      return res.status(404).json({ message: "Data tidak ditemukan" });
    return res
      .status(200)
      .json({ status: status.SUKSES, message: "Berhasil dihapus!" });
  } catch (error) {
    Logging(error, { file: "work_unit_delete.js", func: "deleteWorkUnit" });
    return res.status(500).json({ message: "Gagal menghapus" });
  }
});

export default router;