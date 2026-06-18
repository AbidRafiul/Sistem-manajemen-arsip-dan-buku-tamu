'use client'

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Tag } from "primereact/tag";
import { Dialog } from "primereact/dialog";
import { Divider } from "primereact/divider";
import { useEffect, useState } from "react";
import { LoanData, TableProps } from "../interfaces";
import { formatDateCalendar } from "@/lib/tools/dateTools";
import Form from "./form";

const Table = ({
    state,
    setState,
    formik,
    getLoans,
    handleApproveReject,
    handleReturn,
}: TableProps) => {

    const [detailDialog, setDetailDialog] = useState(false);
    const [selectedDetail, setSelectedDetail] = useState<LoanData | null>(null);

    const [approvalDialog, setApprovalDialog] = useState(false);
    const [notes, setNotes] = useState('');
    const [targetStatus, setTargetStatus] = useState<'approved' | 'rejected' | ''>('');

    const isAdmin = state.session?.user?.role === 'superadmin' || state.session?.user?.role === 'Administrator' || state.session?.user?.role === 'admin';

    const headerTemplate = (
        <div className="flex flex-wrap align-items-center justify-content-between gap-3">
            <span className="text-xl font-bold">Archive Loan Records</span>
            <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText
                    value={state.searchVal || ''}
                    onChange={(e) => {
                        const val = e.target.value;
                        setState(p => ({ ...p, searchVal: val }));
                    }}
                    placeholder="Search borrower or document..."
                />
            </span>
        </div>
    );

    const statusTemplate = (rowData: LoanData) => {
        const status = rowData.status;
        let severity: 'success' | 'danger' | 'warning' | 'info' = 'warning';
        if (status === 'returned') severity = 'success';
        if (status === 'rejected') severity = 'danger';
        if (status === 'borrowed') severity = 'info';
        
        // Check if overdue
        if (rowData.is_overdue === 1 && status === 'borrowed') {
            return <Tag value="OVERDUE" severity="danger" />;
        }
        
        return <Tag value={status} severity={severity} />;
    };

    const actionTemplate = (rowData: LoanData) => {
        const status = rowData.status;

        return (
            <div className="flex gap-2 justify-content-center">
                <Button
                    icon="pi pi-eye"
                    rounded
                    outlined
                    severity="secondary"
                    className="p-button-sm"
                    tooltip="View Details"
                    onClick={() => {
                        setSelectedDetail(rowData);
                        setDetailDialog(true);
                    }}
                />
                {status === 'pending' && isAdmin && (
                    <>
                        <Button
                            icon="pi pi-check"
                            rounded
                            outlined
                            severity="success"
                            className="p-button-sm"
                            tooltip="Approve Peminjaman"
                            onClick={() => {
                                setSelectedDetail(rowData);
                                setTargetStatus('approved');
                                setNotes('');
                                setApprovalDialog(true);
                            }}
                        />
                        <Button
                            icon="pi pi-times"
                            rounded
                            outlined
                            severity="danger"
                            className="p-button-sm"
                            tooltip="Reject Peminjaman"
                            onClick={() => {
                                setSelectedDetail(rowData);
                                setTargetStatus('rejected');
                                setNotes('');
                                setApprovalDialog(true);
                            }}
                        />
                    </>
                )}
                {status === 'borrowed' && (
                    <Button
                        icon="pi pi-replay"
                        label="Return"
                        outlined
                        severity="info"
                        size="small"
                        className="p-button-sm"
                        tooltip="Kembalikan Dokumen"
                        onClick={() => {
                            if (confirm(`Kembalikan dokumen ${rowData.document_number} yang dipinjam oleh ${rowData.borrower_name}?`)) {
                                handleReturn(rowData.loan_id);
                            }
                        }}
                    />
                )}
            </div>
        );
    };

    const filteredData = state.data.filter((item) => {
        const query = state.searchVal?.toLowerCase() || '';
        const matchSearch = 
            item.borrower_name?.toLowerCase().includes(query) ||
            item.document_name?.toLowerCase().includes(query) ||
            item.document_number?.toLowerCase().includes(query) ||
            item.purpose?.toLowerCase().includes(query);

        if (!matchSearch) return false;

        const tab = state.activeTab;
        if (tab === 'all') return true;
        if (tab === 'pending') return item.status === 'pending';
        if (tab === 'borrowed') return item.status === 'borrowed' && item.is_overdue !== 1;
        if (tab === 'returned') return item.status === 'returned';
        if (tab === 'overdue') return item.is_overdue === 1 && item.status === 'borrowed';

        return true;
    });

    useEffect(() => {
        getLoans();
    }, []);

    const tabs: { label: string; value: typeof state.activeTab; icon: string; count: number }[] = [
        { label: 'Semua', value: 'all', icon: 'pi pi-list', count: state.data.length },
        { label: 'Pending', value: 'pending', icon: 'pi pi-clock', count: state.data.filter(d => d.status === 'pending').length },
        { label: 'Dipinjam', value: 'borrowed', icon: 'pi pi-info-circle', count: state.data.filter(d => d.status === 'borrowed' && d.is_overdue !== 1).length },
        { label: 'Kembali', value: 'returned', icon: 'pi pi-check-circle', count: state.data.filter(d => d.status === 'returned').length },
        { label: 'Terlambat', value: 'overdue', icon: 'pi pi-exclamation-circle', count: state.data.filter(d => d.is_overdue === 1 && d.status === 'borrowed').length }
    ];

    return <>
        <div className="card">
            <div className="flex flex-column md:flex-row md:align-items-center justify-content-between gap-3 mb-4">
                <div>
                    <h3 className="text-2xl font-semibold mb-1">EDMS Archive Loans</h3>
                    <span className="text-color-secondary">Kelola peminjaman dokumen fisik arsip dan monitor keterlambatan pengembalian.</span>
                </div>
                <div className="flex gap-2">
                    <Button
                        size="small"
                        label="Pinjam Dokumen"
                        icon="pi pi-plus"
                        onClick={() => {
                            formik.resetForm();
                            setState(p => ({ ...p, add: true }));
                        }}
                    />
                    <Button
                        size="small"
                        label="Refresh"
                        icon="pi pi-refresh"
                        outlined
                        loading={state.load}
                        onClick={getLoans}
                    />
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2 mb-4">
                {tabs.map((tab) => (
                    <Button
                        key={tab.value}
                        icon={tab.icon}
                        label={`${tab.label} (${tab.count})`}
                        severity={state.activeTab === tab.value ? undefined : 'secondary'}
                        className="text-sm py-2 px-3"
                        onClick={() => setState(p => ({ ...p, activeTab: tab.value }))}
                        outlined={state.activeTab !== tab.value}
                    />
                ))}
            </div>

            <DataTable
                value={filteredData}
                paginator
                rows={10}
                header={headerTemplate}
                loading={state.load}
                dataKey="loan_id"
                emptyMessage="Tidak ada riwayat peminjaman"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                currentPageReportTemplate="Menampilkan {first} - {last} dari {totalRecords} data"
            >
                <Column field="borrower_name" header="Borrower" sortable />
                <Column 
                    header="Document" 
                    body={(rowData: LoanData) => (
                        <div>
                            <span className="font-semibold block">{rowData.document_number}</span>
                            <span className="text-sm text-color-secondary">{rowData.document_name}</span>
                        </div>
                    )} 
                />
                <Column field="loan_date" header="Loan Date" sortable body={rowData => formatDateCalendar(rowData.loan_date)} />
                <Column field="expected_return_date" header="Expected Return" sortable body={rowData => rowData.expected_return_date ? formatDateCalendar(rowData.expected_return_date) : '-'} />
                <Column field="return_date" header="Returned At" sortable body={rowData => rowData.return_date ? formatDateCalendar(rowData.return_date) : '-'} />
                <Column body={statusTemplate} header="Status" style={{ width: '8rem', textAlign: 'center' }} />
                <Column headerStyle={{ textAlign: 'center' }} header="Action" body={actionTemplate} style={{ width: '15rem' }} />
            </DataTable>
        </div>

        <Form state={state} setState={setState} formik={formik} toast={null as any} />

        {/* Loan Details Dialog */}
        <Dialog
            visible={detailDialog}
            header="Loan Record Details"
            modal
            style={{ width: '45rem', maxWidth: '95vw' }}
            onHide={() => {
                setDetailDialog(false);
                setSelectedDetail(null);
            }}
        >
            {selectedDetail && (
                <div className="flex flex-column gap-4">
                    <div className="grid">
                        <div className="col-12 md:col-6">
                            <div className="text-color-secondary mb-1 text-sm font-semibold">Borrower Name</div>
                            <div className="font-bold text-lg">{selectedDetail.borrower_name}</div>
                        </div>
                        <div className="col-12 md:col-6">
                            <div className="text-color-secondary mb-1 text-sm font-semibold">Status</div>
                            <div>{statusTemplate(selectedDetail)}</div>
                        </div>
                        <div className="col-12">
                            <Divider />
                        </div>
                        <div className="col-12 md:col-6">
                            <div className="text-color-secondary mb-1 text-sm font-semibold">Document Number</div>
                            <div className="font-semibold">{selectedDetail.document_number || '-'}</div>
                        </div>
                        <div className="col-12 md:col-6">
                            <div className="text-color-secondary mb-1 text-sm font-semibold">Document Name</div>
                            <div>{selectedDetail.document_name || '-'}</div>
                        </div>
                        <div className="col-12">
                            <Divider />
                        </div>
                        <div className="col-12 md:col-4">
                            <div className="text-color-secondary mb-1 text-sm font-semibold">Loan Date</div>
                            <div>{formatDateCalendar(selectedDetail.loan_date)}</div>
                        </div>
                        <div className="col-12 md:col-4">
                            <div className="text-color-secondary mb-1 text-sm font-semibold">Expected Return Date</div>
                            <div>{selectedDetail.expected_return_date ? formatDateCalendar(selectedDetail.expected_return_date) : '-'}</div>
                        </div>
                        <div className="col-12 md:col-4">
                            <div className="text-color-secondary mb-1 text-sm font-semibold">Return Date</div>
                            <div className="font-semibold text-primary">{selectedDetail.return_date ? formatDateCalendar(selectedDetail.return_date) : 'Not Returned Yet'}</div>
                        </div>
                        <div className="col-12">
                            <Divider />
                        </div>
                        <div className="col-12">
                            <div className="text-color-secondary mb-1 text-sm font-semibold">Purpose of Loan</div>
                            <div className="p-3 bg-light border-round" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>{selectedDetail.purpose}</div>
                        </div>
                        
                        {(selectedDetail.approved_by || selectedDetail.approval_notes) && (
                            <>
                                <div className="col-12">
                                    <Divider />
                                </div>
                                <div className="col-12 md:col-6">
                                    <div className="text-color-secondary mb-1 text-sm font-semibold">Reviewed By</div>
                                    <div>{selectedDetail.approved_by}</div>
                                </div>
                                <div className="col-12 md:col-6">
                                    <div className="text-color-secondary mb-1 text-sm font-semibold">Reviewed At</div>
                                    <div>{selectedDetail.approved_at ? formatDateCalendar(selectedDetail.approved_at) : '-'}</div>
                                </div>
                                <div className="col-12 mt-2">
                                    <div className="text-color-secondary mb-1 text-sm font-semibold">Reviewer Notes</div>
                                    <div className="p-3 bg-light border-round italic" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>{selectedDetail.approval_notes || 'No notes left.'}</div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </Dialog>

        {/* Approval Modal Dialog */}
        <Dialog
            visible={approvalDialog}
            header={targetStatus === 'approved' ? 'Approve Loan Request' : 'Reject Loan Request'}
            modal
            style={{ width: '32rem', maxWidth: '95vw' }}
            onHide={() => {
                setApprovalDialog(false);
                setSelectedDetail(null);
                setNotes('');
                setTargetStatus('');
            }}
        >
            <div className="flex flex-column gap-3">
                <p>
                    Apakah Anda yakin ingin <strong>{targetStatus === 'approved' ? 'menyetujui' : 'menolak'}</strong> pengajuan peminjaman dokumen <strong>{selectedDetail?.document_number}</strong> oleh <strong>{selectedDetail?.borrower_name}</strong>?
                </p>
                <div className="flex flex-column gap-2">
                    <label htmlFor="notes" className="font-semibold text-sm">Catatan Persetujuan (Optional)</label>
                    <InputText
                        id="notes"
                        placeholder="E.g., Approved, please take care of the document..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    />
                </div>
                <div className="flex justify-content-end gap-2 mt-3">
                    <Button
                        label="Batal"
                        severity="secondary"
                        outlined
                        onClick={() => {
                            setApprovalDialog(false);
                            setSelectedDetail(null);
                            setNotes('');
                            setTargetStatus('');
                        }}
                    />
                    <Button
                        label={targetStatus === 'approved' ? 'Setujui' : 'Tolak'}
                        severity={targetStatus === 'approved' ? 'success' : 'danger'}
                        onClick={async () => {
                            if (selectedDetail && targetStatus) {
                                await handleApproveReject(selectedDetail.loan_id, targetStatus, notes);
                                setApprovalDialog(false);
                                setSelectedDetail(null);
                                setNotes('');
                                setTargetStatus('');
                            }
                        }}
                        loading={state.load}
                    />
                </div>
            </div>
        </Dialog>
    </>
}

export default Table
