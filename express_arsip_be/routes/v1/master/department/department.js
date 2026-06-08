import express from "express";
import Joi from "joi";
import DB from "../../../../core/config/knex.js";
import {
  status,
  datetime,
  formatDateSystem,
} from "../../components/tools/general.js";
import { validatePayload, Logging } from "../../components/tools/servertool.js";

const router = express.Router();

// [READ] GET ALL DATA DEPARTEMEN
router.get("/", async (req, res) => {
  try {
    const aData = await DB("mst_departments")
      .select("id", "department_code", "department_name", "status")
      .where("status", "1");

    return res.status(200).json({
      status: status.SUKSES,
      message: "Data departemen berhasil ditarik",
      datetime: formatDateSystem(),
      data: aData,
    });
  } catch (error) {
    Logging(error, { file: "department.js", func: "GET all" });
    return res.status(500).json({
      status: status.BAD_REQUEST,
      message: "Terjadi kesalahan sistem",
      datetime: formatDateSystem(),
    });
  }
});

// [CREATE] INPUT DEPARTEMEN BARU
router.post("/", async (req, res) => {
  const oPayload = req.body;

  try {
    const cValidation = await validatePayload(
      {
        department_code: Joi.string().required().label("Kode Departemen"),
        department_name: Joi.string().required().label("Nama Departemen"),
      },
      {
        "string.empty": "{#label} tidak boleh kosong",
        "any.required": "{#label} wajib diisi",
      },
      oPayload,
    );

    if (cValidation) {
      return res.status(422).json({
        status: status.BAD_REQUEST,
        message: cValidation,
        datetime: formatDateSystem(),
      });
    }

    await DB("mst_departments").insert({
      department_code: oPayload.department_code,
      department_name: oPayload.department_name,
      status: "1",
    });

    return res.status(201).json({
      status: status.SUKSES,
      message: "Departemen baru berhasil ditambahkan!",
      datetime: formatDateSystem(),
    });
  } catch (error) {
    Logging(error, {
      file: "department.js",
      func: "POST insert",
      request: oPayload,
    });
    return res.status(500).json({
      status: status.BAD_REQUEST,
      message: "Gagal menyimpan data",
      datetime: formatDateSystem(),
    });
  }
});

export default router;
