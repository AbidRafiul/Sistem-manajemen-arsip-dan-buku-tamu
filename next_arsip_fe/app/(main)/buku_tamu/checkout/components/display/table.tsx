'use client'

import React from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { State } from "@/app/(main)/buku_tamu/checkout/components/interfaces";
import { formatDateCalendar } from "@/lib/tools/dateTools";

interface TableProps {
    state: State;
    setState: React.Dispatch<React.SetStateAction<State>>;
    onCheckout: (row: any) => void;
    onDetail: (row: any) => void;
    onFilterStatus: (value: string) => void;
    onRefresh: () => void;
}

export default function GuestDataTable({
    state,
    setState,
    onCheckout,
    onDetail,
    onFilterStatus,
    onRefresh
}: TableProps) {
    const statusOptions = [
        { label: 'Semua Status', value: '' },
        { label: 'Rencana Kunjungan', value: 'Rencana' },
        { label: 'Sedang Berkunjung', value: 'Sedang Berkunjung' },
        { label: 'Selesai', value: 'Selesai' }
    ];

    const actionBodyTemplate = (rowData: any) => {
        return (
            <div className="flex gap-2">
                <Button icon="pi pi-eye" severity="info" rounded outlined onClick={() => onDetail(rowData)} />
                {rowData.status === 'Sedang Berkunjung' && (
                    <Button icon="pi pi-sign-out" severity="danger" rounded outlined onClick={() => onCheckout(rowData)} />
                )}
            </div>
        );
    };

    const statusBodyTemplate = (rowData: any) => {
        let badgeClass = "bg-blue-100 text-blue-800";
        if (rowData.status === 'Sedang Berkunjung') badgeClass = "bg-orange-100 text-orange-800";
        if (rowData.status === 'Selesai') badgeClass = "bg-green-100 text-green-800";
        return <span className={`px-2 py-1 border-round text-xs font-bold ${badgeClass}`}>{rowData.status}</span>;
    };

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center gap-3">
            <h5 className="m-0 font-bold text-slate-700">Riwayat Kunjungan Tamu</h5>
            <div className="flex flex-column sm:flex-row gap-2">
                <Dropdown value={state.statusFilter} options={statusOptions} onChange={(e) => onFilterStatus(e.value)} placeholder="Filter Status" className="w-full sm:w-12rem" />
                <span className="p-input-icon-left w-full sm:w-auto">
                    <i className="pi pi-search" />
                    <InputText type="search" value={state.searchVal} onChange={(e) => setState((p: State) => ({ ...p, searchVal: e.target.value }))} placeholder="Cari Nama Tamu..." className="w-full sm:w-auto" />
                </span>
                <Button type="button" icon="pi pi-refresh" severity="secondary" outlined onClick={onRefresh} />
            </div>
        </div>
    );

    return (
        <div className="card shadow-2 border-round p-4 bg-white">
            <DataTable value={state.data} loading={state.load} paginator rows={10} header={header} responsiveLayout="scroll" emptyMessage="Data kunjungan tamu kosong">
                <Column field="guest_name" header="Nama Tamu" sortable />
                <Column field="phone_number" header="No. Telepon" />
                <Column field="guest_company" header="Instansi" sortable />
                <Column field="VisitPurposeName" header="Tujuan" />
                <Column field="check_in_time" header="Check In" body={(r) => formatDateCalendar(r.check_in_time, 'HH:mm dd/MM/yyyy')} sortable />
                <Column field="check_out_time" header="Check Out" body={(r) => r.check_out_time ? formatDateCalendar(r.check_out_time, 'HH:mm dd/MM/yyyy') : '-'} />
                <Column field="status" header="Status" body={statusBodyTemplate} sortable />
                <Column header="Aksi" body={actionBodyTemplate} style={{ minWidth: '8rem' }} />
            </DataTable>
        </div>
    );
}