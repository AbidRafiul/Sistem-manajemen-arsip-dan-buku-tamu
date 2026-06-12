'use client'

import { formatDateCalendar } from "@/lib/tools/dateTools";
import { FilterMatchMode } from "primereact/api";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Divider } from "primereact/divider";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Tag } from "primereact/tag";
import { useEffect } from "react";
import { apiEndpointGet } from "../endpoints";
import { IncomingLetterStatus, TableData, TableProps } from "../interfaces";
import Form from "./form";

const statusOptions = [
    { label: "Semua Status", value: "" },
    { label: "Baru", value: "baru" },
    { label: "Diproses", value: "diproses" },
    { label: "Didisposisi", value: "didisposisi" },
    { label: "Selesai", value: "selesai" },
];

const Table = ({
    state,
    setState,
    formik,
    getData,
    toast
}: TableProps) => {
    const buildPayload = () => ({
        Keyword: state.searchVal || "",
        Status: state.statusFilter || "",
    });

    const refreshData = () => getData(apiEndpointGet, buildPayload());

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
                icon="pi pi-pencil"
                rounded
                outlined
                className="p-button-sm"
                onClick={() => {
                    formik.setValues({
                        IncomingLetterId: rowData.IncomingLetterId,
                        AgendaNumber: rowData.AgendaNumber,
                        LetterNumber: rowData.LetterNumber,
                        LetterDate: rowData.LetterDate?.slice(0, 10) || "",
                        ReceivedDate: rowData.ReceivedDate?.slice(0, 10) || "",
                        SenderName: rowData.SenderName,
                        SenderInstitution: rowData.SenderInstitution || "",
                        Subject: rowData.Subject,
                        AttachmentDescription: rowData.AttachmentDescription || "",
                        LetterTypeId: rowData.LetterTypeId,
                        DocumentTypeId: rowData.DocumentTypeId,
                        ArchiveClassificationId: rowData.ArchiveClassificationId,
                        ConfidentialityLevelId: rowData.ConfidentialityLevelId,
                        Status: rowData.Status,
                        CreatedBy: rowData.CreatedBy,
                        UpdatedBy: rowData.UpdatedBy,
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

        const status = rowData.Status?.toLowerCase() as IncomingLetterStatus;
        const statusConfig: Record<string, { label: string; severity: SeverityType }> = {
            baru: { label: "Baru", severity: "info" },
            diproses: { label: "Diproses", severity: "warning" },
            didisposisi: { label: "Didisposisi", severity: "warning" },
            selesai: { label: "Selesai", severity: "success" },
        };

        const config = statusConfig[status] || { label: rowData.Status, severity: "info" as SeverityType };

        return <Tag value={config.label} severity={config.severity} />;
    };

    useEffect(() => {
        getData(apiEndpointGet);
    }, []);

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
                    globalFilterFields={["AgendaNumber", "LetterNumber", "SenderName", "SenderInstitution", "Subject", "Status"]}
                    filters={state.filters}
                    loading={state.load}
                    selection={state.selectedLetters}
                    onSelectionChange={(e) => setState((p) => ({ ...p, selectedLetters: e.value }))}
                    dataKey="IncomingLetterId"
                    emptyMessage="Data Kosong"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    currentPageReportTemplate="Menampilkan {first} - {last} dari {totalRecords} data"
                >
                    <Column selectionMode="multiple" headerStyle={{ width: "3rem" }} />
                    <Column field="AgendaNumber" header="No Agenda" sortable />
                    <Column field="LetterNumber" header="No Surat" sortable />
                    <Column field="ReceivedDate" header="Tanggal Terima" sortable body={(rowData) => formatDateCalendar(rowData.ReceivedDate)} />
                    <Column field="SenderName" header="Pengirim" sortable />
                    <Column field="SenderInstitution" header="Instansi" />
                    <Column field="Subject" header="Perihal" />
                    <Column field="LetterTypeName" header="Jenis Surat" />
                    <Column body={statusBodyTemplate} header="Status" sortable />
                    <Column field="CreatedAt" sortable body={(rowData) => formatDateCalendar(rowData.CreatedAt)} header="Datetime" />
                    <Column headerStyle={{ textAlign: "center" }} header="Action" body={actionBodyTemplate} />
                </DataTable>
            </div>

            <Form getData={getData} toast={toast} state={state} setState={setState} formik={formik} />
        </>
    );
};

export default Table;
