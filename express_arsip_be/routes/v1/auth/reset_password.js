import "dotenv/config";
import express from "express";
import Joi from "joi";
import DB from "../../../core/config/knex.js";
import {
  formatDateSystem,
  hashEquals,
  hmac,
  status,
} from "../components/tools/general.js";
import { Logging, validatePayload } from "../components/tools/servertool.js";
import { recordAuditTrail } from "../components/tools/audit_tool.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { body: oPayload } = req;
  const cnama_penggunaActor = req?.auth?.nama_pengguna || "Unknown"; // Ngambil dari token JWT

  try {
    // 1. Validasi Input User
    const cValidation = await validatePayload(
      {
        nama_pengguna: Joi.string().required().label("nama_pengguna"),
        old_kata_sandi: Joi.string().required().label("kata_sandi Lama"),
        new_kata_sandi: Joi.string().min(6).required().label("kata_sandi Baru"),
      },
      {
        "string.base": "{#label} harus berupa string",
        "string.empty": "{#label} tidak boleh kosong",
        "any.required": "{#label} wajib diisi",
        "string.min": "{#label} minimal {#limit} karakter",
      },
      oPayload,
    );

    if (cValidation) {
      const oResult = {
        status: status.BAD_REQUEST,
        message: cValidation || "Terdapat kesalahan pada data anda",
        datetime: formatDateSystem(),
      };
      return res.status(422).json(oResult);
    }

    // 2. Cari Data User di Database
    const oUser = await DB("mst_pengguna")
      .leftJoin(
        "mst_pengguna_peran",
        "mst_pengguna.user_id",
        "mst_pengguna_peran.user_id",
      )
      .leftJoin(
        "mst_peran",
        "mst_pengguna_peran.role_id",
        "mst_peran.role_id",
      )
      .select(
        "mst_pengguna.user_id",
        "mst_pengguna.username as nama_pengguna",
        "mst_pengguna.password as kata_sandi",
        "mst_peran.role_name as peran",
      )
      .where("mst_pengguna.username", oPayload.nama_pengguna)
      .first();

    if (!oUser) {
      return res.status(400).json({
        status: status.GAGAL,
        message: "nama_pengguna tidak ditemukan",
        datetime: formatDateSystem(),
      });
    }

    // 3. Verifikasi kata_sandi Lama
    const cSecret = process.env.USER_SECRET;
    const cOldkata_sandi =
      process.env.USER_KEY + oUser.nama_pengguna + oPayload.old_kata_sandi;

    if (
      !hashEquals(hmac(cOldkata_sandi, cSecret, "sha512"), oUser.kata_sandi)
    ) {
      return res.status(400).json({
        status: status.GAGAL,
        message: "kata_sandi lama salah!",
        datetime: formatDateSystem(),
      });
    }

    // 4. Hash (Sandikan) kata_sandi Baru
    const cNewkata_sandi =
      process.env.USER_KEY + oUser.nama_pengguna + oPayload.new_kata_sandi;
    const cHashedNewkata_sandi = hmac(cNewkata_sandi, cSecret, "sha512");

    // 5. Update Database dengan kata_sandi Baru
    await DB("mst_pengguna")
      .where("user_id", oUser.user_id)
      .update({
        password: cHashedNewkata_sandi,
        updated_at: formatDateSystem(),
      });

    // 6. Catat Aktivitas ke CCTV
    recordAuditTrail(
      oUser.nama_pengguna,
      String(oUser.peran || ""),
      "RESET_kata_sandi",
      req,
    );

    return res.status(200).json({
      status: status.SUKSES,
      message: "kata_sandi berhasil diubah",
      datetime: formatDateSystem(),
    });
  } catch (oError) {
    const oResult = {
      status: status.BAD_REQUEST,
      message: "Sistem sedang maintenance harap tunggu sebentar",
      datetime: formatDateSystem(),
    };

    Logging(oError, {
      file: "reset_kata_sandi.js",
      func: "POST /",
      request: oPayload,
      response: oResult,
      user: cnama_penggunaActor,
    });

    return res.status(500).json(oResult);
  }
});

export default router;
