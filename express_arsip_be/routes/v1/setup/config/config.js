import express from "express";
import DB from "../../../../core/config/knex.js";
import { status, formatDateSystem, datetime } from "../../components/tools/general.js";
import { Logging, validatePayload } from "../../components/tools/servertool.js";
import Joi from "joi";
import fs from "fs";
import path from "path";
import multer from "multer";

const router = express.Router();
const upload = multer({ dest: 'public/uploads/temp/' });

router.post("/", upload.any(), async (req, res) => {
  const oPayload = req.body;
  const files = req.files;
  const nama_pengguna = req?.auth?.nama_pengguna || "";

  try {
    console.log(oPayload);
    const cValidation = await validatePayload(
      {
        Kode: Joi.string().required().label("Kode"),
        Keterangan: Joi.string().required().label("Keterangan"),
      },
      {
        "any.required": "{#label} wajib diisi",
        "array.base": "{#label} harus berupa array",
        "string.base": "{#label} harus berupa string",
        "string.empty": "{#label} tidak boleh kosong",
      },
      oPayload,
    );

    if (cValidation) {
      const oResult = {
        status: status.GAGAL,
        message: cValidation,
        datetime: formatDateSystem(),
      };
      Logging(null, {
        file: "info_perusahaan_create.js",
        func: "create",
        request: oPayload,
        response: oResult,
        user: nama_pengguna,
      });
      return res.status(422).json(oResult);
    }

    let { Kode, Keterangan } = oPayload;

    Kode = JSON.parse(Kode);
    Keterangan = JSON.parse(Keterangan);
    console.log(files);

    if (Kode.length !== Keterangan.length) {
      const oResult = {
        status: status.BAD_REQUEST,
        message: "Jumlah data kode dan keterangan tidak sama.",
        datetime: formatDateSystem(),
      };
      Logging(null, {
        file: "info_perusahaan_create.js",
        func: "create",
        request: oPayload,
        response: oResult,
        user: nama_pengguna,
      });
      return res.status(422).json(oResult);
    }

    const oldData = await DB("config")
      .select("kode", "keterangan")
      .where("kode", "msLogoPerusahaan")
      .first();

    let filename = oldData?.keterangan || "";
    const file = files[0];

    if (file) {
      const uploadDir = path.join(
        process.cwd(),
        "public",
        "uploads",
        "config",
        "logo_perusahaan",
      );
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const ext = path.extname(file.originalname) || "";
      filename = `logo_perusahaan${ext}`;
      const filepath = path.join(uploadDir, filename);

      // hapus file lama kalau ada
      const oldPath = path.join(uploadDir, oldData?.keterangan || "");
      if (oldData?.keterangan && fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }

      fs.renameSync(file.path, filepath);
    }

    Kode.push("msLogoPerusahaan");
    Keterangan.push(filename);

    for (let i = 0; i < Kode.length; i++) {
      const cKode = Kode[i];
      const cKeterangan = Keterangan[i] ?? null;

      const existing = await DB("config")
        .select("keterangan")
        .where("kode", cKode)
        .first();

      if (existing) {
        await DB("config")
          .where("kode", cKode)
          .update({ keterangan: cKeterangan });
      } else {
        await DB("config").insert({ kode: cKode, keterangan: cKeterangan });
      }
    }

    const oResult = {
      status: status.SUKSES,
      message: "Berhasil Menambahkan Data",
      datetime: formatDateSystem(),
    };

    return res.status(200).json(oResult);
  } catch (error) {
    console.log(error);
    const oResult = {
      status: status.BAD_REQUEST,
      message: "Sistem sedang maintenance harap tunggu sebentar",
      datetime: formatDateSystem(),
    };
    Logging(error, {
      file: "info_perusahaan_create.js",
      func: "create",
      request: oPayload,
      response: oResult,
      user: nama_pengguna,
    });

    return res.status(500).json(oResult);
  }
});

router.post("/", async (req, res) => {
  const oPayload = req.body;
  const nama_pengguna = req?.auth?.nama_pengguna || "";

  try {
    const cValidation = await validatePayload(
      {
        Kode: Joi.array()
          .items(Joi.string().required())
          .required()
          .label("Kode"),
      },
      {
        "array.base": "{#label} harus berupa array",
        "any.required": "{#label} wajib diisi",
      },
      oPayload,
    );

    if (cValidation) {
      const oResult = {
        status: status.GAGAL,
        message: cValidation,
        datetime: formatDateSystem(),
      };
      Logging(null, {
        file: "info_perusahaan_data.js",
        func: "data",
        request: oPayload,
        response: oResult,
        user: nama_pengguna,
      });
      return res.status(422).json(oResult);
    }
    const vaData = await DB("config")
      .whereIn("kode", oPayload.Kode)
      .select("kode", "keterangan");

    if (!vaData || vaData.length < 1) {
      const oResult = {
        status: status.GAGAL,
        message: "DATA TIDAK DITEMUKAN",
        datetime: formatDateSystem(),
        data: [],
      };
      Logging(null, {
        file: "config_data.js",
        func: "data",
        request: oPayload,
        response: oResult,
        user: nama_pengguna,
      });

      return res.status(400).json(oResult);
    }

    const oFormatted = {};
    vaData.forEach((row) => {
      oFormatted[row.kode] = row.keterangan;

      if (row.kode == "msLogoPerusahaan") {
        oFormatted["msLogoPerusahaan"] =
          `${process.env.APP_SERVER}:${process.env.APP_PORT}/uploads/config/logo_perusahaan/${row.keterangan}`;
      }
    });

    const oResult = {
      status: status.SUKSES,
      message: "Berhasil Mendapatkan Data",
      datetime: formatDateSystem(),
      data: oFormatted,
    };

    return res.status(200).json(oResult);
  } catch (error) {
    console.log(error);
    const oResult = {
      status: status.BAD_REQUEST,
      message: "Sistem sedang maintenance harap tunggu sebentar",
      datetime: formatDateSystem(),
    };
    Logging(error, {
      file: "info_perusahaan_data.js",
      func: "data",
      request: oPayload,
      response: oResult,
      user: nama_pengguna,
    });

    return res.status(500).json(oResult);
  }
});

export default router;
