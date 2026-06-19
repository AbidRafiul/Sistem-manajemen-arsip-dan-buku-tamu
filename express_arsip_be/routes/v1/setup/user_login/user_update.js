import express from "express";
import {
  datetime,
  formatDateSystem,
  hmac,
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
    if (!oPayload || Object.keys(oPayload).length < 1) {
      return res
        .status(400)
        .json({
          status: status.BAD_REQUEST,
          message: "Invalid request body",
          datetime: formatDateSystem(),
        });
    }

    const cValidation = await validatePayload(
      {
        user_id: Joi.number().required().label("user_id"), 
        fullname: Joi.string().max(100).required().label("fullname"),
        username: Joi.string().max(100).required().label("username"),
        telp: Joi.string()
          .pattern(/^[0-9]+$/)
          .max(13)
          .required()
          .label("telp"),
        role: Joi.any().required(),
        password: Joi.string().optional().allow(''),
        status: Joi.string().required().label("status"),
      },
      { "any.required": "{#label} wajib diisi" },
      oPayload,
      {
        uniqueField: ["username", "telp"],
        table: "mst_users",
        excludedField: "user_id", 
        allowUnknown: true,
      },
    );

    if (cValidation)
      return res
        .status(422)
        .json({
          status: status.BAD_REQUEST,
          message: cValidation,
          datetime: datetime(),
        });

    // Siapkan data update mst_users
    const oDataUser = {
      fullname: oPayload.fullname,
      username: oPayload.username, // Update username jika berubah
      telp: oPayload.telp,
      status: (oPayload.status == "1" || oPayload.status == "active") ? "active" : "nonactive",
      updated_at: formatDateSystem(),
    };

    if (oPayload.password) {
      const cPassword =
        process.env.USER_KEY + oPayload.username + oPayload.password;
      const secret = process.env.USER_SECRET;
      oDataUser["password"] = hmac(cPassword, secret, "sha512");
    }

    // TRANSAKSI UPDATE
    await DB.transaction(async (trx) => {
      const userId = oPayload.user_id;

      // 2. Update mst_users
      await trx("mst_users")
        .where("user_id", userId)
        .update(oDataUser);

      // 3. Update mst_user_roles (pake user_id)
      await trx("mst_user_roles")
        .where("user_id", userId)
        .update({
            role_id: oPayload.role || null,
        });
    });

    return res
      .status(200)
      .json({
        status: status.SUKSES,
        message: "Data berhasil diupdate",
        datetime: formatDateSystem(),
      });
  } catch (error) {
    console.log("ERROR DATABASE:", error); //TAMBAHKAN BARIS INI
    return res
      .status(500)
      .json({
        status: status.BAD_REQUEST,
        message: "Sistem maintenance",
        datetime: datetime(),
      });
  }
});

export default router;