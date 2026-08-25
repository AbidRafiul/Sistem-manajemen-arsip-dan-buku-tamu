'use client';

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
import { usePermissions } from '@/hooks/usePermissions';

interface TableProps {
    state: State;
    setState: React.Dispatch<React.SetStateAction<State>>;
    session?: any;
    onCheckout: (row: any) => void;
    onDetail: (row: any) => void;
    onFilterStatus: (value: string) => void;
    onRefresh: () => void;
    onApprove: (row: any) => void;
    onReject: (row: any) => void;
    onCheckin: (row: any) => void;
    onScanQR: () => void;
}

export default function GuestDataTable({
    state,
    setState,
    session,
    onCheckout,
    onDetail,
    onFilterStatus,
    onRefresh,
    onApprove,
    onReject,
    onCheckin,
    onScanQR
}: TableProps) {
    const roleCode = (session?.user as any)?.roleCode;
    const isSuperadmin = roleCode === 'SUPERADMIN';
    const statusOptions = [
        { label: 'Semua Status', value: '' },
        { label: 'Sedang Berkunjung', value: 'in' },
        { label: 'Selesai', value: 'out' }
    ];

    const permissions = usePermissions();
    const { canUpdate, canApprove } = permissions;

    const actionBodyTemplate = (rowData: any) => {
        return (
            <div className="flex gap-2 justify-content-center">
                <Button icon="pi pi-eye" severity="info" outlined onClick={() => onDetail(rowData)} tooltip="Detail" />
                {canApprove && rowData.status_persetujuan === 'pending' && (
                    <>
                        <Button icon="pi pi-check" rounded outlined onClick={() => onApprove(rowData)} tooltip="Setujui" />
                        <Button icon="pi pi-times" severity="danger" rounded outlined onClick={() => onReject(rowData)} tooltip="Tolak" />
                    </>
                )}
                {canUpdate && rowData.status === 'Rencana' && rowData.status_persetujuan === 'approved' && (
                    <Button icon="pi pi-sign-in" rounded outlined onClick={() => onCheckin(rowData)} tooltip="Check-In (Masuk)" />
                )}
                {canUpdate && rowData.status === 'in' && rowData.status_persetujuan === 'approved' && (
                    <Button icon="pi pi-sign-out" severity="danger" rounded outlined onClick={() => onCheckout(rowData)} tooltip="Check-Out" />
                )}
            </div>
        );
    };

    const statusBodyTemplate = (rowData: any) => {
        let severity: "success" | "info" | "warning" | "danger" | null = null;
        let statusLabel = rowData.status;

        if (rowData.status === 'in') {
            severity = "success";
            statusLabel = "in";
        } else if (rowData.status === 'out') {
            severity = "danger";
            statusLabel = "out";
        } else {
            severity = "warning";
        }

        return <Tag severity={severity} value={statusLabel} />;
    };

    const approvalBodyTemplate = (rowData: any) => {
        let severity: "success" | "info" | "warning" | "danger" | null = null;
        let statusLabel = "Pending";

        if (rowData.status_persetujuan === 'approved') {
            severity = "success";
            statusLabel = "Disetujui";
        } else if (rowData.status_persetujuan === 'rejected') {
            severity = "danger";
            statusLabel = "Ditolak";
        } else {
            severity = "warning";
        }

        return <Tag severity={severity} value={statusLabel} />;
    };

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center gap-3">
            <h5 className="m-0 font-bold">Riwayat Kunjungan Tamu</h5>
            <div className="flex flex-column sm:flex-row gap-2">
                <Button type="button"
                    label="Scan QR"
                    icon="pi pi-qrcode"
                    className="p-button-sm px-3 text-white"
                    style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', border: 'none' }}
                    onClick={onScanQR} />

                <Dropdown
                    value={state.statusFilter}
                    options={statusOptions}
                    onChange={(e) => onFilterStatus(e.value)}
                    placeholder="Filter Status"
                    className="w-full sm:w-12rem p-inputtext-sm" />
                <span className="p-input-icon-left w-full sm:w-auto">
                    <i className="pi pi-search" />
                    <InputText
                        type="search"
                        value={state.searchVal}
                        onChange={(e) => setState((p: State) => ({ ...p, searchVal: e.target.value }))}
                        placeholder="Cari Nama Tamu..."
                        className="w-full sm:w-auto p-inputtext-sm" />
                </span>
                <Button type="button"
                    icon="pi pi-refresh"
                    severity="secondary"
                    outlined
                    className="p-button-sm px-3 bg-white"
                    onClick={onRefresh} />
            </div>
        </div>
    );

    return (
        <div className="card shadow-2 border-round p-4">
            <DataTable value={state.data} loading={state.load} paginator rows={10} header={header} responsiveLayout="scroll" emptyMessage="Data kunjungan tamu kosong">
                <Column field="nama_tamu" header="Nama Tamu" sortable />
                {isSuperadmin && <Column field="BranchName" header="Kantor Cabang" sortable />}
                <Column field="nomor_telepon" header="No. Telepon" />
                <Column field="instansi_tamu" header="Instansi" sortable />
                <Column field="VisitPurposeName" header="Tujuan" />
                <Column field="waktu_masuk" header="Check In" body={(r) => r.waktu_masuk && r.waktu_masuk !== '0000-00-00 00:00:00' ? formatDateCalendar(r.waktu_masuk, 'HH:mm dd/MM/yyyy') : '-'} sortable />
                <Column field="waktu_keluar" header="Check Out" body={(r) => r.waktu_keluar && r.waktu_keluar !== '0000-00-00 00:00:00' ? formatDateCalendar(r.waktu_keluar, 'HH:mm dd/MM/yyyy') : '-'} />
                <Column field="status_persetujuan" header="Persetujuan" body={approvalBodyTemplate} sortable />
                <Column field="status" header=""  body={statusBodyTemplate} sortable  style={{ width: '3rem', textAlign: 'center' }} />
                <Column align="center" header="Aksi" body={actionBodyTemplate} style={{ minWidth: '10rem' }} />
            </DataTable>
        </div>
    );
}
