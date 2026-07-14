import express from "express";
import DB from "../../../../core/config/knex.js";
import { status, formatDateSystem, datetime } from "../../components/tools/general.js";
import { Logging, validatePayload } from "../../components/tools/servertool.js";
import Joi from "joi";

const router = express.Router();

router.post("/data", async (req, res) => {
  try {
    const rawData = await DB("mst_menu")
      .select(
        "id_menu as id",
        "id_menu as id_menu",
        "id_menu_induk as id_menu_induk",
        "kode_menu as kode_menu",
        "nama_menu as name",
        "nama_menu as nama_menu",
        "jalur_menu as jalur_menu",
        "ikon_menu as ikon_menu",
        "urutan as urutan",
        "status_aktif as status_aktif",
      )
      .orderBy("urutan", "asc");

    // Flatten hierarchical tree to array
    const buildFlatTree = (parentId = null) => {
      let result = [];
      const children = rawData.filter((item) => item.id_menu_induk === parentId);
      for (const child of children) {
        result.push(child);
        result = result.concat(buildFlatTree(child.id));
      }
      return result;
    };

    const data = buildFlatTree(null);

    return res.status(200).json({ status: "SUKSES", data });
  } catch (error) {
    return res.status(500).json({ status: "GAGAL", error: error.message });
  }
});

router.post("/delete", async (req, res) => {
    try {
        const { IdMenu } = req.body;

        await DB("mst_peran_menu").whereIn("id_menu", IdMenu).del();
        await DB("mst_menu").whereIn("id_menu", IdMenu).del();

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

router.post("/insert", async (req, res) => {
    try {
        const { id_peran, ...dataMenu } = req.body;

        const [id_menu] = await DB("mst_menu").insert({
            ...dataMenu,
            created_at: new Date(),
            updated_at: new Date()
        });

        if (id_peran) {
            const peranArray = Array.isArray(id_peran) ? id_peran : [id_peran];
            if (peranArray.length > 0) {
                const insertPeranMenu = peranArray.map((peran) => ({
                    id_menu: id_menu,
                    id_peran: peran,
                    created_at: new Date(),
                    updated_at: new Date()
                }));
                await DB("mst_peran_menu").insert(insertPeranMenu);
            }
        }

        return res.status(200).json({ message: "Menu berhasil ditambah!" });
    } catch (error) {
        console.error("ERROR INSERT MENU:", error);
        return res.status(500).json({ error: error.message });
    }
});

router.post("/update", async (req, res) => {
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

import { buildAndCacheMenu } from "../../components/tools/menu_builder.js";

router.post("/rebuild", async (req, res) => {
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
