import express from "express";
import DB from "../../../core/config/knex.js";
import { formatDateSystem } from "../components/tools/general.js";
import { getPresignedUrlFromMinio } from "../../../core/components/tools/minio_helper.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { body: oPayload } = req;
  try {
    if (!oPayload.VisitationId) {
      return res
        .status(400)
        .json({ status: "01", message: "VisitationId wajib diisi" });
    }

    const row = await DB("trs_kunjungan as t")
      .select(
        "t.*",
        "mp.nama_tujuan_kunjungan as VisitPurposeName",
        "u.nama_lengkap as HostFullname",
        "c.nama_cabang as BranchName"
      )
      .leftJoin("mst_tujuan_kunjungan as mp", "t.id_tujuan_kunjungan", "mp.id_tujuan_kunjungan")
      .leftJoin("mst_pengguna as u", "t.id_user_host", "u.id_pengguna")
      .leftJoin("mst_cabang as c", "t.id_cabang", "c.id_cabang")
      .where("t.id_kunjungan", oPayload.VisitationId)
      .first();

    if (!row) {
      return res
        .status(404)
        .json({ status: "01", message: "Data tidak ditemukan" });
    }

    if (row.foto_wajah) {
      row.PhotoFaceUrl = row.foto_wajah.startsWith("http")
        ? row.foto_wajah
        : await getPresignedUrlFromMinio("buku-tamu", row.foto_wajah);
    } else {
      row.PhotoFaceUrl = null;
    }

    if (row.foto_identitas) {
      row.PhotoIdentityUrl = row.foto_identitas.startsWith("http")
        ? row.foto_identitas
        : await getPresignedUrlFromMinio("buku-tamu", row.foto_identitas);
    } else {
      row.PhotoIdentityUrl = null;
    }

    if (row.tanda_tangan) {
      row.SignatureUrl = row.tanda_tangan.startsWith("http")
        ? row.tanda_tangan
        : await getPresignedUrlFromMinio("buku-tamu", row.tanda_tangan);
    } else {
      row.SignatureUrl = null;
    }

    // Fetch group members if visit is a group
    let groupMembers = [];
    if (row.tipe_kunjungan === "group") {
      groupMembers = await DB("trs_kunjungan_anggota")
        .where("id_kunjungan", row.id_kunjungan);

      // Map file URLs for group members
      groupMembers = groupMembers.map(m => {
        if (m.foto_identitas) {
          m.PhotoIdentityUrl = m.foto_identitas.startsWith("http")
            ? m.foto_identitas
            : `${cBaseUrl}/uploads/${m.foto_identitas}`;
        } else {
          m.PhotoIdentityUrl = null;
        }
        return m;
      });
    }
    row.group_members = groupMembers;

    return res.status(200).json({
      status: "00",
      message: "OK",
      data: row,
      datetime: formatDateSystem(),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "01",
      message: "Sistem error",
      datetime: formatDateSystem(),
    });
  }
});

export default router;
