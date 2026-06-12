'use client'

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Tag } from "primereact/tag";
import { Button } from "primereact/button";
import { TableProps, TableData } from "./interfaces";
import { formatDateCalendar } from "@/lib/tools/dateTools";

const Table = ({ state, setState, getData, toast, onOpenCheckin, onCheckout, onApprove, onReject, onDetail, onFilterStatus, onRefresh }: TableProps) => {

    const headerTemplate = (
        <div className="flex flex-wrap align-items-center justify-content-between gap-2">
            <div>
                <span className="text-xl font-semibold">Monitoring Buku Tamu</span>
            </div>
            <div className="flex flex-wrap gap-2 align-items-center">
                <Button label="Check-In Tamu Baru" icon="pi pi-sign-in" severity="success" onClick={onOpenCheckin} />
                <Dropdown
                    value={state.statusFilter}
                    options={[
                        { label: "Semua Status", value: "" },
                        { label: "In", value: "in" },
                        { label: "Out", value: "out" },
                    ]}
                    optionLabel="label"
                    optionValue="value"
                    onChange={(e) => onFilterStatus(e.value)}
                    placeholder="Filter Status"
                />
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText
                        value={state.searchVal}
                        onChange={(e) => {
                            const value = e.target.value;
                            const filters = { ...state.filters };
                            filters.global.value = value;
                            setState((prev) => ({ ...prev, searchVal: value, filters }));
                        }}
                        placeholder="Search GuestName..."
                    />
                </span>
                <Button label="Refresh" icon="pi pi-refresh" outlined onClick={onRefresh} loading={state.load} />
            </div>
        </div>
    );

    const statusTag = (status: string) => {
        const lookup: Record<string, { label: string; severity: string }> = {
            in: { label: "In", severity: "success" },
            out: { label: "Out", severity: "secondary" },
        };
        const config = lookup[status] || { label: status, severity: "info" };
        // FIX: Tambahkan 'as any' pada severity agar TypeScript tidak komplain perihal TagProps
        return <Tag value={config.label} severity={config.severity as any} />;
    };

    const approvalTag = (approval: string) => {
        const lookup: Record<string, { label: string; severity: string }> = {
            approved: { label: "Approved", severity: "info" },
            pending: { label: "Pending", severity: "warning" },
            rejected: { label: "Rejected", severity: "danger" },
        };
        const config = lookup[approval] || { label: approval, severity: "info" };
        // FIX: Tambahkan 'as any' pada severity agar TypeScript tidak komplain perihal TagProps
        return <Tag value={config.label} severity={config.severity as any} />;
    };

    const actionBodyTemplate = (rowData: TableData) => {
        return (
            <div className="flex flex-wrap gap-2">
                {rowData.Status === 'in' && (
                    <Button icon="pi pi-sign-out" rounded outlined severity="warning" className="p-button-sm" onClick={() => onCheckout(rowData)} tooltip="Check-Out" />
                )}
                {rowData.ApprovalStatus === 'pending' && (
                    <>
                        <Button icon="pi pi-check" rounded outlined severity="success" className="p-button-sm" onClick={() => onApprove(rowData)} tooltip="Approve" />
                        <Button icon="pi pi-times" rounded outlined severity="danger" className="p-button-sm" onClick={() => onReject(rowData)} tooltip="Reject" />
                    </>
                )}
                <Button icon="pi pi-eye" rounded outlined severity="info" className="p-button-sm" onClick={() => onDetail(rowData)} tooltip="Detail" />
            </div>
        );
    };

    const photoBody = (rowData: TableData) => {
        return rowData.PhotoFaceUrl ? (
            <img src={rowData.PhotoFaceUrl} alt="PhotoFace" width={40} height={40} className="border-circle" style={{ objectFit: 'cover' }} />
        ) : (
            <i className="pi pi-user text-xl flex align-items-center justify-content-center border-circle bg-subtle text-gray-400" style={{ width: '40px', height: '40px' }} />
        );
    };

    const cards = state.statData ? [
        { title: 'Tamu Hari Ini', value: state.statData.today_total, color: '#2563eb' },
        { title: 'Sedang Berkunjung', value: state.statData.today_in, color: '#16a34a' },
        { title: 'Sudah Keluar', value: state.statData.today_out, color: '#6b7280' },
        { title: 'Menunggu Approval', value: state.statData.pending_approval, color: '#f59e0b' },
    ] : [];

    return (
        <div className="card border-none p-0">
            {/* FIX: Set col-12 dan col-sm-6 agar layout responsive aman & proporsional */}
            <div className="grid mt-1 mb-4">
                {cards.map((card) => (
                    <div key={card.title} className="col-12 sm:col-6 lg:col">
                        <div className="p-4 border-round shadow-1" style={{ backgroundColor: card.color, color: '#ffffff' }}>
                            <div className="text-sm font-medium opacity-80">{card.title}</div>
                            <div className="text-3xl font-bold mt-2">{card.value}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="card">
                <DataTable
                    value={state.data}
                    paginator
                    rows={10}
                    header={headerTemplate}
                    filters={state.filters}
                    globalFilterFields={['GuestName']}
                    loading={state.load}
                    emptyMessage="Data kunjungan tamu kosong"
                    responsiveLayout="scroll"
                    dataKey="VisitationId"
                >
                    <Column field="PhotoFaceUrl" header="Foto" body={photoBody} style={{ width: '5rem' }} />
                    <Column field="GuestName" header="Guest Name" sortable />
                    <Column field="PhoneNumber" header="Phone" />
                    <Column field="GuestCompany" header="Company" />
                    <Column field="VisitPurposeName" header="Purpose" />
                    <Column field="CheckInTime" header="Check In" body={(rowData) => formatDateCalendar(rowData.CheckInTime, 'HH:mm dd/MM/yyyy')} sortable />
                    <Column field="CheckOutTime" header="Check Out" body={(rowData) => rowData.CheckOutTime ? formatDateCalendar(rowData.CheckOutTime, 'HH:mm dd/MM/yyyy') : '-'} />
                    <Column header="Status" body={(rowData) => statusTag(rowData.Status)} />
                    <Column header="Approval" body={(rowData) => approvalTag(rowData.ApprovalStatus)} />
                    <Column header="Action" body={actionBodyTemplate} style={{ minWidth: '10rem' }} />
                </DataTable>
            </div>
        </div>
    );
};

export default Table;