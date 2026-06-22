import "dotenv/config";
import express from "express";
import crypto from "crypto";
import {
  datetime,
  datetimeIso,
  status,
  uniqueId,
} from "../components/tools/general.js";
import { getClientSecret } from "../../../core/config/secret.js";
import DB from "../../../core/config/knex.js";
import { Logging } from "../components/tools/servertool.js";

const router = express.Router();

//get Token
router.get("/", async (req, res) => {
  try {
    const cAccessToken = crypto.randomBytes(32).toString("hex");

    await DB("access_token").insert({
      token: cAccessToken,
      expired: "0",
      datetime: datetimeIso(),
    });

    return res.status(200).json({
      status: status.SUKSES,
      message: "Token created",
      datetime: datetime(),
      access_token: cAccessToken,
      token_type: "Bearer",
    });
  } catch (oError) {
    console.log(oError);

    Logging(oError)

    return res.status(404).json({
      status: status.BAD_REQUEST,
      message: "Terjadi kesalahan pada sistem harap coba lagi nanti",
      datetime: datetime(),
    });
  }
});

export default router;
