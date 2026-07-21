import minioClient from '../../config/minio.js';
import DB from '../../config/knex.js';

const MINIO_BUCKET_NAME = process.env.MINIO_BUCKET_NAME || 'arsip-bucket';

/**
 * Helper untuk menyusun hirarki prefix folder MinIO berdasarkan silsilah cabang
 * @param {number|string} idCabang - ID Cabang milik uploader
 * @returns {Promise<string>} - Prefix hirarki (contoh: "PUSAT-JAKARTA/PUSAT-SURABAYA")
 */
const getMinioPrefix = async (idCabang, idDepartemen = null, idDivisi = null, idUnitKerja = null) => {
    if (!idCabang) return 'GLOBAL';

    let currentId = parseInt(idCabang, 10);
    if (isNaN(currentId)) return 'GLOBAL';

    const hierarchy = [];

    try {
        while (currentId) {
            const branch = await DB("mst_cabang")
                .select("id_cabang", "kode_cabang", "nama_cabang", "id_induk")
                .where("id_cabang", currentId)
                .first();

            if (!branch) break;

            const rawName = branch.nama_cabang || branch.kode_cabang || `CAB-${branch.id_cabang}`;
            const sanitizedName = rawName
                .trim()
                .replace(/\s+/g, "-")
                .replace(/[^a-zA-Z0-9_-]/g, "")
                .toUpperCase();

            hierarchy.unshift(sanitizedName);

            // Naik ke parent
            currentId = branch.id_induk;
        }

        // Add Departemen
        if (idDepartemen) {
            const dept = await DB("mst_departemen").select("nama_departemen").where("id_departemen", idDepartemen).first();
            if (dept && dept.nama_departemen) {
                hierarchy.push(dept.nama_departemen.replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_').toLowerCase());
            }
        }

        // Add Divisi
        if (idDivisi) {
            const div = await DB("mst_divisi").select("nama_divisi").where("id_divisi", idDivisi).first();
            if (div && div.nama_divisi) {
                hierarchy.push(div.nama_divisi.replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_').toLowerCase());
            }
        }

        // Add Unit Kerja
        if (idUnitKerja) {
            const unit = await DB("mst_unit_kerja").select("nama_unit_kerja").where("id_unit_kerja", idUnitKerja).first();
            if (unit && unit.nama_unit_kerja) {
                hierarchy.push(unit.nama_unit_kerja.replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_').toLowerCase());
            }
        }
    } catch (e) {
        console.error("Gagal getMinioPrefix:", e);
    }

    if (hierarchy.length === 0) return 'GLOBAL';
    return hierarchy.join('/');
};

/**
 * Enterprise Helper untuk upload file ke MinIO sesuai hirarki kantor & penamaan terstruktur berdasarkan metadata.
 * @param {string} bucketName - Nama bucket (contoh: 'arsip-bucket')
 * @param {object} file - Objek file dari Multer (req.file)
 * @param {object|string} [options={}] - Opsi konfigurasi metadata upload
 *   - options.idCabang: ID Cabang untuk hirarki
 *   - options.modul: Modul tujuan (contoh: 'arsip-dokumen', 'surat-masuk', 'buku-tamu')
 *   - options.nomorDokumen: Nomor dokumen dari form metadata (contoh: 'SBY-SK-2026-004')
 *   - options.namaDokumen: Nama dokumen dari form metadata (contoh: 'SK Direksi Pengangkatan Karyawan')
 *   - options.version: Label versi file (contoh: 'V1')
 * @returns {Promise<string>} - Nama/Path file unik yang berhasil diupload (objectName)
 */
const uploadFileToMinio = async (bucketName, file, options = {}) => {
    try {
        // 1. Cek & pastikan bucket ada
        const exists = await minioClient.bucketExists(bucketName);
        if (!exists) {
            await minioClient.makeBucket(bucketName);
            console.log(`Bucket '${bucketName}' berhasil dibuat.`);
        }

        // Parse metadata options
        let idCabang = null;
        let modul = 'documents';
        let nomorDokumen = '';
        let namaDokumen = '';
        let versionLabel = '';

        if (typeof options === 'string') {
            modul = options.replace(/\/$/, '') || 'documents';
        } else if (typeof options === 'object' && options !== null) {
            idCabang = options.idCabang || null;
            modul = options.modul || 'documents';
            nomorDokumen = options.nomorDokumen || options.customPrefix || '';
            namaDokumen = options.namaDokumen || '';
            versionLabel = options.version || '';
        }

        // 2. Susun hirarki folder cabang (PUSAT-JAKARTA/PUSAT-SURABAYA/...)
        const branchPrefix = await getMinioPrefix(idCabang);
        const yearFolder = new Date().getFullYear();
        const folderPath = `${branchPrefix}/${modul}/${yearFolder}`;

        // 3. Susun penamaan file bersih dari metadata (tanpa angka acak timestamp)
        const ext = file.originalname.split('.').pop();

        let cleanNomor = nomorDokumen
            ? String(nomorDokumen).trim().replace(/[^a-zA-Z0-9_-]/g, "-")
            : "";

        let cleanNama = namaDokumen
            ? String(namaDokumen).trim().replace(/\s+/g, "-").replace(/[^a-zA-Z0-9_-]/g, "")
            : "";

        if (cleanNama.length > 40) cleanNama = cleanNama.substring(0, 40);

        const vString = versionLabel ? `_${String(versionLabel).toUpperCase()}` : '_V1';

        let baseName = "";
        if (cleanNomor && cleanNama) {
            baseName = `${cleanNomor}_${cleanNama}${vString}.${ext}`;
        } else if (cleanNomor) {
            baseName = `${cleanNomor}${vString}.${ext}`;
        } else if (cleanNama) {
            baseName = `${cleanNama}${vString}.${ext}`;
        } else {
            const raw = file.originalname.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "-");
            baseName = `${raw}${vString}_${Date.now()}.${ext}`;
        }

        const objectName = `${folderPath}/${baseName}`;

        // 4. Put object ke MinIO
        await minioClient.putObject(
            bucketName,
            objectName,
            file.buffer,
            file.size,
            { 'Content-Type': file.mimetype }
        );

        console.log(`[Metadata MinIO Upload] Berhasil upload -> ${bucketName}/${objectName}`);

        return objectName;

    } catch (error) {
        console.error("Gagal upload ke MinIO:", error);
        throw error;
    }
};

/**
 * Helper fleksibel untuk download file dari MinIO.
 */
const downloadFileFromMinio = async (bucketName, objectName) => {
    try {
        const cleanedObject = String(objectName).replace(/^\/uploads\//, "").replace(/^\//, "");
        const stream = await minioClient.getObject(bucketName, cleanedObject);
        return stream;
    } catch (error) {
        console.error(`Gagal download dari MinIO (${objectName}):`, error.message);
        throw error;
    }
};

/**
 * Helper untuk menghapus file dari MinIO.
 */
const removeFileFromMinio = async (bucketName, objectName) => {
    try {
        const cleanedObject = String(objectName).replace(/^\/uploads\//, "").replace(/^\//, "");
        await minioClient.removeObject(bucketName, cleanedObject);
    } catch (error) {
        console.error(`Gagal menghapus file dari MinIO (${objectName}):`, error.message);
        throw error;
    }
};

/**
 * Helper untuk menghasilkan pre-signed URL dari MinIO (akses sementara).
 */
const getPresignedUrlFromMinio = async (bucketName, objectName, expiry = 3600) => {
    try {
        const cleanedObject = String(objectName).replace(/^\/uploads\//, "").replace(/^\//, "");
        const url = await minioClient.presignedGetObject(bucketName, cleanedObject, expiry);
        return url;
    } catch (error) {
        console.error("Gagal generate presigned URL dari MinIO:", error);
        return null;
    }
};

export {
    uploadFileToMinio,
    downloadFileFromMinio,
    removeFileFromMinio,
    getMinioPrefix,
    getPresignedUrlFromMinio,
    MINIO_BUCKET_NAME
};
