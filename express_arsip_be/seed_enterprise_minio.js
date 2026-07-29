import DB from "./core/config/knex.js";
import { uploadFileToMinio } from "./core/components/tools/minio_helper.js";
import { processDocumentContent } from "./core/components/ocr_service.js";
import { logDocumentChange } from "./routes/v1/components/tools/audit_trail_helper.js";
import { v4 as uuidv4 } from "uuid";

/**
 * Enterprise MinIO & Database Seeder Script
 * Creates 5 distinct documents across different branch hierarchies in MinIO
 */

const makeValidPdf = (titleText, bodyText) => {
  const contentStr = `BT /F1 12 Tf 50 750 Td (${titleText}) Tj ET BT /F1 10 Tf 50 720 Td (${bodyText}) Tj ET`;
  const streamLength = Buffer.byteLength(contentStr);

  const pdf = `%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj
3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<</Font<</F1 4 0 R>>>>/Contents 5 0 R>>endobj
4 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj
5 0 obj<</Length ${streamLength}>>stream
${contentStr}
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000226 00000 n 
0000000293 00000 n 
trailer<</Size 6/Root 1 0 R>>
startxref
${390 + streamLength}
%%EOF`;

  return Buffer.from(pdf);
};

const seedData = [
  {
    id_cabang: 1, // Pusat Jakarta (BR-001)
    nama_dokumen: "Kontrak Pengadaan Cloud Server 2026",
    nomor_dokumen: "JKT/KONTRAK/2026/001",
    kode_jenis_dokumen: "KONTRAK",
    kode_kategori_dokumen: "HUK-AGR",
    kode_klasifikasi: "HUK",
    kode_tingkat_kerahasiaan: "RHS",
    lokasi_fisik: "Rak Legal 1 - Jakarta",
    body: "Surat Perjanjian Kontrak Layanan Cloud Server Infrastructure AWS GCP 2026 PT Marshtech Indonesia dan Vendor ABC"
  },
  {
    id_cabang: 5, // Pusat Bandung (BR-001/BR-005)
    nama_dokumen: "SOP Keselamatan Kerja dan Siber V2",
    nomor_dokumen: "BND/SOP/2026/002",
    kode_jenis_dokumen: "SOP",
    kode_kategori_dokumen: "PRD-SOP",
    kode_klasifikasi: "PRD",
    kode_tingkat_kerahasiaan: "INT",
    lokasi_fisik: "Lemari SOP Kantor Bandung",
    body: "Standard Operating Procedure SOP K3 Keselamatan Kerja Dan Sistem Proteksi Keamanan Siber Informasi Kantor Pusat Bandung"
  },
  {
    id_cabang: 11, // Cabang Cimahi (BR-001/BR-005/BR-011)
    nama_dokumen: "Laporan Audit Keuangan Triwulan Cimahi",
    nomor_dokumen: "CMH/KEU/2026/003",
    kode_jenis_dokumen: "LAPORAN",
    kode_kategori_dokumen: "KEU-LAP",
    kode_klasifikasi: "KEU",
    kode_tingkat_kerahasiaan: "SRHS",
    lokasi_fisik: "Brankas Keuangan Cimahi",
    body: "Laporan Hasil Audit Internal Dan Rekonsiliasi Neraca Keuangan Triwulan II Cabang Cimahi Tahun 2026"
  },
  {
    id_cabang: 2, // Pusat Surabaya (BR-001/BR-002)
    nama_dokumen: "SK Direksi Pengangkatan Karyawan Tetap",
    nomor_dokumen: "SBY/SK/2026/004",
    kode_jenis_dokumen: "SK",
    kode_kategori_dokumen: "ADM-UMUM",
    kode_klasifikasi: "HRD",
    kode_tingkat_kerahasiaan: "INT",
    lokasi_fisik: "Filing Cabinet HRD Surabaya",
    body: "Surat Keputusan SK Direksi Utama PT Marshtech Indonesia Tentang Pengangkatan Karyawan Tetap Divisi IT Dan Operasional Surabaya"
  },
  {
    id_cabang: 3, // Cabang Madiun (BR-001/BR-002/BR-003)
    nama_dokumen: "Perjanjian Kerjasama Vendor Logistik",
    nomor_dokumen: "MDN/HUK/2026/005",
    kode_jenis_dokumen: "KONTRAK",
    kode_kategori_dokumen: "HUK-AGR",
    kode_klasifikasi: "HUK",
    kode_tingkat_kerahasiaan: "PUB",
    lokasi_fisik: "Laci Legal Cabang Madiun",
    body: "Perjanjian Kerjasama PKS Pengiriman Dan Ekspedisi Paket Logistik Kantor Cabang Madiun Dengan PT JNE Express"
  }
];

async function runEnterpriseSeeder() {
  console.log("=================================================");
  console.log("  MENJALANKAN ENTERPRISE MINIO & DATABASE SEEDER  ");
  console.log("=================================================\n");

  const bucketName = process.env.MINIO_BUCKET_NAME || "arsip-bucket";
  const createdResults = [];

  // Clean existing seed records from database to prevent duplication
  const seedDocNumbers = seedData.map(s => s.nomor_dokumen);
  const existingSeedDocs = await DB("trs_dokumen").whereIn("nomor_dokumen", seedDocNumbers).select("kode_dokumen", "id_dokumen");
  if (existingSeedDocs.length > 0) {
    const existingKodes = existingSeedDocs.map(d => d.kode_dokumen);
    const existingIds = existingSeedDocs.map(d => d.id_dokumen);
    await DB("trs_versi_dokumen").whereIn("kode_dokumen", existingKodes).del();
    await DB("trs_dokumen").whereIn("id_dokumen", existingIds).del();
    console.log(`[Seeder Clean] De-duplicated ${existingSeedDocs.length} previous seed document records.`);
  }

  for (const item of seedData) {
    const dNow = new Date();
    const cPic = "Superadmin SIAB";

    // 1. Generate PDF buffer
    const pdfBuffer = makeValidPdf(item.nama_dokumen, item.body);
    const mockFile = {
      originalname: `${item.nomor_dokumen.replace(/\//g, "-")}.pdf`,
      buffer: pdfBuffer,
      size: pdfBuffer.length,
      mimetype: "application/pdf"
    };

    // 2. Upload file to MinIO with Branch Hierarchy & Metadata Naming
    const objectPath = await uploadFileToMinio(bucketName, mockFile, {
      idCabang: item.id_cabang,
      modul: "arsip-dokumen",
      nomorDokumen: item.nomor_dokumen,
      namaDokumen: item.nama_dokumen,
      version: "V1"
    });

    console.log(`[MinIO Object Created]: ${objectPath}`);

    // 3. Generate Kode Dokumen
    const cClassification = item.kode_klasifikasi || "KLS";
    const cDocType = item.kode_jenis_dokumen || "DOC";
    const cDateStr = dNow.toISOString().slice(0, 10).replace(/-/g, "");
    const cPrefix = `${cClassification}/${cDocType}/${cDateStr}/`;

    const oLastDoc = await DB("trs_dokumen")
      .select("kode_dokumen")
      .where("kode_dokumen", "like", `${cPrefix}%`)
      .orderBy("id_dokumen", "desc")
      .first();

    let nSeq = 1;
    if (oLastDoc && oLastDoc.kode_dokumen) {
      const parts = oLastDoc.kode_dokumen.split("/");
      const lastSeq = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(lastSeq)) nSeq = lastSeq + 1;
    }
    const cKodeDokumen = `${cPrefix}${String(nSeq).padStart(4, "0")}`;

    // 4. Insert into trs_dokumen
    const [nIdDokumen] = await DB("trs_dokumen").insert({
      id_cabang: item.id_cabang,
      kode_klasifikasi: item.kode_klasifikasi,
      kode_jenis_dokumen: item.kode_jenis_dokumen,
      kode_kategori_dokumen: item.kode_kategori_dokumen,
      kode_tingkat_kerahasiaan: item.kode_tingkat_kerahasiaan,
      nama_dokumen: item.nama_dokumen,
      nomor_dokumen: item.nomor_dokumen,
      tanggal: dNow,
      tanggal_transaksi: dNow,
      tanggal_kedaluwarsa: new Date(dNow.getFullYear() + 5, dNow.getMonth(), dNow.getDate()),
      nama_pic: cPic,
      lokasi_fisik: item.lokasi_fisik,
      qr_code: `DOC-${uuidv4()}`,
      status: "active",
      kode_dokumen: cKodeDokumen,
      created_at: dNow,
      updated_at: dNow
    });

    // 5. Insert into trs_versi_dokumen
    const [nIdVersi] = await DB("trs_versi_dokumen").insert({
      kode_dokumen: cKodeDokumen,
      nomor_versi: 1,
      catatan_perubahan: "Versi Awal (Unggahan Perdana Seeder)",
      file_path: objectPath,
      diunggah_oleh: cPic,
      status_persetujuan: "approved",
      disetujui_oleh: cPic,
      disetujui_pada: dNow,
      tanggal_transaksi: dNow,
      created_at: dNow,
      updated_at: dNow
    });

    // 6. Log Audit Trail
    await logDocumentChange({
      kodeDokumen: cKodeDokumen,
      aksi: "create",
      deskripsi: `Dokumen '${item.nama_dokumen}' (${item.nomor_dokumen}) berhasil didaftarkan via Enterprise Seeder`,
      detailJson: {
        nama_dokumen: item.nama_dokumen,
        nomor_dokumen: item.nomor_dokumen,
        nama_pic: cPic,
        lokasi_fisik: item.lokasi_fisik
      },
      dilakukanOleh: cPic,
      req: { headers: {}, socket: { remoteAddress: "127.0.0.1" } }
    });

    // 7. Trigger OCR Content Processing
    const ocrRes = await processDocumentContent(cKodeDokumen, nIdVersi, objectPath);
    console.log(`[OCR Result]: Text Length = ${ocrRes.text_length} chars, Status = ${ocrRes.status}`);

    createdResults.push({
      id_dokumen: nIdDokumen,
      id_cabang: item.id_cabang,
      nama_dokumen: item.nama_dokumen,
      nomor_dokumen: item.nomor_dokumen,
      minio_object_path: objectPath,
      ocr_length: ocrRes.text_length
    });

    console.log(`-------------------------------------------------`);
  }

  console.log("\n=================================================");
  console.log("  SEEDING SELESAI! 5 DOKUMEN BERHASIL DISIMPAN  ");
  console.log("=================================================");
  console.table(createdResults);

  process.exit(0);
}

runEnterpriseSeeder().catch((err) => {
  console.error("Seeder Error:", err);
  process.exit(1);
});
