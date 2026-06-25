'use client'

import React from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Divider } from 'primereact/divider';
import { Tag } from 'primereact/tag';
import { formatDateCalendar } from "@/lib/tools/dateTools";

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
                    <span className="font-semibold text-900 text-base">{record.guest_name}</span>
                </div>
                <div className="col-12 md:col-6 mb-3">
                    <span className="text-xs uppercase text-500 font-bold tracking-wider block mb-1">Nomor Telepon</span>
                    <span className="font-semibold text-900 text-base">{record.phone_number}</span>
                </div>
                <div className="col-12 md:col-6 mb-3">
                    <span className="text-xs uppercase text-500 font-bold tracking-wider block mb-1">Instansi / Perusahaan</span>
                    <span className="font-semibold text-800">{record.guest_company || '-'}</span>
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

                <div className="col-12">
                    <Divider className="my-2" style={{ borderColor: '#F1F5F9' }} />
                </div>

                <div className="col-12 md:col-6 mb-3">
                    <span className="text-xs uppercase text-500 font-bold tracking-wider block mb-1">Tujuan / Keperluan</span>
                    <span className="font-semibold text-800">{record.VisitPurposeName || '-'}</span>
                </div>
                <div className="col-12 md:col-6 mb-3">
                    <span className="text-xs uppercase text-500 font-bold tracking-wider block mb-1">Pegawai Internal (Host)</span>
                    <span className="font-semibold text-800">{record.HostFullname || record.host_name || '-'}</span>
                </div>

                <div className="col-12">
                    <Divider className="my-2" style={{ borderColor: '#F1F5F9' }} />
                </div>

                <div className="col-12 md:col-6 mb-3">
                    <span className="text-xs uppercase text-500 font-bold tracking-wider block mb-1">Waktu Masuk (Check-In)</span>
                    <span className="font-semibold text-800">
                        {record.check_in_time ? formatDateCalendar(record.check_in_time, 'HH:mm dd MMM yyyy') + ' WIB' : '-'}
                    </span>
                </div>
                <div className="col-12 md:col-6 mb-3">
                    <span className="text-xs uppercase text-500 font-bold tracking-wider block mb-1">Waktu Keluar (Check-Out)</span>
                    <span className="font-semibold text-800">
                        {record.check_out_time ? formatDateCalendar(record.check_out_time, 'HH:mm dd MMM yyyy') + ' WIB' : '-'}
                    </span>
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
                        {record.visit_notes || 'Tidak ada catatan tambahan.'}
                    </div>
                </div>
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
