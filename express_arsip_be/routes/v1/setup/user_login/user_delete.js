import express from "express";
import {
  datetime,
  formatDateSystem,
  status,
} from "../../components/tools/general.js";
import Joi from "joi";
import DB from "../../../../core/config/knex.js";
import { Logging, validatePayload } from "../../components/tools/servertool.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { body: oPayload } = req;
  const nama_pengguna = req?.auth?.nama_pengguna || "";

  try {
    if (
      !oPayload ||
      !oPayload.NamaPengguna ||
      !Array.isArray(oPayload.NamaPengguna)
    ) {
      return res.status(400).json({
        status: status.BAD_REQUEST,
        message: "Invalid request body: NamaPengguna (array) is required",
        datetime: formatDateSystem(),
      });
    }

    // 🔥 PERBAIKAN VALIDASI: Ganti nama_pengguna jadi NamaPengguna
    const cValidation = await validatePayload(
      {
        NamaPengguna: Joi.array()
          .items(Joi.number())
          .required()
          .label("NamaPengguna"),
      },
      { "any.required": "{#label} wajib diisi" },
      oPayload,
    );

    if (cValidation)
      return res.status(422).json({
        status: status.BAD_REQUEST,
        message: cValidation,
        datetime: datetime(),
      });

    //  TRANSAKSI SOFT DELETE (Mencakup mst_pengguna & mst_pengguna_perans)
    await DB.transaction(async (trx) => {
      // 1. Nonaktifkan di mst_pengguna
      await trx("mst_pengguna")
        .whereIn("id_pengguna", oPayload.NamaPengguna)
        .update({
          status: "nonactive",
          updated_at: formatDateSystem(),
        });

      // 2. Nonaktifkan juga di mst_pengguna_perans
      await trx("mst_pengguna_peran")
        .whereIn("id_pengguna", oPayload.NamaPengguna)
        .update({
          status: "nonactive",
          updated_at: formatDateSystem(),
        });
    });

    return res.status(200).json({
      status: status.SUKSES,
      message: "Data berhasil dinonaktifkan",
      datetime: formatDateSystem(),
    });
  } catch (error) {
    Logging(error, {
      file: "user_delete.js",
      func: "delete",
      request: oPayload,
      user: nama_pengguna,
    });
    return res.status(500).json({
      status: status.BAD_REQUEST,
      message: "Sistem maintenance",
      datetime: datetime(),
    });
  }
});

export default router;
