import express from "express";
import Joi from "joi";
import DB from "../../../../core/config/knex.js";
import { status, formatDateSystem } from "../../components/tools/general.js";
import { validatePayload, Logging } from "../../components/tools/servertool.js";

const router = express.Router();

// [READ] GET ALL DATA
router.get("/", async (req, res) => {
  try {
    const aData = await DB("mst_branches")
      .select("BranchId", "BranchCode", "BranchName", "Status")
      .where("Status", "active");

    return res.status(200).json({
      status: status.SUKSES,
      message: "Data branch berhasil ditarik",
      datetime: formatDateSystem(),
      data: aData,
    });
  } catch (error) {
    Logging(error, { file: "branch_get.js", func: "getAllBranch" });
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
        BranchCode: Joi.string().required().label("Kode Branch"),
        BranchName: Joi.string().required().label("Nama Branch"),
      },
      { "string.empty": "{#label} tidak boleh kosong", "any.required": "{#label} wajib diisi" },
      oPayload
    );

    if (cValidation) return res.status(422).json({ status: status.BAD_REQUEST, message: cValidation, datetime: formatDateSystem() });

    await DB("mst_branches").insert({
      BranchCode: oPayload.BranchCode,
      BranchName: oPayload.BranchName,
      Status: "active",
      CreatedAt: dNow,
      UpdatedAt: dNow,
    });

    return res.status(201).json({ status: status.SUKSES, message: "Berhasil ditambahkan!", datetime: formatDateSystem() });
  } catch (error) {
    Logging(error, { file: "branch_create.js", func: "createBranch", request: oPayload });
    return res.status(500).json({ status: status.BAD_REQUEST, message: "Gagal menyimpan", datetime: formatDateSystem() });
  }
});

// [UPDATE] EDIT DATA
router.put("/:BranchId", async (req, res) => {
  const oPayload = req.body;
  const cBranchId = req.params.BranchId;
  const dNow = new Date();

  try {
    const nUpdated = await DB("mst_branches")
      .where("BranchId", cBranchId)
      .update({
        BranchCode: oPayload.BranchCode,
        BranchName: oPayload.BranchName,
        UpdatedAt: dNow,
      });

    if (!nUpdated) return res.status(404).json({ message: "Data tidak ditemukan" });
    return res.status(200).json({ status: status.SUKSES, message: "Berhasil diupdate!" });
  } catch (error) {
    Logging(error, { file: "branch_update.js", func: "updateBranch", request: oPayload });
    return res.status(500).json({ message: "Gagal mengupdate" });
  }
});

// [DELETE] SOFT DELETE
router.delete("/:BranchId", async (req, res) => {
  const cBranchId = req.params.BranchId;
  const dNow = new Date();

  try {
    const nUpdated = await DB("mst_branches")
      .where("BranchId", cBranchId)
      .update({ Status: "nonactive", UpdatedAt: dNow });

    if (!nUpdated) return res.status(404).json({ message: "Data tidak ditemukan" });
    return res.status(200).json({ status: status.SUKSES, message: "Berhasil dihapus!" });
  } catch (error) {
    Logging(error, { file: "branch_delete.js", func: "deleteBranch" });
    return res.status(500).json({ message: "Gagal menghapus" });
  }
});

export default router;