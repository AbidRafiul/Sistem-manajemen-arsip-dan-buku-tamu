'use client'

import fileDownload from "@/lib/axios/fileDownload";
import postData from "@/lib/axios/postData";
import { formatDateCalendar } from "@/lib/tools/dateTools";
import { showError } from "@/lib/tools/generalTools";
import { FilterMatchMode } from "primereact/api";
import { Avatar } from "primereact/avatar";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Chip } from "primereact/chip";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Divider } from "primereact/divider";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Message } from "primereact/message";
import { Tag } from "primereact/tag";
import { useEffect, useState } from "react";
import { apiEndpointDetail, apiEndpointFileDownload, apiEndpointGet } from "../endpoints";
import { IncomingLetterFile, IncomingLetterStatus, TableData, TableProps } from "../interfaces";
import Form from "./form";
import { usePermissions } from '@/hooks/usePermissions';

const statusOptions = [
    { label: "Semua Status", value: "" },
    { label: "Baru", value: "baru" },
    { label: "Diproses", value: "diproses" },
    { label: "Didisposisi", value: "didisposisi" },
    { label: "Selesai", value: "selesai" },
];

const formatFileSize = (size?: number | null) => {
    if (!size) return "-";
    if (size < 1024 * 1024) return `${Math.ceil(size / 1024)} KB`;
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
};

const getStatusConfig = (status: string): { label: string; severity: "success" | "warning" | "danger" | "info"; icon: string } => {
    const map: Record<string, { label: string; severity: "success" | "warning" | "danger" | "info"; icon: string }> = {
        baru: { label: "Baru", severity: "info", icon: "pi pi-envelope" },
        diproses: { label: "Diproses", severity: "warning", icon: "pi pi-spin pi-cog" },
        didisposisi: { label: "Didisposisi", severity: "warning", icon: "pi pi-share-alt" },
        selesai: { label: "Selesai", severity: "success", icon: "pi pi-check-circle" },
    };
    return map[String(status).toLowerCase()] || { label: status, severity: "info", icon: "pi pi-circle" };
};

const Table = ({
    state,
    setState,
    formik,
    getData,
    toast
}: TableProps) => {
    const permissions = usePermissions();
    const [previewFile, setPreviewFile] = useState<{ url: string; mimeType: string; fileName: string } | null>(null);

    const buildPayload = () => ({ keyword: state.searchVal || "", status: state.statusFilter || "" });
    const refreshData = () => getData(apiEndpointGet, buildPayload());

    const closePreview = () => {
        if (previewFile?.url) window.URL.revokeObjectURL(previewFile.url);
        setPreviewFile(null);
    };

    const closeDetail = () => {
        closePreview();
        setState((p) => ({ ...p, detail: false, detailData: null }));
    };

    const openDetail = async (rowData: TableData) => {
        closePreview();
        setState((p) => ({ ...p, detail: true, detailLoad: true, detailData: null }));
        try {
            const res = await postData(apiEndpointDetail, { surat_masuk_id: rowData.surat_masuk_id });
            setState((p) => ({ ...p, detailData: res.data?.data || null }));
        } catch (error: any) {
            const e = error?.response?.data || error;
            showError(toast, e?.message || "Detail surat gagal diambil");
            setState((p) => ({ ...p, detail: false, detailData: null }));
        } finally {
            setState((p) => ({ ...p, detailLoad: false }));
        }
    };

    const getFileBlob = async (file: IncomingLetterFile) =>
        fileDownload(apiEndpointFileDownload, { file_surat_masuk_id: file.file_surat_masuk_id });

    const previewUploadedFile = async (file: IncomingLetterFile) => {
        closePreview();
        try {
            const res = await getFileBlob(file);
            const mimeType = file.tipe_mime_file || res.headers["content-type"] || "application/octet-stream";
            const blob = new Blob([res.data], { type: mimeType });
            setPreviewFile({ url: window.URL.createObjectURL(blob), mimeType, fileName: file.nama_file || "file-surat" });
        } catch (error: any) {
            const e = error?.response?.data || error;
            showError(toast, e?.message || "File surat gagal dibuka");
        }
    };

    const downloadUploadedFile = async (file: IncomingLetterFile) => {
        try {
            const res = await getFileBlob(file);
            const blob = new Blob([res.data], { type: file.tipe_mime_file || "application/octet-stream" });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = file.nama_file || "file-surat";
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error: any) {
            const e = error?.response?.data || error;
            showError(toast, e?.message || "File surat gagal didownload");
        }
    };

    // ─── Column Templates ───────────────────────────────────────────────────

    const senderTemplate = (rowData: TableData) => (
        <div className="flex align-items-center gap-2">
            <Avatar
                label={rowData.nama_pengirim?.slice(0, 1).toUpperCase() || "S"}
                shape="circle"
                style={{ width: "2rem", height: "2rem", fontSize: "0.7rem", background: "#EEF2FF", color: "#4F46E5", fontWeight: "700", flexShrink: 0 }}
            />
            <div>
                <div className="font-semibold text-sm text-900">{rowData.nama_pengirim}</div>
                {rowData.instansi_pengirim && (
                    <div className="text-xs text-color-secondary">{rowData.instansi_pengirim}</div>
                )}
            </div>
        </div>
    );

    const letterTemplate = (rowData: TableData) => (
        <div>
            <div className="font-semibold text-sm text-900">{rowData.perihal}</div>
            <div className="text-xs text-color-secondary mt-1">
                <span className="mr-2">No. Agenda: <strong>{rowData.nomor_agenda || "-"}</strong></span>
            </div>
        </div>
    );

    const statusTemplate = (rowData: TableData) => {
        const config = getStatusConfig(rowData.status as string);
        return <Tag value={config.label} severity={config.severity} icon={config.icon} style={{ fontSize: "0.72rem", padding: "0.3rem 0.65rem" }} />;
    };

    const actionTemplate = (rowData: TableData) => (
        <div className="flex gap-1 justify-content-center">
            <Button
                icon="pi pi-eye"
                rounded text size="small"
                tooltip="Lihat Detail" tooltipOptions={{ position: "top" }}
                onClick={() => openDetail(rowData)}
            />
            <Button
                icon="pi pi-pencil"
                rounded text severity="secondary" size="small"
                tooltip="Edit" tooltipOptions={{ position: "top" }}
                onClick={() => {
                    formik.setValues({
                        surat_masuk_id: rowData.surat_masuk_id,
                        nomor_agenda: rowData.nomor_agenda,
                        nomor_surat: rowData.nomor_surat,
                        tanggal_surat: rowData.tanggal_surat?.slice(0, 10) || "",
                        tanggal_diterima: rowData.tanggal_diterima?.slice(0, 10) || "",
                        nama_pengirim: rowData.nama_pengirim,
                        instansi_pengirim: rowData.instansi_pengirim || "",
                        perihal: rowData.perihal,
                        keterangan_lampiran: rowData.keterangan_lampiran || "",
                        file_surat: null,
                        jenis_surat_id: rowData.jenis_surat_id,
                        jenis_dokumen_id: rowData.jenis_dokumen_id,
                        archive_classification_id: rowData.archive_classification_id,
                        confidentiality_level_id: rowData.confidentiality_level_id,
                        status: rowData.status,
                        created_by: rowData.created_by,
                        updated_by: rowData.updated_by,
                    });
                    setState((p) => ({ ...p, add: false, delete: false, edit: true }));
                }}
            />
            <Button
                icon="pi pi-trash"
                rounded text severity="danger" size="small"
                tooltip="Hapus" tooltipOptions={{ position: "top" }}
                onClick={() => setState((p) => ({ ...p, delete: true, selectedLetters: [rowData] }))}
            />
        </div>
    );

    const headerTemplate = (
        <div className="flex flex-wrap align-items-center justify-content-between gap-2">
            <span className="font-semibold text-color text-sm">Daftar Surat Masuk</span>
            <div className="flex flex-wrap gap-2 align-items-center">
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText
                        value={state.searchVal}
                        onChange={(e) => {
                            const value = e.target.value;
                            setState((p) => ({ ...p, searchVal: value, filters: { global: { value, matchMode: FilterMatchMode.CONTAINS } } }));
                        }}
                        onKeyDown={(e) => { if (e.key === "Enter") refreshData(); }}
                        placeholder="Cari surat..."
                        className="text-sm" style={{ height: "2.25rem" }}
                    />
                </span>
                <Dropdown
                    value={state.statusFilter}
                    options={statusOptions}
                    onChange={(e) => setState((p) => ({ ...p, statusFilter: e.value }))}
                    placeholder="Filter Status"
                    style={{ minWidth: "10rem", height: "2.25rem" }}
                />
                <Button
                    icon="pi pi-filter"
                    outlined size="small"
                    onClick={refreshData}
                    tooltip="Terapkan filter"
                    style={{ height: "2.25rem" }}
                />
            </div>
        </div>
    );

    useEffect(() => {
        getData(apiEndpointGet);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        return () => { if (previewFile?.url) window.URL.revokeObjectURL(previewFile.url); };
    }, [previewFile?.url]);

    const detailLetter = state.detailData?.surat || state.detailData?.letter || null;
    const detailFiles = state.detailData?.files || [];

    return (
        <>
            <Card className="shadow-1 border-round-2xl border-none">
                {/* Page Header */}
                <div className="mb-4">
                    <span className="text-primary font-bold text-xs uppercase" style={{ letterSpacing: "0.1em" }}>Korespondensi</span>
                    <h2 className="m-0 text-900 font-extrabold text-2xl mt-1 mb-2" style={{ letterSpacing: "-0.02em" }}>Surat Masuk</h2>
                    <p className="m-0 text-color-secondary text-sm font-medium">Kelola seluruh surat masuk, upload file, dan pantau status disposisi.</p>
                </div>

                <div className="flex flex-row flex-wrap items-center gap-2 mb-4">
                    <Button
                        size="small"
                        label="Tambah Surat"
                        icon="pi pi-plus"
                        outlined
                        severity="success"
                        onClick={() => { formik.resetForm(); setState((p) => ({ ...p, selectedLetters: [], add: true, edit: false, delete: false })); }}
                    />
                    <Divider layout="vertical" />
                    <Button
                        size="small"
                        label={`Hapus${state.selectedLetters.length > 0 ? ` (${state.selectedLetters.length})` : ""}`}
                        icon="pi pi-trash"
                        severity="danger"
                        outlined
                        disabled={state.selectedLetters.length === 0}
                        onClick={() => {
                            if (state.selectedLetters.length < 1) return;
                            setState((p) => ({ ...p, delete: true }));
                        }}
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
                    header={headerTemplate}
                    globalFilterFields={["nomor_agenda", "nomor_surat", "nama_pengirim", "instansi_pengirim", "perihal", "status"]}
                    filters={state.filters}
                    loading={state.load}
                    selection={state.selectedLetters}
                    onSelectionChange={(e) => setState((p) => ({ ...p, selectedLetters: e.value }))}
                    dataKey="surat_masuk_id"
                    emptyMessage={
                        <div className="flex flex-column align-items-center py-5 gap-3 text-color-secondary">
                            <i className="pi pi-inbox text-4xl text-300" />
                            <span className="font-medium text-sm">Belum ada surat masuk</span>
                        </div>
                    }
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    currentPageReportTemplate="Menampilkan {first}-{last} dari {totalRecords} data"
                    rowHover
                    className="text-sm"
                >
                    <Column selectionMode="multiple" headerStyle={{ width: "3rem" }} />
                    <Column field="nomor_agenda" header="No. Surat" body={(r) => (
                        <div>
                            <div className="font-semibold text-sm text-900">{r.nomor_agenda || "-"}</div>
                            <div className="text-xs text-color-secondary">{r.nomor_surat || "-"}</div>
                        </div>
                    )} sortable style={{ minWidth: "140px" }} />
                    <Column header="Perihal & Agenda" body={letterTemplate} style={{ minWidth: "200px" }} />
                    <Column header="Pengirim" body={senderTemplate} style={{ minWidth: "180px" }} />
                    <Column field="tanggal_diterima" header="Tgl. Terima" sortable body={(r) => formatDateCalendar(r.tanggal_diterima)} style={{ width: "120px" }} />
                    <Column field="nama_jenis_surat" header="Jenis Surat" style={{ width: "120px" }} />
                    <Column body={statusTemplate} header="Status" style={{ width: "130px", textAlign: "center" }} />
                    <Column field="created_at" header="Dibuat" sortable body={(r) => formatDateCalendar(r.created_at)} style={{ width: "120px" }} />
                    <Column header="Aksi" body={actionTemplate} style={{ width: "130px", textAlign: "center" }} />
                </DataTable>
            </Card>

            <Form getData={getData} toast={toast} state={state} setState={setState} formik={formik} />

            {/* ── Detail Dialog ──────────────────────────────────── */}
            <Dialog
                header={
                    <div className="flex align-items-center gap-2">
                        <i className="pi pi-envelope text-primary" />
                        <span className="font-bold text-900">Detail Surat Masuk</span>
                    </div>
                }
                visible={state.detail}
                modal
                style={{ width: "72rem", maxWidth: "96vw" }}
                onHide={closeDetail}
                pt={{ header: { className: "border-bottom-1 surface-border pb-3" } }}
            >
                {state.detailLoad ? (
                    <div className="flex flex-column align-items-center py-6 gap-3 text-color-secondary">
                        <i className="pi pi-spin pi-spinner text-3xl text-primary" />
                        <span className="text-sm font-medium">Memuat detail surat...</span>
                    </div>
                ) : (
                    <div className="flex flex-column gap-4 pt-3">
                        {/* Header info */}
                        <div className="flex align-items-start justify-content-between gap-3 p-3 surface-50 border-round-xl border-1 surface-border">
                            <div>
                                <h3 className="m-0 text-900 font-bold text-lg">{detailLetter?.perihal || "-"}</h3>
                                <div className="flex gap-2 mt-2 flex-wrap">
                                    <Chip label={`Agenda: ${detailLetter?.nomor_agenda || "-"}`} className="text-xs" style={{ height: "auto", padding: "0.2rem 0.6rem" }} />
                                    <Chip label={`Surat: ${detailLetter?.nomor_surat || "-"}`} className="text-xs" style={{ height: "auto", padding: "0.2rem 0.6rem" }} />
                                </div>
                            </div>
                            {detailLetter?.status && statusTemplate({ status: detailLetter.status } as TableData)}
                        </div>

                        <div className="grid text-sm">
                            {[
                                { label: "Pengirim", value: detailLetter?.nama_pengirim },
                                { label: "Instansi", value: detailLetter?.instansi_pengirim },
                                { label: "Tanggal Surat", value: formatDateCalendar(detailLetter?.tanggal_surat) },
                                { label: "Tanggal Diterima", value: formatDateCalendar(detailLetter?.tanggal_diterima) },
                                { label: "Jenis Surat", value: detailLetter?.nama_jenis_surat },
                                { label: "Lampiran", value: detailLetter?.keterangan_lampiran },
                            ].map(({ label, value }) => (
                                <div key={label} className="col-12 md:col-4">
                                    <div className="text-color-secondary text-xs font-bold uppercase mb-1" style={{ letterSpacing: "0.08em" }}>{label}</div>
                                    <div className="font-semibold text-900">{value || "-"}</div>
                                </div>
                            ))}
                        </div>

                        <Divider className="my-0" />

                        {/* File section */}
                        <div>
                            <div className="flex align-items-center justify-content-between mb-3">
                                <div className="font-bold text-900 flex align-items-center gap-2">
                                    <i className="pi pi-paperclip text-primary" />
                                    File Surat
                                </div>
                                <Tag value={`${detailFiles.length} file`} severity="info" />
                            </div>

                            {detailFiles.length > 0 ? (
                                <div className="grid">
                                    <div className="col-12 lg:col-5">
                                        <div className="flex flex-column gap-2">
                                            {detailFiles.map((file) => (
                                                <div key={file.file_surat_masuk_id} className="p-3 surface-50 border-round-lg border-1 surface-border">
                                                    <div className="flex justify-content-between align-items-start gap-2">
                                                        <div className="flex align-items-center gap-2">
                                                            <div className="flex align-items-center justify-content-center border-round" style={{ width: "2rem", height: "2rem", background: "#EEF2FF", color: "#4F46E5", flexShrink: 0 }}>
                                                                <i className="pi pi-file text-sm" />
                                                            </div>
                                                            <div>
                                                                <div className="font-semibold text-sm text-900">{file.nama_file || "File surat"}</div>
                                                                <div className="text-xs text-color-secondary mt-1">{file.tipe_mime_file || "-"} - {formatFileSize(file.ukuran_file)}</div>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-1">
                                                            <Button icon="pi pi-eye" rounded text size="small" tooltip="Lihat file" onClick={() => previewUploadedFile(file)} />
                                                            <Button icon="pi pi-download" rounded text size="small" tooltip="Download" onClick={() => downloadUploadedFile(file)} />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="col-12 lg:col-7">
                                        <div className="surface-50 border-round-lg border-1 surface-border p-3 flex align-items-center justify-content-center" style={{ minHeight: "26rem" }}>
                                            {previewFile ? (
                                                previewFile.mimeType.startsWith("image/") ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img src={previewFile.url} alt={previewFile.fileName} className="w-full" style={{ maxHeight: "34rem", objectFit: "contain" }} />
                                                ) : previewFile.mimeType === "application/pdf" ? (
                                                    <iframe src={previewFile.url} title={previewFile.fileName} className="w-full" style={{ minHeight: "34rem", border: "none" }} />
                                                ) : (
                                                    <div className="flex flex-column align-items-center text-center gap-3 text-color-secondary">
                                                        <i className="pi pi-file text-5xl text-300" />
                                                        <div>
                                                            <div className="font-semibold text-900">{previewFile.fileName}</div>
                                                            <p className="m-0 mt-1 text-sm">Format ini tidak bisa dipreview. Gunakan tombol download.</p>
                                                        </div>
                                                    </div>
                                                )
                                            ) : (
                                                <div className="flex flex-column align-items-center text-center gap-3 text-color-secondary">
                                                    <i className="pi pi-file-pdf text-5xl text-300" />
                                                    <div>
                                                        <div className="font-semibold text-900">Preview File</div>
                                                        <p className="m-0 mt-1 text-sm">Klik ikon mata di samping file untuk preview.</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <Message severity="info" text="Belum ada file surat yang diupload." className="w-full" />
                            )}
                        </div>
                    </div>
                )}
            </Dialog>
        </>
    );
};

export default Table;
