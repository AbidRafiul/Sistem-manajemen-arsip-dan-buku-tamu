import express from "express";
import DB from "../../../core/config/knex.js";
import { Logging } from "../components/tools/servertool.js";

const router = express.Router();

const incomingLetterData = async (req, res) => {
  const cFile = "incoming_letter_data.js";
  const cFunc = "incomingLetterData";

  try {
    const oPayload = req.body || {};

    const oQuery = DB("trx_incoming_letters as til")
      .leftJoin("mst_letter_types as mlt", "til.letter_type_id", "mlt.letter_type_id")
      .select(
        "til.incoming_letter_id",
        "til.agenda_number",
        "til.letter_number",
        "til.letter_date",
        "til.received_date",
        "til.sender_name",
        "til.sender_institution",
        "til.subject",
        "til.attachment_description",
        "til.letter_type_id",
        "mlt.letter_type_name",
        "til.document_type_id",
        "til.archive_classification_id",
        "til.confidentiality_level_id",
        "til.status",
        "til.created_by",
        "til.updated_by",
        "til.created_at",
        "til.updated_at"
      )
      .orderBy("til.created_at", "desc");

    if (oPayload.keyword) {
      oQuery.where((oBuilder) => {
        oBuilder
          .where("til.agenda_number", "like", `%${oPayload.keyword}%`)
          .orWhere("til.letter_number", "like", `%${oPayload.keyword}%`)
          .orWhere("til.sender_name", "like", `%${oPayload.keyword}%`)
          .orWhere("til.sender_institution", "like", `%${oPayload.keyword}%`)
          .orWhere("til.subject", "like", `%${oPayload.keyword}%`);
      });
    }

    if (oPayload.status) {
      oQuery.where("til.status", oPayload.status);
    }

    if (oPayload.start_date && oPayload.end_date) {
      oQuery.whereBetween("til.received_date", [
        oPayload.start_date,
        oPayload.end_date,
      ]);
    }

    const vaData = await oQuery;

    return res.status(200).json({
      status: true,
      message: "Data surat masuk berhasil diambil",
      data: vaData,
    });
  } catch (error) {
    await Logging(error, {
      file: cFile,
      func: cFunc,
      request: JSON.stringify(req.body || {}),
      response: error.message,
      user: req?.user?.UserId || "",
    });

    return res.status(500).json({
      status: false,
      message: "Data surat masuk gagal diambil",
      error: error.message,
    });
  }
};

router.post("/", incomingLetterData);

export default router;
