import { AddPageInfoProps, FooterProps, HeaderLaporanProps } from "@/types/print-tools";
import { formatDateCalendar } from "../dateTools";
import autoTable from "jspdf-autotable";
import { getDBConfig } from "../serverTools";

export const HeaderLaporan = async ({
    doc, marginTopInMm = 10, judulLaporan, periodeLaporan
}: HeaderLaporanProps): Promise<void> => {
    const pageWidth = doc.internal.pageSize.width;
    const [img, namaPerusahaan, alamat, telepon] = await Promise.all([
        getDBConfig("msLogoPerusahaan"),
        getDBConfig("msNamaPerusahaan"),
        getDBConfig("msAlamatPerusahaan"),
        getDBConfig("msTeleponPerusahaan"),
    ]);
    const baseY = marginTopInMm + 5;
    const layout = {
        imageWidth: 20,
        imageX: 15,
        textStartX: 40,
        baseY,
        titleBaseY: baseY + 25
    };

    // Yang Handle Logo
    if (img?.trim()) {
        try {
            if (img.startsWith("data:image/")) {
                // If the backend returned a base64 Data URL, extract format and add image
                const format = img.split(';')[0].split('/')[1].toUpperCase();
                // We use layout.imageWidth for both width and height (square aspect) or calculate aspect ratio.
                // Let's just pass 0 for height so it maintains aspect ratio automatically! (in jsPDF, if h=0 it infers from w)
                doc.addImage(img, format, layout.imageX, baseY - 4, layout.imageWidth, 0, '', 'FAST');
            } else {
                doc.setFont("helvetica", "bold");
                doc.setFontSize(11);
                doc.text(img ?? "", layout.imageX, layout.baseY - 4);
            }
        } catch (error: any) {
            console.warn("Logo gagal ditambahkan : ", error?.message)
        }
    }

    // Yang Handle Teks
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(namaPerusahaan ?? "", layout.textStartX, layout.baseY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(alamat ?? "", layout.textStartX, layout.baseY + 5);
    doc.text(`No. Telp : ${telepon ?? "-"}`, layout.textStartX, layout.baseY + 10);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(judulLaporan, pageWidth / 2, layout.titleBaseY, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(periodeLaporan, pageWidth / 2, layout.titleBaseY + 6, { align: "center" });
}

export const AddPageInfo = ({
    doc, userName, marginRightInMm = 10
}: AddPageInfoProps): void => {
    const options: Intl.DateTimeFormatOptions = {
        hour12: false,
        timeZone: "Asia/Jakarta"
    }

    const currentDate = new Date().toLocaleString("id-ID", options);
    const pageInfo = `Page ${doc.internal.getCurrentPageInfo().pageNumber}`;
    const userInfo = `${userName} | ${currentDate}`;

    const { width: pageWidth, height: pageHeight } = doc.internal.pageSize;

    const pageTextX = pageWidth - marginRightInMm;
    const pageTextY = pageHeight - 10;

    doc.setFontSize(8);
    doc.text(pageInfo, pageTextX, pageTextY, { align: "right" });
    doc.text(userInfo, pageTextX, pageTextY + 5, { align: "right" });
}

export const Footer = async ({
    doc, marginLeft, marginTop, marginRight, paraf1, paraf2,
    namaPetugas1, namaPetugas2, jabatan1, jabatan2, lastY
}: FooterProps) => {
    const kotaPerusahaan = await getDBConfig("msKotaPerusahaan") || "Kota";
    const namaPerusahaan = await getDBConfig("msNamaPerusahaan") || "Nama Perusahaan";
    const pimpinan = await getDBConfig("msNamaPimpinan") || "Pimpinan Utama";
    const today = new Date();

    const finalParaf2 = paraf2 || "Mengetahui,";
    const finalNamaPetugas2 = namaPetugas2 || pimpinan;
    const finalJabatan2 = jabatan2 || "Pimpinan Utama";

    const vaData = [
        ['', '', '', '', '', `${kotaPerusahaan}, ${formatDateCalendar(today)}`],
        ['', '', '', '', '', `${namaPerusahaan}`],
        ['', `${paraf1}`, '', '', '', `${finalParaf2}`],
        ['', '', '', '', '', ''],
        ['', '', '', '', '', ''],
        ['', '..............', '', '', '', '.............'],
        ['', `${namaPetugas1}`, '', '', '', `${finalNamaPetugas2}`],
        ['', `${jabatan1}`, '', '', '', `${finalJabatan2}`],
    ];

    const finalY = lastY ?? doc?.autoTable.previous?.finalY ?? 20;

    const options = {
        startY: finalY + 10,
        theme: "plain",
        margin: {
            top: marginTop,
            left: marginLeft,
            right: marginRight,
        },
        styles: {
            fontSize: 10,
            valign: "middle",
            halign: "center",
        },
    } as const;

    autoTable(doc, {
        body: vaData,
        ...options,
    });
}