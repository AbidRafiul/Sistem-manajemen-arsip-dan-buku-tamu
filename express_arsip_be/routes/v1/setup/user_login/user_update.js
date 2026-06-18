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
        // 🔥 UBAH 1: TargetUsername diganti jadi UserId
        UserId: Joi.number().required().label("UserId"), 
        Fullname: Joi.string().max(100).required().label("Fullname"),
        Username: Joi.string().max(100).required().label("Username"),
        Telp: Joi.string()
          .pattern(/^[0-9]+$/)
          .max(13)
          .required()
          .label("Telp"),
        Role: Joi.any().required(),
        Password: Joi.string().optional().allow(''),
        Status: Joi.string().required().label("Status"),
      },
      { "any.required": "{#label} wajib diisi" },
      oPayload,
      {
        uniqueField: ["Username", "Telp"],
        table: "mst_users",
        // 🔥 UBAH 2: Excluded field sesuaikan dengan UserId
        excludedField: "UserId", 
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
      Fullname: oPayload.Fullname,
      Username: oPayload.Username, // Update username jika berubah
      Telp: oPayload.Telp,
      Status: oPayload.Status == "1" ? "active" : "nonactive",
      UpdatedAt: formatDateSystem(),
    };

    if (oPayload.Password) {
      const cPassword =
        process.env.USER_KEY + oPayload.Username + oPayload.Password;
      const secret = process.env.USER_SECRET;
      oDataUser["Password"] = hmac(cPassword, secret, "sha512");
    }

    // TRANSAKSI UPDATE
    await DB.transaction(async (trx) => {
      // 🔥 UBAH 3: Langsung ambil UserId dari payload, nggak perlu query nyari Username lagi
      const userId = oPayload.UserId;

      // 2. Update mst_users
      await trx("mst_users")
        .where("UserId", userId)
        .update(oDataUser);

      // 3. Update mst_user_roles (pake UserId)
      await trx("mst_user_roles")
        .where("UserId", userId)
        .update({
            RoleId: oPayload.Role || null,
        });

      // UBAH 4: Diberi comment sementara agar Knex tidak error karena update object kosong
      /*
      await trx("user_navigation")
        .where("UserId", userId) 
        .update({ 
             // Kalau menu perlu diupdate berdasarkan Role, tarik lagi dari mst_navigation
        });
      */
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