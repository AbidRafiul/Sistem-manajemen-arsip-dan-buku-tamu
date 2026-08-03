import express from "express";
import DB from "../../../../core/config/knex.js";
import { buildAndCacheMenu } from "../../components/tools/menu_builder.js";
import { Logging } from "../../components/tools/servertool.js";
const router = express.Router();
router.post("/", async (req, res) => {
  try {
    const roles = await DB("mst_peran").select("id_peran");
    for (const role of roles) {
      await buildAndCacheMenu(role.id_peran);
    }
    return res.status(200).json({
      status: "SUKSES",
      message: "Cache Menu Berhasil Di-build"
    });
  } catch (error) {
    const oResult = {
      status: "GAGAL",
      error: error.message
    };
    Logging(error, {
      file: "menu_rebuild.js",
      func: "handler",
      request: req.body || {},
      response: oResult,
      user: ""
    });
    return res.status(500).json(oResult);
  }
});
export default router;