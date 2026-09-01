import express from "express";
import DB from "../../../core/config/knex.js";
import { formatDateSystem } from "../components/tools/general.js";
import { getPresignedUrlFromMinio } from "../../../core/components/tools/minio_helper.js";
import { Logging } from "../components/tools/servertool.js";
const router = express.Router();
router.post("/", async (req, res) => {
  const {
    body: oPayload
  } = req;
  try {
    if (!oPayload.VisitationId) {
      return res.status(400).json({
        status: "01",
        message: "VisitationId wajib diisi"
      });
    }
    const oRow = await DB("trx_kunjungan as t").select("t.*", "mp.nama_tujuan_kunjungan as VisitPurposeName", "u.nama_lengkap as HostFullname", "c.nama_cabang as BranchName").leftJoin("mst_tujuan_kunjungan as mp", "t.id_tujuan_kunjungan", "mp.id_tujuan_kunjungan").leftJoin("mst_pengguna as u", "t.id_user_host", "u.id_pengguna").leftJoin("mst_cabang as c", "t.id_cabang", "c.id_cabang").where("t.id_kunjungan", oPayload.VisitationId).first();
    if (!oRow) {
      return res.status(404).json({
        status: "01",
        message: "Data tidak ditemukan"
      });
    }
    if (oRow.foto_wajah) {
      oRow.PhotoFaceUrl = oRow.foto_wajah.startsWith("http") ? oRow.foto_wajah : await getPresignedUrlFromMinio("arsip-bucket", oRow.foto_wajah);
    } else {
      oRow.PhotoFaceUrl = null;
    }
    if (oRow.foto_identitas) {
      oRow.PhotoIdentityUrl = oRow.foto_identitas.startsWith("http") ? oRow.foto_identitas : await getPresignedUrlFromMinio("arsip-bucket", oRow.foto_identitas);
    } else {
      oRow.PhotoIdentityUrl = null;
    }
    if (oRow.tanda_tangan) {
      oRow.SignatureUrl = oRow.tanda_tangan.startsWith("http") ? oRow.tanda_tangan : await getPresignedUrlFromMinio("arsip-bucket", oRow.tanda_tangan);
    } else {
      oRow.SignatureUrl = null;
    }

    // Fetch group members if visit is a group
    let groupMembers = [];
    if (oRow.tipe_kunjungan === "group") {
      groupMembers = await DB("trx_kunjungan_anggota").where("id_kunjungan", oRow.id_kunjungan);

      // Map file URLs for group members
      groupMembers = await Promise.all(groupMembers.map(async m => {
        if (m.foto_identitas) {
          m.PhotoIdentityUrl = m.foto_identitas.startsWith("http") ? m.foto_identitas : await getPresignedUrlFromMinio("arsip-bucket", m.foto_identitas);
        } else {
          m.PhotoIdentityUrl = null;
        }
        return m;
      }));
    }
    oRow.group_members = groupMembers;
    return res.status(200).json({
      status: "00",
      message: "OK",
      data: oRow,
      datetime: formatDateSystem()
    });
  } catch (error) {
    const oResult = {
      status: "01",
      message: "Sistem error",
      datetime: formatDateSystem()
    };
    Logging(error, {
      file: "visit_detail.js",
      func: "handler",
      request: req.body || {},
      response: oResult,
      user: ""
    });
    return res.status(500).json(oResult);
  }
});
export default router;
