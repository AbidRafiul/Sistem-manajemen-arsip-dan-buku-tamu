import minioClient from '../../config/minio.js';
import DB from '../../config/knex.js';

const MINIO_BUCKET_NAME = process.env.MINIO_BUCKET_NAME || 'arsip-bucket';

/**
 * Helper untuk upload file ke MinIO.
 * @param {string} bucketName - Nama bucket (contoh: 'berkas-bukutamu')
 * @param {object} file - Objek file dari Multer (req.file)
 * @param {string} [folderPath=""] - Folder tujuan upload (contoh: 'documents' atau 'photos/20260629')
 * @returns {string} - Nama/Path file unik yang berhasil diupload
 */
const uploadFileToMinio = async (bucketName, file, folderPath = "") => {
    try {
        // 1. Cek apakah bucket-nya sudah ada, kalau belum biar otomatis dibikinin
        const exists = await minioClient.bucketExists(bucketName);
        if (!exists) {
            await minioClient.makeBucket(bucketName);
            console.log(`Bucket '${bucketName}' berhasil dibuat.`);
        }

        // 2. Bikin nama file unik biar gak bentrok kalau ada file bernama sama
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = file.originalname.split('.').pop();
        const baseName = `${uniqueSuffix}.${ext}`;
        const objectName = folderPath ? `${folderPath.replace(/\/$/, '')}/${baseName}` : baseName;

        // 3. Eksekusi upload ke MinIO
        await minioClient.putObject(
            bucketName,
            objectName,
            file.buffer, // Ini butuh Multer memoryStorage
            file.size,
            { 'Content-Type': file.mimetype }
        );

        console.log(`Berhasil upload ${objectName} ke bucket ${bucketName}`);

        // 4. Kembalikan nama/path objeknya
        return objectName;

    } catch (error) {
        console.error("Gagal upload ke MinIO:", error);
        throw error;
    }
};

/**
 * Helper untuk download file dari MinIO.
 * @param {string} bucketName - Nama bucket
 * @param {string} objectName - Nama objek/file di MinIO
 * @returns {Promise<stream.Readable>} - Stream pembacaan file
 */
const downloadFileFromMinio = async (bucketName, objectName) => {
    try {
        const stream = await minioClient.getObject(bucketName, objectName);
        return stream;
    } catch (error) {
        console.error("Gagal download dari MinIO:", error);
        throw error;
    }
};

/**
 * Helper untuk menghapus file dari MinIO.
 * @param {string} bucketName - Nama bucket
 * @param {string} objectName - Nama objek/file di MinIO
 */
const removeFileFromMinio = async (bucketName, objectName) => {
    try {
        await minioClient.removeObject(bucketName, objectName);
    } catch (error) {
        console.error("Gagal menghapus file dari MinIO:", error);
        throw error;
    }
};

/**
 * Helper untuk menyusun hirarki prefix folder MinIO berdasarkan silsilah cabang
 * @param {number|string} idCabang - ID Cabang milik uploader
 * @returns {Promise<string>} - Prefix hirarki (contoh: "BR-001/BR-002/BR-003")
 */
const getMinioPrefix = async (idCabang) => {
    if (!idCabang) return 'GLOBAL';

    let currentId = idCabang;
    const hierarchy = [];

    try {
        while (currentId) {
            const branch = await DB("mst_cabang")
                .select("id_cabang", "kode_cabang", "id_induk")
                .where("id_cabang", currentId)
                .first();

            if (!branch) break;

            hierarchy.unshift(branch.kode_cabang || `CAB-${branch.id_cabang}`);

            // Naik ke parent
            currentId = branch.id_induk;
        }
    } catch (e) {
        console.error("Gagal getMinioPrefix:", e);
    }

    if (hierarchy.length === 0) return 'GLOBAL';
    return hierarchy.join('/');
};

/**
 * Helper untuk menghasilkan pre-signed URL dari MinIO (akses sementara).
 * @param {string} bucketName - Nama bucket
 * @param {string} objectName - Nama objek/file di MinIO
 * @param {number} [expiry=3600] - Masa berlaku URL dalam detik (default: 1 jam)
 * @returns {Promise<string>} - Pre-signed URL
 */
const getPresignedUrlFromMinio = async (bucketName, objectName, expiry = 3600) => {
    try {
        const url = await minioClient.presignedGetObject(bucketName, objectName, expiry);
        return url;
    } catch (error) {
        console.error("Gagal generate presigned URL dari MinIO:", error);
        return null;
    }
};

export { uploadFileToMinio, downloadFileFromMinio, removeFileFromMinio, getMinioPrefix, getPresignedUrlFromMinio, MINIO_BUCKET_NAME };
