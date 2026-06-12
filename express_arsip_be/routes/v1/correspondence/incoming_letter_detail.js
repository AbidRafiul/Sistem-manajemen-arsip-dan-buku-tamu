import express from "express";
import Joi from "joi";
import DB from "../../../core/config/knex.js";
import { validatePayload } from "../components/tools/servertool.js";

const router = express.Router();

const incomingLetterDetail = async (req, res) => {
  try {
    const oPayload = req.body || {};

    const oValidation = {
      IncomingLetterId: Joi.number().required(),
    };

    const oMessage = {
      "IncomingLetterId.required": "IncomingLetterId wajib diisi",
      "IncomingLetterId.number": "IncomingLetterId harus berupa angka",
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

    const oLetter = await DB("trs_incoming_letters as til")
      .leftJoin("mst_letter_types as mlt", "til.LetterTypeId", "mlt.LetterTypeId")
      .select(
        "til.IncomingLetterId",
        "til.AgendaNumber",
        "til.LetterNumber",
        "til.LetterDate",
        "til.ReceivedDate",
        "til.SenderName",
        "til.SenderInstitution",
        "til.Subject",
        "til.AttachmentDescription",
        "til.LetterTypeId",
        "mlt.LetterTypeName",
        "til.DocumentTypeId",
        "til.ArchiveClassificationId",
        "til.ConfidentialityLevelId",
        "til.Status",
        "til.CreatedBy",
        "til.UpdatedBy",
        "til.CreatedAt",
        "til.UpdatedAt"
      )
      .where("til.IncomingLetterId", oPayload.IncomingLetterId)
      .first();

    if (!oLetter) {
      return res.status(404).json({
        status: false,
        message: "Surat masuk tidak ditemukan",
      });
    }

    const vaFiles = await DB("trs_incoming_letter_files")
      .select(
        "IncomingLetterFileId",
        "IncomingLetterId",
        "FilePath",
        "FileName",
        "FileMimeType",
        "FileSize",
        "UploadedBy",
        "Status",
        "CreatedAt",
        "UpdatedAt"
      )
      .where("IncomingLetterId", oPayload.IncomingLetterId)
      .where("Status", "active")
      .orderBy("CreatedAt", "desc");

    const vaDispositions = await DB("trs_letter_dispositions as tld")
      .leftJoin(
        "mst_disposition_instructions as mdi",
        "tld.DispositionInstructionId",
        "mdi.DispositionInstructionId"
      )
      .select(
        "tld.DispositionId",
        "tld.IncomingLetterId",
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
      .where("tld.IncomingLetterId", oPayload.IncomingLetterId)
      .orderBy("tld.CreatedAt", "desc");

    const vaTrackings = await DB("trs_incoming_letter_trackings")
      .select(
        "IncomingLetterTrackingId",
        "IncomingLetterId",
        "DispositionId",
        "ActionName",
        "FromUserId",
        "ToUserId",
        "PreviousStatus",
        "CurrentStatus",
        "Notes",
        "ProcessedAt",
        "CreatedBy",
        "CreatedAt",
        "UpdatedAt"
      )
      .where("IncomingLetterId", oPayload.IncomingLetterId)
      .orderBy("ProcessedAt", "desc");

    return res.status(200).json({
      status: true,
      message: "Detail surat masuk berhasil diambil",
      data: {
        Letter: oLetter,
        Files: vaFiles,
        Dispositions: vaDispositions,
        Trackings: vaTrackings,
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