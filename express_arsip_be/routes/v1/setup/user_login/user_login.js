import express from "express";
import DB from "../../../../core/config/knex.js";
import { status, formatDateSystem, datetime } from "../../components/tools/general.js";
import { Logging, validatePayload } from "../../components/tools/servertool.js";
import Joi from "joi";
import crypto from "crypto";

const hmac = (data, secret, algorithm = 'sha512') => crypto.createHmac(algorithm, secret).update(data).digest('hex');

const router = express.Router();

router.post("/", async (req, res) => {
  const { body: oPayload } = req;
  const cNamaPengguna = req?.auth?.nama_pengguna || "";

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
        user: cNamaPengguna,
      });
      return res.status(422).json(oResult);
    }

    const existingUser = await DB("mst_pengguna")
      .where("nama_pengguna", oPayload.nama_pengguna)
      .orWhere("telepon", oPayload.telepon)
      .first();

    if (existingUser) {
      return res.status(422).json({
        status: status.BAD_REQUEST,
        message:
          existingUser.nama_pengguna === oPayload.nama_pengguna
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
      .where("id_peran", inputperan)
      .orWhere("nama_peran", inputperan)
      .orWhere("kode_peran", inputperan)
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
      .orWhere("peran", peranData.kode_peran)
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
        surel: oPayload.surel || oPayload.email || oPayload.nama_pengguna,
        telepon: oPayload.telepon,
        kata_sandi: hashedkata_sandi,
        status:
          oPayload.status == "1" || oPayload.status == "active"
            ? "active"
            : "nonactive",
        id_cabang: Number(oPayload.id_cabang) || 1,
        id_jabatan: Number(oPayload.id_jabatan) || 1,
        id_divisi: Number(oPayload.id_divisi) || 1,
        id_departemen: Number(oPayload.id_departemen) || 1,
        id_unit_kerja: Number(oPayload.id_unit_kerja) || 1,
        created_at: formatDateSystem(),
        updated_at: formatDateSystem(),
      });

      // Masuk ke mst_pengguna_peran (Relasi Jabatan)
      await trx("mst_pengguna_peran").insert({
        id_pengguna: newUserId,
        id_peran: peranData.id_peran,
        status: "active",
        created_at: formatDateSystem(),
        updated_at: formatDateSystem(),
      });

      // Masuk ke navigasi_pengguna (Nampan Menu Spesifik)
      // Pakai oNavigation.menu dari pencarian di atas
      await trx("navigasi_pengguna")
        .insert({
          id_pengguna: newUserId,
          menu: oNavigation.menu,
          created_at: formatDateSystem(),
          updated_at: formatDateSystem(),
        })
        .onConflict("id_pengguna")
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
      user: cNamaPengguna,
    });
    return res.status(500).json(oResult);
  }
});

router.post("/", async (req, res) => {
  const { body } = req;
  const oPayload = body;
  const cNamaPengguna = req?.auth?.nama_pengguna || "";

  try {
    // DB aktif memakai nama kolom Inggris; response tetap pakai alias lama
    // supaya frontend setup/users tidak perlu berubah.
    const vaData = await DB("mst_pengguna as mu")
      .leftJoin(
        "mst_pengguna_peran as mur",
        "mu.id_pengguna",
        "mur.id_pengguna",
      )
      .leftJoin("mst_peran as mr", "mur.id_peran", "mr.id_peran") // Pastikan di mst_pengguna_peran namanya juga id_peran
      .select(
        "mu.id_pengguna",
        "mu.nama_lengkap", 
        "mu.nama_pengguna", 
        "mu.telepon",      
        "mu.surel",        
        "mu.id_cabang",    
        "mu.id_divisi",    
        "mu.id_departemen",
        "mu.id_jabatan",   
        "mu.id_unit_kerja",
        "mu.status",
        "mu.created_at",
        "mr.id_peran",    
        "mr.nama_peran as role"    
      )
      .orderBy("mu.created_at", "desc");

    return res.status(200).json({
      status: status.SUKSES,
      message: "Data ditemukan",
      datetime: formatDateSystem(),
      data: vaData,
      total_data: vaData.length,
    });
  } catch (error) {
    const oResult = {
      status: status.BAD_REQUEST,
      message: "Sistem sedang maintenance",
      datetime: datetime(),
    };
    Logging(error, {
      file: "user_data.js",
      func: "get",
      request: oPayload,
      response: oResult,
      user: cNamaPengguna,
    });
    return res.status(500).json(oResult);
  }
});

router.post("/", async (req, res) => {
  const { body: oPayload } = req;
  const cNamaPengguna = req?.auth?.nama_pengguna || "";

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

    // TRANSAKSI SOFT DELETE (mencakup mst_pengguna dan mst_pengguna_peran)
    await DB.transaction(async (trx) => {
      // 1. Nonaktifkan di mst_pengguna
      await trx("mst_pengguna")
        .whereIn("id_pengguna", oPayload.NamaPengguna)
        .update({
          status: "nonactive",
          updated_at: formatDateSystem(),
        });

      // 2. Nonaktifkan juga di mst_pengguna_peran
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
      user: cNamaPengguna,
    });
    return res.status(500).json({
      status: status.BAD_REQUEST,
      message: "Sistem maintenance",
      datetime: datetime(),
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const vaData = await DB("mst_pengguna as u")
      .leftJoin("mst_pengguna_peran as ur", "u.id_pengguna", "ur.id_pengguna")
      .leftJoin("mst_peran as r", "ur.id_peran", "r.id_peran")
      .select(
        "u.id_pengguna as id_pengguna",
        "u.nama_lengkap as nama_lengkap",
        "u.nama_pengguna as nama_pengguna",
        "u.telepon as telepon",
        "r.nama_peran as role",
      )
      .where("u.status", "active")
      .orderBy("u.nama_lengkap", "asc");

    return res.status(200).json({
      status: status.SUKSES,
      message: "Data ditemukan",
      datetime: formatDateSystem(),
      data: vaData,
      total_data: vaData.length,
    });
  } catch (error) {
    const oResult = {
      status: status.BAD_REQUEST,
      message: "Data user gagal diambil",
      datetime: formatDateSystem(),
    };

    Logging(error, {
      file: "user_dropdown.js",
      func: "post",
      request: req.body,
      response: oResult,
      user: req?.auth?.nama_pengguna || "",
    });

    return res.status(500).json(oResult);
  }
});

router.post("/", async (req, res) => {
  const { body: oPayload } = req;

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
        id_pengguna: Joi.alternatives()
          .try(Joi.number(), Joi.string())
          .required()
          .label("id_pengguna"),
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
        allowUnknown: true,
      },
    );

    if (cValidation)
      return res.status(422).json({
        status: status.BAD_REQUEST,
        message: cValidation,
        datetime: datetime(),
      });

    const userId = Number(oPayload.id_pengguna);
    if (!Number.isFinite(userId)) {
      return res.status(422).json({
        status: status.BAD_REQUEST,
        message: "id_pengguna tidak valid",
        datetime: datetime(),
      });
    }

    const existingUser = await DB("mst_pengguna")
      .where((builder) => {
        builder
          .where("nama_pengguna", oPayload.nama_pengguna)
          .orWhere("telepon", oPayload.telepon);
      })
      .whereNot("id_pengguna", userId)
      .first();

    if (existingUser) {
      return res.status(422).json({
        status: status.BAD_REQUEST,
        message:
          existingUser.nama_pengguna === oPayload.nama_pengguna
            ? "Data dengan nama_pengguna tersebut sudah digunakan"
            : "Data dengan telepon tersebut sudah digunakan",
        datetime: datetime(),
      });
    }

    // Siapkan data update mst_pengguna
    const oDataUser = {
      nama_lengkap: oPayload.nama_lengkap,
      nama_pengguna: oPayload.nama_pengguna,
      surel: oPayload.surel || oPayload.email || oPayload.nama_pengguna,
      telepon: oPayload.telepon,
      status:
        oPayload.status == "1" || oPayload.status == "active"
          ? "active"
          : "nonactive",
      id_cabang: Number(oPayload.id_cabang) || 1,
      id_jabatan: Number(oPayload.id_jabatan) || 1,
      id_divisi: Number(oPayload.id_divisi) || 1,
      id_departemen: Number(oPayload.id_departemen) || 1,
      id_unit_kerja: Number(oPayload.id_unit_kerja) || 1,
      updated_at: formatDateSystem(),
    };

    if (oPayload.kata_sandi) {
      const ckata_sandi =
        process.env.USER_KEY + oPayload.nama_pengguna + oPayload.kata_sandi;
      const secret = process.env.USER_SECRET;
      oDataUser.kata_sandi = hmac(ckata_sandi, secret, "sha512");
    }

    // TRANSAKSI UPDATE
    await DB.transaction(async (trx) => {
      // 2. Update mst_pengguna
      await trx("mst_pengguna").where("id_pengguna", userId).update(oDataUser);

      // 3. Update/insert mst_pengguna_peran berdasarkan id_pengguna
      const roleId = Number(oPayload.peran) || null;
      if (roleId) {
        const existingRole = await trx("mst_pengguna_peran")
          .where("id_pengguna", userId)
          .first();

        if (existingRole) {
          await trx("mst_pengguna_peran").where("id_pengguna", userId).update({
            id_peran: roleId,
            status: "active",
            updated_at: formatDateSystem(),
          });
        } else {
          await trx("mst_pengguna_peran").insert({
            id_pengguna: userId,
            id_peran: roleId,
            status: "active",
            created_at: formatDateSystem(),
            updated_at: formatDateSystem(),
          });
        }
      }

      const navigation = await trx("mst_pengguna_peran as ur")
        .leftJoin("mst_peran as r", "ur.id_peran", "r.id_peran")
        .leftJoin("mst_navigasi as n", function () {
          this.on("n.peran", "r.nama_peran").orOn("n.peran", "r.kode_peran");
        })
        .select("n.menu")
        .where("ur.id_pengguna", userId)
        .whereIn("ur.status", ["active", "1", 1])
        .first();

      if (navigation?.menu) {
        await trx("navigasi_pengguna")
          .insert({
            id_pengguna: userId,
            menu: navigation.menu,
            created_at: formatDateSystem(),
            updated_at: formatDateSystem(),
          })
          .onConflict("id_pengguna")
          .merge({
            menu: navigation.menu,
            updated_at: formatDateSystem(),
          });
      }
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
