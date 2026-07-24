'use client'

import React from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Divider } from 'primereact/divider';
import { Tag } from 'primereact/tag';
import { formatDateCalendar } from "@/lib/tools/dateTools";
import { Html5Qrcode } from 'html5-qrcode';

interface CheckoutDialogProps {
    visible: boolean;
    checkoutToken: string;
    checkoutNotes: string;
    loading: boolean;
    onHide: () => void;
    onTokenChange: (val: string) => void;
    onNotesChange: (val: string) => void;
    onConfirm: () => void;
}

export function CheckoutDialog({
    visible,
    checkoutToken,
    checkoutNotes,
    loading,
    onHide,
    onTokenChange,
    onNotesChange,
    onConfirm
}: CheckoutDialogProps) {
    return (
        <Dialog
            header={
                <div className="flex align-items-center gap-2">
                    <i className="pi pi-sign-out text-warning text-xl" />
                    <span className="font-bold text-900">Check-Out Tamu</span>
                </div>
            }
            visible={visible}
            modal
            style={{ width: '480px' }}
            onHide={onHide}
            className="border-round-2xl overflow-hidden"
            pt={{
                root: { className: 'border-round-2xl' },
                header: { className: 'surface-50 border-bottom-1 surface-border py-3 px-4' },
                content: { className: 'p-4' }
            }}
        >
            <div className="flex flex-column gap-3 p-fluid mt-1">
                <div className="field">
                    <label htmlFor="checkoutToken" className="font-semibold block mb-2 text-sm text-800">
                        QR Token / Kode Kunjungan <span className="p-error">*</span>
                    </label>
                    <InputText
                        id="checkoutToken"
                        value={checkoutToken}
                        onChange={(e) => onTokenChange(e.target.value)}
                        placeholder="Contoh: VIST-123456"
                        className="p-inputtext-sm"
                    />
                </div>
                <div className="field">
                    <label htmlFor="checkoutNotes" className="font-semibold block mb-2 text-sm text-800">
                        Catatan Keperluan Keluar / Checkout
                    </label>
                    <InputTextarea
                        id="checkoutNotes"
                        value={checkoutNotes}
                        onChange={(e) => onNotesChange(e.target.value)}
                        rows={4}
                        placeholder="Masukkan catatan tambahan jika diperlukan..."
                        className="p-inputtext-sm"
                        autoResize
                    />
                </div>
            </div>

            <div className="flex justify-content-end gap-2 mt-4 pt-3 border-top-1 surface-border">
                <Button
                    label="Batal"
                    severity="secondary"
                    outlined
                    className="py-2 px-4 font-semibold text-sm border-round-lg"
                    onClick={onHide}
                    disabled={loading}
                />
                <Button
                    label="Konfirmasi Checkout"
                    icon="pi pi-check"
                    loading={loading}
                    className="py-2 px-4 font-semibold text-sm border-round-lg text-white"
                    style={{ background: 'linear-gradient(135deg, var(--primary-color) 0%, #1d4ed8 100%)', border: 'none' }}
                    onClick={onConfirm}
                />
            </div>
        </Dialog>
    );
}

interface DetailVisitorDialogProps {
    visible: boolean;
    record: any;
    onHide: () => void;
}

export function DetailVisitorDialog({
    visible,
    record,
    onHide
}: DetailVisitorDialogProps) {
    if (!record) return null;

    const getStatusSeverity = (status?: string) => {
        const s = String(status || '').toLowerCase();
        if (s.includes('sedang')) return 'warning';
        if (s.includes('selesai')) return 'success';
        return 'info';
    };

    return (
        <Dialog
            header={
                <div className="flex align-items-center gap-2">
                    <i className="pi pi-info-circle text-primary text-xl" />
                    <span className="font-bold text-900">Detail Riwayat Kunjungan</span>
                </div>
            }
            visible={visible}
            modal
            style={{ width: '580px' }}
            onHide={onHide}
            className="border-round-2xl overflow-hidden"
            pt={{
                root: { className: 'border-round-2xl shadow-6' },
                header: { className: 'surface-50 border-bottom-1 surface-border py-3 px-4' },
                content: { className: 'p-4' }
            }}
        >
            <div className="grid text-sm mt-1">
                <div className="col-12 md:col-6 mb-3">
                    <span className="text-xs uppercase text-500 font-bold tracking-wider block mb-1">Nama Lengkap Tamu</span>
                    <span className="font-semibold text-900 text-base">{record.guest_name || record.nama_tamu}</span>
                </div>
                <div className="col-12 md:col-6 mb-3">
                    <span className="text-xs uppercase text-500 font-bold tracking-wider block mb-1">Nomor Telepon</span>
                    <span className="font-semibold text-900 text-base">{record.phone_number || record.nomor_telepon}</span>
                </div>
                <div className="col-12 md:col-6 mb-3">
                    <span className="text-xs uppercase text-500 font-bold tracking-wider block mb-1">Instansi / Perusahaan</span>
                    <span className="font-semibold text-800">{record.guest_company || record.instansi_tamu || '-'}</span>
                </div>
                <div className="col-12 md:col-6 mb-3">
                    <span className="text-xs uppercase text-500 font-bold tracking-wider block mb-1">Status Kunjungan</span>
                    <div className="mt-1">
                        <Tag
                            value={record.status}
                            severity={getStatusSeverity(record.status)}
                            style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                        />
                    </div>
                </div>
                <div className="col-12 md:col-6 mb-3">
                    <span className="text-xs uppercase text-500 font-bold tracking-wider block mb-1">Tipe Kunjungan</span>
                    <span className="font-semibold text-900 text-base uppercase">
                        {record.tipe_kunjungan === 'group' ? `Group (${record.jumlah_tamu} Orang)` : 'Personal'}
                    </span>
                </div>                <div className="col-12 md:col-6 mb-3">
                    <span className="text-xs uppercase text-500 font-bold tracking-wider block mb-1">Kantor / Cabang Tujuan</span>
                    <span className="font-semibold text-900 text-base">{record.BranchName || '-'}</span>
                </div>

                <div className="col-12">
                    <Divider className="my-2" style={{ borderColor: '#F1F5F9' }} />
                </div>

                <div className="col-12 md:col-6 mb-3">
                    <span className="text-xs uppercase text-500 font-bold tracking-wider block mb-1">Tujuan / Keperluan</span>
                    <span className="font-semibold text-800">{record.VisitPurposeName || '-'}</span>
                </div>
                <div className="col-12 md:col-6 mb-3">
                    <span className="text-xs uppercase text-500 font-bold tracking-wider block mb-1">Pegawai Internal (Host)</span>
                    <span className="font-semibold text-800">{record.HostFullname || record.nama_host || '-'}</span>
                </div>

                <div className="col-12">
                    <Divider className="my-2" style={{ borderColor: '#F1F5F9' }} />
                </div>

                <div className="col-12 md:col-6 mb-3">
                    <span className="text-xs uppercase text-500 font-bold tracking-wider block mb-1">Waktu Masuk (Check-In)</span>
                    <span className="font-semibold text-800">
                        {record.check_in_time || record.waktu_masuk ? formatDateCalendar(record.check_in_time || record.waktu_masuk, 'HH:mm dd MMM yyyy') + ' WIB' : '-'}
                    </span>
                </div>
                <div className="col-12 md:col-6 mb-3">
                    <span className="text-xs uppercase text-500 font-bold tracking-wider block mb-1">Waktu Keluar (Check-Out)</span>
                    <span className="font-semibold text-800">
                        {record.check_out_time || record.waktu_keluar ? formatDateCalendar(record.check_out_time || record.waktu_keluar, 'HH:mm dd MMM yyyy') + ' WIB' : '-'}
                    </span>
                </div>

                <div className="col-12">
                    <Divider className="my-2" style={{ borderColor: '#F1F5F9' }} />
                </div>

                <div className="col-12 mb-3">
                    <span className="text-xs uppercase text-500 font-bold tracking-wider block mb-2">Dokumentasi & Tanda Tangan</span>
                    <div className="flex gap-2 justify-content-between mt-2" style={{ gap: '10px' }}>
                        {/* Foto Wajah */}
                        <div className="flex-1 flex flex-column align-items-center p-2 border-round-lg" style={{ background: '#F8FAFC', border: '1px solid #EFF6FF', maxWidth: '32%' }}>
                            <span className="text-xs font-bold text-600 mb-2">Foto Wajah</span>
                            {record.PhotoFaceUrl ? (
                                <img src={record.PhotoFaceUrl} alt="Foto Wajah" className="border-round object-cover" style={{ width: '100%', height: '100px' }} />
                            ) : (
                                <div className="flex align-items-center justify-content-center border-round bg-100 text-500 text-xs text-center" style={{ width: '100%', height: '100px' }}>Tidak Ada Foto</div>
                            )}
                        </div>

                        {/* Foto Identitas */}
                        <div className="flex-1 flex flex-column align-items-center p-2 border-round-lg" style={{ background: '#F8FAFC', border: '1px solid #EFF6FF', maxWidth: '32%' }}>
                            <span className="text-xs font-bold text-600 mb-2">Foto Identitas</span>
                            {record.PhotoIdentityUrl ? (
                                <img src={record.PhotoIdentityUrl} alt="Foto ID" className="border-round object-cover" style={{ width: '100%', height: '100px' }} />
                            ) : (
                                <div className="flex align-items-center justify-content-center border-round bg-100 text-500 text-xs text-center" style={{ width: '100%', height: '100px' }}>Tidak Ada ID</div>
                            )}
                        </div>

                        {/* Tanda Tangan */}
                        <div className="flex-1 flex flex-column align-items-center p-2 border-round-lg" style={{ background: '#F8FAFC', border: '1px solid #EFF6FF', maxWidth: '32%' }}>
                            <span className="text-xs font-bold text-600 mb-2">Tanda Tangan</span>
                            {record.SignatureUrl ? (
                                <img src={record.SignatureUrl} alt="Tanda Tangan" className="border-round" style={{ width: '100%', height: '100px', objectFit: 'contain', background: '#ffffff' }} />
                            ) : (
                                <div className="flex align-items-center justify-content-center border-round bg-100 text-500 text-xs text-center" style={{ width: '100%', height: '100px' }}>Belum TTD</div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="col-12">
                    <Divider className="my-2" style={{ borderColor: '#F1F5F9' }} />
                </div>

                <div className="col-12">
                    <span className="text-xs uppercase text-500 font-bold tracking-wider block mb-1">Catatan Tambahan</span>
                    <div
                        className="p-3 border-round-lg mt-1 text-800 leading-normal"
                        style={{ backgroundColor: '#F8FAFC', border: '1px solid #EFF6FF' }}
                    >
                        {record.visit_notes || record.catatan_kunjungan || 'Tidak ada catatan tambahan.'}
                    </div>
                </div>

                {record.tipe_kunjungan === 'group' && record.group_members && record.group_members.length > 0 && (
                    <>
                        <div className="col-12">
                            <Divider className="my-2" style={{ borderColor: '#F1F5F9' }} />
                        </div>
                        <div className="col-12 mb-3">
                            <span className="text-xs uppercase text-500 font-bold tracking-wider block mb-2">Anggota Rombongan ({record.group_members.length} Orang)</span>
                            <div className="flex flex-column gap-2">
                                {record.group_members.map((member: any, idx: number) => (
                                    <div key={idx} className="p-2 border-round-lg flex align-items-center justify-content-between text-xs" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                                        <div className="flex flex-column gap-1">
                                            <span className="font-semibold text-900">{idx + 1}. {member.nama_anggota}</span>
                                            <div className="flex gap-3 text-600">
                                                {member.nomor_telepon && <span>No. HP: {member.nomor_telepon}</span>}
                                                {member.nomor_identitas && <span>No. ID: {member.nomor_identitas}</span>}
                                            </div>
                                        </div>
                                        {member.PhotoIdentityUrl && (
                                            <a href={member.PhotoIdentityUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-bold flex align-items-center gap-1">
                                                <i className="pi pi-image" /> Lihat KTP
                                            </a>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>

            <div className="flex justify-content-end mt-4 pt-3 border-top-1 surface-border">
                <Button
                    label="Tutup"
                    className="py-2 px-4 font-semibold text-sm border-round-lg"
                    style={{ background: 'linear-gradient(135deg, var(--primary-color) 0%, #1d4ed8 100%)', border: 'none' }}
                    onClick={onHide}
                />
            </div>
        </Dialog>
    );
}

interface ScanQRDialogProps {
    visible: boolean;
    onHide: () => void;
    onScanSuccess: (decodedText: string) => void;
    loading: boolean;
}

export function ScanQRDialog({
    visible,
    onHide,
    onScanSuccess,
    loading
}: ScanQRDialogProps) {
    const scannerRef = React.useRef<any>(null);

    React.useEffect(() => {
        if (visible) {
            const timeoutId = setTimeout(() => {
                const html5QrCode = new Html5Qrcode("qr-reader");
                scannerRef.current = html5QrCode;

                html5QrCode.start(
                    { facingMode: "environment" },
                    { fps: 10, qrbox: { width: 250, height: 250 } },
                    (decodedText) => {
                        onScanSuccess(decodedText);
                        // Stop after scan success
                        if (html5QrCode.isScanning) {
                            html5QrCode.stop().then(() => {
                                scannerRef.current = null;
                            }).catch((err: any) => console.error("Gagal menghentikan scanner:", err));
                        }
                    },
                    () => {
                        // ignore error
                    }
                ).catch((err: any) => {
                    console.error("Gagal memulai scanner QR:", err);
                });
            }, 300);

            return () => {
                clearTimeout(timeoutId);
            };
        } else {
            if (scannerRef.current && scannerRef.current.isScanning) {
                scannerRef.current.stop().then(() => {
                    scannerRef.current = null;
                }).catch((err: any) => console.error("Gagal menghentikan scanner saat modal ditutup:", err));
            }
        }
    }, [visible]);

    const handleClose = async () => {
        if (scannerRef.current && scannerRef.current.isScanning) {
            try {
                await scannerRef.current.stop();
            } catch (err) {
                console.error("Error stopping scanner on close:", err);
            }
        }
        scannerRef.current = null;
        onHide();
    };

    return (
        <Dialog
            header={
                <div className="flex align-items-center gap-2">
                    <i className="pi pi-qrcode text-primary text-xl" />
                    <span className="font-bold text-900">Scan QR Code Tamu</span>
                </div>
            }
            visible={visible}
            modal
            style={{ width: '95vw', maxWidth: '450px' }}
            onHide={handleClose}
            className="border-round-2xl overflow-hidden"
            pt={{
                root: { className: 'border-round-2xl shadow-6' },
                header: { className: 'surface-50 border-bottom-1 surface-border py-3 px-4' },
                content: { className: 'p-4 flex flex-column align-items-center' }
            }}
        >
            <div className="text-center mb-3">
                <p className="text-sm text-600 m-0">Arahkan QR Code Kunjungan tamu ke area kamera di bawah ini</p>
            </div>

            <div className="relative w-full aspect-square border-round-xl overflow-hidden bg-black shadow-inner mb-4 flex align-items-center justify-content-center" style={{ maxWidth: '320px', minHeight: '320px' }}>
                <div id="qr-reader" className="w-full h-full" style={{ border: 'none' }}></div>
                {/* Visual scanner target line overlay */}
                <div 
                    className="absolute left-0 right-0 h-2px bg-primary opacity-75"
                    style={{
                        top: '50%',
                        boxShadow: '0 0 8px var(--primary-color)',
                        animation: 'scan-anim 2s infinite ease-in-out'
                    }}
                />
            </div>

            <Button
                type="button"
                label="Batal"
                severity="secondary"
                outlined
                className="w-full py-2 font-semibold text-sm border-round-lg mt-2"
                onClick={handleClose}
                disabled={loading}
            />

            <style jsx>{`
                @keyframes scan-anim {
                    0% { top: 15%; }
                    50% { top: 85%; }
                    100% { top: 15%; }
                }
            `}</style>
        </Dialog>
    );
}

interface RejectDialogProps {
    visible: boolean;
    rejectRecord: any;
    rejectNotes: string;
    loading: boolean;
    onHide: () => void;
    onNotesChange: (val: string) => void;
    onConfirm: () => void;
}

export function RejectDialog({
    visible,
    rejectRecord,
    rejectNotes,
    loading,
    onHide,
    onNotesChange,
    onConfirm
}: RejectDialogProps) {
    return (
        <Dialog
            header={
                <div className="flex align-items-center gap-2">
                    <i className="pi pi-times-circle text-red-500 text-xl" />
                    <span className="font-bold text-900">Konfirmasi Penolakan Kunjungan</span>
                </div>
            }
            visible={visible}
            modal
            style={{ width: '480px' }}
            onHide={onHide}
            className="border-round-2xl overflow-hidden"
            pt={{
                root: { className: 'border-round-2xl shadow-6' },
                header: { className: 'surface-50 border-bottom-1 surface-border py-3 px-4' },
                content: { className: 'p-4' }
            }}
        >
            <div className="flex flex-column gap-3 p-fluid mt-1">
                {rejectRecord && (
                    <div className="surface-50 p-3 border-round-xl border-1 surface-border flex flex-column gap-1 text-sm">
                        <div className="flex justify-content-between">
                            <span className="text-600 font-medium">Nama Tamu:</span>
                            <span className="font-bold text-900">{rejectRecord.nama_tamu}</span>
                        </div>
                        {rejectRecord.instansi_tamu && (
                            <div className="flex justify-content-between">
                                <span className="text-600 font-medium">Instansi:</span>
                                <span className="font-semibold text-800">{rejectRecord.instansi_tamu}</span>
                            </div>
                        )}
                        <div className="flex justify-content-between">
                            <span className="text-600 font-medium">Kode Kunjungan:</span>
                            <span className="font-bold text-primary">{rejectRecord.kode_kunjungan || rejectRecord.visit_code}</span>
                        </div>
                    </div>
                )}

                <div className="field m-0">
                    <label htmlFor="rejectNotes" className="font-semibold block mb-2 text-sm text-800">
                        Alasan / Catatan Penolakan <span className="text-500 font-normal">(Opsional)</span>
                    </label>
                    <InputTextarea
                        id="rejectNotes"
                        value={rejectNotes}
                        onChange={(e) => onNotesChange(e.target.value)}
                        rows={3}
                        placeholder="Tuliskan alasan penolakan untuk disampaikan ke tamu..."
                        className="p-inputtext-sm"
                        autoResize
                    />
                </div>
            </div>

            <div className="flex justify-content-end gap-2 mt-4 pt-3 border-top-1 surface-border">
                <Button
                    label="Batal"
                    severity="secondary"
                    outlined
                    className="py-2 px-4 font-semibold text-sm border-round-lg"
                    onClick={onHide}
                    disabled={loading}
                />
                <Button
                    label="Tolak Kunjungan"
                    icon="pi pi-times"
                    severity="danger"
                    loading={loading}
                    className="py-2 px-4 font-semibold text-sm border-round-lg text-white"
                    onClick={onConfirm}
                />
            </div>
        </Dialog>
    );
}
