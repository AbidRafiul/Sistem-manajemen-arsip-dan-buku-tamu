'use client'

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Tag } from "primereact/tag";
import { Dialog } from "primereact/dialog";
import { Divider } from "primereact/divider";
import { useEffect, useState } from "react";
import { DocumentData, LoanData, TableProps, VersionData } from "../interfaces";
import { formatDateCalendar } from "@/lib/tools/dateTools";
import Form from "./form";

const Table = ({
    state,
    setState,
    formik,
    getDocuments,
    getDocumentDetail,
    deleteDocuments,
    uploadVersion,
    downloadVersion,
    rollbackVersion,
    approveVersion,
    toast
}: TableProps) => {

    const [newVersionFile, setNewVersionFile] = useState<File | null>(null);
    const [changeNotes, setChangeNotes] = useState('');

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
            value={rowData.Status}
            severity={rowData.Status === 'active' ? 'success' : 'danger'}
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
                onClick={() => getDocumentDetail(rowData.DocumentId)}
            />
            <Button
                icon="pi pi-pencil"
                rounded
                outlined
                className="p-button-sm"
                tooltip="Edit"
                onClick={() => {
                    formik.setValues({
                        DocumentId: rowData.DocumentId,
                        DocumentName: rowData.DocumentName,
                        DocumentNumber: rowData.DocumentNumber,
                        DocumentDate: formatDateInput(rowData.DocumentDate),
                        ExpiredDate: formatDateInput(rowData.ExpiredDate),
                        PicName: rowData.PicName,
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

    const highestVersionNumber = Math.max(...(state.detailData?.versions || []).map(v => v.VersionNumber), 0);
    const isAdmin = state.session?.user?.role === 'superadmin' || state.session?.user?.role === 'Administrator' || state.session?.user?.role === 'admin';

    const versionStatusTemplate = (rowData: VersionData) => {
        const status = rowData.ApprovalStatus || 'pending';
        let severity: 'success' | 'danger' | 'warning' | 'info' = 'warning';
        if (status === 'approved') severity = 'success';
        if (status === 'rejected') severity = 'danger';
        return <Tag value={status} severity={severity} />;
    };

    const versionActionTemplate = (rowData: VersionData) => {
        const isLatest = rowData.VersionNumber === highestVersionNumber;
        const status = rowData.ApprovalStatus || 'pending';

        return (
            <div className="flex gap-2">
                <Button
                    icon="pi pi-download"
                    rounded
                    outlined
                    severity="secondary"
                    className="p-button-sm"
                    tooltip="Download File"
                    onClick={() => {
                        const parts = rowData.FilePath.split('.');
                        const ext = parts.length > 1 ? parts.pop() : 'pdf';
                        const fileName = `${state.detailData?.document?.DocumentNumber || 'doc'}_V${rowData.VersionNumber}.${ext}`;
                        downloadVersion(rowData.VersionId, fileName);
                    }}
                />
                {status === 'approved' && !isLatest && (
                    <Button
                        icon="pi pi-replay"
                        rounded
                        outlined
                        severity="warning"
                        className="p-button-sm"
                        tooltip="Rollback to this version"
                        onClick={() => {
                            if (confirm(`Apakah Anda yakin ingin melakukan rollback ke V${rowData.VersionNumber}?`)) {
                                rollbackVersion(rowData.DocumentId, rowData.VersionId);
                            }
                        }}
                    />
                )}
                {status === 'pending' && isAdmin && (
                    <>
                        <Button
                            icon="pi pi-check"
                            rounded
                            outlined
                            severity="success"
                            className="p-button-sm"
                            tooltip="Approve Version"
                            onClick={() => approveVersion(rowData.VersionId, 'approved')}
                        />
                        <Button
                            icon="pi pi-times"
                            rounded
                            outlined
                            severity="danger"
                            className="p-button-sm"
                            tooltip="Reject Version"
                            onClick={() => {
                                const notes = prompt('Masukkan alasan penolakan:');
                                if (notes !== null) {
                                    approveVersion(rowData.VersionId, 'rejected', notes);
                                }
                            }}
                        />
                    </>
                )}
            </div>
        );
    };

    useEffect(() => {
        getDocuments();
    }, []);

    return <>
        <div className="card">
            <div className="flex flex-column md:flex-row md:align-items-center justify-content-between gap-3 mb-4">
                <div>
                    <h3 className="text-2xl font-semibold mb-1">EDMS Archive Documents</h3>
                    <span className="text-color-secondary">Kelola metadata dokumen dan pantau riwayat versi serta peminjaman arsip.</span>
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
                globalFilterFields={['DocumentName', 'DocumentNumber', 'PicName', 'Status']}
                filters={state.filters}
                loading={state.load}
                dataKey="DocumentId"
                emptyMessage="Data Kosong"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                currentPageReportTemplate="Menampilkan {first} - {last} dari {totalRecords} data"
            >
                <Column selectionMode="multiple" headerStyle={{ width: "3rem" }} />
                <Column field="DocumentNumber" header="Document Number" sortable />
                <Column field="DocumentName" header="Document Name" sortable />
                <Column field="PicName" header="PIC" sortable />
                <Column field="DocumentDate" header="Document Date" sortable body={rowData => formatDateCalendar(rowData.DocumentDate)} />
                <Column field="ExpiredDate" header="Expired Date" sortable body={rowData => formatDateCalendar(rowData.ExpiredDate)} />
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
                setNewVersionFile(null);
                setChangeNotes('');
            }}
        >
            <div className="flex flex-column gap-4">
                <div className="grid">
                    <div className="col-12 md:col-6">
                        <div className="text-color-secondary mb-1">Document Number</div>
                        <div className="font-semibold">{state.detailData?.document?.DocumentNumber || '-'}</div>
                    </div>
                    <div className="col-12 md:col-6">
                        <div className="text-color-secondary mb-1">Document Name</div>
                        <div className="font-semibold">{state.detailData?.document?.DocumentName || '-'}</div>
                    </div>
                    <div className="col-12 md:col-4">
                        <div className="text-color-secondary mb-1">PIC</div>
                        <div>{state.detailData?.document?.PicName || '-'}</div>
                    </div>
                    <div className="col-12 md:col-4">
                        <div className="text-color-secondary mb-1">Document Date</div>
                        <div>{state.detailData?.document?.DocumentDate ? formatDateCalendar(state.detailData.document.DocumentDate) : '-'}</div>
                    </div>
                    <div className="col-12 md:col-4">
                        <div className="text-color-secondary mb-1">Expired Date</div>
                        <div>{state.detailData?.document?.ExpiredDate ? formatDateCalendar(state.detailData.document.ExpiredDate) : '-'}</div>
                    </div>
                </div>

                <Divider />

                {/* Upload New Version Section */}
                <div className="card border-1 border-dashed surface-border p-4 flex flex-column gap-3">
                    <div className="font-semibold text-lg mb-1">Upload New Version</div>
                    <div className="flex flex-column md:flex-row gap-3 align-items-end">
                        <div className="flex-1 w-full">
                            <label className="block text-color-secondary mb-1 text-sm font-semibold">Select File</label>
                            <input 
                                type="file" 
                                className="p-inputtext w-full text-sm" 
                                onChange={(e) => setNewVersionFile(e.target.files?.[0] || null)}
                            />
                        </div>
                        <div className="flex-2 w-full">
                            <label className="block text-color-secondary mb-1 text-sm font-semibold">Change Notes</label>
                            <InputText 
                                className="w-full text-sm" 
                                placeholder="E.g., Update content, Fix typos..."
                                value={changeNotes}
                                onChange={(e) => setChangeNotes(e.target.value)}
                            />
                        </div>
                        <div className="align-self-end mt-2 md:mt-0">
                            <Button 
                                label="Upload" 
                                icon="pi pi-upload" 
                                size="small"
                                disabled={!newVersionFile || !changeNotes.trim() || state.load}
                                onClick={async () => {
                                    if (state.detailData?.document?.DocumentId && newVersionFile) {
                                        await uploadVersion(state.detailData.document.DocumentId, changeNotes, newVersionFile);
                                        setNewVersionFile(null);
                                        setChangeNotes('');
                                    }
                                }}
                            />
                        </div>
                    </div>
                </div>

                <DataTable
                    value={state.detailData?.versions || []}
                    header={<div className="font-semibold">Version History</div>}
                    rows={5}
                    paginator
                    emptyMessage="Belum ada versi dokumen"
                >
                    <Column field="VersionNumber" header="Version" sortable />
                    <Column field="ChangeNotes" header="Change Notes" />
                    <Column field="UploadedBy" header="Uploaded By" body={rowData => rowData.UploadedBy || '-'} />
                    <Column field="ApprovalStatus" header="Status" body={versionStatusTemplate} />
                    <Column field="CreatedAt" header="Created At" body={(rowData: VersionData) => formatDateCalendar(rowData.CreatedAt)} />
                    <Column header="Action" body={versionActionTemplate} style={{ width: '12rem' }} />
                </DataTable>

                <DataTable
                    value={state.detailData?.loans || []}
                    header={<div className="font-semibold">Loan History</div>}
                    rows={5}
                    paginator
                    emptyMessage="Belum ada riwayat peminjaman"
                >
                    <Column field="BorrowerName" header="Borrower" sortable />
                    <Column field="LoanDate" header="Loan Date" body={(rowData: LoanData) => formatDateCalendar(rowData.LoanDate)} />
                    <Column field="ReturnDate" header="Return Date" body={(rowData: LoanData) => rowData.ReturnDate ? formatDateCalendar(rowData.ReturnDate) : '-'} />
                    <Column field="Purpose" header="Purpose" />
                    <Column field="Status" header="Status" body={(rowData: LoanData) => <Tag value={rowData.Status} severity={rowData.Status === 'approved' ? 'success' : rowData.Status === 'rejected' ? 'danger' : 'warning'} />} />
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
                    <h3 className="font-bold mb-2">
                        Delete {state.selectedDocuments.length > 1 ? `${state.selectedDocuments.length} documents` : "this document"}?
                    </h3>
                    <p className="text-color-secondary">
                        {state.selectedDocuments.length > 1
                            ? `Dokumen yang dipilih akan dinonaktifkan.`
                            : `Dokumen ${state.selectedDocuments[0]?.DocumentNumber || ""} akan dinonaktifkan.`}
                    </p>
                </div>
            </div>
        </Dialog>
    </>
}

export default Table
