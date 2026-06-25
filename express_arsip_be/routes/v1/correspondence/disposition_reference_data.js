import express from "express";
import DB from "../../../core/config/knex.js";

const router = express.Router();

const dispositionReferenceData = async (req, res) => {
  try {
    const [vaUsers, vaInstructions] = await Promise.all([
      DB("mst_pengguna")
        .select(
          "nama_pengguna",
          "nama_lengkap",
          "nama_pengguna",
          "id_jabatan",
          "status",
        )
        .where("status", "active")
        .orderBy("nama_lengkap", "asc"),
      DB("mst_disposition_instructions")
        .select(
          "disposition_instruction_id",
          "instruction_code",
          "instruction_name",
          "deskripsi",
          "status",
        )
        .where("status", "active")
        .orderBy("instruction_name", "asc"),
    ]);

    return res.status(200).json({
      status: true,
      message: "Referensi disposisi berhasil diambil",
      data: {
        users: vaUsers,
        instructions: vaInstructions,
      },
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      status: false,
      message: "Referensi disposisi gagal diambil",
      error: error.message,
    });
  }
};

router.post("/", dispositionReferenceData);

export default router;
