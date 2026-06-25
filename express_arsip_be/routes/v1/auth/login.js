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
        nama_pengguna: Joi.string().required().label("nama_pengguna"),
        kata_sandi: Joi.string().required().label("kata_sandi"),
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
        user: oPayload?.nama_pengguna || "",
      });

      return res.status(422).json(oResult);
    }

    // 1. CARI USER DI TABEL BARU (mst_pengguna)
    const oUser = await DB("mst_pengguna")
      .where("nama_pengguna", oPayload.nama_pengguna)
      .select(
        "id_pengguna",
        "nama_pengguna", // Pengganti UniqueId
        "kata_sandi",
        "nama_lengkap",
        "status",
        "telepon",
        "created_at",
      )
      .first();

    if (oUser) {
      const dDatetime = formatDateSystem(
        oUser.created_at,
        "yyyy-MM-dd HH:mm:ss",
      );
      const secret = process.env.USER_SECRET;

      // 2. LOGIKA HASHING BARU (UniqueId diganti nama_pengguna)
      const ckata_sandi =
        process.env.USER_KEY + oUser.nama_pengguna + oPayload.kata_sandi;

      if (!hashEquals(hmac(ckata_sandi, secret, "sha512"), oUser.kata_sandi)) {
        return res.status(400).json({
          status: status.GAGAL,
          message: "kata_sandi salah",
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

      // 4. AMBIL MENU DARI TABEL BARU (Pakai NamaPengguna)
      const oNavigation = await DB("navigasi_pengguna")
        .select("menu")
        .where("id_pengguna", oUser.id_pengguna)
        .first();

      if (!oNavigation || !oNavigation.menu) {
        return res.status(400).json({
          status: status.GAGAL,
          message: "User tidak memiliki hak akses menu terdaftar di database",
          datetime: formatDateSystem(),
        });
      }

      // 5. AMBIL JABATAN DARI TABEL peran (Pakai NamaPengguna)
      const oUserperan = await DB("mst_pengguna_peran")
        .leftJoin(
          "mst_peran",
          "mst_pengguna_peran.id_peran",
          "mst_peran.id_peran",
        )
        .select(
          "mst_pengguna_peran.id_peran",
          "mst_peran.kode_peran",
          "mst_peran.nama_peran",
        )
        .where("mst_pengguna_peran.id_pengguna", oUser.id_pengguna)
        .first();

      const peranId = oUserperan ? oUserperan.id_peran : null;

      // 6. BUNGKUS PAYLOAD JWT BARU
      const credential = {
        IdPengguna: oUser.id_pengguna, // HURUF BESAR: Biar NextAuth & AppMenu.tsx lo mulus baca NamaPengguna
        nama_pengguna: oUser.nama_pengguna,
        nama_lengkap: oUser.nama_lengkap,
        name: oUser.nama_lengkap, // UBAH nama_lengkap JADI name: NextAuth butuh 'name' buat profile
        peranId: peranId,
        peran: oUserperan?.nama_peran || null,
        peranCode: oUserperan?.kode_peran || null,
      };

      const secretKey = new TextEncoder().encode(process.env.USER_KEY);

      const jwtCredential = await new SignJWT(credential)
        .setProtectedHeader({ alg: "HS512" })
        .sign(secretKey);

      recordAuditTrail(oUser.nama_pengguna, String(peranId), "LOGIN", req);

      // 7. UBAHAN CUMA DI RETURN INI
      // Ditambahin key `data` isinya objek `credential`, biar Frontend & NextAuth gampang bacanya
      return res.status(200).json({
        status: status.SUKSES,
        message: "Login Berhasil",
        datetime: formatDateSystem(),
        credential: jwtCredential,
        data: credential, // <--- INI KUNCI UTAMANYA!
      });
    }

    return res.status(400).json({
      status: status.GAGAL,
      message: "nama_pengguna tidak ditemukan",
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
      user: oPayload?.nama_pengguna || "",
    });

    return res.status(500).json(oResult);
  }
});

export default router;
