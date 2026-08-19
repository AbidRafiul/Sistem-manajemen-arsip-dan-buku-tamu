'use client'

import { formatDateCalendar } from "@/lib/tools/dateTools";
import { showError, showSuccess } from "@/lib/tools/generalTools";
import jsPDF from "jspdf";
import dynamic from "next/dynamic";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { Divider } from "primereact/divider";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Tag } from "primereact/tag";
import { useEffect, useState } from "react";
import {
    apiEndpointGet,
} from "../endpoints";

const statusOptions = [
    { label: "Menunggu Approval", value: "menunggu_approval" },
    { label: "Disetujui", value: "disetujui" },
    { label: "Ditolak", value: "ditolak" },
    { label: "Semua Status", value: "" },
];

const statusConfig: Record<string, { label: string; severity: any; icon: string }> = {
    draft: { label: "Draft", severity: "secondary", icon: "pi pi-pencil" },
    menunggu_approval: { label: "Menunggu Approval", severity: "warning", icon: "pi pi-clock" },
    disetujui: { label: "Disetujui", severity: "success", icon: "pi pi-check" },
    ditolak: { label: "Ditolak", severity: "danger", icon: "pi pi-times" },
    terkirim: { label: "Terkirim", severity: "info", icon: "pi pi-send" },
    selesai: { label: "Selesai", severity: "success", icon: "pi pi-check-circle" },
};

const PDFViewerDynamic = dynamic(() => import("@/app/components/print_components/pdfViewer"), { ssr: false });

const SIGNER_NAME = "BOSTANUL ASY'ARI";
const SIGNER_TITLE = "DIREKTUR";

const formatDateId = (value?: string | null) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });
};

const loadImageAsDataUrl = async (url: string) => {
    if (!url) return "";
    if (url.startsWith("data:image/")) return url;
    
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Gagal mengambil gambar");
        
        const contentType = response.headers.get("content-type");
        if (contentType && !contentType.startsWith("image/")) {
            throw new Error("Bukan format gambar");
        }
        
        const blob = await response.blob();
        return await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result || ""));
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch {
        return "";
    }
};

const extractIsiSuratFromFinal = (value?: string | null) => {
    let text = String(value || "").trim();
    if (!text) return "";

    const hormatIndex = text.toLowerCase().indexOf("dengan hormat");
    if (hormatIndex>= 0) {
        text = text.slice(hormatIndex).replace(/^dengan hormat,?\s*/i, "").trim();
    }

    text = text
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

    return text;
};

const buildDetailPdfPreviewUrl = async (detailLetter: any, config?: any) => {
    const cfg = {
        COMPANY_NAME: config?.COMPANY_NAME || "PT. MARSTECH GLOBAL",
        COMPANY_ADDRESS: config?.COMPANY_ADDRESS || "JL. MARGATAMA ASRI IV NO. 3 KANIGORO, KARTOHARJO, MADIUN, JAWA TIMUR",
        COMPANY_CONTACT: config?.COMPANY_CONTACT || "Telp. 0351-2812555 E-mail. info@marstech.co.id web. www.marstech.co.id",
        COMPANY_LICENSE: config?.COMPANY_LICENSE || "SIUP : 503.4/ 29 - MIKRO/ 401.106/ 2018 TDP : 13.13.1.47.00655"
    };

    const logoDataUrl = config?.COMPANY_LOGO || "";

    const doc = new jsPDF({
        orientation: "p",
        unit: "mm",
        format: "a4",
        putOnlyUsedFonts: true,
    });
    
    const pageWidth = 210;
    const marginX = 20;
    const maxWidth = 170;
    const lineHeight = 5;
    let cursorY = 40;

    if (logoDataUrl) {
        doc.addImage(logoDataUrl, "PNG", 24, 9, 28, 0);
    }
    doc.setFont("times", "bold");
    doc.setFontSize(14);
    doc.text(cfg.COMPANY_NAME, pageWidth / 2, 15, { align: "center" });
    doc.setFontSize(9);
    doc.text(cfg.COMPANY_ADDRESS, pageWidth / 2, 21, { align: "center" });
    doc.setFontSize(8);
    doc.text(cfg.COMPANY_CONTACT, pageWidth / 2, 26, { align: "center" });
    doc.text(cfg.COMPANY_LICENSE, pageWidth / 2, 31, { align: "center" });
    doc.setLineWidth(0.8);
    doc.line(18, 36, 190, 36);

    doc.setFont("times", "bold");
    doc.setFontSize(12);
    const metadataRows = [
        ["Nomor", detailLetter?.nomor_surat || "-"],
        ["Perihal", detailLetter?.perihal || "-"],
        ["Lamp", "-"],
    ];
    metadataRows.forEach(([label, value]) => {
        doc.text(label, marginX, cursorY);
        doc.text(":", marginX + 22, cursorY);
        doc.text(String(value || "-"), marginX + 27, cursorY);
        cursorY += 7;
    });

    cursorY += 12;
    const destinationLines = ["Kepada Yth.", detailLetter?.tujuan, detailLetter?.instansi_tujuan, "di Tempat"].filter(Boolean);
    destinationLines.forEach((line) => {
        doc.text(String(line), marginX, cursorY);
        cursorY += 6;
    });
    cursorY += 8;

    doc.setFont("times", "normal");
    doc.setFontSize(11);

    const bodyText = extractIsiSuratFromFinal(detailLetter?.isi_surat_final) || detailLetter?.isi_surat_final || "";
    const body = ["Dengan hormat,", "", bodyText, "", "Demikian surat ini kami sampaikan, atas perhatian dan kerja samanya kami ucapkan terima kasih."];

    for (const paragraph of body) {
        const isListLine = /^\s*\d+\./.test(paragraph);
        const startX = paragraph && !isListLine ? marginX + 8 : marginX;
        const wrappedLines = paragraph ? doc.splitTextToSize(paragraph, maxWidth - (startX - marginX)) : [""];

        for (const line of wrappedLines) {
            if (cursorY> 232) {
                doc.addPage();
                cursorY = 22;
            }

            doc.text(line, startX, cursorY);
            cursorY += lineHeight;
        }

        cursorY += 2;
    }

    if (cursorY> 220) {
        doc.addPage();
    }

    const signatureY = 238;
    doc.setFont("times", "normal");
    doc.setFontSize(11);
    doc.text(`Madiun, ${formatDateId(detailLetter?.tanggal_surat) || "-"}`, 142, signatureY);
    if (logoDataUrl) {
        doc.addImage(logoDataUrl, "PNG", 145, signatureY + 9, 26, 21);
    }
    doc.setFont("times", "bolditalic");
    doc.setFontSize(8);
    doc.text(cfg.COMPANY_NAME, 158, signatureY + 13, { align: "center" });
    doc.setFont("times", "bold");
    doc.setFontSize(9);
    doc.text(detailLetter?.nama_pengirim || SIGNER_NAME, 158, signatureY + 35, { align: "center" });
    doc.text(detailLetter?.jabatan || SIGNER_TITLE, 158, signatureY + 41, { align: "center" });

    doc.setFont("times", "bolditalic");
    doc.setFontSize(7);
    doc.text(`${cfg.COMPANY_NAME} - ${detailLetter?.perihal || "Surat Keluar"}`, marginX, 282);

    return URL.createObjectURL(doc.output("blob"));
};

interface LetterTypeOption {
    jenis_surat_id: number;
    nama_jenis_surat: string;
}

interface TableProps {
    state: any;
    setState: React.Dispatch<React.SetStateAction<any>>;
    getData: (apiEndpoint: string, payload?: Record<string, any>) => Promise<void>;
    toast: React.RefObject<any>;
    fetchLetterTypes?: () => Promise<LetterTypeOption[]>;
    fetchDetail?: (id: number) => Promise<any>;
    handleProcessApproval?: (type: "approve" | "reject", targets: any[], actionComment: string, buildPayload: () => any) => Promise<boolean>;
}

const formatDate = (date?: string | null) => {
    if (!date) return "-";
    return formatDateCalendar(date, "dd MMM yyyy", null, "id") || "-";
};

const Table = ({ state, setState, getData, toast, fetchLetterTypes, fetchDetail, handleProcessApproval }: TableProps) => {
    const [letterTypeOptions, setLetterTypeOptions] = useState<LetterTypeOption[]>([]);
    
    // Approval Dialog state
    const [processDialog, setProcessDialog] = useState(false);
    const [actionComment, setActionComment] = useState("");
    const [processingTarget, setProcessingTarget] = useState<any>(null); // single row or 'bulk'
    const [submitLoad, setSubmitLoad] = useState(false);
    const [pdfPreviewVisible, setPdfPreviewVisible] = useState(false);
    const [pdfPreviewUrl, setPdfPreviewUrl] = useState("");
    const [pdfPreviewLoading, setPdfPreviewLoading] = useState(false);

    const buildPayload = () => ({
        keyword: state.searchVal || "",
        status: state.statusFilter === undefined ? "menunggu_approval" : state.statusFilter,
        id_jenis_surat: state.jenisSuratFilter || "",
        sort_by: "created_at",
        sort_order: "desc",
    });

    const refreshData = () => getData(apiEndpointGet, buildPayload());

    const loadLetterTypes = async () => {
        if (fetchLetterTypes) {
            const data = await fetchLetterTypes();
            setLetterTypeOptions(data);
        }
    };

    const openDetail = async (rowData: any) => {
        setState((p: any) => ({ ...p, detail: true, detailLoad: true, detailData: null }));

        if (fetchDetail) {
            const data = await fetchDetail(rowData.id_surat_keluar);
            if (data) {
                setState((p: any) => ({ ...p, detailData: data }));
            } else {
                setState((p: any) => ({ ...p, detail: false }));
            }
        }
        setState((p: any) => ({ ...p, detailLoad: false }));
    };

    const openProcessDialog = (target: any) => {
        setProcessingTarget(target);
        setActionComment("");
        setProcessDialog(true);
    };

    const openPdfPreview = async () => {
        const detailLetter = state.detailData?.surat || null;
        if (!detailLetter?.isi_surat_final) {
            showError(toast, "Isi surat final belum tersedia untuk preview PDF");
            return;
        }

        setPdfPreviewLoading(true);
        try {
            const nextUrl = await buildDetailPdfPreviewUrl(detailLetter, state.config);
            if (pdfPreviewUrl) {
                URL.revokeObjectURL(pdfPreviewUrl);
            }
            setPdfPreviewUrl(nextUrl);
            setPdfPreviewVisible(true);
        } catch (error: any) {
            const e = error?.response?.data || error;
            showError(toast, e?.message || "Preview PDF gagal dibuat");
        } finally {
            setPdfPreviewLoading(false);
        }
    };

    const handleProcess = async (type: "approve" | "reject") => {
        if (!handleProcessApproval) return;
        setSubmitLoad(true);
        const targets = processingTarget === "bulk" ? state.selectedLetters : [processingTarget];

        const success = await handleProcessApproval(type, targets, actionComment, buildPayload);
        if (success) {
            setProcessDialog(false);
            if (processingTarget === "bulk") {
                setState((p: any) => ({ ...p, selectedLetters: [] }));
            } else {
                setState((p: any) => ({ ...p, detail: false, detailData: null }));
            }
        }
        setSubmitLoad(false);
    };

    useEffect(() => {
        getData(apiEndpointGet, buildPayload());
        loadLetterTypes();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.statusFilter, state.jenisSuratFilter]);

    const statusTemplate = (rowData: any) => {
        const config = statusConfig[String(rowData.status).toLowerCase()] || {
            label: rowData.status || "-",
            severity: "info",
            icon: "pi pi-circle",
        };

        return (
            <Tag
                value={config.label}
                severity={config.severity}
                icon={config.icon}
                style={{ fontSize: "0.72rem", padding: "0.3rem 0.65rem" }} />
        );
    };

    const letterTemplate = (rowData: any) => (
        <div>
            <div className="font-semibold text-sm text-900">{rowData.perihal || "-"}</div>
            <div className="text-xs text-color-secondary mt-1">
                Agenda: <strong>{rowData.nomor_agenda || "-"}</strong>
            </div>
        </div>
    );

    const destinationTemplate = (rowData: any) => (
        <div>
            <div className="font-semibold text-sm text-900">{rowData.tujuan || "-"}</div>
            {rowData.instansi_tujuan && (
                <div className="text-xs text-color-secondary mt-1">{rowData.instansi_tujuan}</div>
            )}
        </div>
    );

    const actionTemplate = (rowData: any) => (
        <div className="flex gap-1 justify-content-center">
            <Button icon="pi pi-eye"
                text
                size="small"
                tooltip="Lihat Detail & Riwayat"
                tooltipOptions={{ position: "top" }}
                onClick={() => openDetail(rowData)} />
            {rowData.status === "menunggu_approval" && (
                <Button icon="pi pi-check-square"
                    rounded
                    text
                   
                    size="small"
                    tooltip="Proses Persetujuan"
                    tooltipOptions={{ position: "top" }}
                    onClick={() => openProcessDialog(rowData)} />
            )}
        </div>
    );

    const headerTemplate = (
        <div className="flex flex-column xl:flex-row xl:align-items-center justify-content-between gap-3 w-full">
            <div className="flex align-items-center gap-2" style={{ minWidth: "12rem", flexShrink: 0 }}>
                <i className="pi pi-check-square text-primary text-sm" />
                <span className="font-semibold text-color text-sm white-space-nowrap">Daftar Persetujuan</span>
            </div>

            <div className="flex flex-column md:flex-row flex-wrap gap-2 align-items-stretch md:align-items-center w-full xl:justify-content-end">
                <span
                    className="p-input-icon-left w-full"
                    style={{ flex: "1 1 14rem", minWidth: "14rem", maxWidth: "22rem" }}>
                    <i className="pi pi-search" />
                    <InputText
                        value={state.searchVal}
                        onChange={(e) => {
                            const value = e.target.value;
                            setState((p: any) => ({
                                ...p,
                                searchVal: value,
                            }));
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") refreshData();
                        }}
                        placeholder="Cari surat..."
                        className="text-sm w-full"
                        style={{ height: "2.5rem" }} />
                </span>

                <div className="w-full" style={{ flex: "1 1 11rem", minWidth: "11rem", maxWidth: "15rem" }}>
                    <Dropdown
                        value={state.statusFilter}
                        options={statusOptions}
                        onChange={(e) => setState((p: any) => ({ ...p, statusFilter: e.value }))}
                        placeholder="Filter Status"
                        className="w-full text-sm"
                        panelClassName="text-sm"
                        style={{ height: "2.5rem" }} />
                </div>

                <div className="w-full" style={{ flex: "1 1 11rem", minWidth: "11rem", maxWidth: "15rem" }}>
                    <Dropdown
                        value={state.jenisSuratFilter || 0}
                        options={letterTypeOptions}
                        optionLabel="nama_jenis_surat"
                        optionValue="jenis_surat_id"
                        onChange={(e) => setState((p: any) => ({ ...p, jenisSuratFilter: e.value || null }))}
                        placeholder="Filter Jenis"
                        className="w-full text-sm"
                        panelClassName="text-sm"
                        style={{ height: "2.5rem" }} />
                </div>

                <Button icon="pi pi-filter"
                    aria-label="Terapkan filter"
                    outlined
                    size="small"
                    onClick={refreshData}
                    tooltip="Terapkan filter"
                    className="align-self-start md:align-self-auto"
                    style={{ width: "2.5rem", height: "2.5rem", flex: "0 0 auto" }} />
            </div>
        </div>
    );

    const detailLetter = state.detailData?.surat || null;
    const detailFiles = state.detailData?.files || [];
    const detailTrackings = state.detailData?.trackings || [];

    useEffect(() => {
        return () => {
            if (pdfPreviewUrl) {
                URL.revokeObjectURL(pdfPreviewUrl);
            }
        };
    }, [pdfPreviewUrl]);

    const getTimelineIcon = (aktivitas: string) => {
        switch (aktivitas) {
            case "surat_dibuat": return "pi pi-file-edit text-blue-500 bg-blue-100 p-2 border-round-circle";
            case "surat_diupdate": return "pi pi-pencil text-yellow-500 bg-yellow-100 p-2 border-round-circle";
            case "surat_disetujui": return "pi pi-check text-green-500 bg-green-100 p-2 border-round-circle";
            case "surat_ditolak": return "pi pi-times text-red-500 bg-red-100 p-2 border-round-circle";
            default: return "pi pi-info-circle text-gray-500 bg-gray-100 p-2 border-round-circle";
        }
    };

    const getTimelineLabel = (aktivitas: string, status: string) => {
        switch (aktivitas) {
            case "surat_dibuat": return "Surat Keluar Dibuat";
            case "surat_diupdate": return `Diperbarui (Status: ${statusConfig[status]?.label || status})`;
            case "surat_disetujui": return "Surat Keluar Disetujui";
            case "surat_ditolak": return "Surat Keluar Ditolak";
            default: return aktivitas;
        }
    };

    return (
        <>
            <Card className="shadow-1 border-round-2xl border-none">
                <div className="mb-3">
                    <span className="text-primary font-bold text-xs uppercase" style={{ letterSpacing: "0.1em" }}>
                        Korespondensi
                    </span>
                    <h2 className="m-0 text-900 font-bold text-2xl mb-1">
                        Approval Surat Keluar
                    </h2>
                    <p className="m-0 text-color-secondary text-sm font-medium">
                        Tinjau permohonan surat keluar, setujui atau berikan rekomendasi perbaikan (tolak).
                    </p>
                </div>

                <div className="flex flex-row flex-wrap align-items-center gap-2 mb-3">
                    <Button size="small"
                        label={`Proses Terpilih${state.selectedLetters.length ? ` (${state.selectedLetters.length})` : ""}`}
                        icon="pi pi-check-square"
                       
                        outlined
                        disabled={state.selectedLetters.length === 0}
                        onClick={() => openProcessDialog("bulk")} />
                    <Divider layout="vertical" />
                    <Button size="small"
                        label="Refresh"
                        icon="pi pi-refresh"
                        outlined
                        loading={state.load}
                        onClick={refreshData} />
                </div>

                <DataTable
                    value={state.data}
                    paginator
                    selectionMode="multiple"
                    rows={10}
                    rowsPerPageOptions={[10, 25, 50]}
                    header={headerTemplate}
                    loading={state.load}
                    selection={state.selectedLetters}
                    onSelectionChange={(e) => setState((p: any) => ({ ...p, selectedLetters: e.value }))}
                    dataKey="id_surat_keluar"
                    emptyMessage={
                        <div className="flex flex-column align-items-center py-5 gap-3 text-color-secondary">
                            <i className="pi pi-check-square text-4xl text-300" />
                            <span className="font-medium text-sm">Belum ada surat keluar yang memerlukan tindakan</span>
                        </div>
                    }
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    currentPageReportTemplate="Menampilkan {first}-{last} dari {totalRecords} data"
                    rowHover
                    className="text-sm">
                    <Column selectionMode="multiple" headerStyle={{ width: "3rem" }} />
                    <Column field="nomor_surat" header="Nomor Surat" sortable style={{ minWidth: "150px" }} />
                    <Column header="Perihal" body={letterTemplate} style={{ minWidth: "220px" }} />
                    <Column header="Tujuan" body={destinationTemplate} style={{ minWidth: "180px" }} />
                    <Column field="nama_jenis_surat" header="Jenis Surat" body={(r) => r.nama_jenis_surat || "-"} style={{ minWidth: "130px" }} />
                    <Column field="tanggal_surat" header="Tanggal Surat" sortable body={(r) => formatDate(r.tanggal_surat)} style={{ width: "130px" }} />
                    <Column field="tanggal_kirim" header="Tanggal Kirim" sortable body={(r) => formatDate(r.tanggal_kirim)} style={{ width: "130px" }} />
                    <Column field="status" header="Status" sortable body={statusTemplate} style={{ width: "155px", textAlign: "center" }} />
                    <Column header="Aksi" body={actionTemplate} style={{ width: "120px", textAlign: "center" }} />
                </DataTable>
            </Card>

            {/* Approval Action Dialog (Unified Approve/Reject) */}
            <Dialog
                header={
                    <div className="flex align-items-center gap-2">
                        <i className="pi pi-check-square text-primary" />
                        <span className="font-bold text-900">
                            {processingTarget === "bulk" 
                                ? `Proses ${state.selectedLetters.length} Surat Keluar` 
                                : "Proses Persetujuan Surat"}
                        </span>
                    </div>
                }
                visible={processDialog}
                style={{ width: "32rem", maxWidth: "90vw" }}
                modal
                onHide={() => {
                    if (!submitLoad) {
                        setProcessDialog(false);
                        setProcessingTarget(null);
                    }
                }}>
                <div className="flex flex-column gap-3 pt-2">
                    {processingTarget !== "bulk" && processingTarget && (
                        <div className="p-3 surface-50 border-round-lg border-1 surface-border">
                            <div className="text-xs text-color-secondary uppercase font-bold mb-1">Perihal / Agenda</div>
                            <div className="font-semibold text-900 text-sm">{processingTarget.perihal}</div>
                            <div className="text-xs text-color-secondary mt-1">No: {processingTarget.nomor_surat}</div>
                        </div>
                    )}

                    <div className="flex flex-column gap-1">
                        <label htmlFor="comment" className="font-semibold text-sm text-900">
                            Catatan / Rekomendasi
                        </label>
                        <InputTextarea
                            id="comment"
                            value={actionComment}
                            onChange={(e) => setActionComment(e.target.value)}
                            rows={4}
                            autoResize
                            placeholder="Tulis alasan persetujuan atau alasan penolakan di sini..."
                            className="text-sm w-full" />
                    </div>

                    <div className="flex mt-4 pt-3 border-top-1 surface-border">
                        <Button label="Batal"
                            outlined
                            severity="secondary"
                            disabled={submitLoad}
                            onClick={() => {
                                setProcessDialog(false);
                                setProcessingTarget(null);
                            }}
                            className="text-sm" />
                        <Button label="Tolak Surat"
                            icon="pi pi-times"
                            severity="danger"
                            loading={submitLoad}
                            onClick={() => handleProcess("reject")}
                            className="text-sm" />
                        <Button label="Setujui Surat"
                            icon="pi pi-check"
                           
                            loading={submitLoad}
                            onClick={() => handleProcess("approve")}
                            className="text-sm" />
                    </div>
                </div>
            </Dialog>

            {/* Letter Detail Dialog with Approval History Log Timeline */}
            <Dialog
                header={
                    <div className="flex align-items-center gap-2">
                        <i className="pi pi-info-circle text-primary" />
                        <span className="font-bold text-900">Detail & Alur Approval Surat</span>
                    </div>
                }
                visible={state.detail}
                modal
                style={{ width: "56rem", maxWidth: "96vw" }}
                onHide={() => setState((p: any) => ({ ...p, detail: false, detailData: null }))}
                pt={{ header: { className: "border-bottom-1 surface-border pb-3" } }}>
                {state.detailLoad ? (
                    <div className="flex flex-column align-items-center py-6 gap-3 text-color-secondary">
                        <i className="pi pi-spin pi-spinner text-3xl text-primary" />
                        <span className="text-sm font-medium">Memuat detail surat...</span>
                    </div>
                ) : (
                    <div className="flex flex-column gap-4 pt-3">
                        <div className="flex align-align-items-center justify-content-between gap-3 p-3 surface-50 border-round-xl border-1 surface-border">
                            <div>
                                <h3 className="m-0 text-900 font-bold text-lg">{detailLetter?.perihal || "-"}</h3>
                                <div className="flex gap-2 mt-2 flex-wrap text-xs text-color-secondary">
                                    <span>No. Agenda: <strong>{detailLetter?.nomor_agenda || "-"}</strong></span>
                                    <span>No. Surat: <strong>{detailLetter?.nomor_surat || "-"}</strong></span>
                                </div>
                            </div>
                            <div className="flex flex-column align-align-items-end gap-2">
                                <Button icon="pi pi-file-pdf"
                                    label="Preview PDF"
                                    outlined
                                    size="small"
                                    disabled={!detailLetter?.isi_surat_final}
                                    loading={pdfPreviewLoading}
                                    onClick={openPdfPreview} />
                                {detailLetter?.status && statusTemplate({ status: detailLetter.status } as any)}
                            </div>
                        </div>

                        <div className="grid text-sm">
                            {[
                                { label: "Tujuan", value: detailLetter?.tujuan },
                                { label: "Instansi Tujuan", value: detailLetter?.instansi_tujuan },
                                { label: "Tanggal Surat", value: formatDate(detailLetter?.tanggal_surat) },
                                { label: "Tanggal Kirim", value: formatDate(detailLetter?.tanggal_kirim) },
                                { label: "Jenis Surat", value: detailLetter?.nama_jenis_surat },
                                { label: "Media Pengiriman", value: detailLetter?.media_pengiriman },
                            ].map(({ label, value }) => (
                                <div key={label} className="col-12 md:col-4">
                                    <div className="text-color-secondary text-xs font-bold uppercase mb-1" style={{ letterSpacing: "0.08em" }}>
                                        {label}
                                    </div>
                                    <div className="font-semibold text-900">{value || "-"}</div>
                                </div>
                            ))}
                        </div>

                        <Divider className="my-0" />

                        {/* Beautiful Timeline Alur Approval */}
                        <div>
                            <div className="font-bold text-900 flex align-items-center gap-2 mb-3">
                                <i className="pi pi-history text-primary" />
                                Alur & Histori Approval
                            </div>

                            {detailTrackings.length> 0 ? (
                                <div className="flex flex-column gap-4 pl-3 py-2 position-relative" style={{ borderLeft: "2px solid var(--surface-200)" }}>
                                    {detailTrackings.map((tracking: any, idx: number) => (
                                        <div key={tracking.id_tracking || idx} className="relative flex align-align-items-center gap-3">
                                            {/* Custom Icon Pin */}
                                            <div className="absolute" style={{ left: "-27px", top: "0" }}>
                                                <i className={`${getTimelineIcon(tracking.aktivitas)} shadow-1`} style={{ fontSize: "0.85rem", padding: "0.4rem" }} />
                                            </div>
                                            <div className="flex-1 pl-2">
                                                <div className="flex align-items-center justify-content-between gap-3 flex-wrap">
                                                    <span className="font-bold text-sm text-900">
                                                        {getTimelineLabel(tracking.aktivitas, tracking.status)}
                                                    </span>
                                                    <span className="text-xs text-color-secondary">
                                                        {formatDateCalendar(tracking.tanggal, "dd MMM yyyy HH:mm", null, "id")}
                                                    </span>
                                                </div>
                                                <div className="text-xs font-semibold text-primary mt-1">
                                                    Oleh: {tracking.nama_pembuat || "Sistem"}
                                                </div>
                                                {tracking.catatan && (
                                                    <div className="text-sm text-color-secondary bg-surface-50 border-round p-2 mt-2 border-1 surface-border border-left-3 border-left-primary">
                                                        {tracking.catatan}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-4 text-color-secondary text-sm">
                                    Belum ada catatan riwayat tracking untuk surat ini.
                                </div>
                            )}
                        </div>

                        <Divider className="my-0" />

                        <div>
                            <div className="flex align-items-center justify-content-between mb-3">
                                <div className="font-bold text-900 flex align-items-center gap-2">
                                    <i className="pi pi-paperclip text-primary" />
                                    Dokumen Terlampir
                                </div>
                                <Tag value={`${detailFiles.length} file`} severity="info" />
                            </div>

                            {detailFiles.length> 0 ? (
                                <div className="flex flex-column gap-2">
                                    {detailFiles.map((file: any, idx: number) => (
                                        <div key={file.id_file_surat_keluar || idx} className="p-3 surface-50 border-round-lg border-1 surface-border flex align-items-center justify-content-between gap-3">
                                            <div className="flex align-items-center gap-3">
                                                <i className="pi pi-file text-primary" />
                                                <div>
                                                    <div className="font-semibold text-sm text-900">{file.nama_file || "Dokumen"}</div>
                                                    <div className="text-xs text-color-secondary">{file.mime_type || "-"}</div>
                                                </div>
                                            </div>
                                            {/* Standard download file link since we have uploads exposed */}
                                            {file.path_file && (
                                                <a 
                                                    href={`${process.env.NEXT_PUBLIC_URL_API?.replace('/api/v1', '') || ''}/${file.path_file}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="no-underline">
                                                    <Button icon="pi pi-download" rounded text size="small" tooltip="Download File" />
                                                </a>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-column align-items-center py-4 gap-2 text-color-secondary surface-50 border-round-lg">
                                    <i className="pi pi-file text-3xl text-300" />
                                    <span className="text-sm font-medium">Belum ada dokumen terlampir</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </Dialog>

            <Dialog
                visible={pdfPreviewVisible}
                header={
                    <div className="flex align-items-center gap-2">
                        <i className="pi pi-file-pdf text-primary" />
                        <span className="font-bold text-900">Preview PDF Surat</span>
                    </div>
                }
                modal
                style={{ width: "92vw", maxWidth: "92rem", height: "90vh" }}
                onHide={() => {
                    setPdfPreviewVisible(false);
                    if (pdfPreviewUrl) {
                        URL.revokeObjectURL(pdfPreviewUrl);
                        setPdfPreviewUrl("");
                    }
                }}
                pt={{ content: { className: "h-full" } }}>
                <div className="h-full">
                    {pdfPreviewUrl ? (
                        <PDFViewerDynamic
                            pdfUrl={pdfPreviewUrl}
                            paperSize="A4"
                            fileName={detailLetter?.nomor_surat || "preview-surat-keluar"} />
                    ) : (
                        <div className="flex flex-column align-items-center justify-content-center h-full gap-3 text-color-secondary">
                            <i className="pi pi-spin pi-spinner text-3xl text-primary" />
                            <span className="text-sm font-medium">Memuat preview PDF...</span>
                        </div>
                    )}
                </div>
            </Dialog>
        </>
    );
};

export default Table;
