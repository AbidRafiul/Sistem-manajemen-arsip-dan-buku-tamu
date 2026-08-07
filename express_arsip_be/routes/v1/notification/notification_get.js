import express from "express";
import DB from "../../../core/config/knex.js";
import { Logging } from "../components/tools/servertool.js";
import { formatDateSystem } from "../components/tools/general.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const nUserId = req?.auth?.id_pengguna || req?.auth?.IdPengguna || null;
  const username = req?.auth?.nama_pengguna || "";

  try {
    if (!nUserId) {
      return res.status(401).json({
        status: "01",
        message: "Pengguna tidak terautentikasi",
        datetime: formatDateSystem(),
      });
    }

    // Get notifications for this user, ordered by created_at desc
    const vaData = await DB("trs_notifikasi")
      .where("id_pengguna", nUserId)
      .orWhereNull("id_pengguna") // support global notifications too
      .orderBy("created_at", "desc")
      .limit(30);

    // Calculate unread count
    const unreadCountRow = await DB("trs_notifikasi")
      .where({ status_baca: 0 })
      .andWhere((builder) => {
        builder.where("id_pengguna", nUserId).orWhereNull("id_pengguna");
      })
      .count({ count: "*" })
      .first();

    const nUnreadCount = Number(unreadCountRow?.count || 0);

    return res.status(200).json({
      status: "00",
      message: "Data notifikasi berhasil diambil",
      datetime: formatDateSystem(),
      data: vaData,
      unread_count: nUnreadCount,
    });
  } catch (error) {
    const oResult = {
      status: "01",
      message: "Gagal mengambil data notifikasi",
      datetime: formatDateSystem(),
    };

    Logging(error, {
      file: "notification_get.js",
      func: "get",
      request: req.query,
      response: oResult,
      user: username,
    });

    return res.status(500).json(oResult);
  }
});

export default router;
