import express from "express";
import Joi from "joi";
import DB from "../../../../core/config/knex.js";
import { status, formatDateSystem } from "../../components/tools/general.js";
import { validatePayload, Logging } from "../../components/tools/servertool.js";

const router = express.Router();

// [READ] GET ALL DATA
router.get("/", async (req, res) => {
  try {
    const aData = await DB("mst_positions")
      .select(
        "PositionId",
        "PositionCode",
        "PositionName",
        "PositionLevel",
        "Description", // <--- FIX: Ditambahkan agar muncul di respon GET
        "Status"
      )
      .where("Status", "active");

    return res.status(200).json({
      status: status.SUKSES,
      message: "Data posisi berhasil ditarik",
      datetime: formatDateSystem(),
      data: aData,
    });
  } catch (error) {
    Logging(error, { file: "position_get.js", func: "getAllPosition" });
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
        PositionCode: Joi.string().max(50).required().label("Kode Jabatan"),
        PositionName: Joi.string().max(100).required().label("Nama Jabatan"),
        PositionLevel: Joi.number().required().label("Level Jabatan"),
        Description: Joi.string().optional().allow(null, "").label("Deskripsi"),
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

    await DB("mst_positions").insert({
      PositionCode: oPayload.PositionCode,
      PositionName: oPayload.PositionName,
      PositionLevel: oPayload.PositionLevel,
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
      file: "position_create.js",
      func: "createPosition",
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
router.put("/:PositionId", async (req, res) => {
  const oPayload = req.body;
  const cPositionId = req.params.PositionId; 
  const dNow = new Date();

  try {
    const nUpdated = await DB("mst_positions")
      .where("PositionId", cPositionId)
      .update({
        PositionCode: oPayload.PositionCode,
        PositionName: oPayload.PositionName,
        PositionLevel: oPayload.PositionLevel,
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
      file: "position_update.js",
      func: "updatePosition",
      request: oPayload,
    });
    return res.status(500).json({ message: "Gagal mengupdate" });
  }
});

// [DELETE] SOFT DELETE
router.delete("/:PositionId", async (req, res) => { 
  const cPositionId = req.params.PositionId; 
  const dNow = new Date();

  try {
    const nUpdated = await DB("mst_positions")
      .where("PositionId", cPositionId) 
      .update({ Status: "nonactive", UpdatedAt: dNow });

    if (!nUpdated)
      return res.status(404).json({ message: "Data tidak ditemukan" });
    return res
      .status(200)
      .json({ status: status.SUKSES, message: "Berhasil dihapus!" });
  } catch (error) {
    Logging(error, { file: "position_delete.js", func: "deletePosition" });
    return res.status(500).json({ message: "Gagal menghapus" });
  }
});

export default router;