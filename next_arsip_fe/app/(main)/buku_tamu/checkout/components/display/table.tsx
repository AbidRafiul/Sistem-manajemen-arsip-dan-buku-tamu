'use client'

import React from 'react';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Tag } from 'primereact/tag';
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
                <Button 
                    icon="pi pi-eye" 
                    severity="info" 
                    text
                    tooltip="Detail Kunjungan"
                    tooltipOptions={{ position: 'top' }}
                    className="p-button-sm"
                    onClick={() => onDetail(rowData)} 
                />
                {rowData.status === 'Sedang Berkunjung' && (
                    <Button 
                        icon="pi pi-sign-out" 
                        severity="warning" 
                        text
                        tooltip="Checkout Tamu"
                        tooltipOptions={{ position: 'top' }}
                        className="p-button-sm"
                        onClick={() => onCheckout(rowData)} 
                    />
                )}
            </div>
        );
    };

    const statusBodyTemplate = (rowData: any) => {
        const s = String(rowData.status || '').toLowerCase();
        let severity: 'warning' | 'success' | 'info' = 'info';
        let icon = 'pi pi-calendar';

        if (s.includes('sedang')) {
            severity = 'warning';
            icon = 'pi pi-id-card';
        } else if (s.includes('selesai')) {
            severity = 'success';
            icon = 'pi pi-check-circle';
        }

        return (
            <Tag 
                value={rowData.status} 
                severity={severity} 
                icon={icon}
                style={{ padding: '0.35rem 0.65rem', fontSize: '0.72rem' }}
            />
        );
    };

    const header = (
        <div className="flex flex-column md:flex-row justify-content-between align-items-stretch md:align-items-center gap-3">
            <div>
                <span className="text-primary font-bold text-xs uppercase" style={{ letterSpacing: '0.08em' }}>Log Tamu</span>
                <h2 className="m-0 font-extrabold text-xl text-900 mt-1" style={{ letterSpacing: '-0.02em' }}>Riwayat Kunjungan Tamu</h2>
            </div>
            <div className="flex flex-column sm:flex-row gap-2">
                <Dropdown 
                    value={state.statusFilter} 
                    options={statusOptions} 
                    onChange={(e) => onFilterStatus(e.value)} 
                    placeholder="Filter Status" 
                    className="w-full sm:w-12rem p-inputtext-sm" 
                />
                <span className="p-input-icon-left w-full sm:w-auto">
                    <i className="pi pi-search" />
                    <InputText 
                        type="search" 
                        value={state.searchVal} 
                        onChange={(e) => setState((p: State) => ({ ...p, searchVal: e.target.value }))} 
                        placeholder="Cari Nama Tamu..." 
                        className="w-full sm:w-auto p-inputtext-sm" 
                    />
                </span>
                <Button 
                    type="button" 
                    icon="pi pi-refresh" 
                    severity="secondary" 
                    outlined 
                    className="p-button-sm px-3 bg-white"
                    onClick={onRefresh} 
                />
            </div>
        </div>
    );

    return (
        <Card className="border-none shadow-1 border-round-2xl overflow-hidden bg-white p-2">
            <DataTable 
                value={state.data} 
                loading={state.load} 
                paginator 
                rows={10} 
                header={header} 
                responsiveLayout="scroll" 
                emptyMessage="Data kunjungan tamu kosong"
                className="text-sm"
                rowHover
                pt={{
                    header: { className: 'bg-white border-none py-3 px-2' },
                    thead: { className: 'bg-slate-50' }
                }}
            >
                <Column field="guest_name" header="Nama Tamu" sortable className="font-semibold text-900" />
                <Column field="phone_number" header="No. Telepon" />
                <Column field="guest_company" header="Instansi" sortable />
                <Column field="VisitPurposeName" header="Tujuan" />
                <Column field="check_in_time" header="Check In" body={(r) => formatDateCalendar(r.check_in_time, 'HH:mm dd/MM/yyyy')} sortable />
                <Column field="check_out_time" header="Check Out" body={(r) => r.check_out_time ? formatDateCalendar(r.check_out_time, 'HH:mm dd/MM/yyyy') : '-'} />
                <Column field="status" header="Status" body={statusBodyTemplate} sortable style={{ width: '150px' }} />
                <Column header="Aksi" body={actionBodyTemplate} style={{ width: '100px' }} />
            </DataTable>
        </Card>
    );
}
