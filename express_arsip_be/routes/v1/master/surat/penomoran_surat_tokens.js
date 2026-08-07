import express from "express";
import { NUMBERING_TOKENS } from "../../components/tools/letter_numbering_service.js";
import { formatDateSystem, status } from "../../components/tools/general.js";

const router = express.Router();

router.get("/", async (req, res) => {
  return res.status(200).json({
    status: status.SUKSES,
    message: "Token penomoran surat berhasil diambil",
    datetime: formatDateSystem(),
    data: NUMBERING_TOKENS,
  });
});

export default router;
