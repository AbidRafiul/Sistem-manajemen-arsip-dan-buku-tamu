import fs from "fs";
import path from "path";
import DB from "../config/knex.js";
import { PDFParse } from "pdf-parse";
import { downloadFileFromMinio } from "./tools/minio_helper.js";

/**
 * Robust OCR & Text Extraction Service with MinIO support
 */

let createWorkerLoader = null;

const getCreateWorker = async () => {
  if (!createWorkerLoader) {
    createWorkerLoader = import("tesseract.js")
      .then((module) => module.createWorker)
      .catch((error) => {
        throw new Error(
          `Dependency tesseract.js belum tersedia: ${error.message}`
        );
      });
  }

  return createWorkerLoader;
};

/**
 * Retrieves file buffer from MinIO storage or local disk fallback
 */
const getFileBuffer = async (relativeFilePath) => {
  if (!relativeFilePath) return null;

  // 1. Coba ambil dari MinIO dulu
  try {
    const bucketName = process.env.MINIO_BUCKET_NAME || "arsip-bucket";
    const objectName = relativeFilePath.replace(/^\/uploads\//, "").replace(/^\//, "");
    
    const stream = await downloadFileFromMinio(bucketName, objectName);
    
    const chunks = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks);
  } catch (minioErr) {
    console.warn("[OCR MinIO Fetch Warning]:", minioErr.message, "- Trying local disk fallback...");
  }

  // 2. Fallback: Lokal disk server
  const cleaned = relativeFilePath.startsWith("/") ? relativeFilePath.slice(1) : relativeFilePath;
  const pathsToTry = [
    path.join(process.cwd(), cleaned),
    path.join(process.cwd(), "public", cleaned),
    path.join(process.cwd(), "public/uploads/documents", path.basename(cleaned)),
    path.join(process.cwd(), "uploads/documents", path.basename(cleaned)),
  ];

  for (const p of pathsToTry) {
    if (fs.existsSync(p)) {
      return fs.readFileSync(p);
    }
  }

  throw new Error(`File '${relativeFilePath}' tidak ditemukan di MinIO maupun di lokal disk server`);
};

/**
 * Extract text from PDF Buffer using pdf-parse
 */
export const extractPdfRawStrings = (fileBuffer) => {
  try {
    const str = fileBuffer.toString("binary");
    const matches = [];

    const regTj = /\(([^()]{2,200})\)\s*Tj/g;
    let m;
    while ((m = regTj.exec(str)) !== null) {
      matches.push(m[1]);
    }

    const regTJ = /\[([^\[\]]{2,500})\]\s*TJ/g;
    while ((m = regTJ.exec(str)) !== null) {
      const innerStr = m[1].replace(/\(([^()]+)\)/g, "$1 ");
      matches.push(innerStr);
    }

    return matches.join(" ").replace(/\\([()])/g, "$1").replace(/\s+/g, " ").trim();
  } catch (err) {
    return "";
  }
};

export const extractTextFromPDF = async (fileBuffer) => {
  let text = "";
  let numPages = 1;

  try {
    const uint8Data = new Uint8Array(
      fileBuffer.buffer,
      fileBuffer.byteOffset,
      fileBuffer.byteLength
    );
    const parser = new PDFParse({ data: uint8Data });
    const data = await parser.getText();
    if (data && data.text) {
      text = String(data.text).trim();
      text = text.replace(/--\s*\d+\s*of\s*\d+\s*--/gi, "").trim();
    }
    if (data && data.total) numPages = data.total;
  } catch (err) {
    console.warn("[PDFParse Warning]:", err.message);
  }

  if (text.replace(/\s+/g, "").length < 15) {
    const rawText = extractPdfRawStrings(fileBuffer);
    if (rawText.length > text.length) {
      text = rawText;
    }
  }

  return {
    text: text ? text.trim() : "",
    numPages: numPages || 1,
  };
};

/**
 * Extract text from image Buffer using Tesseract.js
 */
export const ocrFromImage = async (fileBuffer, lang = "eng") => {
  let worker = null;
  try {
    const createWorker = await getCreateWorker();
    worker = await createWorker(lang);
    const ret = await worker.recognize(fileBuffer);
    await worker.terminate();
    return {
      text: ret.data.text ? ret.data.text.trim() : "",
    };
  } catch (err) {
    if (worker) {
      try {
        await worker.terminate();
      } catch (e) {}
    }
    // Fallback to 'eng' if language load failed
    if (lang !== "eng") {
      return ocrFromImage(fileBuffer, "eng");
    }
    throw err;
  }
};

/**
 * Orchestrator: Process file content for a given document version
 * Runs asynchronously and updates trs_konten_dokumen
 */
export const processDocumentContent = async (
  kodeDokumen,
  idVersi,
  relativeFilePath,
  lang = "eng"
) => {
  const dNow = new Date();

  // Upsert initial record in trs_konten_dokumen with status 'processing'
  const existing = await DB("trs_konten_dokumen")
    .where("kode_dokumen", kodeDokumen)
    .where("id_versi", idVersi)
    .first();

  let idKonten;
  if (existing) {
    idKonten = existing.id_konten;
    await DB("trs_konten_dokumen")
      .where("id_konten", idKonten)
      .update({
        status_ocr: "processing",
        pesan_error: null,
        updated_at: dNow,
      });
  } else {
    const [insertedId] = await DB("trs_konten_dokumen").insert({
      kode_dokumen: kodeDokumen,
      id_versi: idVersi,
      konten_teks: "",
      sumber_konten: "pdf_parse",
      status_ocr: "processing",
      pesan_error: null,
      jumlah_halaman: 0,
      bahasa_ocr: lang,
      created_at: dNow,
      updated_at: dNow,
    });
    idKonten = insertedId;
  }

  try {
    const fileBuffer = await getFileBuffer(relativeFilePath);
    if (!fileBuffer || fileBuffer.length === 0) {
      throw new Error(`File buffer kosong untuk: ${relativeFilePath}`);
    }

    const ext = path.extname(relativeFilePath).toLowerCase();
    let extractedText = "";
    let numPages = 1;
    let sumber = "pdf_parse";

    if (ext === ".pdf") {
      const pdfRes = await extractTextFromPDF(fileBuffer);
      extractedText = pdfRes.text;
      numPages = pdfRes.numPages;
      sumber = "pdf_parse";
    } else if ([".png", ".jpg", ".jpeg", ".bmp", ".webp", ".tiff"].includes(ext)) {
      sumber = "ocr_gambar";
      const imgRes = await ocrFromImage(fileBuffer, lang);
      extractedText = imgRes.text;
      numPages = 1;
    } else {
      throw new Error(`Format file ${ext} belum didukung untuk OCR/ekstraksi teks`);
    }

    // Save result
    await DB("trs_konten_dokumen")
      .where("id_konten", idKonten)
      .update({
        konten_teks: extractedText,
        sumber_konten: sumber,
        status_ocr: "completed",
        jumlah_halaman: numPages,
        pesan_error: null,
        updated_at: new Date(),
      });

    return {
      status: "success",
      id_konten: idKonten,
      text_length: extractedText.length,
      sumber_konten: sumber,
    };
  } catch (error) {
    console.error("[OCR Process Error]:", error.message);

    await DB("trs_konten_dokumen")
      .where("id_konten", idKonten)
      .update({
        status_ocr: "failed",
        pesan_error: error.message,
        updated_at: new Date(),
      });

    return {
      status: "failed",
      id_konten: idKonten,
      error: error.message,
    };
  }
};
