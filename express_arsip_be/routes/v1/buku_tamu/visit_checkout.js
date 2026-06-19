import express from "express";
import Joi from "joi";
import { formatDateSystem } from "../components/tools/general.js";
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
        status: "99",
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
        status: "99",
        message: "QRToken, VisitCode, atau VisitationId wajib diisi salah satu",
        datetime: formatDateSystem(),
      });
    }

    const query = DB("trx_visitations").where("status", "Sedang Berkunjung").andWhere(function () {
      if (QRToken) {
        this.orWhere("qr_token", QRToken);
      }
      if (VisitCode) {
        this.orWhere("visit_code", VisitCode);
      }
      if (VisitationId) {
        this.orWhere("visitation_id", VisitationId);
      }
    });

    const record = await query.first();

    if (!record) {
      return res.status(404).json({
        status: "44",
        message: "Tamu dengan data yang diberikan dan status 'Sedang Berkunjung' tidak ditemukan",
        datetime: formatDateSystem(),
      });
    }

    const updateData = {
      status: "Selesai",
      check_out_time: formatDateSystem(),
    };

    if (VisitNotes) {
      const existingNotes = record.visit_notes ? String(record.visit_notes).trim() : "";
      updateData.visit_notes = existingNotes
        ? `${existingNotes}\n${VisitNotes}`
        : VisitNotes;
    }

    await DB("trx_visitations").where("visitation_id", record.visitation_id).update(updateData);

    return res.status(200).json({
      status: "00",
      message: "Check-out berhasil",
      data: {
        visitation_id: record.visitation_id,
        visit_code: record.visit_code,
        qr_token: record.qr_token,
      },
      datetime: formatDateSystem(),
    });
  } catch (error) {
    const oResult = {
      status: "01",
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