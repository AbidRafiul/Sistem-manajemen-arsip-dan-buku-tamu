import express from "express";
import DB from "../../../../core/config/knex.js";
import { buildAndCacheMenu } from "../../components/tools/menu_builder.js";

const router = express.Router();

router.post("/", async (req, res) => {
    try {
        const roles = await DB("mst_peran").select("id_peran");
        for (const role of roles) {
            await buildAndCacheMenu(role.id_peran);
        }
        return res.status(200).json({ status: "SUKSES", message: "Cache Menu Berhasil Di-build" });
    } catch (error) {
        return res.status(500).json({ status: "GAGAL", error: error.message });
    }
});

export default router;
