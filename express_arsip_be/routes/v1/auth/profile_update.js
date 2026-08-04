import express from "express";
import Joi from "joi";
import DB from "../../../core/config/knex.js";
import { datetime, status, formatDateSystem, hmac } from "../components/tools/general.js";
import { Logging, validatePayload } from "../components/tools/servertool.js";

const router = express.Router();

router.put("/", async (req, res) => {
  const { body: oPayload } = req;
  const cNamaPengguna = req?.auth?.nama_pengguna || "";

  try {
    const userId = req.auth.id_pengguna;
    if (!userId) {
      return res.status(401).json({
        status: status.UNAUTHORIZED,
        message: "Sesi tidak valid",
        datetime: formatDateSystem()
      });
    }

    if (!oPayload || Object.keys(oPayload).length < 1) {
      return res.status(400).json({
        status: status.BAD_REQUEST,
        message: "Invalid request body",
        datetime: formatDateSystem(),
      });
    }

    const cValidation = await validatePayload(
      {
        nama_lengkap: Joi.string().max(100).required().label("nama_lengkap"),
        nama_pengguna: Joi.string().max(100).required().label("nama_pengguna"),
        telepon: Joi.string().pattern(/^[0-9]+$/).max(13).required().label("telepon"),
        surel: Joi.string().email().max(100).allow(null, '').optional().label("surel"),
        kata_sandi: Joi.string().min(8).pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^a-zA-Z0-9]).+$")).allow(null, '').optional().label("kata_sandi"),
      },
      {
        "string.base": "{#label} harus berupa string",
        "string.empty": "{#label} tidak boleh kosong",
        "any.required": "{#label} wajib diisi",
        "string.email": "Format surel tidak valid",
        "string.pattern.base": "Format tidak valid"
      },
      oPayload,
      { allowUnknown: true }
    );

    if (cValidation) {
      const oResult = {
        status: status.BAD_REQUEST,
        message: cValidation || "Terdapat kesalahan pada data anda",
        datetime: datetime(),
      };
      Logging(null, { file: "profile_update.js", func: "update", request: oPayload, response: oResult, user: cNamaPengguna });
      return res.status(422).json(oResult);
    }

    // Cek duplikasi username / telp
    const existingUser = await DB("mst_pengguna")
      .whereNot("id_pengguna", userId)
      .andWhere(function() {
        this.where("nama_pengguna", oPayload.nama_pengguna).orWhere("telepon", oPayload.telepon);
      })
      .first();

    if (existingUser) {
      return res.status(422).json({
        status: status.BAD_REQUEST,
        message: existingUser.nama_pengguna === oPayload.nama_pengguna
            ? "Data dengan nama_pengguna tersebut sudah digunakan"
            : "Data dengan telepon tersebut sudah digunakan",
        datetime: formatDateSystem(),
      });
    }

    const updateData = {
      nama_lengkap: oPayload.nama_lengkap,
      nama_pengguna: oPayload.nama_pengguna,
      telepon: oPayload.telepon,
      surel: oPayload.surel || null,
      updated_at: datetime(),
    };

    if (oPayload.kata_sandi) {
      const cKataSandi = process.env.USER_KEY + oPayload.nama_pengguna + oPayload.kata_sandi;
      const cSecret = process.env.USER_SECRET;
      updateData.kata_sandi = hmac(cKataSandi, cSecret, "sha512");
    }

    await DB("mst_pengguna").where("id_pengguna", userId).update(updateData);

    return res.status(200).json({
      status: status.SUKSES,
      message: "Profil berhasil diperbarui",
      datetime: formatDateSystem()
    });

  } catch (error) {
    const oResult = {
      status: status.BAD_REQUEST,
      message: "Gagal memperbarui profil",
      datetime: datetime(),
    };
    Logging(error, { file: "profile_update.js", func: "update", request: oPayload, response: oResult, user: cNamaPengguna });
    return res.status(500).json(oResult);
  }
});

export default router;
