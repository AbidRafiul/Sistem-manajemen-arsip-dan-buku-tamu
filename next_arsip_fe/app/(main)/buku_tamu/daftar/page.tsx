'use client'

import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Card } from 'primereact/card';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { TabView, TabPanel } from 'primereact/tabview';
import { Dialog } from 'primereact/dialog';
import postData from '@/lib/axios/postData';
import { showError } from '@/lib/tools/generalTools';
import * as XLSX from 'xlsx';
import QRCode from 'qrcode';

// Definisi tipe data state filter yang jelas untuk TypeScript
interface FilterState {
    Status: string | null;
    ApprovalStatus: string | null;
    StartDate: Date | null | undefined;
    EndDate: Date | null | undefined;
    GuestName: string;
    VisitPurposeId: number | null;
}

export default function DaftarSemuaKunjunganPage() {
    const toast = useRef<Toast>(null);
    const [loading, setLoading] = useState(false);
    const [visitations, setVisitations] = useState([]);
    const [expandedRows, setExpandedRows] = useState<any>(null);
    
    const [printData, setPrintData] = useState<any>(null);
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [showPrintDialog, setShowPrintDialog] = useState(false);

    const [visitPurposeOptions, setVisitPurposeOptions] = useState([]);

    // Set nilai awal state filter dengan interface FilterState
    const [filters, setFilters] = useState<FilterState>({
        Status: null,
        ApprovalStatus: null,
        StartDate: null,
        EndDate: null,
        GuestName: '',
        VisitPurposeId: null
    });

    const statusOptions = [
        { label: 'Semua Status', value: null },
        { label: 'Inside (In)', value: 'in' },
        { label: 'Finished (Out)', value: 'out' }
    ];

    const approvalOptions = [
        { label: 'Semua Approval', value: null },
        { label: 'Pending', value: 'pending' },
        { label: 'Approved', value: 'approved' },
        { label: 'Rejected', value: 'rejected' }
    ];

    const loadData = async (activeFilters = filters) => {
        setLoading(true);
        try {
            let params = new URLSearchParams();
            if (activeFilters.Status) params.append('Status', activeFilters.Status);
            if (activeFilters.ApprovalStatus) params.append('ApprovalStatus', activeFilters.ApprovalStatus);
            if (activeFilters.GuestName) params.append('GuestName', activeFilters.GuestName);
            if (activeFilters.VisitPurposeId) params.append('VisitPurposeId', String(activeFilters.VisitPurposeId));
            if (activeFilters.StartDate instanceof Date) params.append('StartDate', activeFilters.StartDate.toISOString());
            if (activeFilters.EndDate instanceof Date) params.append('EndDate', activeFilters.EndDate.toISOString());

            const response = await postData(`/buku_tamu/visit-data?${params.toString()}`, {});
            if (response?.data?.status === '00') {
                setVisitations(response.data.data);
            }
        } catch (err: any) {
            showError(toast, 'Gagal mengambil data log kunjungan');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const resPurpose = await postData('/master/visit-purpose/vp-data', {});
                if (resPurpose?.data?.status === '00') setVisitPurposeOptions(resPurpose.data.data);
                await loadData(filters);
            } catch (err) {
                console.error(err);
            }
        };
        loadInitialData();
    }, []);

    const handleFilterSubmit = () => loadData();

    const handleReset = () => {
        const cleared: FilterState = { Status: null, ApprovalStatus: null, StartDate: null, EndDate: null, GuestName: '', VisitPurposeId: null };
        setFilters(cleared);
        loadData(cleared);
    };

    const exportToExcel = () => {
        if (visitations.length === 0) {
            showError(toast, 'Tidak ada data untuk diekspor!');
            return;
        }

        const dataExcel = visitations.map((v: any) => ({
            'Kode Kunjungan': v.VisitCode,
            'Nama Tamu': v.GuestName,
            'No. Telepon': v.PhoneNumber,
            'Email': v.GuestEmail || '-',
            'Instansi': v.GuestCompany || '-',
            'Jabatan': v.GuestPosition || '-',
            'Tujuan Kunjungan': v.VisitPurposeName || v.VisitPurposeId,
            'Pegawai Internal': v.Fullname || v.HostName || '-',
            'Rencana Masuk': v.CheckInTime ? new Date(v.CheckInTime).toLocaleString('id-ID') : '-',
            'Waktu Keluar': v.CheckOutTime ? new Date(v.CheckOutTime).toLocaleString('id-ID') : '-',
            'Status': v.Status?.toUpperCase() || 'BOOKING',
            'Status Approval': v.ApprovalStatus?.toUpperCase() || 'PENDING'
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataExcel);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Log Tamu");
        XLSX.writeFile(workbook, `Report_Buku_Tamu_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const triggerPrintCard = async (rowData: any) => {
        setPrintData(rowData);
        try {
            const qrUrl = await QRCode.toDataURL(rowData.VisitCode || 'GUEST');
            setQrCodeUrl(qrUrl);
            setShowPrintDialog(true);
        } catch (err) {
            showError(toast, 'Gagal menyiapkan QR Code kartu');
        }
    };

    const executePrint = () => {
        const win = window.open('', '_blank');
        if (win && printData) {
            win.document.write(`
                <html>
                <head><title>Visitor Pass - ${printData.VisitCode}</title></head>
                <body style="font-family: system-ui, sans-serif; text-align: center; padding: 40px; color: #333;">
                    <div style="border: 2px dashed #999; padding: 30px; border-radius: 12px; display: inline-block;">
                        <h2 style="margin: 0; color: #22c55e;">VISITOR CARD PASS</h2>
                        <h4 style="margin: 5px 0 20px 0; color: #666;">${printData.VisitCode}</h4>
                        <div style="font-size: 20px; font-weight: bold; margin-bottom: 10px;">${printData.GuestName}</div>
                        <div style="font-size: 14px; margin-bottom: 20px;">${printData.GuestCompany || 'Personal Visitor'}</div>
                        <div><img src="${qrCodeUrl}" style="width: 180px; height: 180px;" /></div>
                        <div style="margin-top: 20px; font-size: 13px; color: #555;">
                            <strong>Tujuan:</strong> ${printData.VisitPurposeName || 'Kunjungan'} <br/>
                            <strong>Waktu Masuk:</strong> ${new Date(printData.CheckInTime).toLocaleString('id-ID')}
                        </div>
                    </div>
                    <script>window.onload = function() { window.print(); window.close(); }</script>
                </body>
                </html>
            `);
            win.document.close();
        }
    };

    const rowExpansionTemplate = (data: any) => {
        return (
            <div className="p-3 bg-light border-round surface-50 shadow-inner">
                <TabView>
                    <TabPanel header="Detail Profil Tamu" leftIcon="pi pi-user mr-2">
                        <div className="grid">
                            <div className="col-12 md:col-3 text-center flex flex-column align-items-center justify-content-center border-right-1 surface-border">
                                <label className="font-semibold block mb-2 text-600">Foto Tamu</label>
                                <img src={data.PhotoFaceUrl || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} alt="Wajah" className="w-9rem h-9rem object-cover border-round border-1 surface-border shadow-1" />
                            </div>
                            <div className="col-12 md:col-9 grid px-4 py-2">
                                <div className="col-6 mb-2"><strong>ID Tipe / No:</strong> {data.IdentityType?.toUpperCase() || '-'} / {data.IdentityNumber || '-'}</div>
                                <div className="col-6 mb-2"><strong>Email Tamu:</strong> {data.GuestEmail || '-'}</div>
                                <div className="col-6 mb-2"><strong>Jabatan Struktural:</strong> {data.GuestPosition || '-'}</div>
                                <div className="col-6 mb-2"><strong>Pegawai Host Internal:</strong> {data.Fullname || data.HostName || '-'}</div>
                                <div className="col-12 mt-2">
                                    <strong>Catatan Tambahan Kunjungan:</strong>
                                    <p className="mt-1 p-2 bg-white border-1 surface-border border-round text-700 font-normal">{data.VisitNotes || 'Tidak ada catatan tambahan.'}</p>
                                </div>
                            </div>
                        </div>
                    </TabPanel>
                    <TabPanel header="Timeline Aktivitas" leftIcon="pi pi-clock mr-2">
                        <div className="flex flex-column gap-3 p-2">
                            <div className="flex align-items-center gap-3">
                                <i className="pi pi-calendar-plus text-primary text-xl bg-blue-100 p-2 border-circle"></i>
                                <div>
                                    <div className="font-bold text-900">Registrasi Kunjungan / Booking Terbuka</div>
                                    <small className="text-500">{data.CreatedAt ? new Date(data.CreatedAt).toLocaleString('id-ID') : '-'}</small>
                                </div>
                            </div>
                            <div className="flex align-items-center gap-3">
                                <i className={`pi ${data.ApprovalStatus === 'approved' ? 'pi-check-circle text-success bg-green-100' : data.ApprovalStatus === 'rejected' ? 'pi-times-circle text-danger bg-red-100' : 'pi-question-circle text-warning bg-yellow-100'} text-xl p-2 border-circle`}></i>
                                <div>
                                    <div className="font-bold text-900">Validasi Check-In Keamanan: <span className="text-primary capitalize">{data.ApprovalStatus || 'Pending'}</span></div>
                                    <small className="text-500">{data.ApprovalTime ? new Date(data.ApprovalTime).toLocaleString('id-ID') : 'Menunggu aksi petugas security'}</small>
                                    {data.ApprovalNotes && <div className="text-sm text-600 mt-1 italic">" {data.ApprovalNotes} "</div>}
                                </div>
                            </div>
                            {data.Status === 'out' && (
                                <div className="flex align-items-center gap-3">
                                    <i className="pi pi-sign-out text-purple-600 bg-purple-100 p-2 border-circle"></i>
                                    <div>
                                        <div className="font-bold text-900">Selesai / Check-Out Meninggalkan Lokasi</div>
                                        <small className="text-500">{data.CheckOutTime ? new Date(data.CheckOutTime).toLocaleString('id-ID') : '-'}</small>
                                    </div>
                                </div>
                            )}
                        </div>
                    </TabPanel>
                </TabView>
            </div>
        );
    };

    return (
        <div className="p-4">
            <Toast ref={toast} />
            
            <div className="flex justify-content-between align-items-center mb-4">
                <h2 className="text-2xl font-bold m-0 text-900">Log & Riwayat Kunjungan Tamu</h2>
                <Button type="button" label="Export ke Excel" icon="pi pi-file-excel" severity="success" onClick={exportToExcel} />
            </div>

            <Card className="mb-4 shadow-1 border-none bg-stone-50">
                <div className="p-fluid grid">
                    <div className="col-12 md:col-2 field mb-2">
                        <label className="font-semibold block text-sm mb-1">Status Keberadaan</label>
                        <Dropdown value={filters.Status} options={statusOptions} onChange={(e) => setFilters(p => ({ ...p, Status: e.value }))} />
                    </div>
                    <div className="col-12 md:col-2 field mb-2">
                        <label className="font-semibold block text-sm mb-1">Status Approval</label>
                        <Dropdown value={filters.ApprovalStatus} options={approvalOptions} onChange={(e) => setFilters(p => ({ ...p, ApprovalStatus: e.value }))} />
                    </div>
                    <div className="col-12 md:col-2 field mb-2">
                        <label className="font-semibold block text-sm mb-1">Tujuan Kunjungan</label>
                        <Dropdown value={filters.VisitPurposeId} options={visitPurposeOptions} optionLabel="VisitPurposeName" optionValue="VisitPurposeId" onChange={(e) => setFilters(p => ({ ...p, VisitPurposeId: e.value }))} placeholder="Semua" showClear />
                    </div>
                    <div className="col-12 md:col-3 field mb-2">
                        <label className="font-semibold block text-sm mb-1">Nama Tamu</label>
                        <InputText value={filters.GuestName} onChange={(e) => setFilters(p => ({ ...p, GuestName: e.target.value }))} placeholder="Cari nama tamu..." />
                    </div>
                    <div className="col-12 md:col-3 field mb-2">
                        <label className="font-semibold block text-sm mb-1">Rentang Tanggal Kunjungan</label>
                        <div className="flex gap-2 align-items-center">
                            <Calendar value={filters.StartDate} onChange={(e) => setFilters(p => ({ ...p, StartDate: e.value ?? null }))} placeholder="Mulai" showIcon />
                            <span>-</span>
                            <Calendar value={filters.EndDate} onChange={(e) => setFilters(p => ({ ...p, EndDate: e.value ?? null }))} placeholder="Selesai" showIcon />
                        </div>
                    </div>
                    <div className="col-12 flex justify-content-end gap-2 mt-2">
                        <Button type="button" label="Reset Filter" icon="pi pi-filter-slash" className="p-button-outlined w-auto px-4" onClick={handleReset} />
                        <Button type="button" label="Terapkan Filter" icon="pi pi-search" className="w-auto px-4" onClick={handleFilterSubmit} />
                    </div>
                </div>
            </Card>

            <Card className="shadow-2 border-round">
                <DataTable value={visitations} loading={loading} expandedRows={expandedRows} onRowToggle={(e) => setExpandedRows(e.data)} rowExpansionTemplate={rowExpansionTemplate} dataKey="VisitId" paginator rows={10} rowsPerPageOptions={[10, 25, 50]} className="p-datatable-sm" emptyMessage="Data log kunjungan tamu tidak ditemukan">
                    <Column expander style={{ width: '3rem' }} />
                    <Column field="VisitCode" header="Visit Code" sortable style={{ minWidth: '9rem' }} body={(r) => <strong className="text-primary">{r.VisitCode || '-'}</strong>} />
                    <Column field="GuestName" header="Nama Tamu" sortable style={{ minWidth: '11rem' }} />
                    <Column field="PhoneNumber" header="No. Telepon" style={{ minWidth: '9rem' }} />
                    <Column field="GuestCompany" header="Instansi" style={{ minWidth: '10rem' }} body={(r) => r.GuestCompany || '-'} />
                    <Column field="VisitPurposeName" header="Tujuan" style={{ minWidth: '10rem' }} />
                    <Column field="CheckInTime" header="Waktu Masuk" sortable style={{ minWidth: '11rem' }} body={(r) => r.CheckInTime ? new Date(r.CheckInTime).toLocaleString('id-ID') : '-'} />
                    <Column field="CheckOutTime" header="Waktu Keluar" style={{ minWidth: '11rem' }} body={(r) => r.CheckOutTime ? new Date(r.CheckOutTime).toLocaleString('id-ID') : '-'} />
                    <Column field="Status" header="Status" body={(r) => (
                        <span className={`px-2 py-1 border-round font-semibold text-xs ${r.Status === 'in' ? 'bg-blue-100 text-blue-800' : r.Status === 'out' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                            {r.Status === 'in' ? 'Inside' : r.Status === 'out' ? 'Finished' : 'Booking'}
                        </span>
                    )} />
                    <Column field="ApprovalStatus" header="Approval" body={(r) => (
                        <span className={`px-2 py-1 border-round font-bold text-xs capitalize ${r.ApprovalStatus === 'approved' ? 'text-green-700 bg-green-50' : r.ApprovalStatus === 'rejected' ? 'text-red-700 bg-red-50' : 'text-yellow-700 bg-yellow-50'}`}>
                            {r.ApprovalStatus || 'Pending'}
                        </span>
                    )} />
                    <Column header="Aksi" body={(r) => (
                        <Button type="button" icon="pi pi-print" className="p-button-rounded p-button-text p-button-help" tooltip="Cetak Kartu Akses" onClick={() => triggerPrintCard(r)} disabled={r.ApprovalStatus !== 'approved'} />
                    )} />
                </DataTable>
            </Card>

            <Dialog visible={showPrintDialog} header="Cetak ID Card Tamu" modal style={{ width: '400px' }} onHide={() => setShowPrintDialog(false)}>
                {printData && (
                    <div className="flex flex-column align-items-center text-center p-2">
                        <div className="border-1 surface-border p-4 border-round shadow-1 surface-50 w-full mb-4">
                            <h3 className="text-success m-0 font-bold">VISITOR PASS</h3>
                            <div className="text-600 font-semibold mb-3 text-sm">{printData.VisitCode}</div>
                            <div className="text-xl font-bold mb-1">{printData.GuestName}</div>
                            <div className="text-600 text-sm mb-3">{printData.GuestCompany || 'Personal'}</div>
                            {qrCodeUrl && <img src={qrCodeUrl} alt="QR Access" className="w-11rem h-11rem border-round shadow-1 bg-white p-2" />}
                            <div className="mt-3 text-xs text-600">
                                <strong>Tujuan:</strong> {printData.VisitPurposeName}
                            </div>
                        </div>
                        <div className="flex w-full gap-2">
                            <Button type="button" label="Batalkan" severity="secondary" className="flex-1" outlined onClick={() => setShowPrintDialog(false)} />
                            <Button type="button" label="Cetak Sekarang" icon="pi pi-print" severity="help" className="flex-1" onClick={executePrint} />
                        </div>
                    </div>
                )}
            </Dialog>
        </div>
    );
}