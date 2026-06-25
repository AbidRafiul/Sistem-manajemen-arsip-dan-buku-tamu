import express from "express";
import {
  datetime,
  formatDateSystem,
  hmac,
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
    if (!oPayload || Object.keys(oPayload).length < 1) {
      return res.status(400).json({
        status: status.BAD_REQUEST,
        message: "Invalid request body",
        datetime: formatDateSystem(),
      });
    }

    const cValidation = await validatePayload(
      {
        nama_pengguna: Joi.number().required().label("nama_pengguna"),
        nama_lengkap: Joi.string().max(100).required().label("nama_lengkap"),
        nama_pengguna: Joi.string().max(100).required().label("nama_pengguna"),
        telepon: Joi.string()
          .pattern(/^[0-9]+$/)
          .max(13)
          .required()
          .label("telepon"),
        peran: Joi.any().required(),
        kata_sandi: Joi.string().optional().allow(""),
        status: Joi.string().required().label("status"),
      },
      { "any.required": "{#label} wajib diisi" },
      oPayload,
      {
        uniqueField: ["nama_pengguna", "telepon"],
        table: "mst_pengguna",
        excludedField: "nama_pengguna",
        allowUnknown: true,
      },
    );

    if (cValidation)
      return res.status(422).json({
        status: status.BAD_REQUEST,
        message: cValidation,
        datetime: datetime(),
      });

    // Siapkan data update mst_pengguna
    const oDataUser = {
      nama_lengkap: oPayload.nama_lengkap,
      nama_pengguna: oPayload.nama_pengguna, // Update nama_pengguna jika berubah
      telepon: oPayload.telepon,
      status:
        oPayload.status == "1" || oPayload.status == "active"
          ? "active"
          : "nonactive",
      updated_at: formatDateSystem(),
    };

    if (oPayload.kata_sandi) {
      const ckata_sandi =
        process.env.USER_KEY + oPayload.nama_pengguna + oPayload.kata_sandi;
      const secret = process.env.USER_SECRET;
      oDataUser["kata_sandi"] = hmac(ckata_sandi, secret, "sha512");
    }

    // TRANSAKSI UPDATE
    await DB.transaction(async (trx) => {
      const NamaPengguna = oPayload.nama_pengguna;

      // 2. Update mst_pengguna
      await trx("mst_pengguna")
        .where("nama_pengguna", NamaPengguna)
        .update(oDataUser);

      // 3. Update mst_pengguna_perans (pake nama_pengguna)
      await trx("mst_pengguna_peran")
        .where("nama_pengguna", NamaPengguna)
        .update({
          id_peran: oPayload.peran || null,
        });
    });

    return res.status(200).json({
      status: status.SUKSES,
      message: "Data berhasil diupdate",
      datetime: formatDateSystem(),
    });
  } catch (error) {
    console.log("ERROR DATABASE:", error); //TAMBAHKAN BARIS INI
    return res.status(500).json({
      status: status.BAD_REQUEST,
      message: "Sistem maintenance",
      datetime: datetime(),
    });
  }
});

export default router;
