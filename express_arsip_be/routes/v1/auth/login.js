import "dotenv/config";

import express from "express";
import {
  datetime,
  formatDateSystem,
  hashEquals,
  hmac,
  status,
} from "../components/tools/general.js";
import { Logging, validatePayload } from "../components/tools/servertool.js";
import Joi from "joi";
import DB from "../../../core/config/knex.js";
import { jwtVerify, SignJWT } from "jose";
import { recordAuditTrail } from "../components/tools/audit_tool.js";
import { getNavigationMenu } from "../setup/navigation/navigation_helper.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { body } = req;

  const cCredential = req.headers["x-credential"];
  const cAuth = req.headers["authorization"];
  const cForwardedFor = req.headers["x-forwarded-for"];
  const cIp = cForwardedFor ? cForwardedFor.split(",")[0].trim() : "";
  const cEndpoint = req.originalUrl;

  let oPayload = body;

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
        username: Joi.string().required().label("Username"),
        password: Joi.string().required().label("Password"),
      },
      {
        "string.base": "{#label} harus berupa string",
        "string.empty": "{#label} tidak boleh kosong",
        "any.required": "{#label} wajib diisi",
      },
      oPayload,
    );

    if (cValidation) {
      const oResult = {
        status: status.BAD_REQUEST,
        message: cValidation || "Terdapat kesalahan pada data anda",
        datetime: formatDateSystem(),
      };

      Logging(null, {
        file: "login.js",
        func: "login",
        request: oPayload,
        response: oResult,
        user: oPayload?.username || "",
      });

      return res.status(422).json(oResult);
    }

    // 1. CARI USER DI TABEL BARU (mst_users)
    const oUser = await DB("mst_users")
      .where("username", oPayload.username)
      .select(
        "user_id", // Pengganti UniqueId
        "password",
        "username",
        "fullname",
        "status",
        "telp",
        "created_at",
      )
      .first();

    if (oUser) {
      const dDatetime = formatDateSystem(
        oUser.created_at,
        "yyyy-MM-dd HH:mm:ss",
      );
      const secret = process.env.USER_SECRET;

      // 2. LOGIKA HASHING BARU (UniqueId diganti Username)
      const cPassword =
        process.env.USER_KEY + oUser.username + oPayload.password;

      if (!hashEquals(hmac(cPassword, secret, "sha512"), oUser.password)) {
        return res.status(400).json({
          status: status.GAGAL,
          message: "Password salah",
          datetime: formatDateSystem(),
        });
      }

      // 3. CEK STATUS BARU (Sekarang pakai ENUM 'active')
      if (oUser.status !== "active") {
        return res.status(400).json({
          status: status.GAGAL,
          message: "User belum aktif",
          datetime: formatDateSystem(),
        });
      }

      // 4. AMBIL MENU DARI TABEL BARU (Pakai UserId)
      const oNavigation = await DB("user_navigation")
        .select("menu")
        .where("user_id", oUser.user_id)
        .first();

      if (!oNavigation || !oNavigation.menu) {
        return res.status(400).json({
          status: status.GAGAL,
          message: "User tidak memiliki hak akses menu terdaftar di database",
          datetime: formatDateSystem(),
        });
      }

      // 5. AMBIL JABATAN DARI TABEL ROLE (Pakai UserId)
      const oUserRole = await DB("mst_user_roles")
        .where("user_id", oUser.user_id)
        .first();

      const roleId = oUserRole ? oUserRole.role_id : null;

      // 6. BUNGKUS PAYLOAD JWT BARU
      const credential = {
        UserId: oUser.user_id, // HURUF BESAR: Biar NextAuth & AppMenu.tsx lo mulus baca UserId
        username: oUser.username,
        name: oUser.fullname, // UBAH fullname JADI name: NextAuth butuh 'name' buat profile
        roleId: roleId,
      };

      const secretKey = new TextEncoder().encode(process.env.USER_KEY);

      const jwtCredential = await new SignJWT(credential)
        .setProtectedHeader({ alg: "HS512" })
        .sign(secretKey);

      await recordAuditTrail(oUser.username, String(roleId), "LOGIN", req);

      // 7. UBAHAN CUMA DI RETURN INI 
      // Ditambahin key `data` isinya objek `credential`, biar Frontend & NextAuth gampang bacanya
      return res.status(200).json({
        status: status.SUKSES,
        message: "Login Berhasil",
        datetime: formatDateSystem(),
        credential: jwtCredential,
        data: credential // <--- INI KUNCI UTAMANYA!
      });
    }

    return res.status(400).json({
      status: status.GAGAL,
      message: "Username tidak ditemukan",
      datetime: formatDateSystem(),
    });
  } catch (error) {
    const oResult = {
      status: status.BAD_REQUEST,
      message: "Sistem sedang maintenance harap tunggu sebentar",
      datetime: formatDateSystem(),
    };

    Logging(error, {
      file: "login.js",
      func: "login",
      request: oPayload,
      response: oResult,
      user: oPayload?.username || "",
    });

    return res.status(500).json(oResult);
  }
});

export default router;
