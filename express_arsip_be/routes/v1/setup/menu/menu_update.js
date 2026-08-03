import express from "express";
import DB from "../../../../core/config/knex.js";

const router = express.Router();

router.post("/", async (req, res) => {
    try {
        const { id_menu, id_peran, ...menuData } = req.body;

        await DB("mst_menu").where("id_menu", id_menu).update({
            ...menuData,
            updated_at: new Date()
        });

        await DB("mst_peran_menu").where("id_menu", id_menu).del();
        if (Array.isArray(id_peran) && id_peran.length > 0) {
            const vaPeranMenu = id_peran.map(id => ({ 
                id_menu, 
                id_peran: id,
                created_at: new Date(),
                updated_at: new Date()
            }));
            await DB("mst_peran_menu").insert(vaPeranMenu);
        }

        return res.status(200).json({ message: "Menu berhasil diupdate!" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

export default router;
