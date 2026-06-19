'use client'

import fileDownload from "@/lib/axios/fileDownload";
import postData from "@/lib/axios/postData";
import { formatDateCalendar } from "@/lib/tools/dateTools";
import { showError } from "@/lib/tools/generalTools";
import { FilterMatchMode } from "primereact/api";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Divider } from "primereact/divider";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Tag } from "primereact/tag";
import { useEffect, useState } from "react";
import { apiEndpointDetail, apiEndpointFileDownload, apiEndpointGet } from "../endpoints";
import { IncomingLetterFile, IncomingLetterStatus, TableData, TableProps } from "../interfaces";
import Form from "./form";

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

const Table = ({
    state,
    setState,
    formik,
    getData,
    toast
}: TableProps) => {
    const [previewFile, setPreviewFile] = useState<{
        url: string;
        mimeType: string;
        fileName: string;
    } | null>(null);

    const buildPayload = () => ({
        keyword: state.searchVal || "",
        status: state.statusFilter || "",
    });

    const refreshData = () => getData(apiEndpointGet, buildPayload());

    const closePreview = () => {
        if (previewFile?.url) {
            window.URL.revokeObjectURL(previewFile.url);
        }

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
            const res = await postData(apiEndpointDetail, {
                incoming_letter_id: rowData.incoming_letter_id,
            });

            setState((p) => ({
                ...p,
                detailData: res.data?.data || null,
            }));
        } catch (error: any) {
            const e = error?.response?.data || error;
            showError(toast, e?.message || "Detail surat gagal diambil");
            setState((p) => ({ ...p, detail: false, detailData: null }));
        } finally {
            setState((p) => ({ ...p, detailLoad: false }));
        }
    };

    const getFileBlob = async (file: IncomingLetterFile) => {
        return fileDownload(apiEndpointFileDownload, {
            incoming_letter_file_id: file.incoming_letter_file_id,
        });
    };

    const previewUploadedFile = async (file: IncomingLetterFile) => {
        closePreview();

        try {
            const res = await getFileBlob(file);
            const mimeType = file.file_mime_type || res.headers["content-type"] || "application/octet-stream";
            const blob = new Blob([res.data], { type: mimeType });
            const url = window.URL.createObjectURL(blob);

            setPreviewFile({
                url,
                mimeType,
                fileName: file.file_name || "file-surat",
            });
        } catch (error: any) {
            const e = error?.response?.data || error;
            showError(toast, e?.message || "File surat gagal dibuka");
        }
    };

    const downloadUploadedFile = async (file: IncomingLetterFile) => {
        try {
            const res = await getFileBlob(file);
            const blob = new Blob([res.data], { type: file.file_mime_type || "application/octet-stream" });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = file.file_name || "file-surat";
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error: any) {
            const e = error?.response?.data || error;
            showError(toast, e?.message || "File surat gagal didownload");
        }
    };

    const headerTemplate = (
        <div className="flex flex-wrap align-items-center justify-content-between gap-2">
            <span className="text-xl font-bold">Data Surat Masuk</span>

            <div className="flex flex-wrap gap-2">
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText
                        value={state.searchVal}
                        onChange={(e) => {
                            const value = e.target.value;
                            const filters = { ...state.filters };
                            filters.global = { value, matchMode: FilterMatchMode.CONTAINS };
                            setState((p) => ({ ...p, searchVal: value, filters }));
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") refreshData();
                        }}
                        placeholder="Cari surat..."
                    />
                </span>
                <Dropdown
                    value={state.statusFilter}
                    options={statusOptions}
                    onChange={(e) => setState((p) => ({ ...p, statusFilter: e.value }))}
                    placeholder="Status"
                    style={{ minWidth: "11rem" }}
                />
                <Button
                    size="small"
                    icon="pi pi-filter"
                    outlined
                    onClick={refreshData}
                    tooltip="Terapkan filter"
                />
            </div>
        </div>
    );

    const actionBodyTemplate = (rowData: TableData) => (
        <div className="flex gap-2">
            <Button
                icon="pi pi-eye"
                rounded
                outlined
                className="p-button-sm"
                onClick={() => openDetail(rowData)}
                tooltip="Detail"
            />
            <Button
                icon="pi pi-pencil"
                rounded
                outlined
                className="p-button-sm"
                onClick={() => {
                    formik.setValues({
                        incoming_letter_id: rowData.incoming_letter_id,
                        agenda_number: rowData.agenda_number,
                        letter_number: rowData.letter_number,
                        letter_date: rowData.letter_date?.slice(0, 10) || "",
                        received_date: rowData.received_date?.slice(0, 10) || "",
                        sender_name: rowData.sender_name,
                        sender_institution: rowData.sender_institution || "",
                        subject: rowData.subject,
                        attachment_description: rowData.attachment_description || "",
                        letter_file: null,
                        letter_type_id: rowData.letter_type_id,
                        document_type_id: rowData.document_type_id,
                        archive_classification_id: rowData.archive_classification_id,
                        confidentiality_level_id: rowData.confidentiality_level_id,
                        status: rowData.status,
                        created_by: rowData.created_by,
                        updated_by: rowData.updated_by,
                    });

                    setState((p) => ({ ...p, add: false, delete: false, edit: true }));
                }}
                tooltip="Edit"
            />
            <Button
                icon="pi pi-trash"
                rounded
                outlined
                severity="danger"
                className="p-button-sm"
                onClick={() => setState((p) => ({ ...p, delete: true, selectedLetters: [rowData] }))}
                tooltip="Delete"
            />
        </div>
    );

    const statusBodyTemplate = (rowData: TableData) => {
        type SeverityType = "success" | "warning" | "danger" | "info";

        const status = rowData.status?.toLowerCase() as IncomingLetterStatus;
        const statusConfig: Record<string, { label: string; severity: SeverityType }> = {
            baru: { label: "Baru", severity: "info" },
            diproses: { label: "Diproses", severity: "warning" },
            didisposisi: { label: "Didisposisi", severity: "warning" },
            selesai: { label: "Selesai", severity: "success" },
        };

        const config = statusConfig[status] || { label: rowData.status, severity: "info" as SeverityType };

        return <Tag value={config.label} severity={config.severity} />;
    };

    useEffect(() => {
        getData(apiEndpointGet);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        return () => {
            if (previewFile?.url) {
                window.URL.revokeObjectURL(previewFile.url);
            }
        };
    }, [previewFile?.url]);

    const detailLetter = state.detailData?.letter || null;
    const detailFiles = state.detailData?.files || [];

    return (
        <>
            <div className="card">
                <div className="flex justify-content-between items-start mb-4">
                    <div>
                        <h3 className="text-2xl font-semibold">Mail In</h3>
                    </div>
                </div>

                <div className="flex flex-row flex-wrap items-center gap-2 mb-4">
                    <Button
                        size="small"
                        label="New"
                        icon="pi pi-plus"
                        outlined
                        severity="success"
                        onClick={() => {
                            formik.resetForm();
                            setState((p) => ({ ...p, selectedLetters: [], add: true, edit: false, delete: false }));
                        }}
                    />
                    <Divider layout="vertical" />
                    <Button
                        size="small"
                        label={`Delete${state.selectedLetters.length > 0 ? ` (${state.selectedLetters.length})` : ""}`}
                        icon="pi pi-trash"
                        severity="danger"
                        outlined
                        onClick={() => {
                            if (state.selectedLetters.length < 1) {
                                setState((p) => ({ ...p, delete: false }));
                                return;
                            }

                            setState((p) => ({ ...p, delete: true }));
                        }}
                        disabled={state.selectedLetters.length === 0}
                    />
                    <Divider layout="vertical" />
                    <Button
                        size="small"
                        label="Refresh"
                        icon="pi pi-refresh"
                        outlined
                        onClick={refreshData}
                        loading={state.load}
                    />
                </div>

                <DataTable
                    value={state.data}
                    paginator
                    selectionMode="multiple"
                    rows={10}
                    header={headerTemplate}
                    globalFilterFields={["agenda_number", "letter_number", "sender_name", "sender_institution", "subject", "status"]}
                    filters={state.filters}
                    loading={state.load}
                    selection={state.selectedLetters}
                    onSelectionChange={(e) => setState((p) => ({ ...p, selectedLetters: e.value }))}
                    dataKey="incoming_letter_id"
                    emptyMessage="Data Kosong"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    currentPageReportTemplate="Menampilkan {first} - {last} dari {totalRecords} data"
                >
                    <Column selectionMode="multiple" headerStyle={{ width: "3rem" }} />
                    <Column field="agenda_number" header="No Agenda" sortable />
                    <Column field="letter_number" header="No Surat" sortable />
                    <Column field="received_date" header="Tanggal Terima" sortable body={(rowData) => formatDateCalendar(rowData.received_date)} />
                    <Column field="sender_name" header="Pengirim" sortable />
                    <Column field="sender_institution" header="Instansi" />
                    <Column field="subject" header="Perihal" />
                    <Column field="letter_type_name" header="Jenis Surat" />
                    <Column body={statusBodyTemplate} header="Status" sortable />
                    <Column field="created_at" sortable body={(rowData) => formatDateCalendar(rowData.created_at)} header="Datetime" />
                    <Column headerStyle={{ textAlign: "center" }} header="Action" body={actionBodyTemplate} />
                </DataTable>
            </div>

            <Form getData={getData} toast={toast} state={state} setState={setState} formik={formik} />

            <Dialog
                header="Detail Surat Masuk"
                visible={state.detail}
                modal
                style={{ width: "72rem", maxWidth: "96vw" }}
                onHide={closeDetail}
            >
                {state.detailLoad ? (
                    <div className="flex align-items-center gap-2 py-5">
                        <i className="pi pi-spin pi-spinner" />
                        <span>Memuat detail surat...</span>
                    </div>
                ) : (
                    <div className="flex flex-column gap-4">
                        <section>
                            <div className="flex justify-content-between align-items-start gap-3 mb-3">
                                <div>
                                    <h3 className="m-0">{detailLetter?.subject || "-"}</h3>
                                    <small className="text-color-secondary">{detailLetter?.agenda_number || "-"} / {detailLetter?.letter_number || "-"}</small>
                                </div>
                                {detailLetter?.status && statusBodyTemplate({ status: detailLetter.status } as TableData)}
                            </div>

                            <div className="grid">
                                <div className="col-12 md:col-6">
                                    <small className="text-color-secondary">Nomor Agenda</small>
                                    <div className="font-semibold">{detailLetter?.agenda_number || "-"}</div>
                                </div>
                                <div className="col-12 md:col-6">
                                    <small className="text-color-secondary">Nomor Surat</small>
                                    <div className="font-semibold">{detailLetter?.letter_number || "-"}</div>
                                </div>
                                <div className="col-12 md:col-6">
                                    <small className="text-color-secondary">Tanggal Surat</small>
                                    <div className="font-semibold">{formatDateCalendar(detailLetter?.letter_date) || "-"}</div>
                                </div>
                                <div className="col-12 md:col-6">
                                    <small className="text-color-secondary">Tanggal Diterima</small>
                                    <div className="font-semibold">{formatDateCalendar(detailLetter?.received_date) || "-"}</div>
                                </div>
                                <div className="col-12 md:col-6">
                                    <small className="text-color-secondary">Pengirim</small>
                                    <div className="font-semibold">{detailLetter?.sender_name || "-"}</div>
                                </div>
                                <div className="col-12 md:col-6">
                                    <small className="text-color-secondary">Lampiran</small>
                                    <div className="font-semibold">{detailLetter?.attachment_description || "-"}</div>
                                </div>
                            </div>
                        </section>

                        <section>
                            <div className="flex justify-content-between align-items-center mb-3">
                                <h4 className="m-0">File Surat</h4>
                                <Tag value={`${detailFiles.length} file`} severity="info" />
                            </div>

                            {detailFiles.length > 0 ? (
                                <div className="grid">
                                    <div className="col-12 lg:col-5">
                                        <div className="flex flex-column gap-2">
                                            {detailFiles.map((file) => (
                                                <div key={file.incoming_letter_file_id} className="surface-50 border-1 border-200 border-round p-3">
                                                    <div className="flex justify-content-between gap-3">
                                                        <div>
                                                            <strong>{file.file_name || "File surat"}</strong>
                                                            <small className="block text-color-secondary mt-1">
                                                                {file.file_mime_type || "-"} · {formatFileSize(file.file_size)}
                                                            </small>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <Button
                                                                icon="pi pi-eye"
                                                                rounded
                                                                text
                                                                tooltip="Lihat file"
                                                                onClick={() => previewUploadedFile(file)}
                                                            />
                                                            <Button
                                                                icon="pi pi-download"
                                                                rounded
                                                                text
                                                                tooltip="Download file"
                                                                onClick={() => downloadUploadedFile(file)}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="col-12 lg:col-7">
                                        <div className="surface-50 border-1 border-200 border-round p-3" style={{ minHeight: "26rem" }}>
                                            {previewFile ? (
                                                previewFile.mimeType.startsWith("image/") ? (
                                                    <img
                                                        src={previewFile.url}
                                                        alt={previewFile.fileName}
                                                        className="w-full"
                                                        style={{ maxHeight: "34rem", objectFit: "contain" }}
                                                    />
                                                ) : previewFile.mimeType === "application/pdf" ? (
                                                    <iframe
                                                        src={previewFile.url}
                                                        title={previewFile.fileName}
                                                        className="w-full border-none"
                                                        style={{ minHeight: "34rem" }}
                                                    />
                                                ) : (
                                                    <div className="flex flex-column align-items-center justify-content-center text-center gap-3" style={{ minHeight: "24rem" }}>
                                                        <i className="pi pi-file text-5xl text-color-secondary" />
                                                        <div>
                                                            <strong>{previewFile.fileName}</strong>
                                                            <p className="m-0 mt-2 text-color-secondary">File ini tidak bisa dipreview langsung. Gunakan tombol download.</p>
                                                        </div>
                                                    </div>
                                                )
                                            ) : (
                                                <div className="flex flex-column align-items-center justify-content-center text-center gap-3" style={{ minHeight: "24rem" }}>
                                                    <i className="pi pi-file-pdf text-5xl text-color-secondary" />
                                                    <div>
                                                        <strong>Pilih file untuk preview</strong>
                                                        <p className="m-0 mt-2 text-color-secondary">PDF dan gambar akan tampil di panel ini.</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="surface-50 border-1 border-200 border-round p-4 text-center text-color-secondary">
                                    Belum ada file surat yang diupload.
                                </div>
                            )}
                        </section>

                    </div>
                )}
            </Dialog>
        </>
    );
};

export default Table;
