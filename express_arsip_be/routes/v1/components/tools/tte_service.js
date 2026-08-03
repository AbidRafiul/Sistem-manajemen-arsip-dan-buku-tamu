import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { pdflibAddPlaceholder } from "@signpdf/placeholder-pdf-lib";
import signpdf from "@signpdf/signpdf";
import { P12Signer } from "@signpdf/signer-p12";
import QRCode from "qrcode";
import forge from "node-forge";
import DB from "../../../../core/config/knex.js";
import { downloadFileFromMinio, getMinioPrefix, uploadFileToMinio, MINIO_BUCKET_NAME } from "../../../../core/components/tools/minio_helper.js";
import { formatDateSystem } from "./general.js";
const DEFAULT_SIGNATURE_LENGTH = 16384;
const DEFAULT_PAGE_WIDTH = 595.28;
const DEFAULT_PAGE_HEIGHT = 841.89;
const DEFAULT_SIGNATURE_RECT = [345, 58, 565, 162];
const SIGNATURE_PROVIDER = String(process.env.TTE_SIGNING_PROVIDER || "internal").toLowerCase();
const cleanBuffer = value => {
  if (Buffer.isBuffer(value)) return value;
  if (value instanceof Uint8Array) return Buffer.from(value);
  return Buffer.from(value || "");
};
const sha256Hex = buffer => crypto.createHash("sha256").update(buffer).digest("hex");
const toBinaryString = buffer => cleanBuffer(buffer).toString("binary");
const normalizeString = value => String(value || "").replace(/\s+/g, " ").trim();
const splitText = (text = "") => String(text).split(/\r?\n/);
const wrapLine = (text, font, fontSize, maxWidth) => {
  const words = String(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, fontSize) <= maxWidth) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines.length > 0 ? lines : [""];
};
const drawParagraphs = (page, font, text, x, y, maxWidth, fontSize, lineHeight, color = rgb(0.1, 0.1, 0.1)) => {
  let cursorY = y;
  for (const paragraph of splitText(text)) {
    const wrapped = wrapLine(paragraph || " ", font, fontSize, maxWidth);
    for (const line of wrapped) {
      page.drawText(line, {
        x,
        y: cursorY,
        size: fontSize,
        font,
        color
      });
      cursorY -= lineHeight;
    }
    cursorY -= lineHeight * 0.35;
  }
  return cursorY;
};
const getUserId = req => req?.auth?.id_pengguna || req?.auth?.IdPengguna || null;
const getUserBranchId = req => req?.auth?.id_cabang || null;
const getBasePdfFileName = surat => `${normalizeString(surat?.nomor_surat || `surat-keluar-${surat?.id_surat_keluar || "dokumen"}`)}.pdf`.replace(/[\\/:*?"<>|]+/g, "-").replace(/\s+/g, "_");
const getYearFolder = () => new Date().getFullYear();
const loadObjectBuffer = async objectName => {
  if (!objectName) return null;
  const bucketName = process.env.MINIO_BUCKET_NAME || MINIO_BUCKET_NAME;
  const cleanedObject = String(objectName).replace(/\\/g, "/").replace(/^\/+/, "");
  try {
    const stream = await downloadFileFromMinio(bucketName, cleanedObject);
    const chunks = [];
    for await (const chunk of stream) chunks.push(chunk);
    return Buffer.concat(chunks);
  } catch (minioError) {
    const localPath = path.resolve(process.cwd(), cleanedObject.replace(/^uploads\//, ""));
    try {
      return await fs.readFile(localPath);
    } catch (diskError) {
      throw new Error(`Gagal memuat dokumen dari storage (${cleanedObject}): ${minioError.message || diskError.message}`);
    }
  }
};
const uploadPdfBuffer = async (buffer, fileName, {
  idCabang = null,
  moduleName = "tte/surat-keluar"
} = {}) => {
  const bucketName = process.env.MINIO_BUCKET_NAME || MINIO_BUCKET_NAME;
  const prefix = await getMinioPrefix(idCabang);
  const syntheticFile = {
    originalname: fileName,
    buffer,
    size: buffer.length,
    mimetype: "application/pdf"
  };
  return uploadFileToMinio(bucketName, syntheticFile, {
    idCabang,
    modul: moduleName,
    nomorDokumen: fileName.replace(/\.pdf$/i, ""),
    namaDokumen: fileName.replace(/\.pdf$/i, ""),
    version: "V1",
    customFolderPath: `${prefix}/${moduleName}/${getYearFolder()}`
  });
};
const loadP12Signer = async ({
  lokasiKeystore,
  password
}) => {
  const resolved = path.isAbsolute(lokasiKeystore) ? lokasiKeystore : path.resolve(process.cwd(), lokasiKeystore);
  const p12Buffer = await fs.readFile(resolved);
  return new P12Signer(p12Buffer, {
    passphrase: password || ""
  });
};
const buildVisibleSignatureBlock = async ({
  pdfDoc,
  page,
  posisi,
  signerName,
  signerTitle,
  signingTime,
  tokenVerifikasi
}) => {
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const pageWidth = page.getWidth();
  const pageHeight = page.getHeight();
  const rect = posisi?.widgetRect || DEFAULT_SIGNATURE_RECT;
  const [x1, y1, x2, y2] = rect;
  const boxWidth = Math.max(120, x2 - x1);
  const boxHeight = Math.max(70, y2 - y1);
  const blockX = Math.max(24, Math.min(x1, pageWidth - boxWidth - 24));
  const blockY = Math.max(24, Math.min(y1, pageHeight - boxHeight - 24));
  const qrDataUrl = await QRCode.toDataURL(tokenVerifikasi || signerName || "tte", {
    margin: 0,
    width: 96
  });
  const qrImage = await pdfDoc.embedPng(qrDataUrl.split(",")[1] ? Buffer.from(qrDataUrl.split(",")[1], "base64") : Buffer.from(qrDataUrl, "base64"));
  page.drawRectangle({
    x: blockX,
    y: blockY,
    width: boxWidth,
    height: boxHeight,
    borderColor: rgb(0.32, 0.38, 0.55),
    borderWidth: 1,
    color: rgb(0.98, 0.99, 1)
  });
  page.drawText("Ditandatangani secara elektronik oleh", {
    x: blockX + 12,
    y: blockY + boxHeight - 18,
    size: 8.5,
    font: fontRegular,
    color: rgb(0.28, 0.28, 0.32)
  });
  page.drawText(normalizeString(signerName || "-"), {
    x: blockX + 12,
    y: blockY + boxHeight - 32,
    size: 10.5,
    font: fontBold,
    color: rgb(0.08, 0.12, 0.22)
  });
  drawParagraphs(page, fontRegular, `${normalizeString(signerTitle || "-")}\n${formatDateSystem(signingTime, "dd MMM yyyy HH:mm")}\nKode: ${normalizeString(tokenVerifikasi || "-")}`, blockX + 12, blockY + boxHeight - 46, boxWidth - 104, 7.5, 9, rgb(0.16, 0.16, 0.16));
  page.drawImage(qrImage, {
    x: blockX + boxWidth - 84,
    y: blockY + 10,
    width: 64,
    height: 64
  });
  return [blockX, blockY, blockX + boxWidth, blockY + boxHeight];
};
const generatePdfFromSurat = async (surat, {
  signerName = "",
  signerTitle = ""
} = {}) => {
  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage([DEFAULT_PAGE_WIDTH, DEFAULT_PAGE_HEIGHT]);
  const titleFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const bodyFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const margin = 48;
  const contentWidth = DEFAULT_PAGE_WIDTH - margin * 2;
  page.drawText("SURAT KELUAR", {
    x: margin,
    y: DEFAULT_PAGE_HEIGHT - 56,
    size: 16,
    font: titleFont,
    color: rgb(0.09, 0.14, 0.28)
  });
  const metaLines = [`Nomor Surat: ${surat?.nomor_surat || "-"}`, `Nomor Agenda: ${surat?.nomor_agenda || "-"}`, `Tanggal Surat: ${surat?.tanggal_surat || "-"}`, `Perihal: ${surat?.perihal || "-"}`, `Tujuan: ${surat?.tujuan || "-"}`, `Instansi Tujuan: ${surat?.instansi_tujuan || "-"}`, `Media Pengiriman: ${surat?.media_pengiriman || "-"}`];
  let cursorY = DEFAULT_PAGE_HEIGHT - 92;
  cursorY = drawParagraphs(page, bodyFont, metaLines.join("\n"), margin, cursorY, contentWidth, 11, 15, rgb(0.15, 0.15, 0.15));
  cursorY -= 8;
  page.drawLine({
    start: {
      x: margin,
      y: cursorY
    },
    end: {
      x: DEFAULT_PAGE_WIDTH - margin,
      y: cursorY
    },
    thickness: 1,
    color: rgb(0.84, 0.86, 0.9)
  });
  cursorY -= 24;
  const bodyText = normalizeString(surat?.isi_surat_final || surat?.isi_surat || [surat?.perihal ? `Perihal: ${surat.perihal}` : "", surat?.tujuan ? `Tujuan: ${surat.tujuan}` : "", surat?.instansi_tujuan ? `Instansi Tujuan: ${surat.instansi_tujuan}` : "", "", "Dokumen ini disiapkan untuk penandatanganan elektronik internal."].filter(Boolean).join("\n"));
  const bodyLines = splitText(bodyText);
  for (const paragraph of bodyLines) {
    const wrapped = wrapLine(paragraph || " ", bodyFont, 11, contentWidth);
    for (const line of wrapped) {
      if (cursorY < 108) {
        page = pdfDoc.addPage([DEFAULT_PAGE_WIDTH, DEFAULT_PAGE_HEIGHT]);
        cursorY = DEFAULT_PAGE_HEIGHT - 56;
      }
      page.drawText(line, {
        x: margin,
        y: cursorY,
        size: 11,
        font: bodyFont,
        color: rgb(0.1, 0.1, 0.1)
      });
      cursorY -= 15;
    }
    cursorY -= 4;
  }
  const previewPage = pdfDoc.getPages()[pdfDoc.getPageCount() - 1];
  if (signerName || signerTitle) {
    previewPage.drawText(`Penanda tangan: ${normalizeString(signerName || "-")}`, {
      x: margin,
      y: 78,
      size: 8.5,
      font: bodyFont,
      color: rgb(0.35, 0.35, 0.38)
    });
    previewPage.drawText(normalizeString(signerTitle || "-"), {
      x: margin,
      y: 66,
      size: 8.5,
      font: bodyFont,
      color: rgb(0.35, 0.35, 0.38)
    });
  }
  return Buffer.from(await pdfDoc.save());
};
const preparePdfForSignature = async (pdfBuffer, options = {}) => {
  const pdfDoc = await PDFDocument.load(cleanBuffer(pdfBuffer));
  const pages = pdfDoc.getPages();
  const pageIndex = Math.max(0, Math.min((options.posisi?.halaman || pages.length || 1) - 1, pages.length - 1));
  const page = pages[pageIndex] || pdfDoc.addPage([DEFAULT_PAGE_WIDTH, DEFAULT_PAGE_HEIGHT]);
  const rect = await buildVisibleSignatureBlock({
    pdfDoc,
    page,
    posisi: options.posisi,
    signerName: options.signerName,
    signerTitle: options.signerTitle,
    signingTime: options.signingTime,
    tokenVerifikasi: options.tokenVerifikasi
  });
  pdflibAddPlaceholder({
    pdfDoc,
    pdfPage: page,
    reason: options.reason || "Tanda tangan elektronik internal",
    contactInfo: options.contactInfo || "internal-ttd",
    name: normalizeString(options.signerName || "Pengguna"),
    location: normalizeString(options.location || "Indonesia"),
    signingTime: options.signingTime || new Date(),
    signatureLength: options.signatureLength || DEFAULT_SIGNATURE_LENGTH,
    byteRangePlaceholder: options.byteRangePlaceholder,
    subFilter: options.subFilter || "ETSI.CAdES.detached",
    widgetRect: rect,
    appName: options.appName || "TTE Internal"
  });
  return Buffer.from(await pdfDoc.save());
};
const getCertificateRecord = async ({
  idSertifikat,
  idPengguna = null
} = {}) => {
  let query = DB("mst_sertifikat_elektronik as mse").leftJoin("mst_pengguna as u", "mse.id_pengguna", "u.id_pengguna").select("mse.*", "u.nama_lengkap as nama_pengguna", "u.nama_pengguna as username_pengguna").where("mse.status_sertifikat", "aktif");
  if (idSertifikat) {
    query = query.where("mse.id_sertifikat_elektronik", idSertifikat);
  }
  if (idPengguna) {
    query = query.andWhere(builder => {
      builder.whereNull("mse.id_pengguna").orWhere("mse.id_pengguna", idPengguna);
    });
  }
  return query.orderBy("mse.updated_at", "desc").first();
};
const resolveCertificateMaterial = async (certificateRecord = {}) => {
  const lokasiKeystore = certificateRecord.lokasi_keystore || process.env.TTE_INTERNAL_KEYSTORE_PATH || "";
  const password = process.env.TTE_INTERNAL_KEYSTORE_PASSWORD || certificateRecord.password_keystore || "";
  if (!lokasiKeystore) {
    throw new Error("Lokasi keystore sertifikat belum dikonfigurasi");
  }
  const keystoreBuffer = await fs.readFile(path.isAbsolute(lokasiKeystore) ? lokasiKeystore : path.resolve(process.cwd(), lokasiKeystore));
  const p12Asn1 = forge.asn1.fromDer(toBinaryString(keystoreBuffer), {
    parseAllBytes: false
  });
  const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, false, password);
  const certBags = p12.getBags({
    bagType: forge.pki.oids.certBag
  })[forge.pki.oids.certBag] || [];
  const keyBags = p12.getBags({
    bagType: forge.pki.oids.pkcs8ShroudedKeyBag
  })[forge.pki.oids.pkcs8ShroudedKeyBag] || [];
  const cert = certBags[0]?.cert || null;
  const cKey = keyBags[0]?.key || null;
  if (!cert || !cKey) {
    throw new Error("Keystore tidak berisi sertifikat atau private key yang valid");
  }
  return {
    keystoreBuffer,
    cert,
    key: cKey,
    password,
    lokasiKeystore
  };
};
const parseDigestAlgorithm = oid => {
  switch (oid) {
    case forge.pki.oids.sha1:
      return "sha1";
    case forge.pki.oids.sha384:
      return "sha384";
    case forge.pki.oids.sha512:
      return "sha512";
    case forge.pki.oids.sha256:
    default:
      return "sha256";
  }
};
const getAuthenticatedAttributesDigest = attrAsn1 => {
  const raw = forge.asn1.toDer(attrAsn1).getBytes();
  return crypto.createHash("sha256").update(Buffer.from(raw, "binary")).digest();
};
const getAttrValue = (attrNode, attrOid) => {
  if (!attrNode?.value || attrNode.value.length < 2) return null;
  const oidNode = attrNode.value[0];
  if (!oidNode || forge.asn1.derToOid(oidNode.value) !== attrOid) return null;
  const setNode = attrNode.value[1];
  const valueNode = setNode?.value?.[0] || null;
  return valueNode || null;
};
const parseCmsSignature = contentsHex => {
  const normalizedHex = String(contentsHex || "").replace(/\s+/g, "");
  const contentsBuffer = Buffer.from(normalizedHex, "hex");
  const derBytes = contentsBuffer.toString("binary");
  const asn1Obj = forge.asn1.fromDer(derBytes, {
    parseAllBytes: false
  });
  const msg = forge.pkcs7.messageFromAsn1(asn1Obj);
  return {
    asn1Obj,
    msg
  };
};
const extractSignatureInfosFromPdf = pdfBuffer => {
  const text = cleanBuffer(pdfBuffer).toString("latin1");
  const matches = [...text.matchAll(/\/ByteRange\s*\[\s*([0-9\s]+?)\s*\]/g)];
  return matches.map((match, index) => {
    const numbers = match[1].trim().split(/\s+/).map(value => Number(value));
    const tail = text.slice(match.index || 0);
    const contentsMatch = tail.match(/\/Contents\s*<([0-9A-Fa-f\s]+)>/);
    return {
      index,
      byteRange: numbers,
      contentsHex: contentsMatch?.[1] || "",
      rawByteRange: match[0]
    };
  });
};
const verifyPdfBuffer = async pdfBuffer => {
  const signatures = extractSignatureInfosFromPdf(pdfBuffer);
  const results = [];
  for (const signature of signatures) {
    const [offset1, length1, offset2, length2] = signature.byteRange;
    const firstSlice = cleanBuffer(pdfBuffer).slice(offset1, offset1 + length1);
    const secondSlice = cleanBuffer(pdfBuffer).slice(offset2, offset2 + length2);
    const signedContent = Buffer.concat([firstSlice, secondSlice]);
    const signedDigest = crypto.createHash("sha256").update(signedContent).digest();
    let validKriptografis = false;
    let validIntegritas = false;
    let validSertifikat = false;
    let sertifikatDipercaya = false;
    let sertifikatDicabut = false;
    let dokumenDiubah = false;
    let pesan = [];
    let certificateInfo = null;
    try {
      const {
        msg
      } = parseCmsSignature(signature.contentsHex);
      const rawSignerInfos = msg?.rawCapture?.signerInfos;
      const signerInfoAsn1 = rawSignerInfos?.value?.[0] || rawSignerInfos?.[0] || rawSignerInfos || null;
      if (!signerInfoAsn1) {
        throw new Error("Signer info tidak ditemukan di signature");
      }
      const signerCapture = {};
      const errors = [];
      if (!forge.asn1.validate(signerInfoAsn1, forge.pkcs7.asn1.signerInfoValidator, signerCapture, errors)) {
        throw new Error(`Signer info tidak valid: ${errors.map(item => item.message).join(", ")}`);
      }
      const attrsAsn1 = signerCapture.authenticatedAttributes || null;
      const attrs = attrsAsn1?.value || [];
      const digestAttr = attrs.find(attr => {
        const oid = forge.asn1.derToOid(attr.value?.[0]?.value || "");
        return oid === forge.pki.oids.messageDigest;
      });
      const digestAttrValue = getAttrValue(digestAttr, forge.pki.oids.messageDigest);
      const messageDigestBytes = digestAttrValue?.value || null;
      validIntegritas = Boolean(messageDigestBytes && Buffer.from(messageDigestBytes, "binary").equals(signedDigest));
      const digestAlgorithm = parseDigestAlgorithm(signerCapture.digestAlgorithm);
      const attrsDigest = crypto.createHash(digestAlgorithm).update(Buffer.from(forge.asn1.toDer(attrsAsn1).getBytes(), "binary")).digest();
      const signerCertificate = (msg?.certificates || []).find(cert => {
        const certSerial = String(cert.serialNumber || "").replace(/^0+/, "") || "0";
        const signerSerial = String(signerCapture.serialNumber || "").replace(/^0+/, "") || "0";
        return certSerial.toLowerCase() === signerSerial.toLowerCase();
      }) || msg?.certificates?.[0] || null;
      if (signerCertificate) {
        certificateInfo = {
          serialNumber: signerCertificate.serialNumber,
          subject: signerCertificate.subject?.attributes || [],
          issuer: signerCertificate.issuer?.attributes || [],
          validFrom: signerCertificate.validity?.notBefore || null,
          validTo: signerCertificate.validity?.notAfter || null
        };
        const pemPublicKey = signerCertificate.publicKey;
        validKriptografis = pemPublicKey.verify(attrsDigest.toString("binary"), signerCapture.signature, "RSASSA-PKCS1-V1_5");
        const dNow = new Date();
        validSertifikat = signerCertificate.validity?.notBefore <= dNow && signerCertificate.validity?.notAfter >= dNow;
        sertifikatDipercaya = validSertifikat;
      }
      pesan.push(validIntegritas ? "Hash dokumen cocok dengan signature." : "Hash dokumen tidak cocok.");
      pesan.push(validKriptografis ? "Signature kriptografis valid." : "Signature kriptografis tidak valid.");
      pesan.push(validSertifikat ? "Sertifikat masih berlaku." : "Sertifikat tidak berlaku atau tidak ditemukan.");
      dokumenDiubah = !validIntegritas || !validKriptografis;
    } catch (error) {
      pesan.push(error.message || "Verifikasi signature gagal");
      dokumenDiubah = true;
    }
    results.push({
      index: signature.index,
      byteRange: signature.byteRange,
      valid_kriptografis: validKriptografis,
      valid_integritas: validIntegritas,
      valid_sertifikat: validSertifikat,
      sertifikat_dipercaya: sertifikatDipercaya,
      sertifikat_dicabut: sertifikatDicabut,
      dokumen_diubah: dokumenDiubah,
      pesan_verifikasi: pesan.join(" "),
      certificate_info: certificateInfo
    });
  }
  const aggregate = results.length > 0 ? results.every(item => item.valid_kriptografis && item.valid_integritas && item.valid_sertifikat) : false;
  return {
    dokumen_tertandatangan: results.length > 0,
    valid_kriptografis: aggregate,
    valid_integritas: aggregate,
    valid_sertifikat: results.every(item => item.valid_sertifikat),
    sertifikat_dipercaya: results.every(item => item.sertifikat_dipercaya),
    sertifikat_dicabut: results.some(item => item.sertifikat_dicabut),
    dokumen_diubah: results.some(item => item.dokumen_diubah),
    signatures: results
  };
};
const chooseBaseDocumentBuffer = async (surat, {
  preferSigned = true
} = {}) => {
  const latestSignature = preferSigned ? await DB("trs_tanda_tangan_dokumen as ttd").where("ttd.id_surat_keluar", surat.id_surat_keluar).where("ttd.status_tanda_tangan", "aktif").orderBy("ttd.urutan_tanda_tangan", "desc").orderBy("ttd.created_at", "desc").first() : null;
  if (latestSignature?.lokasi_dokumen) {
    return loadObjectBuffer(latestSignature.lokasi_dokumen);
  }
  const latestFile = await DB("trs_file_surat_keluar").where("id_surat_keluar", surat.id_surat_keluar).where("status", "active").orderBy("tanggal_upload", "desc").first();
  if (latestFile?.path_file) {
    const ext = path.extname(latestFile.path_file || latestFile.nama_file || "").toLowerCase();
    if (ext === ".pdf") {
      return loadObjectBuffer(latestFile.path_file);
    }
  }
  return generatePdfFromSurat(surat);
};
const assertMenuPermission = async (req, res, menuPaths = [], actionKey = "canView") => {
  const roleId = req?.auth?.peranId;
  if (!roleId) {
    return res.status(401).json({
      status: false,
      message: "Autentikasi tidak ditemukan"
    });
  }
  const menus = await DB("mst_menu as m").leftJoin("mst_peran_menu as pm", "m.id_menu", "pm.id_menu").select("m.jalur_menu", "pm.hak_lihat", "pm.hak_buat", "pm.hak_ubah", "pm.hak_hapus", "pm.hak_setuju").where("pm.id_peran", roleId).where("m.status_aktif", 1).whereIn("m.jalur_menu", Array.isArray(menuPaths) ? menuPaths : [menuPaths]);
  if (!menus || menus.length === 0) {
    return res.status(403).json({
      status: false,
      message: "Anda tidak memiliki akses ke menu ini"
    });
  }
  const allowed = {
    canView: menus.some(r => Boolean(r.hak_lihat)),
    canCreate: menus.some(r => Boolean(r.hak_buat)),
    canUpdate: menus.some(r => Boolean(r.hak_ubah)),
    canDelete: menus.some(r => Boolean(r.hak_hapus)),
    canApprove: menus.some(r => Boolean(r.hak_setuju))
  };
  if (!allowed[actionKey]) {
    return res.status(403).json({
      status: false,
      message: "Hak akses tidak mencukupi"
    });
  }
  return null;
};
const buildCertificatePayload = async (payload = {}, req = null) => {
  const dNow = new Date();
  const resolvedUserId = payload.id_pengguna || getUserId(req);
  return {
    id_pengguna: resolvedUserId || null,
    nama_sertifikat: normalizeString(payload.nama_sertifikat),
    alias_sertifikat: normalizeString(payload.alias_sertifikat || payload.nama_sertifikat),
    nomor_seri: normalizeString(payload.nomor_seri),
    subjek_sertifikat: normalizeString(payload.subjek_sertifikat),
    penerbit_sertifikat: normalizeString(payload.penerbit_sertifikat),
    algoritma_tanda_tangan: normalizeString(payload.algoritma_tanda_tangan || "RSA-SHA256"),
    algoritma_hash: normalizeString(payload.algoritma_hash || "SHA-256"),
    lokasi_keystore: normalizeString(payload.lokasi_keystore),
    berlaku_mulai: payload.berlaku_mulai || null,
    berlaku_sampai: payload.berlaku_sampai || null,
    status_sertifikat: normalizeString(payload.status_sertifikat || "aktif"),
    created_by: getUserId(req),
    updated_by: getUserId(req),
    created_at: dNow,
    updated_at: dNow
  };
};
const getLatestDocumentSignature = async idSuratKeluar => DB("trs_tanda_tangan_dokumen as ttd").leftJoin("mst_pengguna as u", "ttd.id_pengguna", "u.id_pengguna").leftJoin("mst_sertifikat_elektronik as mse", "ttd.id_sertifikat_elektronik", "mse.id_sertifikat_elektronik").select("ttd.*", "u.nama_lengkap as nama_penanda_tangan", "u.nama_pengguna as username_penanda_tangan", "mse.nama_sertifikat", "mse.alias_sertifikat").where("ttd.id_surat_keluar", idSuratKeluar).where("ttd.status_tanda_tangan", "aktif").orderBy("ttd.urutan_tanda_tangan", "desc").orderBy("ttd.created_at", "desc").first();
const getLatestDocumentVerification = async idSuratKeluar => DB("trs_verifikasi_dokumen as tvd").leftJoin("mst_pengguna as u", "tvd.diverifikasi_oleh", "u.id_pengguna").select("tvd.*", "u.nama_lengkap as nama_verifikator", "u.nama_pengguna as username_verifikator").where("tvd.id_surat_keluar", idSuratKeluar).orderBy("tvd.diverifikasi_pada", "desc").orderBy("tvd.id_verifikasi_dokumen", "desc").first();
const recordSignatureLog = async ({
  idSuratKeluar,
  idPengguna,
  aksi,
  statusSebelum,
  statusSesudah,
  req,
  metadata = {}
}) => {
  const lastLog = await DB("trs_log_tanda_tangan").where("id_surat_keluar", idSuratKeluar).orderBy("id_log_tanda_tangan", "desc").first();
  const logPayloadBase = {
    id_surat_keluar: idSuratKeluar,
    id_pengguna: idPengguna || null,
    aksi,
    status_sebelum: statusSebelum || null,
    status_sesudah: statusSesudah || null,
    alamat_ip: req?.headers?.["x-forwarded-for"]?.split(",")[0]?.trim() || req?.ip || req?.connection?.remoteAddress || null,
    user_agent: req?.headers?.["user-agent"] || null,
    metadata: Object.keys(metadata || {}).length > 0 ? JSON.stringify(metadata) : null,
    hash_log_sebelumnya: lastLog?.hash_log || null,
    dibuat_pada: new Date(),
    created_by: idPengguna || null,
    created_at: new Date(),
    updated_at: new Date()
  };
  const hashLog = sha256Hex(Buffer.from(JSON.stringify({
    ...logPayloadBase,
    hash_log: null
  })));
  await DB("trs_log_tanda_tangan").insert({
    ...logPayloadBase,
    hash_log: hashLog
  });
};
export { assertMenuPermission, buildCertificatePayload, chooseBaseDocumentBuffer, generatePdfFromSurat, getAuthenticatedAttributesDigest, getCertificateRecord, getLatestDocumentSignature, getLatestDocumentVerification, getUserBranchId, getUserId, loadObjectBuffer, loadP12Signer, parseCmsSignature, preparePdfForSignature, recordSignatureLog, resolveCertificateMaterial, sha256Hex, uploadPdfBuffer, verifyPdfBuffer };
export class PenyediaTandaTangan {
  async tandatanganiDokumen() {
    throw new Error("Implementasi penyedia tanda tangan belum tersedia");
  }
  async verifikasiDokumen(parameter) {
    return verifyPdfBuffer(parameter.pdfBuffer);
  }
  async ambilInformasiSertifikat(parameter) {
    return resolveCertificateMaterial(parameter);
  }
}
export class PenyediaTandaTanganInternal extends PenyediaTandaTangan {
  async tandatanganiDokumen(parameter) {
    const signer = await loadP12Signer({
      lokasiKeystore: parameter.lokasiKeystore,
      password: parameter.password
    });
    const prepared = await preparePdfForSignature(parameter.pdfBuffer, parameter);
    const signed = await signpdf.sign(prepared, signer, parameter.signingTime || new Date());
    return Buffer.from(signed);
  }
  async ambilInformasiSertifikat(parameter) {
    const material = await resolveCertificateMaterial(parameter);
    const cert = material.cert;
    return {
      serialNumber: cert.serialNumber,
      subject: cert.subject?.attributes || [],
      issuer: cert.issuer?.attributes || [],
      validFrom: cert.validity?.notBefore || null,
      validTo: cert.validity?.notAfter || null,
      lokasiKeystore: material.lokasiKeystore
    };
  }
}
export class PenyediaTandaTanganPsre extends PenyediaTandaTangan {
  async tandatanganiDokumen() {
    throw new Error("Penyedia PSrE belum diaktifkan");
  }
}
export const createSigningProvider = () => {
  if (SIGNATURE_PROVIDER === "psre") {
    return new PenyediaTandaTanganPsre();
  }
  return new PenyediaTandaTanganInternal();
};