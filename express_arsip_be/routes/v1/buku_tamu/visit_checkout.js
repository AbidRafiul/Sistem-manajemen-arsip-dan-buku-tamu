import express from "express";
import Joi from "joi";
import { formatDateSystem, status } from "../components/tools/general.js";
import { Logging, validatePayload } from "../components/tools/servertool.js";
import DB from "../../../core/config/knex.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { body: oPayload } = req;
  const username = req?.auth?.username || "";

  try {
    const cValidation = await validatePayload(
      {
        QRToken: Joi.string().max(100).optional().allow(null, "").label("QRToken"),
        VisitCode: Joi.string().max(30).optional().allow(null, "").label("VisitCode"),
        VisitationId: Joi.alternatives()
          .try(Joi.string().max(36), Joi.number())
          .optional()
          .allow(null, "")
          .label("VisitationId"),
        VisitNotes: Joi.string().optional().allow(null, "").label("VisitNotes"),
      },
      {
        "string.base": "{#label} harus berupa string",
        "string.max": "{#label} tidak boleh lebih dari {#limit} karakter",
      },
      oPayload,
      { allowUnknown: true }
    );

    if (cValidation) {
      const oResult = {
        status: status.BAD_REQUEST,
        message: cValidation || "Terdapat kesalahan pada data anda",
        datetime: formatDateSystem(),
      };

      Logging(null, {
        file: "visit_checkout.js",
        func: "check-out",
        request: oPayload,
        response: oResult,
        user: username,
      });

      return res.status(422).json(oResult);
    }

    const { QRToken, VisitCode, VisitationId, VisitNotes } = oPayload;

    if (!QRToken && !VisitCode && !VisitationId) {
      return res.status(400).json({
        status: status.BAD_REQUEST,
        message: "QRToken, VisitCode, atau VisitationId wajib diisi salah satu",
        datetime: formatDateSystem(),
      });
    }

    const query = DB("trx_visitations").where("Status", "in").andWhere(function () {
      if (QRToken) {
        this.orWhere("QRToken", QRToken);
      }
      if (VisitCode) {
        this.orWhere("VisitCode", VisitCode);
      }
      if (VisitationId) {
        this.orWhere("VisitationId", VisitationId);
      }
    });

    const record = await query.first();

    if (!record) {
      return res.status(404).json({
        status: status.NOT_FOUND,
        message: "Tamu dengan data yang diberikan dan status 'in' tidak ditemukan",
        datetime: formatDateSystem(),
      });
    }

    const updateData = {
      Status: "out",
      CheckOutTime: formatDateSystem(),
    };

    if (VisitNotes) {
      const existingNotes = record.VisitNotes ? String(record.VisitNotes).trim() : "";
      updateData.VisitNotes = existingNotes
        ? `${existingNotes}\n${VisitNotes}`
        : VisitNotes;
    }

    await DB("trx_visitations").where("VisitationId", record.VisitationId).update(updateData);

    return res.status(200).json({
      status: status.SUKSES,
      message: "Check-out berhasil",
      data: {
        VisitationId: record.VisitationId,
        VisitCode: record.VisitCode,
        QRToken: record.QRToken,
      },
      datetime: formatDateSystem(),
    });
  } catch (error) {
    const oResult = {
      status: status.GAGAL,
      message: "Sistem sedang maintenance harap tunggu sebentar",
      datetime: formatDateSystem(),
    };

    Logging(error, {
      file: "visit_checkout.js",
      func: "check-out",
      request: req.body,
      response: oResult,
      user: username,
    });

    return res.status(500).json(oResult);
  }
});

export default router;
