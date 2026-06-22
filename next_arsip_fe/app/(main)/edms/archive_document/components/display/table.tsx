'use client'

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Tag } from "primereact/tag";
import { Dialog } from "primereact/dialog";
import { Divider } from "primereact/divider";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { DocumentData, LoanData, TableProps } from "../interfaces";
import { formatDateCalendar } from "@/lib/tools/dateTools";
import Form from "./form";

const Table = ({
    state,
    setState,
    formik,
    getDocuments,
    getDocumentDetail,
    deleteDocuments,
    toast
}: TableProps) => {
    const router = useRouter();

    const formatDateInput = (value?: string) => {
        if (!value) return '';
        return String(value).slice(0, 10);
    };

    const headerTemplate = (
        <div className="flex flex-wrap align-items-center justify-content-between gap-2">
            <span className="text-xl font-bold">Archive Documents</span>
            <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText
                    value={state.searchVal}
                    onChange={(e) => {
                        const value = e.target.value;
                        const filters = { ...state.filters };
                        filters.global.value = value;
                        setState((p) => ({ ...p, searchVal: value, filters }));
                    }}
                    placeholder="Search documents..."
                />
            </span>
        </div>
    );

    const statusTemplate = (rowData: DocumentData) => (
        <Tag
            value={rowData.status}
            severity={rowData.status === 'active' ? 'success' : 'danger'}
            style={{ minWidth: "75px", justifyContent: "center" }}
        />
    );

    const actionTemplate = (rowData: DocumentData) => (
        <div className="flex gap-2">
            <Button
                icon="pi pi-eye"
                rounded
                outlined
                className="p-button-sm"
                tooltip="Detail"
                loading={state.detailLoad}
                onClick={() => getDocumentDetail(rowData.document_id)}
            />
            <Button
                icon="pi pi-history"
                rounded
                outlined
                severity="info"
                className="p-button-sm"
                tooltip="Versions"
                onClick={() => router.push(`/edms/archive_document/${rowData.document_id}/versions`)}
            />
            <Button
                icon="pi pi-pencil"
                rounded
                outlined
                className="p-button-sm"
                tooltip="Edit"
                onClick={() => {
                    formik.setValues({
                        document_id: rowData.document_id,
                        document_name: rowData.document_name,
                        document_number: rowData.document_number,
                        document_date: formatDateInput(rowData.document_date),
                        expired_date: formatDateInput(rowData.expired_date),
                        pic_name: rowData.pic_name,
                    });
                    setState((p) => ({ ...p, add: false, edit: true, delete: false, selectedDocuments: [rowData] }));
                }}
            />
            <Button
                icon="pi pi-trash"
                rounded
                outlined
                severity="danger"
                className="p-button-sm"
                tooltip="Delete"
                onClick={() => setState((p) => ({ ...p, delete: true, selectedDocuments: [rowData] }))}
            />
        </div>
    );

    const deleteFooterTemplate = (
        <div className="flex justify-content-center gap-2">
            <Button
                label="Cancel"
                icon="pi pi-times"
                severity="secondary"
                outlined
                onClick={() => setState((p) => ({ ...p, delete: false }))}
                disabled={state.load}
            />
            <Button
                label="Delete"
                icon="pi pi-trash"
                severity="danger"
                onClick={deleteDocuments}
                loading={state.load}
            />
        </div>
    );

    useEffect(() => {
        getDocuments();
    }, []);

    return <>
        <div className="card shadow-xl rounded-2xl bg-white border border-slate-100 p-5">
            <div className="flex flex-column md:flex-row md:align-items-center justify-content-between gap-3 mb-4">
                <div>
                    <h3 className="text-2xl font-bold text-slate-800 mb-1">EDMS Archive Documents</h3>
                    <span className="text-slate-500 text-sm">Kelola metadata dokumen dan pantau riwayat versi serta peminjaman arsip.</span>
                </div>
                <div className="flex gap-2">
                    <Button
                        size="small"
                        label="New"
                        icon="pi pi-plus"
                        outlined
                        severity="success"
                        onClick={() => {
                            formik.resetForm();
                            setState(p => ({ ...p, add: true, edit: false, delete: false }));
                        }}
                    />
                    <Button
                        size="small"
                        label={`Delete${state.selectedDocuments.length > 0 ? ` (${state.selectedDocuments.length})` : ''}`}
                        icon="pi pi-trash"
                        severity="danger"
                        outlined
                        disabled={state.selectedDocuments.length === 0}
                        onClick={() => setState((p) => ({ ...p, delete: true }))}
                    />
                    <Button
                        size="small"
                        label="Refresh"
                        icon="pi pi-refresh"
                        outlined
                        loading={state.load}
                        onClick={getDocuments}
                    />
                </div>
            </div>

            <DataTable
                value={state.data}
                paginator
                selectionMode="multiple"
                selection={state.selectedDocuments}
                onSelectionChange={(e) => setState((p) => ({ ...p, selectedDocuments: e.value }))}
                rows={10}
                header={headerTemplate}
                globalFilterFields={['document_name', 'document_number', 'pic_name', 'status', 'document_type_name', 'document_category_name', 'confidentiality_level_name']}
                filters={state.filters}
                loading={state.load}
                className="p-datatable-striped p-datatable-gridlines text-sm"
            >
                <Column selectionMode="multiple" headerStyle={{ width: "3rem" }} />
                <Column field="document_number" header="Document Number" sortable />
                <Column field="document_name" header="Document Name" sortable />
                <Column field="document_type_name" header="Type" sortable />
                <Column field="document_category_name" header="Category" sortable />
                <Column field="confidentiality_level_name" header="Confidentiality" sortable />
                <Column field="pic_name" header="PIC" sortable />
                <Column field="document_date" header="Document Date" sortable body={rowData => formatDateCalendar(rowData.document_date)} />
                <Column field="expired_date" header="Expired Date" sortable body={rowData => formatDateCalendar(rowData.expired_date)} />
                <Column body={statusTemplate} header="Status" />
                <Column headerStyle={{ textAlign: 'center' }} header="Action" body={actionTemplate} />
            </DataTable>
        </div>

        <Form state={state} setState={setState} formik={formik} toast={toast} />

        <Dialog
            visible={state.detail}
            header="Document Detail"
            modal
            style={{ width: '75rem', maxWidth: '95vw' }}
            onHide={() => {
                setState(p => ({ ...p, detail: false, detailData: null }));
            }}
        >
            <div className="flex flex-column gap-4">
                <div className="grid text-sm">
                    <div className="col-12 md:col-6">
                        <div className="text-color-secondary mb-1 font-semibold">Document Number</div>
                        <div className="font-semibold text-slate-800">{state.detailData?.document?.document_number || '-'}</div>
                    </div>
                    <div className="col-12 md:col-6">
                        <div className="text-color-secondary mb-1 font-semibold">Document Name</div>
                        <div className="font-semibold text-slate-800">{state.detailData?.document?.document_name || '-'}</div>
                    </div>
                    <div className="col-12 md:col-4">
                        <div className="text-color-secondary mb-1 font-semibold">PIC</div>
                        <div className="text-slate-700">{state.detailData?.document?.pic_name || '-'}</div>
                    </div>
                    <div className="col-12 md:col-4">
                        <div className="text-color-secondary mb-1 font-semibold">Document Date</div>
                        <div className="text-slate-700">{state.detailData?.document?.document_date ? formatDateCalendar(state.detailData.document.document_date) : '-'}</div>
                    </div>
                    <div className="col-12 md:col-4">
                        <div className="text-color-secondary mb-1 font-semibold">Expired Date</div>
                        <div className="text-slate-700">{state.detailData?.document?.expired_date ? formatDateCalendar(state.detailData.document.expired_date) : '-'}</div>
                    </div>
                </div>

                <Divider />

                <DataTable
                    value={state.detailData?.loans || []}
                    header={<div className="font-semibold text-slate-800 text-base">Loan History</div>}
                    rows={5}
                    paginator
                    emptyMessage="Belum ada riwayat peminjaman"
                    className="text-xs"
                >
                    <Column field="borrower_name" header="Borrower" sortable />
                    <Column field="loan_date" header="Loan Date" body={(rowData: LoanData) => formatDateCalendar(rowData.loan_date)} />
                    <Column field="return_date" header="Return Date" body={(rowData: LoanData) => rowData.return_date ? formatDateCalendar(rowData.return_date) : '-'} />
                    <Column field="purpose" header="Purpose" />
                    <Column field="status" header="Status" body={(rowData: LoanData) => <Tag value={rowData.status} severity={rowData.status === 'approved' ? 'success' : rowData.status === 'rejected' ? 'danger' : 'warning'} />} />
                </DataTable>
            </div>
        </Dialog>

        <Dialog
            header="Delete Confirm"
            visible={state.delete}
            onHide={() => setState((p) => ({ ...p, delete: false }))}
            modal
            style={{ width: "28rem", maxWidth: "95vw" }}
            footer={deleteFooterTemplate}
        >
            <div className="flex flex-column align-items-center text-center gap-4 py-4">
                <i className="pi pi-exclamation-triangle text-red-500 text-6xl" />
                <div>
                    <h3 className="font-bold text-slate-800 mb-2">
                        Delete {state.selectedDocuments.length > 1 ? `${state.selectedDocuments.length} documents` : "this document"}?
                    </h3>
                    <p className="text-slate-500 text-sm">
                        {state.selectedDocuments.length > 1
                            ? `Dokumen yang dipilih akan dinonaktifkan.`
                            : `Dokumen ${state.selectedDocuments[0]?.document_number || ""} akan dinonaktifkan.`}
                    </p>
                </div>
            </div>
        </Dialog>
    </>
}

export default Table
