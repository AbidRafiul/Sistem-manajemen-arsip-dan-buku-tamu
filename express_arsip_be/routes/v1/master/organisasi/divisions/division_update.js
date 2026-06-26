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

router.put("/:id_divisi", async (req, res) => {
  const { body: oPayload } = req;
  const cIdDivisi = req.params.id_divisi;
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
        kode_divisi: Joi.string().required().label("Kode Divisi"),
        nama_divisi: Joi.string().required().label("Nama Divisi"),
        id_cabang: Joi.number().required().label("ID Branch"),
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
        file: "division_update.js",
        func: "update",
        request: oPayload,
        response: oResult,
        user: cnama_pengguna,
      });
      return res.status(422).json(oResult);
    }

    const nUpdated = await DB("mst_divisi")
      .where("id_divisi", cIdDivisi)
      .update({
        kode_divisi: oPayload.kode_divisi,
        nama_divisi: oPayload.nama_divisi,
        id_cabang: oPayload.id_cabang,
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
      file: "division_update.js",
      func: "update",
      request: oPayload,
      response: oResult,
      user: cnama_pengguna,
    });
    return res.status(500).json(oResult);
  }
});

export default router;
