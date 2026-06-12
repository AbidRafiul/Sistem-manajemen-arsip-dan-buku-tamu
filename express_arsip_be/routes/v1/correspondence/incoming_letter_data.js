import express from "express";
import DB from "../../../core/config/knex.js";
import { Logging } from "../components/tools/servertool.js";

const router = express.Router();

const incomingLetterData = async (req, res) => {
  const cFile = "incoming_letter_data.js";
  const cFunc = "incomingLetterData";

  try {
    const oPayload = req.body || {};

    const oQuery = DB("trs_incoming_letters as til")
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
      .orderBy("til.CreatedAt", "desc");

    if (oPayload.Keyword) {
      oQuery.where((oBuilder) => {
        oBuilder
          .where("til.AgendaNumber", "like", `%${oPayload.Keyword}%`)
          .orWhere("til.LetterNumber", "like", `%${oPayload.Keyword}%`)
          .orWhere("til.SenderName", "like", `%${oPayload.Keyword}%`)
          .orWhere("til.SenderInstitution", "like", `%${oPayload.Keyword}%`)
          .orWhere("til.Subject", "like", `%${oPayload.Keyword}%`);
      });
    }

    if (oPayload.Status) {
      oQuery.where("til.Status", oPayload.Status);
    }

    if (oPayload.StartDate && oPayload.EndDate) {
      oQuery.whereBetween("til.ReceivedDate", [
        oPayload.StartDate,
        oPayload.EndDate,
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
