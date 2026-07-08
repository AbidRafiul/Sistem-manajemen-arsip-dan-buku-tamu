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
import { apiEndpointExpiredGet, apiEndpointProposalCreate, apiEndpointDocumentCategoryGet } from './endpoints';
import getData from '@/lib/axios/getData';
import postData from '@/lib/axios/postData';
import { showError, showSuccess } from '@/lib/tools/generalTools';

interface ExpiredTableProps {
    toast: React.RefObject<any>;
    onProposalCreated: () => void;
}

export default function ExpiredTable({ toast, onProposalCreated }: ExpiredTableProps) {
    const [data, setData] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [searchVal, setSearchVal] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [dialogVisible, setDialogVisible] = useState<boolean>(false);
    const [selectedDoc, setSelectedDoc] = useState<any>(null);
    const [reason, setReason] = useState<string>('');
    const [submitting, setSubmitting] = useState<boolean>(false);

    const getExpiredDocuments = async () => {
        setLoading(true);
        try {
            let url = apiEndpointExpiredGet;
            const params = {} as any;
            if (selectedCategory) {
                params.kode_kategori_dokumen = selectedCategory;
            }
            const res = await getData(url, params);
            setData(res.data?.data || []);
        } catch (error: any) {
            showError(toast, error?.response?.data?.message || 'Gagal memuat dokumen kedaluwarsa');
        } finally {
            setLoading(false);
        }
    };

    const getCategories = async () => {
        try {
            const res = await getData(apiEndpointDocumentCategoryGet);
            setCategories(res.data?.data || []);
        } catch (error) {
            console.error("Gagal mengambil data kategori:", error);
        }
    };

    useEffect(() => {
        getExpiredDocuments();
        getCategories();
    }, [selectedCategory]);

    const handleProposeDestruction = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reason.trim()) {
            showError(toast, 'Alasan pemusnahan wajib diisi');
            return;
        }

        setSubmitting(true);
        try {
            const res = await postData(apiEndpointProposalCreate, {
                kode_dokumen: selectedDoc.kode_dokumen,
                alasan_usulan: reason
            });
            showSuccess(toast, res.data?.message || 'Proposal pemusnahan berhasil diajukan');
            setDialogVisible(false);
            setSelectedDoc(null);
            setReason('');
            getExpiredDocuments();
            onProposalCreated();
        } catch (error: any) {
            showError(toast, error?.response?.data?.message || 'Gagal mengajukan proposal pemusnahan');
        } finally {
            setSubmitting(false);
        }
    };

    const actionTextTemplate = (rowData: any) => {
        switch (rowData.tindakan_retensi) {
            case 'destroy':
                return <Tag value="Musnahkan" severity="danger" className="font-semibold text-xs" />;
            case 'review':
                return <Tag value="Tinjau Kembali" severity="warning" className="font-semibold text-xs" />;
            default:
                return <Tag value={rowData.tindakan_retensi} severity="info" className="font-semibold text-xs" />;
        }
    };

    const actionBodyTemplate = (rowData: any) => {
        const hasProposal = Boolean(rowData.ActiveProposalStatus);
        
        if (hasProposal) {
            let severity: 'warning' | 'info' | 'success' | 'danger' = 'warning';
            let label = 'Diproses';
            if (rowData.ActiveProposalStatus === 'approved') {
                severity = 'success';
                label = 'Disetujui';
            } else if (rowData.ActiveProposalStatus === 'rejected') {
                severity = 'danger';
                label = 'Ditolak';
            }
            return (
                <div className="flex flex-column align-items-center gap-1">
                    <Tag value={`Usulan: ${label}`} severity={severity} className="text-xs font-semibold px-2" />
                </div>
            );
        }

        return (
            <Button
                type="button"
                label="Usulkan"
                icon="pi pi-file-export"
                size="small"
                outlined
                severity="danger"
                className="p-button-sm py-1 font-semibold text-xs"
                onClick={() => {
                    setSelectedDoc(rowData);
                    setDialogVisible(true);
                }}
            />
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

    const renderHeader = () => {
        return (
            <div className="flex flex-wrap align-items-center justify-content-between gap-3 text-sm">
                <span className="font-bold text-color">Dokumen Kedaluwarsa JRA</span>
                <div className="flex gap-2 align-items-center">
                    <Dropdown
                        value={selectedCategory}
                        options={categories.map(c => ({ label: c.nama_kategori_dokumen, value: c.kode_kategori_dokumen }))}
                        onChange={(e) => setSelectedCategory(e.value)}
                        placeholder="Filter Kategori"
                        showClear
                        className="text-xs"
                        style={{ minWidth: '15rem', height: '2.25rem' }}
                    />
                    <span className="p-input-icon-left">
                        <i className="pi pi-search" />
                        <InputText
                            value={searchVal}
                            onChange={(e) => setSearchVal(e.target.value)}
                            placeholder="Cari dokumen..."
                            className="text-sm"
                            style={{ height: '2.25rem' }}
                        />
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
                emptyMessage="Tidak ada dokumen kedaluwarsa retensi ditemukan."
                loading={loading}
                className="text-sm"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                currentPageReportTemplate="Menampilkan {first}-{last} dari {totalRecords} data"
            >
                <Column field="kode_dokumen" header="Kode Dokumen" sortable className="font-semibold text-primary"></Column>
                <Column field="nomor_dokumen" header="No. Dokumen" sortable></Column>
                <Column field="nama_dokumen" header="Nama Dokumen" sortable style={{ minWidth: '200px' }}></Column>
                <Column field="nama_kategori_dokumen" header="Kategori" sortable></Column>
                <Column field="tanggal" header="Tgl. Dokumen" sortable body={rowData => formatDate(rowData.tanggal)}></Column>
                <Column field="tahun_retensi" header="Masa Retensi" body={rowData => `${rowData.tahun_retensi} Thn`} sortable></Column>
                <Column body={actionTextTemplate} header="Tindakan JRA" sortable field="tindakan_retensi"></Column>
                <Column field="RetentionEndDate" header="Berakhir Retensi" sortable body={rowData => formatDate(rowData.RetentionEndDate)}></Column>
                <Column body={actionBodyTemplate} header="Pernyataan" style={{ width: '130px', textAlign: 'center' }}></Column>
            </DataTable>

            <Dialog
                visible={dialogVisible}
                header="Ajukan Pemusnahan Dokumen"
                modal
                style={{ width: '35rem' }}
                onHide={() => {
                    setDialogVisible(false);
                    setSelectedDoc(null);
                    setReason('');
                }}
            >
                {selectedDoc && (
                    <form onSubmit={handleProposeDestruction} className="flex flex-column gap-3 pt-3 text-sm">
                        <div className="surface-50 p-3 border-round border-1 surface-border">
                            <div className="mb-2"><strong>Nomor Dokumen:</strong> {selectedDoc.nomor_dokumen}</div>
                            <div className="mb-2"><strong>Nama Dokumen:</strong> {selectedDoc.nama_dokumen}</div>
                            <div className="mb-2"><strong>Jadwal Retensi:</strong> {selectedDoc.nama_retensi} ({selectedDoc.tahun_retensi} Tahun)</div>
                            <div><strong>Tindakan:</strong> {selectedDoc.tindakan_retensi === 'destroy' ? 'Musnahkan' : 'Tinjau Kembali'}</div>
                        </div>

                        <div className="flex flex-column gap-1">
                            <label htmlFor="alasan_usulan" className="font-semibold">
                                Alasan Pemusnahan <span className="text-red-500">*</span>
                            </label>
                            <InputTextarea
                                id="alasan_usulan"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                rows={4}
                                required
                                placeholder="Masukkan alasan mengapa dokumen ini diusulkan untuk dimusnahkan..."
                            />
                        </div>

                        <div className="flex justify-content-end gap-2 mt-2">
                            <Button
                                type="button"
                                label="Batal"
                                outlined
                                severity="secondary"
                                size="small"
                                onClick={() => {
                                    setDialogVisible(false);
                                    setSelectedDoc(null);
                                    setReason('');
                                }}
                                disabled={submitting}
                            />
                            <Button
                                type="submit"
                                label="Ajukan Usulan"
                                icon="pi pi-send"
                                severity="danger"
                                size="small"
                                loading={submitting}
                            />
                        </div>
                    </form>
                )}
            </Dialog>
        </div>
    );
}
