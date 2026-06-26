import express from "express";
import Joi from "joi";
import DB from "../../../../../core/config/knex.js";
import {
  status,
  formatDateSystem,
  datetime,
} from "../../../components/tools/general.js";
import {
  Logging,
  validatePayload,
} from "../../../components/tools/servertool.js";

const router = express.Router();

router.put("/:id_peran", async (req, res) => {
  const { body: oPayload } = req;
  const cIdPeran = req.params.id_peran;
  const cnama_pengguna = req?.auth?.nama_pengguna || "";

  try {
    if (!oPayload || Object.keys(oPayload).length < 1) {
      return res.status(400).json({
        status: status.BAD_REQUEST,
        message: "Invalid request body",
        datetime: formatDateSystem(),
      });
    }

    const cValidation = await validatePayload(
      {
        kode_peran: Joi.string().max(50).required().label("Kode Peran"),
        nama_peran: Joi.string().max(100).required().label("Nama Peran"),
        deskripsi: Joi.string().optional().allow(null, "").label("Deskripsi"),
      },
      {
        "string.empty": "{#label} tidak boleh kosong",
        "any.required": "{#label} wajib diisi",
      },
      oPayload,
    );

    if (cValidation) {
      const oResult = {
        status: status.BAD_REQUEST,
        message: cValidation,
        datetime: datetime(),
      };
      Logging(null, {
        file: "roles_update.js",
        func: "update",
        request: oPayload,
        response: oResult,
        user: cnama_pengguna,
      });
      return res.status(422).json(oResult);
    }

    const nUpdated = await DB("mst_peran")
      .where("role_id", cIdPeran)
      .update({
        role_code: oPayload.kode_peran,
        role_name: oPayload.nama_peran,
        description: oPayload.deskripsi || null,
        updated_at: new Date(),
      });

    if (!nUpdated)
      return res.status(404).json({
        message: "Data tidak ditemukan",
        datetime: formatDateSystem(),
      });
    return res.status(200).json({
      status: status.SUKSES,
      message: "Berhasil diupdate!",
      datetime: formatDateSystem(),
    });
  } catch (error) {
    const oResult = {
      status: status.BAD_REQUEST,
      message: "Gagal mengupdate",
      datetime: datetime(),
    };
    Logging(error, {
      file: "roles_update.js",
      func: "update",
      request: oPayload,
      response: oResult,
      user: cnama_pengguna,
    });
    return res.status(500).json(oResult);
  }
});

export default router;
