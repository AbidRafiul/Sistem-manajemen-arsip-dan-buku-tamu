import { formatDateSystem } from "./general.js"; // Memanfaatkan tool lo yang udah ada
import DB from "../../../../core/config/knex.js"

export const buildAndCacheMenu = async (id_peran) => {
    try {
        // 1. Ambil nama peran (karena di tabel mst_navigasi kolom 'peran' nyimpen string nama perannya, bukan ID)
        const roleData = await DB("mst_peran").where("id_peran", id_peran).first();
        if (!roleData) throw new Error("Peran tidak ditemukan");

        // 2. Ambil data menu mentah yang diizinkan untuk peran ini dari tabel mst_peran_menu
        const rawMenus = await DB("mst_menu as m")
            .join("mst_peran_menu as pm", "m.id_menu", "pm.id_menu")
            .where("pm.id_peran", id_peran)
            .where("m.status_aktif", 1)
            .select("m.*")
            .orderBy("m.urutan", "asc");

        // 3. Fungsi rekursif (pengulangan) untuk merakit struktur Parent-Child
        const buildTree = (parentId = null) => {
            return rawMenus
                .filter(menu => menu.id_menu_induk === parentId)
                .map(menu => ({
                    label: menu.nama_menu,
                    icon: menu.ikon_menu,
                    to: menu.jalur_menu,
                    items: buildTree(menu.id_menu) // Cari anaknya lagi
                }))
                // Bersihkan menu parent yang nggak punya anak dan nggak punya link (to)
                .filter(menu => (menu.items && menu.items.length > 0) || menu.to);
        };

        const menuTree = buildTree(null);

        // 4. Cek apakah di mst_navigasi sudah ada baris untuk peran ini
        const existingCache = await DB("mst_navigasi").where("peran", roleData.nama_peran).first();

        const payloadCache = {
            menu: JSON.stringify(menuTree),
            peran: roleData.nama_peran,
            // Jika mau update created_at/updated_at, bisa disesuaikan
        };

        if (existingCache) {
            // Update kalau udah ada
            await DB("mst_navigasi")
                .where("peran", roleData.nama_peran)
                .update(payloadCache);
        } else {
            // Insert kalau belum ada
            payloadCache.created_at = formatDateSystem();
            await DB("mst_navigasi").insert(payloadCache);
        }

        return menuTree;
    } catch (error) {
        console.error("Gagal merakit menu:", error);
        throw error;
    }
};
