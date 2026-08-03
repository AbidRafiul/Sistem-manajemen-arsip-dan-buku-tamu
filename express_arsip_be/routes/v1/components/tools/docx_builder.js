import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import PizZip from "pizzip";
import DB from "../../../../core/config/knex.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOGO_PATH = path.resolve(__dirname, "../../../../assets/marstech-logo.png");

// Konfigurasi dinamis akan diambil melalui tabel config

const escapeXml = (value) =>
  String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const formatDateId = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
};

const extractBodyFromFinalLetter = (value) => {
  let text = String(value || "").trim();
  if (!text) return "";

  const hormatIndex = text.toLowerCase().indexOf("dengan hormat");
  if (hormatIndex >= 0) {
    text = text.slice(hormatIndex).replace(/^dengan hormat,?\s*/i, "").trim();
  }

  return text
    .replace(/^nomor\s*:.*(?:\r?\n|$)/gim, "")
    .replace(/^lampiran\s*:.*(?:\r?\n|$)/gim, "")
    .replace(/^lamp\s*:.*(?:\r?\n|$)/gim, "")
    .replace(/^perihal\s*:.*(?:\r?\n|$)/gim, "")
    .replace(/^kepada yth\.?\s*(?:\r?\n|$)/gim, "")
    .replace(/^di tempat\s*(?:\r?\n|$)/gim, "")
    .replace(/demikian surat ini[\s\S]*$/i, "")
    .replace(/demikian surat .*?terima kasih\.?[\s\S]*$/i, "")
    .replace(/hormat kami,?[\s\S]*$/i, "")
    .trim();
};

const buildBodyOnly = (body) => [
  "Dengan hormat,",
  "",
  extractBodyFromFinalLetter(body),
  "",
  "Demikian surat ini dibuat untuk dipergunakan sebagaimana mestinya.",
].join("\n");

const makeParagraphXml = (
  text,
  { align = "left", bold = false, italic = false, size = 24, spacingAfter = 80, indentFirst = 0 } = {}
) => `
  <w:p>
    <w:pPr>
      <w:jc w:val="${align}" />
      <w:spacing w:after="${spacingAfter}" />
      ${indentFirst ? `<w:ind w:firstLine="${indentFirst}" />` : ""}
    </w:pPr>
    <w:r>
      <w:rPr>
        ${bold ? "<w:b />" : ""}
        ${italic ? "<w:i />" : ""}
        <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" />
        <w:sz w:val="${size}" />
      </w:rPr>
      <w:t xml:space="preserve">${escapeXml(text)}</w:t>
    </w:r>
  </w:p>
`;

const makeImageXml = (relationshipId, widthEmu = 914400, heightEmu = 762000) => `
  <w:p>
    <w:pPr><w:jc w:val="center" /></w:pPr>
    <w:r>
      <w:drawing>
        <wp:inline distT="0" distB="0" distL="0" distR="0">
          <wp:extent cx="${widthEmu}" cy="${heightEmu}" />
          <wp:docPr id="1" name="Logo" />
          <a:graphic>
            <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
              <pic:pic>
                <pic:nvPicPr>
                  <pic:cNvPr id="1" name="marstech-logo.png" />
                  <pic:cNvPicPr />
                </pic:nvPicPr>
                <pic:blipFill>
                  <a:blip r:embed="${relationshipId}" />
                  <a:stretch><a:fillRect /></a:stretch>
                </pic:blipFill>
                <pic:spPr>
                  <a:xfrm>
                    <a:off x="0" y="0" />
                    <a:ext cx="${widthEmu}" cy="${heightEmu}" />
                  </a:xfrm>
                  <a:prstGeom prst="rect"><a:avLst /></a:prstGeom>
                </pic:spPr>
              </pic:pic>
            </a:graphicData>
          </a:graphic>
        </wp:inline>
      </w:drawing>
    </w:r>
  </w:p>
`;

const makeHeaderXml = (hasLogo, cfg) => `
  <w:tbl>
    <w:tblPr>
      <w:tblW w:w="0" w:type="auto" />
      <w:tblBorders>
        <w:top w:val="nil" /><w:left w:val="nil" /><w:bottom w:val="nil" />
        <w:right w:val="nil" /><w:insideH w:val="nil" /><w:insideV w:val="nil" />
      </w:tblBorders>
    </w:tblPr>
    <w:tblGrid><w:gridCol w:w="1800" /><w:gridCol w:w="7600" /></w:tblGrid>
    <w:tr>
      <w:tc>
        <w:tcPr><w:tcW w:w="1800" w:type="dxa" /></w:tcPr>
        ${hasLogo ? makeImageXml("rIdLogo") : makeParagraphXml("", { spacingAfter: 0 })}
      </w:tc>
      <w:tc>
        <w:tcPr><w:tcW w:w="7600" w:type="dxa" /></w:tcPr>
        ${makeParagraphXml(cfg.COMPANY_NAME, { align: "center", bold: true, size: 32, spacingAfter: 20 })}
        ${makeParagraphXml(cfg.COMPANY_ADDRESS, { align: "center", bold: true, size: 20, spacingAfter: 10 })}
        ${makeParagraphXml(cfg.COMPANY_CONTACT, { align: "center", bold: true, size: 18, spacingAfter: 10 })}
        ${makeParagraphXml(cfg.COMPANY_LICENSE, { align: "center", bold: true, size: 18, spacingAfter: 0 })}
      </w:tc>
    </w:tr>
  </w:tbl>
  <w:p>
    <w:pPr>
      <w:pBdr><w:bottom w:val="single" w:sz="18" w:space="4" w:color="000000" /></w:pBdr>
      <w:spacing w:after="220" />
    </w:pPr>
  </w:p>
`;

const makeInfoRowXml = (label, value) => makeParagraphXml(
  `${label.padEnd(8, " ")}: ${value || "-"}`,
  { bold: true, size: 24, spacingAfter: 40 }
);

const makeBodyXml = (body) =>
  String(body || "")
    .split(/\r?\n/)
    .map((line) =>
      makeParagraphXml(line, {
        size: 24,
        spacingAfter: line ? 80 : 120,
        indentFirst: line && !/^\s*\d+\./.test(line) ? 540 : 0,
      })
    )
    .join("");

const makeSignatureXml = (letter, hasLogo, cfg) => {
  const signerName = letter?.nama_pengirim || cfg.SIGNER_NAME;
  const signerTitle = letter?.jabatan || cfg.SIGNER_TITLE;

  return `
  <w:tbl>
    <w:tblPr>
      <w:tblW w:w="0" w:type="auto" />
      <w:tblBorders>
        <w:top w:val="nil" /><w:left w:val="nil" /><w:bottom w:val="nil" />
        <w:right w:val="nil" /><w:insideH w:val="nil" /><w:insideV w:val="nil" />
      </w:tblBorders>
    </w:tblPr>
    <w:tblGrid><w:gridCol w:w="5600" /><w:gridCol w:w="3600" /></w:tblGrid>
    <w:tr>
      <w:tc><w:tcPr><w:tcW w:w="5600" w:type="dxa" /></w:tcPr>${makeParagraphXml("", { spacingAfter: 0 })}</w:tc>
      <w:tc>
        <w:tcPr><w:tcW w:w="3600" w:type="dxa" /></w:tcPr>
        ${makeParagraphXml(`Madiun, ${formatDateId(letter.tanggal_surat)}`, { align: "center", size: 24, spacingAfter: 220 })}
        ${hasLogo ? makeImageXml("rIdLogo", 780000, 650000) : makeParagraphXml("", { spacingAfter: 500 })}
        ${makeParagraphXml(cfg.COMPANY_NAME, { align: "center", bold: true, italic: true, size: 16, spacingAfter: 260 })}
        ${makeParagraphXml(signerName, { align: "center", bold: true, size: 20, spacingAfter: 20 })}
        ${makeParagraphXml(signerTitle, { align: "center", bold: true, size: 20, spacingAfter: 0 })}
      </w:tc>
    </w:tr>
  </w:tbl>
`;
};

export const buildDocxBufferFromText = async (title, body, letter = {}) => {
  const vaData = await DB("config").whereIn("kode", [
    "msNamaPerusahaan", "msAlamatPerusahaan", "msTeleponPerusahaan", "msNamaPimpinan", "msLogoPerusahaan"
  ]).select("kode", "keterangan");
  const configMap = {};
  vaData.forEach(row => { configMap[row.kode] = row.keterangan; });

  const cfg = {
    COMPANY_NAME: configMap["msNamaPerusahaan"] || "PT. MARSTECH GLOBAL",
    COMPANY_ADDRESS: configMap["msAlamatPerusahaan"] || "JL. MARGATAMA ASRI IV NO. 3 KANIGORO, KARTOHARJO, MADIUN, JAWA TIMUR",
    COMPANY_CONTACT: `Telp. ${configMap["msTeleponPerusahaan"] || "0351-2812555"} E-mail. info@marstech.co.id web. www.marstech.co.id`,
    COMPANY_LICENSE: "SIUP : 503.4/ 29 - MIKRO/ 401.106/ 2018 TDP : 13.13.1.47.00655",
    SIGNER_NAME: configMap["msNamaPimpinan"] || "BOSTANUL ASY'ARI",
    SIGNER_TITLE: "DIREKTUR",
  };

  const zip = new PizZip();
  let logoBuffer = null;
  const dbLogoName = configMap["msLogoPerusahaan"];
  if (dbLogoName) {
      const dbLogoPath = path.resolve(process.cwd(), "public/uploads/config/logo_perusahaan", dbLogoName);
      if (fs.existsSync(dbLogoPath)) {
          logoBuffer = fs.readFileSync(dbLogoPath);
      }
  }
  if (!logoBuffer && fs.existsSync(LOGO_PATH)) {
      logoBuffer = fs.readFileSync(LOGO_PATH);
  }

  const bodyOnly = buildBodyOnly(body);

  zip.file(
    "[Content_Types].xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Default Extension="png" ContentType="image/png"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>`
  );

  zip.folder("_rels").file(
    ".rels",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>`
  );

  zip.folder("docProps").file(
    "core.xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:dcterms="http://purl.org/dc/terms/"
  xmlns:dcmitype="http://purl.org/dc/dcmitype/"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>${escapeXml(title)}</dc:title>
  <dc:creator>Archiva</dc:creator>
  <cp:lastModifiedBy>Archiva</cp:lastModifiedBy>
</cp:coreProperties>`
  );

  zip.folder("docProps").file(
    "app.xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties">
  <Application>Microsoft Office Word</Application>
</Properties>`
  );

  zip.folder("word").folder("_rels").file(
    "document.xml.rels",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  ${logoBuffer ? '<Relationship Id="rIdLogo" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/marstech-logo.png"/>' : ""}
</Relationships>`
  );

  if (logoBuffer) {
    zip.folder("word").folder("media").file("marstech-logo.png", logoBuffer);
  }

  zip.folder("word").file(
    "document.xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas"
  xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
  xmlns:o="urn:schemas-microsoft-com:office:office"
  xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
  xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math"
  xmlns:v="urn:schemas-microsoft-com:vml"
  xmlns:wp14="http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing"
  xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
  xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
  xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"
  xmlns:w10="urn:schemas-microsoft-com:office:word"
  xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
  xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml"
  xmlns:wpg="http://schemas.microsoft.com/office/word/2010/wordprocessingGroup"
  xmlns:wpi="http://schemas.microsoft.com/office/word/2010/wordprocessingInk"
  xmlns:wne="http://schemas.microsoft.com/office/word/2006/wordml"
  xmlns:wps="http://schemas.microsoft.com/office/word/2010/wordprocessingShape"
  mc:Ignorable="w14 wp14">
  <w:body>
    ${makeHeaderXml(Boolean(logoBuffer), cfg)}
    ${makeInfoRowXml("Nomor", letter.nomor_surat)}
    ${makeInfoRowXml("Perihal", letter.perihal)}
    ${makeInfoRowXml("Lamp", "-")}
    ${makeParagraphXml("", { spacingAfter: 160 })}
    ${makeParagraphXml("Kepada Yth.", { bold: true, size: 24, spacingAfter: 20 })}
    ${makeParagraphXml(letter.tujuan || "-", { bold: true, size: 24, spacingAfter: 20 })}
    ${letter.instansi_tujuan ? makeParagraphXml(letter.instansi_tujuan, { bold: true, size: 24, spacingAfter: 20 }) : ""}
    ${makeParagraphXml("di Tempat", { bold: true, size: 24, spacingAfter: 220 })}
    ${makeBodyXml(bodyOnly)}
    ${makeParagraphXml("", { spacingAfter: 260 })}
    ${makeSignatureXml(letter, Boolean(logoBuffer), cfg)}
    ${makeParagraphXml(`${cfg.COMPANY_NAME} - ${letter.perihal || "Surat Keluar"}`, { bold: true, italic: true, size: 16, spacingAfter: 0 })}
    <w:sectPr>
      <w:pgSz w:w="11906" w:h="16838"/>
      <w:pgMar w:top="720" w:right="1260" w:bottom="720" w:left="1620" w:header="708" w:footer="708" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>`
  );

  return zip.generate({ type: "nodebuffer" });
};
