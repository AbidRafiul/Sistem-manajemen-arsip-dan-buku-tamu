import express from "express";
import {
  datetime,
  formatDateSystem,
  hmac,
  status,
} from "../../components/tools/general.js";
import Joi from "joi";
import DB from "../../../../core/config/knex.js";
import { validatePayload } from "../../components/tools/servertool.js";

const router = express.Router();

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
          .where("username", oPayload.nama_pengguna)
          .orWhere("telp", oPayload.telepon);
      })
      .whereNot("id_pengguna", userId)
      .first();

    if (existingUser) {
      return res.status(422).json({
        status: status.BAD_REQUEST,
        message:
          existingUser.username === oPayload.nama_pengguna
            ? "Data dengan nama_pengguna tersebut sudah digunakan"
            : "Data dengan telepon tersebut sudah digunakan",
        datetime: datetime(),
      });
    }

    // Siapkan data update mst_pengguna
    const oDataUser = {
      fullname: oPayload.nama_lengkap,
      username: oPayload.nama_pengguna,
      email: oPayload.surel || oPayload.email || oPayload.nama_pengguna,
      telp: oPayload.telepon,
      status:
        oPayload.status == "1" || oPayload.status == "active"
          ? "active"
          : "nonactive",
      branch_id: Number(oPayload.id_cabang) || 1,
      position_id: Number(oPayload.id_jabatan) || 1,
      division_id: Number(oPayload.id_divisi) || 1,
      department_id: Number(oPayload.id_departemen) || 1,
      work_unit_id: Number(oPayload.id_unit_kerja) || 1,
      updated_at: formatDateSystem(),
    };

    if (oPayload.kata_sandi) {
      const ckata_sandi =
        process.env.USER_KEY + oPayload.nama_pengguna + oPayload.kata_sandi;
      const secret = process.env.USER_SECRET;
      oDataUser.password = hmac(ckata_sandi, secret, "sha512");
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
            role_id: roleId,
            is_primary: 1,
            status: "active",
            updated_at: formatDateSystem(),
          });
        } else {
          await trx("mst_pengguna_peran").insert({
            id_pengguna: userId,
            role_id: roleId,
            is_primary: 1,
            status: "active",
            created_at: formatDateSystem(),
            updated_at: formatDateSystem(),
          });
        }
      }

      const navigation = await trx("mst_pengguna_peran as ur")
        .leftJoin("mst_peran as r", "ur.role_id", "r.role_id")
        .leftJoin("mst_navigasi as n", function () {
          this.on("n.role", "r.role_name").orOn("n.role", "r.role_code");
        })
        .select("n.menu")
        .where("ur.id_pengguna", userId)
        .where("ur.status", "active")
        .orderBy("ur.is_primary", "desc")
        .first();

      if (navigation?.menu) {
        await trx("user_navigation")
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
