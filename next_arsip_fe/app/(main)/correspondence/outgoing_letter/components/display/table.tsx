'use client'

import deleteData from "@/lib/axios/deleteData";
import getDataRequest from "@/lib/axios/getData";
import postData from "@/lib/axios/postData";
import { formatDateCalendar } from "@/lib/tools/dateTools";
import { showError, showSuccess } from "@/lib/tools/generalTools";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Column } from "primereact/column";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { DataTable } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { Divider } from "primereact/divider";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Tag } from "primereact/tag";
import { useEffect, useState, useRef } from "react";
import {
    apiEndpointDelete,
    apiEndpointDetail,
    apiEndpointGet,
    apiEndpointLetterTypeManagement,
    apiEndpointUpload,
    apiEndpointArchive,
} from "../endpoints";
import formUpload from "@/lib/axios/formData";
import { TableData, TableProps } from "../interfaces";
import Form, { extractIsiSuratFromFinal } from "./form";

const statusOptions = [
    { label: "Semua Status", value: "" },
    { label: "Draft", value: "draft" },
    { label: "Menunggu Approval", value: "menunggu_approval" },
    { label: "Disetujui", value: "disetujui" },
    { label: "Ditolak", value: "ditolak" },
    { label: "Terkirim", value: "terkirim" },
    { label: "Selesai", value: "selesai" },
];

const statusConfig: Record<string, { label: string; severity: any; icon: string }> = {
    draft: { label: "Draft", severity: "secondary", icon: "pi pi-pencil" },
    menunggu_approval: { label: "Menunggu Approval", severity: "warning", icon: "pi pi-clock" },
    disetujui: { label: "Disetujui", severity: "info", icon: "pi pi-check" },
    ditolak: { label: "Ditolak", severity: "danger", icon: "pi pi-times-circle" },
    terkirim: { label: "Terkirim", severity: "success", icon: "pi pi-send" },
    selesai: { label: "Selesai", severity: "success", icon: "pi pi-check-circle" },
};

interface LetterTypeOption {
    jenis_surat_id: number;
    nama_jenis_surat: string;
}

const getUserId = (state: TableProps["state"]) =>
    state.session?.user?.IdPengguna || state.session?.user?.id || null;

const formatDate = (date?: string | null) => {
    if (!date) return "-";
    return formatDateCalendar(date, "dd MMM yyyy", null, "id") || "-";
};

const getUploadErrorMessage = (error: any) => {
    const response = error?.response?.data || error;
    const detail = String(response?.error || response?.message || "");

    if (/ECONNREFUSED.*127\.0\.0\.1:9000/i.test(detail) || /ECONNREFUSED.*9000/i.test(detail)) {
        return "File gagal diunggah karena server penyimpanan lampiran (MinIO) belum aktif.";
    }

    return response?.message || "File gagal diunggah";
};

const getTimelineIcon = (aktivitas: string) => {
    switch (aktivitas) {
        case "surat_dibuat": return "pi pi-file-edit text-blue-500 bg-blue-100 p-2 border-round-circle";
        case "surat_diupdate": return "pi pi-pencil text-yellow-500 bg-yellow-100 p-2 border-round-circle";
        case "surat_disetujui": return "pi pi-check text-green-500 bg-green-100 p-2 border-round-circle";
        case "surat_ditolak": return "pi pi-times text-red-500 bg-red-100 p-2 border-round-circle";
        case "file_surat_diupload": return "pi pi-upload text-purple-500 bg-purple-100 p-2 border-round-circle";
        case "surat_diarsipkan": return "pi pi-bookmark text-green-500 bg-green-100 p-2 border-round-circle";
        default: return "pi pi-info-circle text-gray-500 bg-gray-100 p-2 border-round-circle";
    }
};

const getTimelineLabel = (aktivitas: string, status: string) => {
    switch (aktivitas) {
        case "surat_dibuat": return "Surat Keluar Dibuat";
        case "surat_diupdate": return `Diperbarui (Status: ${statusConfig[status]?.label || status})`;
        case "surat_disetujui": return "Surat Keluar Disetujui";
        case "surat_ditolak": return "Surat Keluar Ditolak";
        case "file_surat_diupload": return "File Surat Keluar Diunggah";
        case "surat_diarsipkan": return "Surat Keluar Diarsipkan ke EDMS";
        default: return aktivitas;
    }
};

const Table = ({ state, setState, formik, getData, toast }: TableProps) => {
    const [letterTypeOptions, setLetterTypeOptions] = useState<LetterTypeOption[]>([]);
    const [uploading, setUploading] = useState(false);
    const [archiving, setArchiving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        const detailLetter = state.detailData?.surat;
        if (!file || !detailLetter) return;

        setUploading(true);
        const formData = new FormData();
        formData.append("id_surat_keluar", String(detailLetter.id_surat_keluar));
        formData.append("File", file);
        const uploadedBy = getUserId(state);
        if (uploadedBy) formData.append("uploaded_by", String(uploadedBy));

        try {
            await formUpload(apiEndpointUpload, formData, {});
            showSuccess(toast, "File berhasil diunggah");
            // Reload details
            const res = await getDataRequest(`${apiEndpointDetail}/${detailLetter.id_surat_keluar}`);
            setState((p) => ({ ...p, detailData: res.data?.data || null }));
            await refreshData();
        } catch (error: any) {
            showError(toast, getUploadErrorMessage(error));
        } finally {
            setUploading(false);
        }
    };

    const executeArchiveLetter = async () => {
        const detailLetter = state.detailData?.surat;
        if (!detailLetter?.id_surat_keluar) return;

        setArchiving(true);
        try {
            const res = await postData(apiEndpointArchive, {
                id_surat_keluar: detailLetter.id_surat_keluar,
                nama_pic: state.session?.user?.name || "Sekretariat",
                created_by: getUserId(state),
            });
            showSuccess(toast, res.data?.message || "Surat keluar berhasil diarsipkan");
            // Reload details
            const resDetail = await getDataRequest(`${apiEndpointDetail}/${detailLetter.id_surat_keluar}`);
            setState((p) => ({ ...p, detailData: resDetail.data?.data || null }));
            await refreshData();
        } catch (error: any) {
            const e = error?.response?.data || error;
            showError(toast, e?.message || "Surat keluar gagal diarsipkan");
        } finally {
            setArchiving(false);
        }
    };

    const confirmArchiveLetter = () => {
        const detailLetter = state.detailData?.surat;
        const detailFiles = state.detailData?.files || [];
        if (!detailLetter?.id_surat_keluar) return;

        if (detailFiles.length < 1) {
            showError(toast, "Unggah file surat terlebih dahulu sebelum diarsipkan");
            return;
        }

        confirmDialog({
            header: "Konfirmasi Arsip",
            message: `Arsipkan surat keluar ${detailLetter.nomor_agenda || detailLetter.nomor_surat} ke dalam Arsip Dokumen (EDMS)?`,
            icon: "pi pi-archive",
            acceptLabel: "Arsipkan",
            rejectLabel: "Batal",
            acceptClassName: "p-button-success",
            rejectClassName: "p-button-secondary p-button-outlined",
            accept: executeArchiveLetter,
        });
    };

    const buildPayload = () => ({
        keyword: state.searchVal || "",
        status: state.statusFilter || "",
        id_jenis_surat: state.jenisSuratFilter || "",
        sort_by: "created_at",
        sort_order: "desc",
    });

    const refreshData = () => getData(apiEndpointGet, buildPayload());

    const fetchLetterTypes = async () => {
        try {
            const res = await getDataRequest(apiEndpointLetterTypeManagement);
            setLetterTypeOptions([
                { jenis_surat_id: 0, nama_jenis_surat: "Semua Jenis" },
                ...(res.data?.data || []),
            ]);
        } catch (error: any) {
            const e = error?.response?.data || error;
            showError(toast, e?.message || "Jenis surat gagal diambil");
        }
    };

    const openDetail = async (rowData: TableData) => {
        setState((p) => ({ ...p, detail: true, detailLoad: true, detailData: null }));

        try {
            const res = await getDataRequest(`${apiEndpointDetail}/${rowData.id_surat_keluar}`);
            setState((p) => ({ ...p, detailData: res.data?.data || null }));
        } catch (error: any) {
            const e = error?.response?.data || error;
            showError(toast, e?.message || "Detail surat keluar gagal diambil");
            setState((p) => ({ ...p, detail: false, detailData: null }));
        } finally {
            setState((p) => ({ ...p, detailLoad: false }));
        }
    };

    const confirmDelete = (letters: TableData[]) => {
        if (letters.length < 1) return;

        confirmDialog({
            header: "Konfirmasi Hapus",
            message:
                letters.length > 1
                    ? `Hapus ${letters.length} surat keluar yang dipilih dari daftar?`
                    : `Hapus surat ${letters[0].nomor_agenda || letters[0].nomor_surat} dari daftar?`,
            icon: "pi pi-exclamation-triangle",
            acceptLabel: "Ya, Hapus",
            rejectLabel: "Batal",
            acceptClassName: "p-button-danger",
            rejectClassName: "p-button-secondary p-button-outlined",
            accept: async () => {
                setState((p) => ({ ...p, load: true }));
                try {
                    for (const letter of letters) {
                        await deleteData(`${apiEndpointDelete}/${letter.id_surat_keluar}`, {
                            updated_by: getUserId(state),
                        });
                    }

                    showSuccess(toast, "Surat keluar berhasil dihapus");
                    setState((p) => ({ ...p, selectedLetters: [] }));
                    await refreshData();
                } catch (error: any) {
                    const e = error?.response?.data || error;
                    showError(toast, e?.message || "Surat keluar gagal dihapus");
                } finally {
                    setState((p) => ({ ...p, load: false }));
                }
            },
        });
    };

    const statusTemplate = (rowData: TableData) => {
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
                style={{ fontSize: "0.72rem", padding: "0.3rem 0.65rem" }}
            />
        );
    };

    const letterTemplate = (rowData: TableData) => (
        <div>
            <div className="font-semibold text-sm text-900">{rowData.perihal || "-"}</div>
            <div className="text-xs text-color-secondary mt-1">
                Agenda: <strong>{rowData.nomor_agenda || "-"}</strong>
            </div>
        </div>
    );

    const destinationTemplate = (rowData: TableData) => (
        <div>
            <div className="font-semibold text-sm text-900">{rowData.tujuan || "-"}</div>
            {rowData.instansi_tujuan && (
                <div className="text-xs text-color-secondary mt-1">{rowData.instansi_tujuan}</div>
            )}
        </div>
    );

    const actionTemplate = (rowData: TableData) => (
        <div className="flex gap-1 justify-content-center">
            <Button
                icon="pi pi-eye"
                rounded
                text
                size="small"
                tooltip="Lihat Detail"
                tooltipOptions={{ position: "top" }}
                onClick={() => openDetail(rowData)}
            />
            <Button
                icon="pi pi-pencil"
                rounded
                text
                severity="secondary"
                size="small"
                tooltip="Edit"
                tooltipOptions={{ position: "top" }}
                onClick={() => {
                    formik.setValues({
                        id_surat_keluar: rowData.id_surat_keluar,
                        nomor_surat: rowData.nomor_surat,
                        nomor_agenda: rowData.nomor_agenda,
                        tanggal_surat: rowData.tanggal_surat?.slice(0, 10) || "",
                        tanggal_kirim: rowData.tanggal_kirim?.slice(0, 10) || "",
                        id_jenis_surat: rowData.id_jenis_surat,
                        perihal: rowData.perihal,
                        tujuan: rowData.tujuan,
                        instansi_tujuan: rowData.instansi_tujuan || "",
                        media_pengiriman: rowData.media_pengiriman || "",
                        id_template: rowData.id_template || null,
                        isi_surat: rowData.isi_surat || extractIsiSuratFromFinal(rowData.isi_surat_final),
                        isi_surat_final: rowData.isi_surat_final || "",
                        nama_pengirim: rowData.nama_pengirim || "",
                        jabatan: rowData.jabatan || "",
                        status: rowData.status,
                        file_surat: null,
                        created_by: rowData.created_by,
                        updated_by: rowData.updated_by,
                    });
                    setState((p) => ({ ...p, add: false, edit: true }));
                }}
            />
            <Button
                icon="pi pi-trash"
                rounded
                text
                severity="danger"
                size="small"
                tooltip="Hapus"
                tooltipOptions={{ position: "top" }}
                onClick={() => confirmDelete([rowData])}
            />
        </div>
    );

    const headerTemplate = (
        <div className="flex flex-column xl:flex-row xl:align-items-center justify-content-between gap-3 w-full">
            <div className="flex align-items-center gap-2" style={{ minWidth: "11rem", flexShrink: 0 }}>
                <i className="pi pi-list text-primary text-sm" />
                <span className="font-semibold text-color text-sm white-space-nowrap">Daftar Surat Keluar</span>
            </div>

            <div className="flex flex-column md:flex-row flex-wrap gap-2 align-items-stretch md:align-items-center w-full xl:justify-content-end">
                <span
                    className="p-input-icon-left w-full"
                    style={{ flex: "1 1 14rem", minWidth: "14rem", maxWidth: "22rem" }}
                >
                    <i className="pi pi-search" />
                    <InputText
                        value={state.searchVal}
                        onChange={(e) => {
                            const value = e.target.value;
                            setState((p) => ({
                                ...p,
                                searchVal: value,
                                filters: { global: { value, matchMode: p.filters.global.matchMode } },
                            }));
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") refreshData();
                        }}
                        placeholder="Cari surat..."
                        className="text-sm w-full"
                        style={{ height: "2.5rem" }}
                    />
                </span>

                <div className="w-full" style={{ flex: "1 1 11rem", minWidth: "11rem", maxWidth: "15rem" }}>
                    <Dropdown
                        value={state.statusFilter}
                        options={statusOptions}
                        onChange={(e) => setState((p) => ({ ...p, statusFilter: e.value }))}
                        placeholder="Filter Status"
                        className="w-full text-sm"
                        panelClassName="text-sm"
                        style={{ height: "2.5rem" }}
                    />
                </div>

                <div className="w-full" style={{ flex: "1 1 11rem", minWidth: "11rem", maxWidth: "15rem" }}>
                    <Dropdown
                        value={state.jenisSuratFilter || 0}
                        options={letterTypeOptions}
                        optionLabel="nama_jenis_surat"
                        optionValue="jenis_surat_id"
                        onChange={(e) => setState((p) => ({ ...p, jenisSuratFilter: e.value || null }))}
                        placeholder="Filter Jenis"
                        className="w-full text-sm"
                        panelClassName="text-sm"
                        style={{ height: "2.5rem" }}
                    />
                </div>

                <Button
                    icon="pi pi-filter"
                    aria-label="Terapkan filter"
                    outlined
                    size="small"
                    onClick={refreshData}
                    tooltip="Terapkan filter"
                    className="align-self-start md:align-self-auto"
                    style={{ width: "2.5rem", height: "2.5rem", flex: "0 0 auto" }}
                />
            </div>
        </div>
    );

    useEffect(() => {
        getData(apiEndpointGet, buildPayload());
        fetchLetterTypes();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const detailLetter = state.detailData?.surat || null;
    const detailFiles = state.detailData?.files || [];
    const detailTrackings = state.detailData?.trackings || [];

    return (
        <>
            <ConfirmDialog />
            <Card className="shadow-1 border-round-2xl border-none">
                <div className="mb-4">
                    <span className="text-primary font-bold text-xs uppercase" style={{ letterSpacing: "0.1em" }}>
                        Korespondensi
                    </span>
                    <h2 className="m-0 text-900 font-extrabold text-2xl mt-1 mb-2">
                        Data Surat Keluar
                    </h2>
                    <p className="m-0 text-color-secondary text-sm font-medium">
                        Kelola data surat keluar, tujuan pengiriman, dan status proses surat.
                    </p>
                </div>

                <div className="flex flex-row flex-wrap align-items-center gap-2 mb-4">
                    <Button
                        size="small"
                        label="Tambah Surat"
                        icon="pi pi-plus"
                        outlined
                        severity="success"
                        onClick={() => {
                            formik.resetForm();
                            setState((p) => ({ ...p, selectedLetters: [], add: true, edit: false }));
                        }}
                    />
                    <Divider layout="vertical" />
                    <Button
                        size="small"
                        label={`Hapus${state.selectedLetters.length ? ` (${state.selectedLetters.length})` : ""}`}
                        icon="pi pi-trash"
                        severity="danger"
                        outlined
                        disabled={state.selectedLetters.length === 0}
                        onClick={() => confirmDelete(state.selectedLetters)}
                    />
                    <Divider layout="vertical" />
                    <Button
                        size="small"
                        label="Refresh"
                        icon="pi pi-refresh"
                        outlined
                        loading={state.load}
                        onClick={refreshData}
                    />
                </div>

                <DataTable
                    value={state.data}
                    paginator
                    selectionMode="multiple"
                    rows={10}
                    rowsPerPageOptions={[10, 25, 50]}
                    header={headerTemplate}
                    globalFilterFields={["nomor_surat", "nomor_agenda", "perihal", "tujuan", "instansi_tujuan", "status"]}
                    filters={state.filters}
                    loading={state.load}
                    selection={state.selectedLetters}
                    onSelectionChange={(e) => setState((p) => ({ ...p, selectedLetters: e.value }))}
                    dataKey="id_surat_keluar"
                    emptyMessage={
                        <div className="flex flex-column align-items-center py-5 gap-3 text-color-secondary">
                            <i className="pi pi-send text-4xl text-300" />
                            <span className="font-medium text-sm">Belum ada surat keluar</span>
                        </div>
                    }
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    currentPageReportTemplate="Menampilkan {first}-{last} dari {totalRecords} data"
                    rowHover
                    className="text-sm"
                >
                    <Column selectionMode="multiple" headerStyle={{ width: "3rem" }} />
                    <Column field="nomor_surat" header="Nomor Surat" sortable style={{ minWidth: "150px" }} />
                    <Column header="Perihal" body={letterTemplate} style={{ minWidth: "220px" }} />
                    <Column header="Tujuan" body={destinationTemplate} style={{ minWidth: "180px" }} />
                    <Column field="nama_jenis_surat" header="Jenis Surat" body={(r) => r.nama_jenis_surat || "-"} style={{ minWidth: "130px" }} />
                    <Column field="tanggal_surat" header="Tanggal Surat" sortable body={(r) => formatDate(r.tanggal_surat)} style={{ width: "130px" }} />
                    <Column field="tanggal_kirim" header="Tanggal Kirim" sortable body={(r) => formatDate(r.tanggal_kirim)} style={{ width: "130px" }} />
                    <Column field="media_pengiriman" header="Media" body={(r) => r.media_pengiriman || "-"} style={{ width: "120px" }} />
                    <Column field="status" header="Status" sortable body={statusTemplate} style={{ width: "155px", textAlign: "center" }} />
                    <Column header="Aksi" body={actionTemplate} style={{ width: "120px", textAlign: "center" }} />
                </DataTable>
            </Card>

            <Form getData={getData} toast={toast} state={state} setState={setState} formik={formik} />

            <Dialog
                header={
                    <div className="flex align-items-center gap-2">
                        <i className="pi pi-send text-primary" />
                        <span className="font-bold text-900">Detail Surat Keluar</span>
                    </div>
                }
                visible={state.detail}
                modal
                style={{ width: "56rem", maxWidth: "96vw" }}
                onHide={() => setState((p) => ({ ...p, detail: false, detailData: null }))}
                pt={{ header: { className: "border-bottom-1 surface-border pb-3" } }}
            >
                {state.detailLoad ? (
                    <div className="flex flex-column align-items-center py-6 gap-3 text-color-secondary">
                        <i className="pi pi-spin pi-spinner text-3xl text-primary" />
                        <span className="text-sm font-medium">Memuat detail surat...</span>
                    </div>
                ) : (
                    <div className="flex flex-column gap-4 pt-3">
                        <div className="flex align-items-start justify-content-between gap-3 p-3 surface-50 border-round-xl border-1 surface-border">
                            <div>
                                <h3 className="m-0 text-900 font-bold text-lg">{detailLetter?.perihal || "-"}</h3>
                                <div className="flex gap-2 mt-2 flex-wrap text-xs text-color-secondary">
                                    <span>No. Agenda: <strong>{detailLetter?.nomor_agenda || "-"}</strong></span>
                                    <span>No. Surat: <strong>{detailLetter?.nomor_surat || "-"}</strong></span>
                                </div>
                            </div>
                            <div className="flex align-items-center gap-2">
                                {(() => {
                                    const isArchived = detailTrackings.some((t: any) => t.aktivitas === "surat_diarsipkan");
                                    const canArchive = detailFiles.length > 0 && ["disetujui", "selesai", "terkirim"].includes(String(detailLetter?.status).toLowerCase());

                                    if (isArchived) {
                                        return (
                                            <Tag 
                                                value="Sudah Diarsipkan" 
                                                severity="success" 
                                                icon="pi pi-bookmark-fill" 
                                                style={{ fontSize: "0.72rem", padding: "0.3rem 0.65rem" }} 
                                            />
                                        );
                                    } else if (canArchive) {
                                        return (
                                            <Button
                                                label="Arsipkan ke EDMS"
                                                icon="pi pi-archive"
                                                severity="success"
                                                size="small"
                                                loading={archiving}
                                                onClick={confirmArchiveLetter}
                                                style={{ fontSize: "0.75rem", padding: "0.3rem 0.65rem" }}
                                            />
                                        );
                                    }
                                    return null;
                                })()}
                                {detailLetter?.status && statusTemplate({ status: detailLetter.status } as TableData)}
                            </div>
                        </div>

                        <div className="grid text-sm">
                            {[
                                { label: "Tujuan", value: detailLetter?.tujuan },
                                { label: "Instansi Tujuan", value: detailLetter?.instansi_tujuan },
                                { label: "Tanggal Surat", value: formatDate(detailLetter?.tanggal_surat) },
                                { label: "Tanggal Kirim", value: formatDate(detailLetter?.tanggal_kirim) },
                                { label: "Jenis Surat", value: detailLetter?.nama_jenis_surat },
                                { label: "Template", value: detailLetter?.nama_template },
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

                        {detailLetter?.isi_surat_final && (
                            <>
                                <div>
                                    <div className="font-bold text-900 flex align-items-center gap-2 mb-3">
                                        <i className="pi pi-file-edit text-primary" />
                                        Preview Surat
                                    </div>
                                    <pre
                                        className="m-0 p-4 surface-50 border-1 surface-border border-round-lg text-sm line-height-3"
                                        style={{ whiteSpace: "pre-wrap", fontFamily: "Georgia, 'Times New Roman', serif" }}
                                    >
                                        {detailLetter.isi_surat_final}
                                    </pre>
                                </div>

                                <Divider className="my-0" />
                            </>
                        )}

                        <div>
                            <div className="flex align-items-center justify-content-between mb-3">
                                <div className="font-bold text-900 flex align-items-center gap-2">
                                    <i className="pi pi-paperclip text-primary" />
                                    Dokumen Terlampir
                                </div>
                                <div className="flex align-items-center gap-2">
                                    {(() => {
                                        const isArchived = detailTrackings.some((t: any) => t.aktivitas === "surat_diarsipkan");
                                        if (!isArchived) {
                                            return (
                                                <>
                                                    <input
                                                        type="file"
                                                        ref={fileInputRef}
                                                        style={{ display: "none" }}
                                                        onChange={handleFileUpload}
                                                        accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,image/jpeg,image/png"
                                                    />
                                                    <Button
                                                        type="button"
                                                        icon="pi pi-upload"
                                                        label="Unggah File"
                                                        outlined
                                                        size="small"
                                                        loading={uploading}
                                                        onClick={() => fileInputRef.current?.click()}
                                                        style={{ fontSize: "0.75rem", padding: "0.3rem 0.65rem" }}
                                                    />
                                                </>
                                            );
                                        }
                                        return null;
                                    })()}
                                    <Tag value={`${detailFiles.length} file`} severity="info" />
                                </div>
                            </div>

                            {detailFiles.length > 0 ? (
                                <div className="flex flex-column gap-2">
                                    {detailFiles.map((file, idx) => (
                                        <div key={file.id_file_surat_keluar || idx} className="p-3 surface-50 border-round-lg border-1 surface-border flex align-items-center justify-content-between gap-3">
                                            <div className="flex align-items-center gap-3">
                                                <i className="pi pi-file text-primary" />
                                                <div>
                                                    <div className="font-semibold text-sm text-900">{file.nama_file || "Dokumen"}</div>
                                                    <div className="text-xs text-color-secondary">{file.mime_type || "-"}</div>
                                                </div>
                                            </div>
                                            {file.path_file && (
                                                <a 
                                                    href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/${file.path_file}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="no-underline"
                                                >
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

                        <Divider className="my-0" />

                        {/* Beautiful Timeline Alur Approval */}
                        <div>
                            <div className="font-bold text-900 flex align-items-center gap-2 mb-3">
                                <i className="pi pi-history text-primary" />
                                Alur & Histori Approval
                            </div>

                            {detailTrackings.length > 0 ? (
                                <div className="flex flex-column gap-4 pl-3 py-2 relative" style={{ borderLeft: "2px solid var(--surface-200)" }}>
                                    {detailTrackings.map((tracking: any, idx: number) => (
                                        <div key={tracking.id_tracking || idx} className="relative flex align-items-start gap-3">
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
                    </div>
                )}
            </Dialog>
        </>
    );
};

export default Table;
