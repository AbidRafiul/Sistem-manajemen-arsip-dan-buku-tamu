import DB from "../../../core/config/knex.js";
import { Logging } from "../components/tools/servertool.js";

const getDocumentCategories = async (req, res) => {
  try {
    const cStatus = req.query.status || "active";

    const vaData = await DB("mst_kategori_dokumen as dc")
      .select(
        "dc.id_kategori_dokumen",
        "dc.kode_kategori_dokumen",
        "dc.nama_kategori_dokumen",
        "dc.deskripsi",
        "dc.status",
        "ac.id_klasifikasi",
        "ac.kode_klasifikasi",
        "ac.nama_klasifikasi"
      )
      .leftJoin(
        "mst_klasifikasi_arsip as ac",
        "dc.kode_klasifikasi",
        "ac.kode_klasifikasi"
      )
      .where("dc.status", cStatus)
      .orderBy("dc.nama_kategori_dokumen", "asc");

    const oResult = {
      status: "success",
      message: "Document categories retrieved successfully",
      data: vaData,
    };

    return res.status(200).json(oResult);
  } catch (error) {
    const oResult = {
      status: "error",
      message: "Failed to retrieve document categories",
      error: error.message,
    };

    Logging(error, {
      file: "document_category_get.js",
      func: "getDocumentCategories",
      request: req.query,
      response: oResult,
      user: req?.context?.nama_pengguna || "system",
    });

    return res.status(500).json(oResult);
  }
};

export default getDocumentCategories;
