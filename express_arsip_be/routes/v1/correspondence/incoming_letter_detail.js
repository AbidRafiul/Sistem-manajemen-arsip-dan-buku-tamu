import express from "express";
import Joi from "joi";
import DB from "../../../core/config/knex.js";
import { validatePayload } from "../components/tools/servertool.js";

const router = express.Router();

const incomingLetterDetail = async (req, res) => {
  try {
    const oPayload = req.body || {};

    const oValidation = {
      incoming_letter_id: Joi.number().required(),
    };

    const oMessage = {
      "incoming_letter_id.required": "incoming_letter_id wajib diisi",
      "incoming_letter_id.number": "incoming_letter_id harus berupa angka",
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

    const oLetter = await DB("trx_incoming_letters as til")
      .leftJoin(
        "mst_letter_types as mlt",
        "til.letter_type_id",
        "mlt.letter_type_id",
      )
      .select(
        "til.incoming_letter_id",
        "til.agenda_number",
        "til.letter_number",
        "til.letter_date",
        "til.received_date",
        "til.sender_name",
        "til.sender_institution",
        "til.subject",
        "til.attachment_deskripsi",
        "til.letter_type_id",
        "mlt.letter_type_name",
        "til.document_type_id",
        "til.archive_classification_id",
        "til.confidentiality_level_id",
        "til.status",
        "til.created_by",
        "til.updated_by",
        "til.created_at",
        "til.updated_at",
      )
      .where("til.incoming_letter_id", oPayload.incoming_letter_id)
      .first();

    if (!oLetter) {
      return res.status(404).json({
        status: false,
        message: "Surat masuk tidak ditemukan",
      });
    }

    const vaFiles = await DB("trx_incoming_letter_files")
      .select(
        "incoming_letter_file_id",
        "incoming_letter_id",
        "file_path",
        "file_name",
        "file_mime_type",
        "file_size",
        "uploaded_by",
        "status",
        "created_at",
        "updated_at",
      )
      .where("incoming_letter_id", oPayload.incoming_letter_id)
      .where("status", "active")
      .orderBy("created_at", "desc");

    const vaDispositions = await DB("trx_letter_dispositions as tld")
      .leftJoin(
        "mst_disposition_instructions as mdi",
        "tld.disposition_instruction_id",
        "mdi.disposition_instruction_id",
      )
      .select(
        "tld.disid_jabatan",
        "tld.incoming_letter_id",
        "tld.parent_disid_jabatan",
        "tld.from_nama_pengguna",
        "tld.to_nama_pengguna",
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
        "tld.updated_at",
      )
      .where("tld.incoming_letter_id", oPayload.incoming_letter_id)
      .orderBy("tld.created_at", "desc");

    const vaTrackings = await DB("trx_incoming_letter_trackings")
      .select(
        "incoming_letter_tracking_id",
        "incoming_letter_id",
        "disid_jabatan",
        "action_name",
        "from_nama_pengguna",
        "to_nama_pengguna",
        "previous_status",
        "current_status",
        "notes",
        "processed_at",
        "created_by",
        "created_at",
        "updated_at",
      )
      .where("incoming_letter_id", oPayload.incoming_letter_id)
      .orderBy("processed_at", "desc");

    return res.status(200).json({
      status: true,
      message: "Detail surat masuk berhasil diambil",
      data: {
        letter: oLetter,
        files: vaFiles,
        dispositions: vaDispositions,
        trackings: vaTrackings,
      },
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      status: false,
      message: "Detail surat masuk gagal diambil",
      error: error.message,
    });
  }
};

router.post("/", incomingLetterDetail);

export default router;
