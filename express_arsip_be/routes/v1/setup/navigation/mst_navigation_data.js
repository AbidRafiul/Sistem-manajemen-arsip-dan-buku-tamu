import express from "express";
import DB from "../../../../core/config/knex.js";
import {
  datetime,
  formatDateSystem,
  status,
} from "../../components/tools/general.js";
import { Logging, validatePayload } from "../../components/tools/servertool.js";
import Joi from "joi";
import { normalizeLegacyMenu, roleAliases } from "./navigation_helper.js";

const router = express.Router();

const uniqueValues = (values) => {
  return Array.from(
    new Set(
      values
        .flat()
        .map((value) => String(value || "").trim())
        .filter(Boolean),
    ),
  );
};

const getRoleById = async (roleId) => {
  if (!roleId) return null;

  return await DB("mst_peran")
    .select("nama_peran", "kode_peran")
    .where("id_peran", roleId)
    .first()
    .catch(() => null);
};

const getRoleByUserId = async (nUserId) => {
  if (!nUserId) return null;

  return await DB("mst_pengguna_peran")
    .leftJoin("mst_peran", "mst_pengguna_peran.id_peran", "mst_peran.id_peran")
    .select(
      "mst_peran.nama_peran",
      "mst_peran.kode_peran",
    )
    .where("mst_pengguna_peran.id_pengguna", nUserId)
    .where((builder) => {
      builder
        .where("mst_pengguna_peran.status", "active")
        .orWhereNull("mst_pengguna_peran.status");
    })
    .orderBy("mst_pengguna_peran.peran_utama", "desc")
    .first()
    .catch(() => null);
};

const getNavigationByRole = async (roles) => {
  const aliases = uniqueValues(roles.map((role) => roleAliases(role)));

  if (!aliases.length) return null;

  return await DB("mst_navigasi")
    .select("menu", "peran")
    .whereIn("peran", aliases)
    .orderByRaw(`CASE WHEN peran = ? THEN 0 ELSE 1 END`, [roles[0] || ""])
    .first();
};

const queryNavigationByRoleId = async (roleId) => {
  const role = await getRoleById(roleId);
  if (!role) return null;

  const aliases = uniqueValues([
    role.nama_peran,
    role.kode_peran,
    ...roleAliases(role.nama_peran),
    ...roleAliases(role.kode_peran),
  ]);

  return await DB("mst_navigasi")
    .select("menu")
    .whereIn("peran", aliases);
};

router.post("/", async (req, res) => {
  const { body } = req;
  const oPayload = body;
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
        peran: Joi.number().required().label("peran"),
      },
      {
        "number.base": "{#label} harus berupa number",
        "number.empty": "{#label} tidak boleh kosong",
        "any.required": "{#label} wajib diisi",
      },
      oPayload,
      {},
    );

    if (cValidation) {
      const oResult = {
        status: status.BAD_REQUEST,
        message: cValidation || "Terdapat kesalahan pada data anda",
        datetime: datetime(),
      };

      Logging(null, {
        file: "mst_navigation_data.js",
        func: "get",
        request: oPayload,
        response: oResult,
        user: nama_pengguna,
      });

      return res.status(422).json(oResult);
    }

    const oData = await queryNavigationByRoleId(oPayload?.peran);

    if (!oData) {
      const oResult = {
        status: status.GAGAL,
        message: "Menu tidak ditemukan",
        datetime: datetime(),
      };

      Logging(null, {
        file: "mst_navigation_data.js",
        func: "get",
        request: oPayload,
        response: oResult,
        user: nama_pengguna,
      });

      return res.status(400).json(oResult);
    }

    return res.status(200).json({
      status: status.SUKSES,
      message: "Data ditemukan",
      datetime: formatDateSystem(),
      data: oData,
    });
  } catch (error) {
    const oResult = {
      status: status.BAD_REQUEST,
      message: "Sistem sedang maintenance harap tunggu sebentar",
      datetime: datetime(),
    };

    Logging(error, {
      file: "mst_navigation_data.js",
      func: "get",
      request: oPayload,
      response: oResult,
      user: nama_pengguna,
    });

    return res.status(500).json(oResult);
  }
});

export default router;
