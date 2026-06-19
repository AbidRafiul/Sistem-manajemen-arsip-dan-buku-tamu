import "dotenv/config";
import express from "express";
import Joi from "joi";
import DB from "../../../core/config/knex.js";
import { formatDateSystem, hashEquals, hmac, status } from "../components/tools/general.js";
import { Logging, validatePayload } from "../components/tools/servertool.js";
import { recordAuditTrail } from "../components/tools/audit_tool.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { body: oPayload } = req;
  const cUsernameActor = req?.auth?.username || "Unknown"; // Ngambil dari token JWT

  try {
    // 1. Validasi Input User
    const cValidation = await validatePayload(
      {
        username: Joi.string().required().label("Username"),
        old_password: Joi.string().required().label("Password Lama"),
        new_password: Joi.string().min(6).required().label("Password Baru"),
      },
      {
        "string.base": "{#label} harus berupa string",
        "string.empty": "{#label} tidak boleh kosong",
        "any.required": "{#label} wajib diisi",
        "string.min": "{#label} minimal {#limit} karakter",
      },
      oPayload
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
    const oUser = await DB("mst_users")
      .leftJoin("mst_user_roles", "mst_users.user_id", "mst_user_roles.user_id")
      .leftJoin("mst_roles", "mst_user_roles.role_id", "mst_roles.role_id")
      .select(
        "mst_users.user_id",
        "mst_users.username",
        "mst_users.password",
        "mst_roles.role_name as role"
      )
      .where("mst_users.username", oPayload.username)
      .first();

    if (!oUser) {
      return res.status(400).json({
        status: status.GAGAL,
        message: "Username tidak ditemukan",
        datetime: formatDateSystem(),
      });
    }

    // 3. Verifikasi Password Lama
    const cSecret = process.env.USER_SECRET;
    const cOldPassword = process.env.USER_KEY + oUser.username + oPayload.old_password;

    if (!hashEquals(hmac(cOldPassword, cSecret, "sha512"), oUser.password)) {
      return res.status(400).json({
        status: status.GAGAL,
        message: "Password lama salah!",
        datetime: formatDateSystem(),
      });
    }

    // 4. Hash (Sandikan) Password Baru
    const cNewPassword = process.env.USER_KEY + oUser.username + oPayload.new_password;
    const cHashedNewPassword = hmac(cNewPassword, cSecret, "sha512");

    // 5. Update Database dengan Password Baru
    await DB("mst_users")
      .where("username", oUser.username)
      .update({
        password: cHashedNewPassword
      });

    // 6. Catat Aktivitas ke CCTV
    recordAuditTrail(oUser.username, String(oUser.role || ""), "RESET_PASSWORD", req);

    return res.status(200).json({
      status: status.SUKSES,
      message: "Password berhasil diubah",
      datetime: formatDateSystem(),
    });

  } catch (oError) {
    const oResult = {
      status: status.BAD_REQUEST,
      message: "Sistem sedang maintenance harap tunggu sebentar",
      datetime: formatDateSystem(),
    };

    Logging(oError, {
      file: "reset_password.js",
      func: "POST /",
      request: oPayload,
      response: oResult,
      user: cUsernameActor,
    });

    return res.status(500).json(oResult);
  }
});

export default router;