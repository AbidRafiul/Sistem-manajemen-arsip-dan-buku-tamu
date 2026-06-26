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
        nama_lengkap: Joi.string().max(100).required().label("nama_lengkap"),
        nama_pengguna: Joi.string().max(100).required().label("nama_pengguna"),
        telepon: Joi.string()
          .pattern(/^[0-9]+$/)
          .max(13)
          .required()
          .label("telepon"),
        peran: Joi.alternatives()
          .try(Joi.string(), Joi.number())
          .required()
          .label("peran"),
        kata_sandi: Joi.string()
          .min(8)
          .pattern(
            new RegExp(
              "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^a-zA-Z0-9]).+$",
            ),
          )
          .required()
          .label("kata_sandi"),
        status: Joi.string().required().label("status"),
      },
      {
        "string.base": "{#label} harus berupa string",
        "string.empty": "{#label} tidak boleh kosong",
        "any.required": "{#label} wajib diisi",
      },
      oPayload,
      {
        allowUnknown: true,
      },
    );

    if (cValidation) {
      const oResult = {
        status: status.BAD_REQUEST,
        message: cValidation || "Terdapat kesalahan pada data anda",
        datetime: datetime(),
      };
      Logging(null, {
        file: "user_create.js",
        func: "create",
        request: oPayload,
        response: oResult,
        user: nama_pengguna,
      });
      return res.status(422).json(oResult);
    }

    const existingUser = await DB("mst_pengguna")
      .where("username", oPayload.nama_pengguna)
      .orWhere("telp", oPayload.telepon)
      .first();

    if (existingUser) {
      return res.status(422).json({
        status: status.BAD_REQUEST,
        message:
          existingUser.username === oPayload.nama_pengguna
            ? "Data dengan nama_pengguna tersebut sudah digunakan"
            : "Data dengan telepon tersebut sudah digunakan",
        datetime: formatDateSystem(),
      });
    }

    // HASH kata_sandi PAKAI nama_pengguna SEBAGAI SALT
    let hashedkata_sandi = "";
    if (oPayload.kata_sandi) {
      const ckata_sandi =
        process.env.USER_KEY + oPayload.nama_pengguna + oPayload.kata_sandi;
      const secret = process.env.USER_SECRET;
      hashedkata_sandi = hmac(ckata_sandi, secret, "sha512");
    }

    // 1. SIAPKAN INPUT peran (Menangani superadmin ke master)
    let inputperan = oPayload.peran;
    if (inputperan == "superadmin" || inputperan == "admin") {
      inputperan = "master";
    }

    // 2. CARI peran DATA TERLEBIH DAHULU SEBELUM TRANSAKSI
    // Mencari berdasarkan ID (angka) atau peranName (string)
    const peranData = await DB("mst_peran")
      .where("role_id", inputperan)
      .orWhere("role_name", inputperan)
      .orWhere("role_code", inputperan)
      .first();

    if (!peranData) {
      return res.status(400).json({
        status: status.GAGAL,
        message: "peran tidak ditemukan di sistem",
        datetime: formatDateSystem(),
      });
    }

    // 3. CARI NAVIGASI
    // Karena peranData sudah ketemu, kita pasti bisa mengambil peranName-nya
    const oNavigation = await DB("mst_navigasi")
      .select("menu")
      .where("role", peranData.role_name)
      .orWhere("role", peranData.role_code)
      .first();

    // 4. VALIDASI NAVIGASI
    if (!oNavigation || !oNavigation.menu) {
      return res.status(400).json({
        status: status.GAGAL,
        message: "peran tidak memiliki template menu di mst_navigasi",
        datetime: formatDateSystem(),
      });
    }

    // 5. TRANSAKSI DATABASE KE 3 TABEL
    await DB.transaction(async (trx) => {
      // 1. Masuk ke mst_pengguna (Buku Induk)
      const [newUserId] = await trx("mst_pengguna").insert({
        fullname: oPayload.nama_lengkap,
        username: oPayload.nama_pengguna,
        email: oPayload.surel || oPayload.email || oPayload.nama_pengguna,
        telp: oPayload.telepon,
        password: hashedkata_sandi,
        status:
          oPayload.status == "1" || oPayload.status == "active"
            ? "active"
            : "nonactive",
        branch_id: Number(oPayload.id_cabang) || 1,
        position_id: Number(oPayload.id_jabatan) || 1,
        division_id: Number(oPayload.id_divisi) || 1,
        department_id: Number(oPayload.id_departemen) || 1,
        work_unit_id: Number(oPayload.id_unit_kerja) || 1,
        created_at: formatDateSystem(),
        updated_at: formatDateSystem(),
      });

      // Masuk ke mst_pengguna_peran (Relasi Jabatan)
      await trx("mst_pengguna_peran").insert({
        user_id: newUserId,
        role_id: peranData.role_id,
        is_primary: 1,
        status: "active",
        created_at: formatDateSystem(),
        updated_at: formatDateSystem(),
      });

      // Masuk ke user_navigation (Nampan Menu Spesifik)
      // Pakai oNavigation.menu dari pencarian di atas
      await trx("user_navigation")
        .insert({
          user_id: newUserId,
          menu: oNavigation.menu,
          created_at: formatDateSystem(),
          updated_at: formatDateSystem(),
        })
        .onConflict("user_id")
        .merge({
          menu: oNavigation.menu,
          updated_at: formatDateSystem(),
        });
    });

    return res.status(200).json({
      status: status.SUKSES,
      message: "Data berhasil dibuat di sistem baru",
      datetime: formatDateSystem(),
    });
  } catch (error) {
    const oResult = {
      status: status.BAD_REQUEST,
      message: "Sistem sedang maintenance",
      datetime: datetime(),
    };
    Logging(error, {
      file: "user_create.js",
      func: "create",
      request: oPayload,
      response: oResult,
      user: nama_pengguna,
    });
    return res.status(500).json(oResult);
  }
});

export default router;
