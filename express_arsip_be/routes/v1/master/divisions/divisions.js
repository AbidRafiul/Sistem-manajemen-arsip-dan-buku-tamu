import express from "express";
import Joi from "joi";
import DB from "../../../../core/config/knex.js";
import { status, formatDateSystem } from "../../components/tools/general.js";
import { validatePayload, Logging } from "../../components/tools/servertool.js";

const router = express.Router();

// [READ] GET ALL DATA
router.get("/", async (req, res) => {
  try {
    const aData = await DB("mst_divisions")
      .select("DivisionId", "DivisionCode", "DivisionName", "Status")
      .where("Status", "active");

    return res.status(200).json({
      status: status.SUKSES,
      message: "Data divisi berhasil ditarik",
      datetime: formatDateSystem(),
      data: aData,
    });
  } catch (error) {
    Logging(error, { file: "division_get.js", func: "getAllDivision" });
    return res.status(500).json({ status: status.BAD_REQUEST, message: "Terjadi kesalahan sistem", datetime: formatDateSystem() });
  }
});

// [CREATE / POST] INPUT DATA
router.post("/", async (req, res) => {
  const oPayload = req.body;
  const dNow = new Date();

  try {
    const cValidation = await validatePayload(
      {
        DivisionCode: Joi.string().required().label("Kode Divisi"),
        DivisionName: Joi.string().required().label("Nama Divisi"),
        BranchId: Joi.number().required().label("ID Branch"),
      },
      { "string.empty": "{#label} tidak boleh kosong", "any.required": "{#label} wajib diisi" },
      oPayload
    );

    if (cValidation) return res.status(422).json({ status: status.BAD_REQUEST, message: cValidation, datetime: formatDateSystem() });

    await DB("mst_divisions").insert({
      DivisionCode: oPayload.DivisionCode,
      DivisionName: oPayload.DivisionName,
      BranchId: oPayload.BranchId,
      Status: "active",
      CreatedAt: dNow,
      UpdatedAt: dNow,
    });

    return res.status(201).json({ status: status.SUKSES, message: "Berhasil ditambahkan!", datetime: formatDateSystem() });
  } catch (error) {
    Logging(error, { file: "division_create.js", func: "createDivision", request: oPayload });
    return res.status(500).json({ status: status.BAD_REQUEST, message: "Gagal menyimpan", datetime: formatDateSystem() });
  }
});

// [UPDATE] EDIT DATA
router.put("/:DivisionId", async (req, res) => {
  const oPayload = req.body;
  const cDivisionId = req.params.DivisionId;
  const dNow = new Date();

  try {
    const nUpdated = await DB("mst_divisions")
      .where("DivisionId", cDivisionId)
      .update({
        DivisionCode: oPayload.DivisionCode,
        DivisionName: oPayload.DivisionName,
        BranchId: oPayload.BranchId,
        UpdatedAt: dNow,
      });

    if (!nUpdated) return res.status(404).json({ message: "Data tidak ditemukan" });
    return res.status(200).json({ status: status.SUKSES, message: "Berhasil diupdate!" });
  } catch (error) {
    Logging(error, { file: "division_update.js", func: "updateDivision", request: oPayload });
    return res.status(500).json({ message: "Gagal mengupdate" });
  }
});

// [DELETE] SOFT DELETE
router.delete("/:DivisionId", async (req, res) => {
  const cDivisionId = req.params.DivisionId;
  const dNow = new Date();

  try {
    const nUpdated = await DB("mst_divisions")
      .where("DivisionId", cDivisionId)
      .update({ Status: "nonactive", UpdatedAt: dNow });

    if (!nUpdated) return res.status(404).json({ message: "Data tidak ditemukan" });
    return res.status(200).json({ status: status.SUKSES, message: "Berhasil dihapus!" });
  } catch (error) {
    Logging(error, { file: "division_delete.js", func: "deleteDivision" });
    return res.status(500).json({ message: "Gagal menghapus" });
  }
});

export default router;