import express from "express";
import Joi from "joi";
import DB from "../../../core/config/knex.js";
import { validatePayload } from "../components/tools/servertool.js";

const router = express.Router();

const letterDispositionData = async (req, res) => {
  try {
    const oPayload = req.body || {};

    const oValidation = {
      IncomingLetterId: Joi.number().allow(null).optional(),
      ToUserId: Joi.number().allow(null).optional(),
      FromUserId: Joi.number().allow(null).optional(),
      Status: Joi.string()
        .valid("baru", "dibaca", "diproses", "selesai")
        .allow(null, "")
        .optional(),
      Keyword: Joi.string().allow(null, "").optional(),
    };

    const oMessage = {
      "IncomingLetterId.number": "IncomingLetterId harus berupa angka",
      "ToUserId.number": "ToUserId harus berupa angka",
      "FromUserId.number": "FromUserId harus berupa angka",
      "Status.valid": "Status disposisi tidak valid",
    };

    const cValidate = await validatePayload(oValidation, oMessage, oPayload, {
      allowUnknown: false,
    });

    if (cValidate) {
      return res.status(400).json({
        status: false,
        message: cValidate,
      });
    }

    const oQuery = DB("trs_letter_dispositions as tld")
      .leftJoin(
        "trs_incoming_letters as til",
        "tld.IncomingLetterId",
        "til.IncomingLetterId"
      )
      .leftJoin(
        "mst_disposition_instructions as mdi",
        "tld.DispositionInstructionId",
        "mdi.DispositionInstructionId"
      )
      .select(
        "tld.DispositionId",
        "tld.IncomingLetterId",
        "til.AgendaNumber",
        "til.LetterNumber",
        "til.Subject",
        "til.SenderName",
        "til.Status as LetterStatus",

        "tld.ParentDispositionId",
        "tld.FromUserId",
        "tld.ToUserId",
        "tld.DispositionInstructionId",
        "mdi.InstructionName",

        "tld.Instruction",
        "tld.DispositionNote",
        "tld.DueDate",
        "tld.Status",
        "tld.ReceivedAt",
        "tld.ProcessedAt",
        "tld.CompletedAt",

        "tld.CreatedBy",
        "tld.UpdatedBy",
        "tld.CreatedAt",
        "tld.UpdatedAt"
      )
      .orderBy("tld.CreatedAt", "desc");

    if (oPayload.IncomingLetterId) {
      oQuery.where("tld.IncomingLetterId", oPayload.IncomingLetterId);
    }

    if (oPayload.ToUserId) {
      oQuery.where("tld.ToUserId", oPayload.ToUserId);
    }

    if (oPayload.FromUserId) {
      oQuery.where("tld.FromUserId", oPayload.FromUserId);
    }

    if (oPayload.Status) {
      oQuery.where("tld.Status", oPayload.Status);
    }

    if (oPayload.Keyword) {
      oQuery.where((oBuilder) => {
        oBuilder
          .where("til.AgendaNumber", "like", `%${oPayload.Keyword}%`)
          .orWhere("til.LetterNumber", "like", `%${oPayload.Keyword}%`)
          .orWhere("til.Subject", "like", `%${oPayload.Keyword}%`)
          .orWhere("til.SenderName", "like", `%${oPayload.Keyword}%`)
          .orWhere("tld.Instruction", "like", `%${oPayload.Keyword}%`)
          .orWhere("tld.DispositionNote", "like", `%${oPayload.Keyword}%`);
      });
    }

    const vaData = await oQuery;

    return res.status(200).json({
      status: true,
      message: "Data disposisi surat berhasil diambil",
      data: vaData,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      status: false,
      message: "Data disposisi surat gagal diambil",
      error: error.message,
    });
  }
};

router.post("/", letterDispositionData);

export default router;