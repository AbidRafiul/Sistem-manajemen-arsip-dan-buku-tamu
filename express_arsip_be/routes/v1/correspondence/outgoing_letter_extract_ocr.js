import express from "express";
import multer from "multer";
import PizZip from "pizzip";
import { extractTextFromPDF, ocrFromImage } from "../../../core/components/ocr_service.js";
import { Logging } from "../components/tools/servertool.js";
import { status, datetime } from "../components/tools/general.js";

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
});

const parseDocxText = (fileBuffer) => {
  try {
    const zip = new PizZip(fileBuffer);
    const xml = zip.file("word/document.xml")?.asText() || "";
    return xml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  } catch (err) {
    return "";
  }
};

const monthMap = {
  januari: "01", jan: "01",
  februari: "02", feb: "02",
  maret: "03", mar: "03",
  april: "04", apr: "04",
  mei: "05", may: "05",
  juni: "06", jun: "06",
  juli: "07", jul: "07",
  agustus: "08", aug: "08",
  september: "09", sep: "09",
  oktober: "10", okt: "10", oct: "10",
  november: "11", nov: "11",
  desember: "12", des: "12", dec: "12",
};

export const parseIndonesianDateToIso = (dateStr) => {
  if (!dateStr) return "";
  const cleaned = String(dateStr).trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) return cleaned;

  const matchMonthName = cleaned.match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/);
  if (matchMonthName) {
    const day = matchMonthName[1].padStart(2, "0");
    const monthName = matchMonthName[2].toLowerCase();
    const year = matchMonthName[3];
    const month = monthMap[monthName];
    if (month) {
      return `${year}-${month}-${day}`;
    }
  }

  const matchSlash = cleaned.match(/^(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{4})$/);
  if (matchSlash) {
    const day = matchSlash[1].padStart(2, "0");
    const month = matchSlash[2].padStart(2, "0");
    const year = matchSlash[3];
    return `${year}-${month}-${day}`;
  }

  const dateObj = new Date(cleaned);
  if (!Number.isNaN(dateObj.getTime())) {
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, "0");
    const d = String(dateObj.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  return "";
};

export const extractMetadataFromText = (text = "") => {
  const cleanText = String(text || "").trim();

  // 1. Extract Nomor Surat
  let nomorSurat = "";
  const noMatch = cleanText.match(/(?:Nomor|No\.?|NO|Num|Ref|Nomer)\s*[:.]?\s*([A-Za-z0-9\/\.\-_]{3,60})/i);
  if (noMatch) {
    nomorSurat = noMatch[1].trim();
  }

  // 2. Extract Perihal / Hal (SINGKAT)
  let perihal = "";
  const halMatch = cleanText.match(/(?:Perihal|Hal|Subject)\s*[:.]?\s*([^\n\r]+)/i);
  if (halMatch) {
    let rawHal = halMatch[1].trim();
    rawHal = rawHal.split(/(?:Lampiran|Lamp|Kepada|Yth|Dengan hormat|\.\s+[A-Z])/i)[0].trim();
    rawHal = rawHal.replace(/[:.,\-\s]+$/, "").trim();
    perihal = rawHal.slice(0, 150);
  }

  // 3. Extract Tanggal Surat
  let rawTanggal = "";
  const dateKeywordMatch = cleanText.match(/(?:Tanggal|Tgl)\s*[:.]?\s*([^\n\r]+)/i);
  if (dateKeywordMatch) {
    rawTanggal = dateKeywordMatch[1].trim();
  }
  if (!rawTanggal) {
    const dateMatch = cleanText.match(/(?:Jakarta|Bandung|Surabaya|Semarang|Medan|Makassar|Yogyakarta|Denpasar|Palembang|Banten|Bogor|Depok|Tangerang|Bekasi|KOTA|KABUPATEN)?\s*,?\s*(\d{1,2}\s+(?:Januari|Februari|Maret|April|Mei|Juni|Juli|Agustus|September|Oktober|November|Desember|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4})/i);
    if (dateMatch) {
      rawTanggal = dateMatch[1].trim();
    } else {
      const slashMatch = cleanText.match(/\b(\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{2,4})\b/);
      if (slashMatch) {
        rawTanggal = slashMatch[1];
      } else {
        const isoMatch = cleanText.match(/\b(\d{4}-\d{2}-\d{2})\b/);
        if (isoMatch) rawTanggal = isoMatch[1];
      }
    }
  }
  const tanggalSurat = parseIndonesianDateToIso(rawTanggal);

  // 4. Extract Tujuan / Kepada Yth (SINGKAT)
  let tujuanSurat = "";
  const ythMatch = cleanText.match(/(?:Kepada\s+Yth\.?|Yth\.?|Kepada)\s*[:.]?\s*([^\n\r]+)/i);
  if (ythMatch) {
    let rawYth = ythMatch[1].trim();
    const diTempatIdx = rawYth.search(/di\s+tempat/i);
    if (diTempatIdx !== -1) {
      rawYth = rawYth.slice(0, diTempatIdx + 9).trim();
    } else {
      rawYth = rawYth.split(/(?:Dengan hormat|di\s+-|Demikian)/i)[0].trim();
    }
    rawYth = rawYth.replace(/[:.,\-\s]+$/, "").trim();
    tujuanSurat = rawYth.slice(0, 150);
  }

  // 5. Extract Isi Surat (BODY TEXT)
  let isiSurat = "";
  const hormatIndex = cleanText.search(/dengan\s+hormat,?/i);
  if (hormatIndex !== -1) {
    let bodyText = cleanText.slice(hormatIndex).replace(/^dengan\s+hormat,?\s*/i, "").trim();
    bodyText = bodyText.split(/(?:demikian\s+surat|hormat\s+kami)/i)[0].trim();
    isiSurat = bodyText;
  } else {
    const lines = cleanText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const contentLines = lines.filter(
      (l) => !/^(nomor|no|lampiran|lamp|perihal|hal|kepada|yth|di tempat)/i.test(l)
    );
    isiSurat = contentLines.join("\n").slice(0, 2000);
  }

  return {
    nomor_surat: nomorSurat,
    perihal: perihal,
    tanggal_surat: tanggalSurat,
    tujuan_surat: tujuanSurat,
    isi_surat: isiSurat,
    raw_text_snippet: cleanText.slice(0, 500),
  };
};

const extractImagesFromPdfBuffer = (pdfBuffer) => {
  const images = [];
  const jpegHeader = Buffer.from([0xff, 0xd8, 0xff]);
  const jpegFooter = Buffer.from([0xff, 0xd9]);

  let start = 0;
  while ((start = pdfBuffer.indexOf(jpegHeader, start)) !== -1) {
    const end = pdfBuffer.indexOf(jpegFooter, start);
    if (end !== -1 && end > start) {
      const img = pdfBuffer.subarray(start, end + 2);
      if (img.length > 2500) {
        images.push(img);
      }
      start = end + 2;
    } else {
      break;
    }
  }
  return images;
};

const extractOcrMetadataHandler = async (req, res) => {
  const cFile = "outgoing_letter_extract_ocr.js";
  const cFunc = "extractOcrMetadataHandler";

  try {
    const oFile = req.file;

    if (!oFile) {
      return res.status(400).json({
        status: status.BAD_REQUEST,
        message: "File berkas surat eksternal wajib diupload",
      });
    }

    const mime = (oFile.mimetype || "").toLowerCase();
    const originalName = (oFile.originalname || "").toLowerCase();
    let extractedText = "";

    if (mime.includes("pdf") || originalName.endsWith(".pdf")) {
      try {
        const pdfResult = await extractTextFromPDF(oFile.buffer);
        extractedText = pdfResult.text || "";
      } catch (pdfErr) {
        console.warn("[PDF Extract Warning]:", pdfErr.message);
      }

      // Clean metadata page footers from pdf-parse
      extractedText = extractedText.replace(/--\s*\d+\s*of\s*\d+\s*--/gi, "").trim();

      // If text is very short (e.g. scanned image PDF), run OCR on extracted JPEG image streams
      if (extractedText.replace(/\s+/g, "").length < 20) {
        try {
          const pdfImages = extractImagesFromPdfBuffer(oFile.buffer);
          if (pdfImages.length > 0) {
            let combinedOcrText = "";
            for (const imgBuf of pdfImages.slice(0, 3)) {
              const ocrRes = await ocrFromImage(imgBuf);
              if (ocrRes && ocrRes.text) {
                combinedOcrText += "\n" + ocrRes.text;
              }
            }
            if (combinedOcrText.trim().length > extractedText.length) {
              extractedText = combinedOcrText.trim();
            }
          }
        } catch (ocrPdfErr) {
          console.warn("[Scanned PDF Image OCR Warning]:", ocrPdfErr.message);
        }
      }
    } else if (
      mime.includes("image") ||
      [".png", ".jpg", ".jpeg", ".bmp", ".webp", ".tiff"].some((ext) => originalName.endsWith(ext))
    ) {
      try {
        const imgRes = await ocrFromImage(oFile.buffer);
        extractedText = imgRes?.text || "";
      } catch (ocrErr) {
        console.warn("[Image OCR Warning]:", ocrErr.message);
      }
    } else if (
      mime.includes("word") ||
      mime.includes("officedocument") ||
      originalName.endsWith(".docx") ||
      originalName.endsWith(".doc")
    ) {
      extractedText = parseDocxText(oFile.buffer);
    } else {
      return res.status(400).json({
        status: status.BAD_REQUEST,
        message: "Format file tidak didukung. Harap upload file PDF atau Word (.docx)",
      });
    }

    const metadata = extractMetadataFromText(extractedText);

    return res.status(200).json({
      status: status.SUKSES,
      message: "Berhasil meng-ekstrak metadata dari file eksternal",
      data: {
        ...metadata,
        filename: oFile.originalname,
        mimetype: oFile.mimetype,
        filesize: oFile.size,
      },
    });
  } catch (error) {
    await Logging(error, { file: cFile, func: cFunc });
    return res.status(500).json({
      status: status.BAD_REQUEST,
      message: error.message || "Gagal meng-ekstrak metadata dari file eksternal",
    });
  }
};

router.post("/", upload.single("file"), extractOcrMetadataHandler);

export default router;
