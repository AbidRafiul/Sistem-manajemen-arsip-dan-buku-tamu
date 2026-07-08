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
    handleFetchPreviewUrl,
    handleGenerateQR,
    handleScanQR,
    handleUpdateLocation,
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
            <span className="font-semibold text-sm text-900 block">{rowData.nomor_dokumen}</span>
            <span className="text-xs text-color-secondary">{rowData.nama_dokumen}</span>
        </div>
    );

    const picTemplate = (rowData: DocumentData) => (
        <div className="flex align-items-center gap-2">
            <Avatar
                label={rowData.nama_pic?.slice(0, 1).toUpperCase() || 'P'}
                shape="circle"
                style={{ width: '1.75rem', height: '1.75rem', fontSize: '0.7rem', background: '#EEF2FF', color: '#4F46E5', fontWeight: '700', flexShrink: 0 }}
            />
            <span className="text-sm text-900">{rowData.nama_pic}</span>
        </div>
    );

    const actionTemplate = (rowData: DocumentData) => (
        <div className="flex gap-1 align-items-center">
            <Button
                icon="pi pi-info-circle"
                rounded
                text
                size="small"
                tooltip="Detail Dokumen"
                tooltipOptions={{ position: 'top' }}
                loading={state.detailLoad}
                onClick={() => getDocumentDetail(rowData.id_dokumen)}
            />
            <Button
                icon="pi pi-history"
                rounded
                text
                severity="info"
                size="small"
                tooltip="Riwayat Versi"
                tooltipOptions={{ position: 'top' }}
                onClick={() => router.push(`/edms/archive_document/${rowData.id_dokumen}/versions`)}
            />
            <Button
                icon="pi pi-qrcode"
                rounded
                text
                severity="warning"
                size="small"
                tooltip="QR Code"
                tooltipOptions={{ position: 'top' }}
                onClick={() => handleGenerateQR(rowData.id_dokumen)}
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
                        id_dokumen: rowData.id_dokumen,
                        nama_dokumen: rowData.nama_dokumen,
                        nomor_dokumen: rowData.nomor_dokumen,
                        tanggal: formatDateInput(rowData.tanggal),
                        tanggal_kedaluwarsa: formatDateInput(rowData.tanggal_kedaluwarsa),
                        nama_pic: rowData.nama_pic,
                        kode_jenis_dokumen: rowData.kode_jenis_dokumen || '',
                        kode_klasifikasi: rowData.kode_klasifikasi || '',
                        kode_kategori_dokumen: rowData.kode_kategori_dokumen || '',
                        kode_tingkat_kerahasiaan: rowData.kode_tingkat_kerahasiaan || '',
                        tanggal_transaksi: formatDateInput(rowData.tanggal_transaksi || undefined),
                        lokasi_fisik: rowData.lokasi_fisik || '',
                        kode_retensi: rowData.kode_retensi || '',
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

    const previewTemplate = (rowData: DocumentData) => (
        <Button
            icon="pi pi-eye"
            rounded
            text
            severity="info"
            size="small"
            tooltip={rowData.file_path ? "Pratinjau Dokumen" : "Belum ada file berkas"}
            tooltipOptions={{ position: 'top' }}
            onClick={() => handleFetchPreviewUrl(rowData.file_path || '')}
            disabled={!rowData.file_path}
        />
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
                    onClick={() => {
                        const name = (state.session?.user as any)?.name || (state.session?.user as any)?.nama_pengguna || '';
                        formik.resetForm({
                            values: {
                                id_dokumen: null,
                                nama_dokumen: '',
                                nomor_dokumen: '',
                                tanggal: '',
                                tanggal_kedaluwarsa: '',
                                nama_pic: name,
                                kode_jenis_dokumen: '',
                                kode_klasifikasi: '',
                                kode_kategori_dokumen: '',
                                kode_tingkat_kerahasiaan: '',
                                tanggal_transaksi: '',
                                lokasi_fisik: '',
                                kode_retensi: '',
                            }
                        });
                        setState(p => ({ ...p, add: true, edit: false, delete: false }));
                    }}
                />
                <Divider layout="vertical" />
                <Button
                    size="small"
                    label="Scan & Track QR"
                    icon="pi pi-qrcode"
                    outlined
                    severity="info"
                    onClick={() => setState(p => ({ ...p, trackingDialog: true, trackingCode: '', trackingResult: null }))}
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
                globalFilterFields={['nama_dokumen', 'nomor_dokumen', 'nama_pic', 'status', 'nama_jenis_dokumen', 'nama_kategori_dokumen', 'nama_tingkat_kerahasiaan']}
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
                <Column header="Nomor & Nama Dokumen" body={documentTemplate} sortable sortField="nomor_dokumen" style={{ minWidth: '200px' }} />
                <Column field="nama_jenis_dokumen" header="Tipe" sortable style={{ minWidth: '110px' }} />
                <Column field="nama_kategori_dokumen" header="Kategori" sortable style={{ minWidth: '110px' }} />
                <Column field="nama_retensi" header="Jadwal Retensi" sortable body={rowData => rowData.nama_retensi ? `${rowData.nama_retensi} (${rowData.tahun_retensi} Thn)` : '-'} style={{ minWidth: '135px' }} />
                <Column field="nama_tingkat_kerahasiaan" header="Kerahasiaan" sortable style={{ minWidth: '120px' }} />
                <Column header="PIC" body={picTemplate} sortable sortField="nama_pic" style={{ minWidth: '150px' }} />
                <Column field="tanggal" header="Tgl. Dokumen" sortable body={rowData => formatDateCalendar(rowData.tanggal, 'yyyy-MM-dd')} style={{ width: '130px' }} />
                <Column field="tanggal_kedaluwarsa" header="Tgl. Kedaluwarsa" sortable body={rowData => formatDateCalendar(rowData.tanggal_kedaluwarsa, 'yyyy-MM-dd')} style={{ width: '140px' }} />
                <Column body={statusTemplate} header="Status" style={{ width: '110px', textAlign: 'center' }} />
                <Column header="Preview" body={previewTemplate} style={{ width: '90px', textAlign: 'center' }} />
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
                        <div className="font-bold text-900">{state.detailData?.document?.nomor_dokumen || '-'}</div>
                    </div>
                    <div className="col-12 md:col-6">
                        <div className="text-color-secondary text-xs font-bold uppercase mb-1" style={{ letterSpacing: '0.08em' }}>Nama Dokumen</div>
                        <div className="font-semibold text-900">{state.detailData?.document?.nama_dokumen || '-'}</div>
                    </div>
                    <div className="col-12 md:col-4">
                        <div className="text-color-secondary text-xs font-bold uppercase mb-1" style={{ letterSpacing: '0.08em' }}>PIC</div>
                        <div className="text-900">{state.detailData?.document?.nama_pic || '-'}</div>
                    </div>
                    <div className="col-12 md:col-4">
                        <div className="text-color-secondary text-xs font-bold uppercase mb-1" style={{ letterSpacing: '0.08em' }}>Tanggal Dokumen</div>
                        <div className="text-900">{state.detailData?.document?.tanggal ? formatDateCalendar(state.detailData.document.tanggal, 'yyyy-MM-dd') : '-'}</div>
                    </div>
                    <div className="col-12 md:col-4">
                        <div className="text-color-secondary text-xs font-bold uppercase mb-1" style={{ letterSpacing: '0.08em' }}>Tanggal Kedaluwarsa</div>
                        <div className="text-900">{state.detailData?.document?.tanggal_kedaluwarsa ? formatDateCalendar(state.detailData.document.tanggal_kedaluwarsa, 'yyyy-MM-dd') : '-'}</div>
                    </div>
                    <div className="col-12 md:col-4">
                        <div className="text-color-secondary text-xs font-bold uppercase mb-1" style={{ letterSpacing: '0.08em' }}>Tanggal Transaksi</div>
                        <div className="text-900">{state.detailData?.document?.tanggal_transaksi ? formatDateCalendar(state.detailData.document.tanggal_transaksi, 'yyyy-MM-dd') : '-'}</div>
                    </div>
                    <div className="col-12 md:col-4">
                        <div className="text-color-secondary text-xs font-bold uppercase mb-1" style={{ letterSpacing: '0.08em' }}>Lokasi Fisik</div>
                        <div className="text-900">{state.detailData?.document?.lokasi_fisik || '-'}</div>
                    </div>
                    <div className="col-12 md:col-4">
                        <div className="text-color-secondary text-xs font-bold uppercase mb-1" style={{ letterSpacing: '0.08em' }}>Jadwal Retensi</div>
                        <div className="text-900">{state.detailData?.document?.nama_retensi ? `${state.detailData.document.nama_retensi} (${state.detailData.document.tahun_retensi} Tahun)` : '-'}</div>
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
                        <Column field="nama_peminjam" header="Peminjam" sortable />
                        <Column field="tanggal_pinjam" header="Tgl. Pinjam" body={(rowData: LoanData) => formatDateCalendar(rowData.tanggal_pinjam)} />
                        <Column field="tanggal_kembali" header="Tgl. Kembali" body={(rowData: LoanData) => rowData.tanggal_kembali ? formatDateCalendar(rowData.tanggal_kembali) : rowData.status === 'borrowed' ? <span className="text-orange-500 font-medium">Belum Kembali</span> : '-'} />
                        <Column field="keperluan" header="Keperluan" />
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
                            : `Dokumen "${state.selectedDocuments[0]?.nomor_dokumen || ''}" akan dinonaktifkan.`}
                    </p>
                </div>
            </div>
        </Dialog>

        {/* Document Preview Dialog */}
        <Dialog
            visible={state.isPreviewVisible}
            header={
                <div className="flex align-items-center gap-2">
                    <i className="pi pi-file-pdf text-primary" />
                    <span className="font-bold text-900">Pratinjau Dokumen</span>
                </div>
            }
            modal
            style={{ width: '60rem', maxWidth: '95vw' }}
            onHide={() => setState(p => ({ ...p, isPreviewVisible: false, previewUrl: '' }))}
            pt={{ header: { className: 'border-bottom-1 surface-border pb-3' } }}
        >
            <div className="pt-3">
                {state.previewUrl ? (
                    <iframe
                        src={state.previewUrl}
                        width="100%"
                        height="600px"
                        style={{ border: 'none', borderRadius: '8px' }}
                        title="Preview Arsip"
                    />
                ) : (
                    <div className="flex flex-column align-items-center justify-content-center py-5 text-color-secondary">
                        <i className="pi pi-spin pi-spinner text-3xl mb-3" />
                        <span>Memuat dokumen...</span>
                    </div>
                )}
            </div>
        </Dialog>

        {/* QR Code Dialog */}
        <Dialog
            visible={state.qrDialog}
            header={
                <div className="flex align-items-center gap-2">
                    <i className="pi pi-qrcode text-primary" />
                    <span className="font-bold text-900">QR Code Arsip</span>
                </div>
            }
            modal
            style={{ width: '24rem', maxWidth: '95vw' }}
            onHide={() => setState(p => ({ ...p, qrDialog: false, qrData: null }))}
            pt={{ header: { className: 'border-bottom-1 surface-border pb-3' } }}
        >
            <div className="flex flex-column align-items-center justify-content-center pt-4 pb-2 text-sm">
                {state.qrLoad ? (
                    <div className="flex flex-column align-items-center py-5">
                        <i className="pi pi-spin pi-spinner text-3xl text-primary mb-3" />
                        <span className="text-color-secondary text-sm">Membuat QR Code...</span>
                    </div>
                ) : state.qrData ? (
                    <>
                        <div id="printable-qr" className="p-3 border-1 border-200 border-round-xl bg-white shadow-1 flex flex-column align-items-center text-center">
                            <img src={state.qrData.qr_base64} alt="QR Code" className="w-12rem h-12rem mb-3" />
                            <span className="font-bold text-900 block text-base">{state.qrData.nomor_dokumen}</span>
                            <span className="text-xs text-color-secondary block mt-1 max-w-15rem overflow-hidden text-overflow-ellipsis white-space-nowrap">{state.qrData.nama_dokumen}</span>
                            <span className="text-xs text-primary font-mono block mt-2 p-1 bg-blue-50 border-round">{state.qrData.qr_code}</span>
                        </div>
                        <Button
                            label="Cetak QR Code"
                            icon="pi pi-print"
                            className="mt-4 w-full"
                            severity="success"
                            onClick={() => {
                                const printContent = document.getElementById('printable-qr')?.innerHTML;
                                if (state.qrData) {
                                    const windowPrint = window.open('', '', 'left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0');
                                    windowPrint?.document.write(`
                                        <html>
                                            <head>
                                                <title>Cetak QR Code</title>
                                                <style>
                                                    body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #fff; }
                                                    .qr-container { text-align: center; border: 2px dashed #94a3b8; padding: 20px; border-radius: 12px; }
                                                    img { width: 200px; height: 200px; }
                                                    h3 { margin: 10px 0 5px 0; font-size: 18px; }
                                                    p { margin: 0; font-size: 12px; color: #64748b; }
                                                    .code { font-family: monospace; font-size: 11px; margin-top: 8px; color: #3b82f6; }
                                                </style>
                                            </head>
                                            <body>
                                                <div class="qr-container">
                                                    <img src="${state.qrData.qr_base64}" />
                                                    <h3>${state.qrData.nomor_dokumen}</h3>
                                                    <p>${state.qrData.nama_dokumen}</p>
                                                    <div class="code">${state.qrData.qr_code}</div>
                                                </div>
                                                <script>
                                                    window.onload = function() { window.print(); window.close(); }
                                                </script>
                                            </body>
                                        </html>
                                    `);
                                    windowPrint?.document.close();
                                }
                            }}
                        />
                    </>
                ) : (
                    <span className="text-red-500">Gagal memuat QR Code</span>
                )}
            </div>
        </Dialog>

        {/* Scan & Track QR Dialog */}
        <Dialog
            visible={state.trackingDialog}
            header={
                <div className="flex align-items-center gap-2">
                    <i className="pi pi-search text-primary" />
                    <span className="font-bold text-900">Tracking Dokumen & Scan QR</span>
                </div>
            }
            modal
            style={{ width: '45rem', maxWidth: '95vw' }}
            onHide={() => setState(p => ({ ...p, trackingDialog: false, trackingCode: '', trackingResult: null }))}
            pt={{ header: { className: 'border-bottom-1 surface-border pb-3' } }}
        >
            <div className="flex flex-column gap-4 pt-3">
                <div className="flex flex-column gap-2 text-sm">
                    <label htmlFor="qr_input" className="font-bold text-sm text-900">
                        Scan QR Code / Masukkan Kode Pelacakan <span className="text-red-500">*</span>
                    </label>
                    <div className="p-inputgroup">
                        <InputText
                            id="qr_input"
                            value={state.trackingCode}
                            onChange={(e) => setState(p => ({ ...p, trackingCode: e.target.value }))}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleScanQR(state.trackingCode);
                                }
                            }}
                            placeholder="Arahkan kursor ke sini lalu scan QR atau tempel Kode UUID Dokumen..."
                            className="text-sm"
                            autoFocus
                        />
                        <Button
                            icon="pi pi-search"
                            label="Track"
                            loading={state.trackingLoad}
                            onClick={() => handleScanQR(state.trackingCode)}
                        />
                    </div>
                    <small className="text-color-secondary">Gunakan alat pemindai (scanner) USB atau masukkan kode manual dan tekan Enter.</small>
                </div>

                {state.trackingLoad && (
                    <div className="flex flex-column align-items-center py-5">
                        <i className="pi pi-spin pi-spinner text-3xl text-primary mb-3" />
                        <span className="text-sm text-color-secondary">Mencari data pelacakan...</span>
                    </div>
                )}

                {!state.trackingLoad && state.trackingResult && (
                    <div className="surface-card border-1 border-200 border-round-xl p-4 flex flex-column gap-3 text-sm shadow-1">
                        <div className="flex justify-content-between align-items-center pb-2 border-bottom-1 surface-border">
                            <div>
                                <span className="font-extrabold text-lg text-900 block">{state.trackingResult.document.nomor_dokumen}</span>
                                <span className="text-xs text-color-secondary block mt-1">{state.trackingResult.document.kode_dokumen}</span>
                            </div>
                            <Tag
                                value={state.trackingResult.is_currently_borrowed ? 'SEDANG DIPINJAM' : 'TERSEDIA'}
                                severity={state.trackingResult.is_currently_borrowed ? 'warning' : 'success'}
                                icon={state.trackingResult.is_currently_borrowed ? 'pi pi-exclamation-circle' : 'pi pi-check-circle'}
                                className="px-3 py-1 font-semibold text-xs border-round-md"
                            />
                        </div>

                        <div className="grid">
                            <div className="col-12 md:col-6 flex flex-column gap-1">
                                <span className="text-color-secondary font-bold text-xs uppercase" style={{ letterSpacing: '0.05em' }}>Nama Dokumen</span>
                                <span className="text-900 font-medium">{state.trackingResult.document.nama_dokumen}</span>
                            </div>
                            <div className="col-12 md:col-6 flex flex-column gap-1">
                                <span className="text-color-secondary font-bold text-xs uppercase" style={{ letterSpacing: '0.05em' }}>Kategori & Kerahasiaan</span>
                                <span className="text-900 font-medium">
                                    {state.trackingResult.document.nama_kategori_dokumen || '-'} ({state.trackingResult.document.nama_tingkat_kerahasiaan || '-'})
                                </span>
                            </div>
                            <div className="col-12 md:col-6 flex flex-column gap-1 mt-2">
                                <span className="text-color-secondary font-bold text-xs uppercase" style={{ letterSpacing: '0.05em' }}>PIC Dokumen</span>
                                <span className="text-900 font-medium">{state.trackingResult.document.nama_pic}</span>
                            </div>
                            <div className="col-12 md:col-6 flex flex-column gap-1 mt-2">
                                <span className="text-color-secondary font-bold text-xs uppercase" style={{ letterSpacing: '0.05em' }}>Berkas Elektronik (PDF)</span>
                                {state.trackingResult.latest_version ? (
                                    <div className="flex align-items-center gap-2 mt-1">
                                        <i className="pi pi-file-pdf text-red-500 text-lg" />
                                        <a
                                            href="#"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleFetchPreviewUrl(state.trackingResult.latest_version.file_path);
                                            }}
                                            className="text-primary font-semibold hover:underline"
                                        >
                                            Versi {state.trackingResult.latest_version.nomor_versi} (Pratinjau)
                                        </a>
                                    </div>
                                ) : (
                                    <span className="text-color-secondary">Belum mengunggah berkas</span>
                                )}
                            </div>
                        </div>

                        {state.trackingResult.is_currently_borrowed && state.trackingResult.active_loan && (
                            <div className="bg-orange-50 border-round-xl p-3 border-1 border-orange-200 mt-2">
                                <div className="font-bold text-orange-800 mb-2 flex align-items-center gap-2">
                                    <i className="pi pi-info-circle" />
                                    Informasi Peminjaman Aktif
                                </div>
                                <div className="grid text-xs text-orange-900">
                                    <div className="col-6">
                                        <span className="font-semibold block">Nama Peminjam:</span>
                                        <span>{state.trackingResult.active_loan.nama_peminjam}</span>
                                    </div>
                                    <div className="col-6">
                                        <span className="font-semibold block">Tanggal Pinjam:</span>
                                        <span>{formatDateCalendar(state.trackingResult.active_loan.tanggal_pinjam)}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <Divider className="my-2" />

                        {/* Update Physical Location Panel */}
                        <div className="flex flex-column gap-2">
                            <span className="font-bold text-900 text-sm flex align-items-center gap-2">
                                <i className="pi pi-map-marker text-primary" />
                                Pembaruan Lokasi Penyimpanan Fisik (Rak / Lemari)
                            </span>
                            <div className="p-inputgroup mt-1">
                                <InputText
                                    id="lokasi_fisik_update"
                                    defaultValue={state.trackingResult.document.lokasi_fisik || ''}
                                    placeholder="Contoh: Lemari A, Rak 3, Baris 2"
                                    className="text-sm"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            const val = (e.target as HTMLInputElement).value;
                                            handleUpdateLocation(state.trackingResult.document.id_dokumen, val);
                                        }
                                    }}
                                />
                                <Button
                                    icon="pi pi-save"
                                    label="Simpan Lokasi"
                                    severity="success"
                                    loading={state.updatingLocation}
                                    onClick={() => {
                                        const el = document.getElementById('lokasi_fisik_update') as HTMLInputElement;
                                        if (el) {
                                            handleUpdateLocation(state.trackingResult.document.id_dokumen, el.value);
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Dialog>
    </>
}

export default Table
