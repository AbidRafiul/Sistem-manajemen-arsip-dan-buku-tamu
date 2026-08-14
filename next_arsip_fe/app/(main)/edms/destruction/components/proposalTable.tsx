"use client";
import React, { useEffect, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { Tag } from 'primereact/tag';
import { usePermissions } from '@/hooks/usePermissions';
import { showError } from '@/lib/tools/generalTools';

interface ProposalTableProps {
    toast: React.RefObject<any>;
    data: any[];
    loading: boolean;
    fetchProposals: (statusFilter: string) => void;
    reviewProposal: (id: number, status: string, notes: string) => Promise<boolean>;
    executeProposal: (id: number, file: string) => Promise<boolean>;
}

export default function ProposalTable({ 
    toast, 
    data, 
    loading, 
    fetchProposals, 
    reviewProposal, 
    executeProposal 
}: ProposalTableProps) {
    const { canApprove, canDelete } = usePermissions();

    const [searchVal, setSearchVal] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<string>('');

    // Review Dialog States
    const [reviewDialog, setReviewDialog] = useState<boolean>(false);
    const [selectedProposal, setSelectedProposal] = useState<any>(null);
    const [reviewStatus, setReviewStatus] = useState<string>('approved');
    const [reviewNotes, setReviewNotes] = useState<string>('');
    const [submittingReview, setSubmittingReview] = useState<boolean>(false);

    // Execution Dialog States
    const [executeDialog, setExecuteDialog] = useState<boolean>(false);
    const [baFile, setBaFile] = useState<string>('');
    const [submittingExecution, setSubmittingExecution] = useState<boolean>(false);

    useEffect(() => {
        fetchProposals(statusFilter);
    }, [statusFilter, fetchProposals]);

    const handleReviewSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProposal) return;

        setSubmittingReview(true);
        try {
            await reviewProposal(selectedProposal.id_usulan, reviewStatus, reviewNotes);
            setReviewDialog(false);
            setSelectedProposal(null);
            setReviewNotes('');
            fetchProposals(statusFilter);
        } catch (error: any) {
            // Handled by parent
        } finally {
            setSubmittingReview(false);
        }
    };

    const handleExecuteSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProposal) return;
        if (!baFile.trim()) {
            showError(toast, 'Nomor/File Berita Acara wajib diisi');
            return;
        }

        setSubmittingExecution(true);
        try {
            await executeProposal(selectedProposal.id_usulan, baFile);
            setExecuteDialog(false);
            setSelectedProposal(null);
            setBaFile('');
            fetchProposals(statusFilter);
        } catch (error: any) {
            // Handled by parent
        } finally {
            setSubmittingExecution(false);
        }
    };

    const statusBodyTemplate = (rowData: any) => {
        switch (rowData.status) {
            case 'submitted':
                return <Tag value="Menunggu Tinjauan" severity="warning" className="font-semibold text-xs" />;
            case 'approved':
                return <Tag value="Disetujui (Siap Musnah)" severity="success" className="font-semibold text-xs" />;
            case 'rejected':
                return <Tag value="Ditolak" severity="danger" className="font-semibold text-xs" />;
            case 'executed':
                return <Tag value="Telah Dimusnahkan" severity="info" className="font-semibold text-xs" />;
            default:
                return <Tag value={rowData.status} className="font-semibold text-xs" />;
        }
    };

    const actionBodyTemplate = (rowData: any) => {
        const isSubmitted = rowData.status === 'submitted';
        const isApproved = rowData.status === 'approved';

        return (
            <div className="flex gap-2 justify-content-center">
                {isSubmitted && (
                    <Button type="button"
                        label="Review"
                        icon="pi pi-shield"
                        size="small"
                        severity="warning"
                        outlined
                        className="py-1 font-semibold text-xs"
                        disabled={!canApprove}
                        onClick={() => {
                            setSelectedProposal(rowData);
                            setReviewDialog(true);
                        }} />
                )}
                {isApproved && (
                    <Button type="button"
                        label="Eksekusi"
                        icon="pi pi-trash"
                        size="small"
                        severity="danger"
                        className="py-1 font-semibold text-xs"
                        disabled={!canDelete && !canApprove}
                        onClick={() => {
                            setSelectedProposal(rowData);
                            setExecuteDialog(true);
                        }} />
                )}
                {!isSubmitted && !isApproved && (
                    <span className="text-gray-400 text-xs italic">-</span>
                )}
            </div>
        );
    };

    const formatDate = (val: string) => {
        if (!val) return '-';
        return new Date(val).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const statusOptions = [
        { label: 'Setujui Usulan', value: 'approved' },
        { label: 'Tolak Usulan', value: 'rejected' }
    ];

    const proposalStatusFilterOptions = [
        { label: 'Menunggu Tinjauan', value: 'submitted' },
        { label: 'Disetujui', value: 'approved' },
        { label: 'Ditolak', value: 'rejected' },
        { label: 'Telah Dimusnahkan', value: 'executed' }
    ];

    const renderHeader = () => {
        return (
            <div className="flex flex-wrap align-items-center justify-content-between gap-3 text-sm">
                <span className="font-bold text-color">Daftar Usulan Pemusnahan</span>
                <div className="flex gap-2 align-items-center">
                    <Dropdown
                        value={statusFilter}
                        options={proposalStatusFilterOptions}
                        onChange={(e) => setStatusFilter(e.value)}
                        placeholder="Filter Status"
                        showClear
                        className="text-xs"
                        style={{ minWidth: '15rem', height: '2.25rem' }} />
                    <span className="p-input-icon-left">
                        <i className="pi pi-search" />
                        <InputText
                            value={searchVal}
                            onChange={(e) => setSearchVal(e.target.value)}
                            placeholder="Cari..."
                            className="text-sm"
                            style={{ height: '2.25rem' }} />
                    </span>
                </div>
            </div>
        );
    };

    return (
        <div className="card border-none bg-white p-3">
            <DataTable
                value={data}
                paginator
                rows={10}
                header={renderHeader()}
                globalFilter={searchVal}
                emptyMessage="Tidak ada usulan pemusnahan ditemukan."
                loading={loading}
                className="text-sm"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                currentPageReportTemplate="Menampilkan {first}-{last} dari {totalRecords} data">
                <Column field="kode_dokumen" header="Kode Dokumen" sortable className="font-semibold text-primary"></Column>
                <Column field="nomor_dokumen" header="No. Dokumen" sortable></Column>
                <Column field="nama_dokumen" header="Nama Dokumen" sortable style={{ minWidth: '150px' }}></Column>
                <Column field="alasan_usulan" header="Alasan Usulan" sortable></Column>
                <Column field="diusulkan_oleh" header="Pengusul" sortable></Column>
                <Column field="diusulkan_pada" header="Tgl. Usulan" sortable body={rowData => formatDate(rowData.diusulkan_pada)}></Column>
                <Column body={statusBodyTemplate} header="Status" sortable field="status" style={{ minWidth: '150px' }}></Column>
                <Column field="ditinjau_oleh" header="Peninjau" sortable body={rowData => rowData.ditinjau_oleh || '-'}></Column>
                <Column field="catatan_tinjauan" header="Catatan Tinjauan" sortable body={rowData => rowData.catatan_tinjauan || '-'}></Column>
                <Column field="file_berita_acara" header="Berita Acara" sortable body={rowData => rowData.file_berita_acara || '-'}></Column>
                <Column body={actionBodyTemplate} header="Aksi" style={{ width: '130px', textAlign: 'center' }}></Column>
            </DataTable>

            {/* Review Dialog */}
            <Dialog
                visible={reviewDialog}
                header="Tinjau Usulan Pemusnahan"
                modal
                style={{ width: '35rem' }}
                onHide={() => {
                    setReviewDialog(false);
                    setSelectedProposal(null);
                    setReviewNotes('');
                }}>
                {selectedProposal && (
                    <form onSubmit={handleReviewSubmit} className="flex flex-column gap-4 mt-2 fadein animation-duration-300">
                        <div className="surface-50 p-3 border-round border-1 surface-border">
                            <div className="mb-2"><strong>Dokumen:</strong> {selectedProposal.nama_dokumen} ({selectedProposal.nomor_dokumen})</div>
                            <div className="mb-2"><strong>Alasan Usulan:</strong> {selectedProposal.alasan_usulan}</div>
                            <div><strong>Diusulkan Oleh:</strong> {selectedProposal.diusulkan_oleh} ({formatDate(selectedProposal.diusulkan_pada)})</div>
                        </div>

                        <div className="flex flex-column gap-1">
                            <label className="font-semibold">Keputusan Tinjauan <span className="text-red-500">*</span></label>
                            <Dropdown
                                value={reviewStatus}
                                options={statusOptions}
                                onChange={(e) => setReviewStatus(e.value)}
                                className="w-full" />
                        </div>

                        <div className="flex flex-column gap-1">
                            <label htmlFor="catatan_tinjauan" className="font-semibold">Catatan Tinjauan</label>
                            <InputTextarea
                                id="catatan_tinjauan"
                                value={reviewNotes}
                                onChange={(e) => setReviewNotes(e.target.value)}
                                rows={3}
                                placeholder="Masukkan catatan penolakan atau instruksi persetujuan..." />
                        </div>

                        <div className="flex mt-4 pt-3 border-top-1 surface-border">
                            
                            <Button type="submit"
                                label="Tinjau"
                                size="small"
                                loading={submittingReview} />
                        </div>
                    </form>
                )}
            </Dialog>

            {/* Execution Dialog */}
            <Dialog
                visible={executeDialog}
                header="Eksekusi Pemusnahan Dokumen"
                modal
                style={{ width: '35rem' }}
                onHide={() => {
                    setExecuteDialog(false);
                    setSelectedProposal(null);
                    setBaFile('');
                }}>
                {selectedProposal && (
                    <form onSubmit={handleExecuteSubmit} className="flex flex-column gap-4 mt-2 fadein animation-duration-300">
                        <div className="surface-50 p-3 border-round border-1 surface-border">
                            <div className="mb-2"><strong>Dokumen:</strong> {selectedProposal.nama_dokumen} ({selectedProposal.nomor_dokumen})</div>
                            <div className="mb-2"><strong>Alasan Usulan:</strong> {selectedProposal.alasan_usulan}</div>
                            <div><strong>Disetujui Oleh:</strong> {selectedProposal.ditinjau_oleh} ({formatDate(selectedProposal.ditinjau_pada)})</div>
                        </div>

                        <div className="flex flex-column gap-1">
                            <label htmlFor="file_berita_acara" className="font-semibold">
                                Nomor / File Berita Acara <span className="text-red-500">*</span>
                            </label>
                            <InputText
                                id="file_berita_acara"
                                value={baFile}
                                onChange={(e) => setBaFile(e.target.value)}
                                required
                                placeholder="Contoh: BA-PEMUSNAHAN/2026/001" />
                            <small className="text-color-secondary mt-1">
                                Memasukkan data ini menandakan dokumen telah secara fisik dimusnahkan. Dokumen akan dinonaktifkan permanen di sistem.
                            </small>
                        </div>

                        <div className="flex mt-4 pt-3 border-top-1 surface-border">
                            
                            <Button type="submit"
                                label="Selesaikan Pemusnahan"
                                severity="danger"
                                size="small"
                                loading={submittingExecution} />
                        </div>
                    </form>
                )}
            </Dialog>
        </div>
    );
}
