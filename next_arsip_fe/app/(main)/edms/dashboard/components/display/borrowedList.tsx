"use client";
import React from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Card } from 'primereact/card';
import { Badge } from 'primereact/badge';
import { Skeleton } from 'primereact/skeleton';
import { BorrowedItem } from '../interfaces';

interface BorrowedListProps {
    list?: BorrowedItem[];
    isLoading: boolean;
}

export default function BorrowedList({ list = [], isLoading }: BorrowedListProps) {
    if (isLoading) {
        return (
            <Card className="border-none shadow-1 border-round-2xl p-4 bg-white mt-4">
                <Skeleton width="30%" height="2rem" className="mb-4" />
                <Skeleton width="100%" height="200px" borderRadius="12px" />
            </Card>
        );
    }

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const docCodeTemplate = (rowData: BorrowedItem) => (
        <span className="font-bold text-primary font-mono text-xs bg-blue-50 px-2 py-1 border-round-md">
            {rowData.kode_dokumen}
        </span>
    );

    const docNameTemplate = (rowData: BorrowedItem) => (
        <div className="flex flex-column">
            <span className="font-bold text-800 text-sm line-clamp-1">{rowData.nama_dokumen}</span>
            <span className="text-xs text-color-secondary mt-0.5 font-medium">Keperluan: {rowData.keperluan}</span>
        </div>
    );

    const loanDateTemplate = (rowData: BorrowedItem) => (
        <span className="text-sm text-700 font-semibold">{formatDate(rowData.tanggal_pinjam)}</span>
    );

    const returnDateTemplate = (rowData: BorrowedItem) => {
        const dueDate = new Date(rowData.tanggal_pengembalian);
        const today = new Date();
        const isOverdue = dueDate < today;

        return (
            <div className="flex flex-column">
                <span className={`text-sm font-semibold ${isOverdue ? 'text-red-500' : 'text-700'}`}>
                    {formatDate(rowData.tanggal_pengembalian)}
                </span>
                {isOverdue && (
                    <span className="text-xs font-bold text-red-500 mt-0.5 flex align-items-center gap-1">
                        <i className="pi pi-exclamation-circle text-xs" />
                        Terlambat
                    </span>
                )}
            </div>
        );
    };

    const statusTemplate = () => (
        <Badge value="Dipinjam" severity="warning" className="px-2 py-1 text-xs font-bold" />
    );

    return (
        <Card className="border-none shadow-1 border-round-2xl overflow-hidden bg-white mt-4">
            <div className="flex flex-column mb-4">
                <div className="flex align-items-center gap-2">
                    <h3 className="text-xl font-bold text-900 m-0" style={{ letterSpacing: '-0.02em' }}>
                        Daftar Berkas Sedang Dipinjam
                    </h3>
                    <Badge value={list.length} severity="info" className="ml-2 font-bold" />
                </div>
                <p className="text-sm text-color-secondary mt-1 m-0">
                    Informasi rincian berkas kearsipan fisik yang saat ini berada di luar ruang penyimpanan.
                </p>
            </div>

            <DataTable
                value={list}
                rows={5}
                paginator={list.length > 5}
                className="p-datatable-sm"
                emptyMessage={
                    <div className="flex flex-column align-items-center justify-content-center text-center p-5 text-color-secondary">
                        <i className="pi pi-check-circle text-5xl mb-3 text-200" />
                        <span className="text-sm font-bold">Semua berkas aman di ruang arsip</span>
                        <p className="text-xs mt-1 m-0">Saat ini tidak ada dokumen yang sedang dipinjam.</p>
                    </div>
                }
                responsiveLayout="scroll"
                rowHover
                rowClassName={() => 'premium-hover-card'}
                pt={{
                    root: { className: 'border-none' }
                }}
            >
                <Column field="kode_dokumen" header="KODE DOKUMEN" body={docCodeTemplate} style={{ width: '15%' }} headerClassName="font-bold text-xs text-color-secondary uppercase tracking-wider py-3" />
                <Column field="nama_dokumen" header="NAMA DOKUMEN / DETAIL" body={docNameTemplate} style={{ width: '35%' }} headerClassName="font-bold text-xs text-color-secondary uppercase tracking-wider py-3" />
                <Column field="nama_peminjam" header="PEMINJAM" headerClassName="font-bold text-xs text-color-secondary uppercase tracking-wider py-3" className="text-sm font-semibold text-800" style={{ width: '15%' }} />
                <Column field="tanggal_pinjam" header="TANGGAL PINJAM" body={loanDateTemplate} style={{ width: '15%' }} headerClassName="font-bold text-xs text-color-secondary uppercase tracking-wider py-3" />
                <Column field="tanggal_pengembalian" header="TENGGAT PENGEMBALIAN" body={returnDateTemplate} style={{ width: '12%' }} headerClassName="font-bold text-xs text-color-secondary uppercase tracking-wider py-3" />
                <Column header="STATUS" body={statusTemplate} style={{ width: '8%' }} headerClassName="font-bold text-xs text-color-secondary uppercase tracking-wider py-3 text-center" className="text-center" />
            </DataTable>
        </Card>
    );
}
