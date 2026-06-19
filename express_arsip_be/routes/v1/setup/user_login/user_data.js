import express from "express";
import DB from "../../../../core/config/knex.js";
import {
  datetime,
  formatDateSystem,
  status,
} from "../../components/tools/general.js";
import { Logging } from "../../components/tools/servertool.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { body } = req;
  const oPayload = body;
  const username = req?.auth?.username || "";

  try {
    // JOIN murni cuma buat ngambil Role dari mst_user_roles
    const vaData = await DB("mst_users as mu")
      .leftJoin("mst_user_roles as mur", "mu.user_id", "mur.user_id")
      .leftJoin("mst_roles as mr", "mur.role_id", "mr.role_id")
      .select(
        "mu.user_id as user_id",
        "mu.username as username",
        "mu.fullname as fullname",
        "mu.telp as telp",
        "mu.status as status",
        "mu.created_at as created_at",
        "mr.role_name as role", 
      )
      .orderBy("mu.created_at", "desc");

    return res.status(200).json({
      status: status.SUKSES,
      message: "Data ditemukan",
      datetime: formatDateSystem(),
      data: vaData,
      total_data: vaData.length,
    });
  } catch (error) {
    const oResult = {
      status: status.BAD_REQUEST,
      message: "Sistem sedang maintenance",
      datetime: datetime(),
    };
    Logging(error, {
      file: "user_data.js",
      func: "get",
      request: oPayload,
      response: oResult,
      user: username,
    });
    return res.status(500).json(oResult);
  }
});

export default router;
