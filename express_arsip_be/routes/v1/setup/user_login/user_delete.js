import express from "express";
import {
  datetime,
  formatDateSystem,
  status,
} from "../../components/tools/general.js";
import Joi from "joi";
import DB from "../../../../core/config/knex.js";
import { Logging, validatePayload } from "../../components/tools/servertool.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { body: oPayload } = req;
  const username = req?.auth?.username || "";

  try {
    if (!oPayload || !oPayload.userId || !Array.isArray(oPayload.userId)) {
      return res.status(400).json({
        status: status.BAD_REQUEST,
        message: "Invalid request body: userId (array) is required",
        datetime: formatDateSystem(),
      });
    }

    // 🔥 PERBAIKAN VALIDASI: Ganti Username jadi userId
    const cValidation = await validatePayload(
      {
        userId: Joi.array().items(Joi.number()).required().label("UserId"),
      },
      { "any.required": "{#label} wajib diisi" },
      oPayload,
    );

    if (cValidation)
      return res.status(422).json({
        status: status.BAD_REQUEST,
        message: cValidation,
        datetime: datetime(),
      });

    // 🔥 TRANSAKSI SOFT DELETE (Mencakup mst_users & mst_user_roles)
    await DB.transaction(async (trx) => {
      // 1. Nonaktifkan di mst_users
      await trx("mst_users")
        .whereIn("user_id", oPayload.userId)
        .update({
          status: "nonactive",
          updated_at: formatDateSystem(),
        });

      // 2. Nonaktifkan juga di mst_user_roles
      await trx("mst_user_roles")
        .whereIn("user_id", oPayload.userId)
        .update({
          status: "nonactive",
          updated_at: formatDateSystem(),
        });
    });

    return res.status(200).json({
      status: status.SUKSES,
      message: "Data berhasil dinonaktifkan",
      datetime: formatDateSystem(),
    });
  } catch (error) {
    Logging(error, { file: "user_delete.js", func: "delete", request: oPayload, user: username });
    return res.status(500).json({
      status: status.BAD_REQUEST,
      message: "Sistem maintenance",
      datetime: datetime(),
    });
  }
});

export default router;
