import express from "express";
import DB from "../../../../core/config/knex.js";

const router = express.Router();

router.post("/", async (req, res) => {
    try {
        const { IdMenu } = req.body;

        await DB("mst_peran_menu").whereIn("id_menu", IdMenu).del();
        await DB("mst_menu").whereIn("id_menu", IdMenu).update({ status_aktif: 0, updated_at: new Date() });

        // Optional cache refresh
        // const roles = await DB("mst_peran").select("id_peran");
        // for (const role of roles) {
        //     await buildAndCacheMenu(role.id_peran);
        // }

        return res.status(200).json({ message: "Menu berhasil dihapus!" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

export default router;
