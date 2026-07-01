'use client'

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Tag } from "primereact/tag";
import { Dialog } from "primereact/dialog";
import { Divider } from "primereact/divider";
import { Card } from "primereact/card";
import { Avatar } from "primereact/avatar";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { DocumentData, LoanData, TableProps } from "../interfaces";
import { formatDateCalendar } from "@/lib/tools/dateTools";
import Form from "./form";
import { usePermissions } from '@/hooks/usePermissions';

const Table = ({
    state,
    setState,
    formik,
    getDocuments,
    getDocumentDetail,
    deleteDocuments,
    toast
}: TableProps) => {
    const permissions = usePermissions();
    const router = useRouter();

    const formatDateInput = (value?: string) => {
        if (!value) return '';
        return String(value).slice(0, 10);
    };

    const statusTemplate = (rowData: DocumentData) => (
        <Tag
            value={rowData.status === 'active' ? 'Aktif' : 'Nonaktif'}
            severity={rowData.status === 'active' ? 'success' : 'danger'}
            icon={rowData.status === 'active' ? 'pi pi-check-circle' : 'pi pi-times-circle'}
            style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem' }}
        />
    );

    const documentTemplate = (rowData: DocumentData) => (
        <div>
            <span className="font-semibold text-sm text-900 block">{rowData.document_number}</span>
            <span className="text-xs text-color-secondary">{rowData.document_name}</span>
        </div>
    );

    const picTemplate = (rowData: DocumentData) => (
        <div className="flex align-items-center gap-2">
            <Avatar
                label={rowData.pic_name?.slice(0, 1).toUpperCase() || 'P'}
                shape="circle"
                style={{ width: '1.75rem', height: '1.75rem', fontSize: '0.7rem', background: '#EEF2FF', color: '#4F46E5', fontWeight: '700', flexShrink: 0 }}
            />
            <span className="text-sm text-900">{rowData.pic_name}</span>
        </div>
    );

    const actionTemplate = (rowData: DocumentData) => (
        <div className="flex gap-1 align-items-center">
            <Button
                icon="pi pi-eye"
                rounded
                text
                size="small"
                tooltip="Detail Dokumen"
                tooltipOptions={{ position: 'top' }}
                loading={state.detailLoad}
                onClick={() => getDocumentDetail(rowData.document_id)}
            />
            <Button
                icon="pi pi-history"
                rounded
                text
                severity="info"
                size="small"
                tooltip="Riwayat Versi"
                tooltipOptions={{ position: 'top' }}
                onClick={() => router.push(`/edms/archive_document/${rowData.document_id}/versions`)}
            />
            <Button
                icon="pi pi-pencil"
                rounded
                text
                severity="secondary"
                size="small"
                tooltip="Edit"
                tooltipOptions={{ position: 'top' }}
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
                text
                severity="danger"
                size="small"
                tooltip="Hapus"
                tooltipOptions={{ position: 'top' }}
                onClick={() => setState((p) => ({ ...p, delete: true, selectedDocuments: [rowData] }))}
            />
        </div>
    );

    const headerTemplate = (
        <div className="flex flex-wrap align-items-center justify-content-between gap-2">
            <span className="font-semibold text-color text-sm">Daftar Dokumen</span>
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
                    placeholder="Cari dokumen..."
                    className="text-sm"
                    style={{ height: '2.25rem' }}
                />
            </span>
        </div>
    );

    const deleteFooterTemplate = (
        <div className="flex justify-content-end gap-2">
            <Button
                label="Batal"
                icon="pi pi-times"
                severity="secondary"
                outlined
                size="small"
                onClick={() => setState((p) => ({ ...p, delete: false }))}
                disabled={state.load}
            />
            <Button
                label="Hapus"
                icon="pi pi-trash"
                severity="danger"
                size="small"
                onClick={deleteDocuments}
                loading={state.load}
            />
        </div>
    );

    useEffect(() => { getDocuments(); }, []);

    return <>
        <Card className="shadow-1 border-round-2xl border-none">
            {/* Page Header */}
            <div className="mb-4">
                <span className="text-primary font-bold text-xs uppercase" style={{ letterSpacing: '0.1em' }}>EDMS</span>
                <h2 className="m-0 text-900 font-extrabold text-2xl mt-1 mb-2" style={{ letterSpacing: '-0.02em' }}>Archive Documents</h2>
                <p className="m-0 text-color-secondary text-sm font-medium">Kelola metadata dokumen dan pantau riwayat versi serta peminjaman arsip.</p>
            </div>

            <div className="flex flex-row flex-wrap items-center gap-2 mb-4">
                <Button
                    size="small"
                    label="Tambah Dokumen"
                    icon="pi pi-plus"
                    outlined
                    severity="success"
                    onClick={() => { formik.resetForm(); setState(p => ({ ...p, add: true, edit: false, delete: false })); }}
                />
                <Divider layout="vertical" />
                <Button
                    size="small"
                    label={`Hapus${state.selectedDocuments.length > 0 ? ` (${state.selectedDocuments.length})` : ''}`}
                    icon="pi pi-trash"
                    severity="danger"
                    outlined
                    disabled={state.selectedDocuments.length === 0}
                    onClick={() => setState((p) => ({ ...p, delete: true }))}
                />
                <Divider layout="vertical" />
                <Button
                    size="small"
                    label="Refresh"
                    icon="pi pi-refresh"
                    outlined
                    loading={state.load}
                    onClick={getDocuments}
                />
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
                rowHover
                emptyMessage={
                    <div className="flex flex-column align-items-center py-5 gap-3 text-color-secondary">
                        <i className="pi pi-folder-open text-4xl text-300" />
                        <span className="font-medium text-sm">Belum ada dokumen arsip</span>
                    </div>
                }
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                currentPageReportTemplate="Menampilkan {first}-{last} dari {totalRecords} data"
                className="text-sm"
            >
                <Column selectionMode="multiple" headerStyle={{ width: '3rem' }} />
                <Column header="Nomor & Nama Dokumen" body={documentTemplate} sortable sortField="document_number" style={{ minWidth: '200px' }} />
                <Column field="document_type_name" header="Tipe" sortable style={{ minWidth: '110px' }} />
                <Column field="document_category_name" header="Kategori" sortable style={{ minWidth: '110px' }} />
                <Column field="confidentiality_level_name" header="Kerahasiaan" sortable style={{ minWidth: '120px' }} />
                <Column header="PIC" body={picTemplate} sortable sortField="pic_name" style={{ minWidth: '150px' }} />
                <Column field="document_date" header="Tgl. Dokumen" sortable body={rowData => formatDateCalendar(rowData.document_date)} style={{ width: '130px' }} />
                <Column field="expired_date" header="Tgl. Kedaluwarsa" sortable body={rowData => formatDateCalendar(rowData.expired_date)} style={{ width: '140px' }} />
                <Column body={statusTemplate} header="Status" style={{ width: '110px', textAlign: 'center' }} />
                <Column header="Aksi" body={actionTemplate} style={{ width: '150px', textAlign: 'center' }} />
            </DataTable>
        </Card>

        <Form state={state} setState={setState} formik={formik} toast={toast} />

        {/* Document Detail Dialog */}
        <Dialog
            visible={state.detail}
            header={
                <div className="flex align-items-center gap-2">
                    <i className="pi pi-file text-primary" />
                    <span className="font-bold text-900">Detail Dokumen</span>
                </div>
            }
            modal
            style={{ width: '75rem', maxWidth: '95vw' }}
            onHide={() => setState(p => ({ ...p, detail: false, detailData: null }))}
            pt={{ header: { className: 'border-bottom-1 surface-border pb-3' } }}
        >
            <div className="flex flex-column gap-4 pt-3">
                <div className="grid surface-50 border-round-xl p-3 border-1 surface-border text-sm">
                    <div className="col-12 md:col-6">
                        <div className="text-color-secondary text-xs font-bold uppercase mb-1" style={{ letterSpacing: '0.08em' }}>Nomor Dokumen</div>
                        <div className="font-bold text-900">{state.detailData?.document?.document_number || '-'}</div>
                    </div>
                    <div className="col-12 md:col-6">
                        <div className="text-color-secondary text-xs font-bold uppercase mb-1" style={{ letterSpacing: '0.08em' }}>Nama Dokumen</div>
                        <div className="font-semibold text-900">{state.detailData?.document?.document_name || '-'}</div>
                    </div>
                    <div className="col-12 md:col-4">
                        <div className="text-color-secondary text-xs font-bold uppercase mb-1" style={{ letterSpacing: '0.08em' }}>PIC</div>
                        <div className="text-900">{state.detailData?.document?.pic_name || '-'}</div>
                    </div>
                    <div className="col-12 md:col-4">
                        <div className="text-color-secondary text-xs font-bold uppercase mb-1" style={{ letterSpacing: '0.08em' }}>Tanggal Dokumen</div>
                        <div className="text-900">{state.detailData?.document?.document_date ? formatDateCalendar(state.detailData.document.document_date) : '-'}</div>
                    </div>
                    <div className="col-12 md:col-4">
                        <div className="text-color-secondary text-xs font-bold uppercase mb-1" style={{ letterSpacing: '0.08em' }}>Tanggal Kedaluwarsa</div>
                        <div className="text-900">{state.detailData?.document?.expired_date ? formatDateCalendar(state.detailData.document.expired_date) : '-'}</div>
                    </div>
                </div>

                <Divider className="my-0" />

                <div>
                    <div className="font-bold text-900 mb-3 flex align-items-center gap-2">
                        <i className="pi pi-history text-primary" />
                        Riwayat Peminjaman
                    </div>
                    <DataTable
                        value={state.detailData?.loans || []}
                        rows={5}
                        paginator
                        emptyMessage={
                            <div className="flex align-items-center gap-2 py-3 text-color-secondary text-sm">
                                <i className="pi pi-info-circle" />
                                Belum ada riwayat peminjaman
                            </div>
                        }
                        className="text-sm"
                        rowHover
                    >
                        <Column field="borrower_name" header="Peminjam" sortable />
                        <Column field="loan_date" header="Tgl. Pinjam" body={(rowData: LoanData) => formatDateCalendar(rowData.loan_date)} />
                        <Column field="return_date" header="Tgl. Kembali" body={(rowData: LoanData) => rowData.return_date ? formatDateCalendar(rowData.return_date) : <span className="text-orange-500 font-medium">Belum Kembali</span>} />
                        <Column field="purpose" header="Keperluan" />
                        <Column field="status" header="Status" body={(rowData: LoanData) => (
                            <Tag
                                value={rowData.status === 'approved' ? 'Disetujui' : rowData.status === 'rejected' ? 'Ditolak' : 'Pending'}
                                severity={rowData.status === 'approved' ? 'success' : rowData.status === 'rejected' ? 'danger' : 'warning'}
                                style={{ fontSize: '0.7rem' }}
                            />
                        )} />
                    </DataTable>
                </div>
            </div>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog
            header={
                <div className="flex align-items-center gap-2">
                    <i className="pi pi-exclamation-triangle text-red-500" />
                    <span className="font-bold text-900">Konfirmasi Hapus</span>
                </div>
            }
            visible={state.delete}
            onHide={() => setState((p) => ({ ...p, delete: false }))}
            modal
            style={{ width: '26rem', maxWidth: '95vw' }}
            footer={deleteFooterTemplate}
            pt={{ header: { className: 'border-bottom-1 surface-border pb-3' } }}
        >
            <div className="flex flex-column align-items-center text-center gap-3 py-4">
                <div className="flex align-items-center justify-content-center border-circle bg-red-50 border-1 border-red-100" style={{ width: '4rem', height: '4rem' }}>
                    <i className="pi pi-trash text-red-500 text-2xl" />
                </div>
                <div>
                    <h4 className="font-bold text-900 m-0 mb-2 text-lg">
                        Hapus {state.selectedDocuments.length > 1 ? `${state.selectedDocuments.length} dokumen` : 'dokumen ini'}?
                    </h4>
                    <p className="text-color-secondary text-sm m-0">
                        {state.selectedDocuments.length > 1
                            ? `${state.selectedDocuments.length} dokumen yang dipilih akan dinonaktifkan.`
                            : `Dokumen "${state.selectedDocuments[0]?.document_number || ''}" akan dinonaktifkan.`}
                    </p>
                </div>
            </div>
        </Dialog>
    </>
}

export default Table
