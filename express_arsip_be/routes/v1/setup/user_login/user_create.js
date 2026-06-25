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
        uniqueField: ["nama_pengguna", "telepon"],
        table: "mst_pengguna", // Validasi langsung cek ke mst_pengguna
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
      .where("id_peran", inputperan)
      .orWhere("nama_peran", inputperan)
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
      .where("peran", peranData.nama_peran)
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
        nama_lengkap: oPayload.nama_lengkap,
        nama_pengguna: oPayload.nama_pengguna,
        telepon: oPayload.telepon,
        kata_sandi: hashedkata_sandi,
        status:
          oPayload.status == "1" || oPayload.status == "active"
            ? "active"
            : "nonactive",
        id_cabang: oPayload.id_cabang || null,
        id_jabatan: oPayload.id_jabatan || null,
        id_divisi: oPayload.id_divisi || null,
        id_departemen: oPayload.id_departemen || null,
        id_unit_kerja: oPayload.id_unit_kerja || null,
        created_at: formatDateSystem(),
        updated_at: formatDateSystem(),
      });

      // Masuk ke mst_pengguna_perans (Relasi Jabatan)
      // Pakai peranData.id_peran dari pencarian di atas
      await trx("mst_pengguna_peran").insert({
        id_pengguna: newUserId, // Cocok dengan screenshot
        id_peran: peranData.id_peran, // Cocok dengan screenshot
        peran_utama: 1, // Nilai default agar tidak error
        status: "active", // Nilai default agar tidak error
        created_at: formatDateSystem(),
        updated_at: formatDateSystem(),
      });

      // Masuk ke navigasi_pengguna (Nampan Menu Spesifik)
      // Pakai oNavigation.menu dari pencarian di atas
      await trx("navigasi_pengguna").insert({
        id_pengguna: newUserId,
        menu: oNavigation.menu,
        created_at: formatDateSystem(),
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
