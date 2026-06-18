import express from "express";
import Joi from "joi";
import DB from "../../../core/config/knex.js";
import { validatePayload } from "../components/tools/servertool.js";

const router = express.Router();

const letterDispositionData = async (req, res) => {
  try {
    const oPayload = req.body || {};

    const oValidation = {
      incoming_letter_id: Joi.number().allow(null).optional(),
      to_user_id: Joi.number().allow(null).optional(),
      from_user_id: Joi.number().allow(null).optional(),
      status: Joi.string()
        .valid("baru", "dibaca", "diproses", "selesai")
        .allow(null, "")
        .optional(),
      keyword: Joi.string().allow(null, "").optional(),
    };

    const oMessage = {
      "incoming_letter_id.number": "incoming_letter_id harus berupa angka",
      "to_user_id.number": "to_user_id harus berupa angka",
      "from_user_id.number": "from_user_id harus berupa angka",
      "status.valid": "status disposisi tidak valid",
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

    const oQuery = DB("trx_letter_dispositions as tld")
      .leftJoin(
        "trx_incoming_letters as til",
        "tld.incoming_letter_id",
        "til.incoming_letter_id"
      )
      .leftJoin(
        "mst_disposition_instructions as mdi",
        "tld.disposition_instruction_id",
        "mdi.disposition_instruction_id"
      )
      .leftJoin("mst_users as from_user", "tld.from_user_id", "from_user.UserId")
      .leftJoin("mst_users as to_user", "tld.to_user_id", "to_user.UserId")
      .leftJoin("mst_users as processed_user", "tld.updated_by", "processed_user.UserId")
      .select(
        "tld.disposition_id",
        "tld.incoming_letter_id",
        "til.agenda_number",
        "til.letter_number",
        "til.subject",
        "til.sender_name",
        "til.status as letter_status",

        "tld.parent_disposition_id",
        "tld.from_user_id",
        "from_user.Fullname as from_user_name",
        "tld.to_user_id",
        "to_user.Fullname as to_user_name",
        "processed_user.Fullname as processed_by_name",
        "tld.disposition_instruction_id",
        "mdi.instruction_name",

        "tld.instruction",
        "tld.disposition_note",
        "tld.due_date",
        "tld.status",
        "tld.received_at",
        "tld.processed_at",
        "tld.completed_at",

        "tld.created_by",
        "tld.updated_by",
        "tld.created_at",
        "tld.updated_at"
      )
      .orderBy("tld.created_at", "desc");

    if (oPayload.incoming_letter_id) {
      oQuery.where("tld.incoming_letter_id", oPayload.incoming_letter_id);
    }

    if (oPayload.to_user_id) {
      oQuery.where("tld.to_user_id", oPayload.to_user_id);
    }

    if (oPayload.from_user_id) {
      oQuery.where("tld.from_user_id", oPayload.from_user_id);
    }

    if (oPayload.status) {
      oQuery.where("tld.status", oPayload.status);
    }

    if (oPayload.keyword) {
      oQuery.where((oBuilder) => {
        oBuilder
          .where("til.agenda_number", "like", `%${oPayload.keyword}%`)
          .orWhere("til.letter_number", "like", `%${oPayload.keyword}%`)
          .orWhere("til.subject", "like", `%${oPayload.keyword}%`)
          .orWhere("til.sender_name", "like", `%${oPayload.keyword}%`)
          .orWhere("tld.instruction", "like", `%${oPayload.keyword}%`)
          .orWhere("tld.disposition_note", "like", `%${oPayload.keyword}%`);
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
