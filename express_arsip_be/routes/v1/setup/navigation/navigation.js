import express from "express";
import DB from "../../../../core/config/knex.js";
import { status, formatDateSystem, datetime } from "../../components/tools/general.js";
import { Logging, validatePayload } from "../../components/tools/servertool.js";
import Joi from "joi";

const router = express.Router();

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

    const oData = await DB("mst_navigasi")
      .select("Menu as menu")
      .where("peran", oPayload?.peran);

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

router.post("/", async (req, res) => {
  const { body } = req;
  const oPayload = body;

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
        nama_pengguna: Joi.alternatives()
          .try(Joi.string(), Joi.number())
          .optional()
          .label("nama_pengguna"),
        id_pengguna: Joi.alternatives()
          .try(Joi.string(), Joi.number())
          .optional()
          .label("id_pengguna"),
        id_pengguna: Joi.alternatives()
          .try(Joi.string(), Joi.number())
          .optional()
          .label("id_pengguna"),
        IdPengguna: Joi.alternatives()
          .try(Joi.string(), Joi.number())
          .optional()
          .label("IdPengguna"),
      },
      {
        "string.base": "{#label} harus berupa string",
        "string.empty": "{#label} tidak boleh kosong",
        "any.required": "{#label} wajib diisi",
      },
      oPayload,
    );

    const cUserLookup = String(
        oPayload.id_pengguna ||
        oPayload.IdPengguna ||
        oPayload.nama_pengguna ||
        req?.auth?.IdPengguna ||
        req?.auth?.id_pengguna ||
        req?.auth?.nama_pengguna ||
        "",
    ).trim();

    if (cValidation || !cUserLookup) {
      const oResult = {
        status: status.BAD_REQUEST,
        message: cValidation || "nama_pengguna atau id_pengguna wajib diisi",
        datetime: formatDateSystem(),
      };

      Logging(null, {
        file: "user_navigation_data.js",
        func: "post",
        request: oPayload,
        response: oResult,
        user: req?.auth?.nama_pengguna || "",
      });

      return res.status(422).json(oResult);
    }

    const {
      menu: vaData,
      source: cSource,
      user: oUser,
    } = await getNavigationMenu(DB, cUserLookup);

    return res.status(200).json({
      status: status.SUKSES,
      message: "Data ditemukan",
      datetime: formatDateSystem(),
      data: vaData,
      menu: vaData,
      source: cSource,
      user: oUser,
    });
  } catch (error) {
    const oResult = {
      status: status.BAD_REQUEST,
      message: "Sistem sedang maintenance harap tunggu sebentar",
      datetime: formatDateSystem(),
    };

    Logging(error, {
      file: "user_navigation_data.js",
      func: "post",
      request: oPayload,
      response: oResult,
      user: req?.auth?.nama_pengguna || "",
    });

    return res.status(500).json(oResult);
  }
});

router.post("/", async (req, res) => {
  const { body } = req;
  const oPayload = body;

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
        // 🚨 UBAH DI SINI: Dari nama_pengguna jadi NamaPengguna
        NamaPengguna: Joi.alternatives()
          .try(Joi.number(), Joi.string())
          .required()
          .label("NamaPengguna"),
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
        file: "user_navigation_data_edit.js",
        func: "get",
        request: oPayload,
        response: oResult,
        user: req?.auth?.nama_pengguna || "",
      });

      return res.status(422).json(oResult);
    }

    let oNavigation = await DB("user_navigation")
      .select("menu")
      .where("id_pengguna", oPayload.NamaPengguna)
      .first();

    // fallback ke mst_navigasi kalau tidak ada
    if (!oNavigation?.menu) {
      oNavigation = await DB("mst_navigasi")
        .select("menu")
        .where("role", "master")
        .first();
    }

    if (!oNavigation?.menu) {
      return res.status(400).json({
        status: status.GAGAL,
        message: "Data navigasi tidak ditemukan",
        datetime: formatDateSystem(),
      });
    }

    const oUser = await DB("mst_pengguna_peran")
      .leftJoin("mst_peran", "mst_pengguna_peran.role_id", "mst_peran.role_id")
      .select(
        "mst_peran.role_name as peran",
        "mst_peran.role_code as kode_peran",
      )
      .where("mst_pengguna_peran.id_pengguna", oPayload.NamaPengguna)
      .where("mst_pengguna_peran.status", "active")
      .orderBy("mst_pengguna_peran.is_primary", "desc")
      .first();

    const oMst = await DB("mst_navigasi")
      .select("menu")
      .where((builder) => {
        builder
          .where("role", oUser?.peran || "master")
          .orWhere("role", oUser?.kode_peran || "master");
      })
      .first();

    if (!oMst?.menu) {
      return res.status(400).json({
        status: status.GAGAL,
        message: "Data navigasi tidak ditemukan",
        datetime: formatDateSystem(),
      });
    }

    return res.status(200).json({
      status: status.SUKSES,
      message: "Data ditemukan",
      datetime: formatDateSystem(),
      data: parseMenu(oMst.menu),
      menu: parseMenu(oNavigation.menu),
    });
  } catch (error) {
    const oResult = {
      status: status.BAD_REQUEST,
      message: "Sistem sedang maintenance harap tunggu sebentar",
      datetime: formatDateSystem(),
    };

    Logging(error, {
      file: "user_navigation_data_edit.js",
      func: "get",
      request: oPayload,
      response: oResult,
      user: req?.auth?.nama_pengguna || "",
    });

    return res.status(500).json(oResult);
  }
});

router.post("/", async (req, res) => {
  const { body } = req;
  const oPayload = body;

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
        // UBAH DI SINI: Dari nama_pengguna jadi NamaPengguna
        NamaPengguna: Joi.alternatives()
          .try(Joi.number(), Joi.string())
          .required()
          .label("NamaPengguna"),
        Menu: Joi.string().required().label("Menu"),
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
        file: "user_navigation_insert.js",
        func: "insert",
        request: oPayload,
        response: oResult,
        user: req?.auth?.nama_pengguna || "",
      });

      return res.status(422).json(oResult);
    }

    await DB("user_navigation")
      .insert({
        id_pengguna: oPayload.NamaPengguna,
        menu: oPayload.Menu,
        created_at: formatDateSystem(),
        updated_at: formatDateSystem(),
      })
      .onConflict("id_pengguna")
      .merge({
        menu: oPayload.Menu,
        updated_at: formatDateSystem(),
      });

    return res.status(200).json({
      status: status.SUKSES,
      message: "Data disimpan",
      datetime: formatDateSystem(),
    });
  } catch (error) {
    const oResult = {
      status: status.BAD_REQUEST,
      message: "Sistem sedang maintenance harap tunggu sebentar",
      datetime: formatDateSystem(),
    };

    Logging(error, {
      file: "user_navigation_insert.js",
      func: "insert",
      request: oPayload,
      response: oResult,
      user: req?.auth?.nama_pengguna || "",
    });

    return res.status(500).json(oResult);
  }
});

export default router;
