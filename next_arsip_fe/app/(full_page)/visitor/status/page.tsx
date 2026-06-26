'use client';

import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import Link from 'next/link';
import axios from 'axios';

interface BookingData {
    nama_tamu: string;
    nomor_telepon: string;
    instansi_tamu?: string;
    waktu_masuk: string;
    waktu_keluar?: string;
    status: string;
    status_persetujuan: string;
    catatan_kunjungan?: string;
    nama_host?: string;
    kode_kunjungan: string;
    token_qr?: string;
    VisitPurposeName: string;
    created_at: string;
    qr_image_url?: string;
}

export default function VisitorStatusPage() {
    const [visitCode, setVisitCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [bookingData, setBookingData] = useState<BookingData | null>(null);
    const [errorMsg, setErrorMsg] = useState('');

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!visitCode.trim()) {
            setErrorMsg('Silakan masukkan Kode Kunjungan terlebih dahulu.');
            setBookingData(null);
            return;
        }

        setLoading(true);
        setErrorMsg('');
        try {
            const response = await axios.post("http://localhost:8000/api/v1/buku_tamu/visit_booking/status", {
                VisitCode: visitCode.trim()
            });

            if (response.data?.status === '00' && response.data?.data) {
                setBookingData(response.data.data);
            } else {
                setErrorMsg(response.data?.message || 'Kode kunjungan tidak ditemukan.');
                setBookingData(null);
            }
        } catch (error: any) {
            setErrorMsg(error?.response?.data?.message || 'Kode kunjungan tidak ditemukan atau terjadi kesalahan server.');
            setBookingData(null);
        } finally {
            setLoading(false);
        }
    };

    const getApprovalTag = (statusPersetujuan: string) => {
        switch (statusPersetujuan?.toLowerCase()) {
            case 'approved':
                return <Tag severity="success" value="Disetujui / Approved" icon="pi pi-check-circle" className="px-3 py-2 text-sm font-semibold border-round-xl" />;
            case 'rejected':
                return <Tag severity="danger" value="Ditolak / Rejected" icon="pi pi-times-circle" className="px-3 py-2 text-sm font-semibold border-round-xl" />;
            case 'pending':
            default:
                return <Tag severity="warning" value="Menunggu Persetujuan" icon="pi pi-info-circle" className="px-3 py-2 text-sm font-semibold border-round-xl" />;
        }
    };

    const getVisitStatusTag = (statusKunjungan: string) => {
        switch (statusKunjungan?.toLowerCase()) {
            case 'in':
                return <Tag severity="info" value="Sedang Berkunjung (Checked-In)" className="px-3 py-1 text-xs" />;
            case 'out':
                return <Tag value="Selesai (Checked-Out)" className="px-3 py-1 text-xs bg-slate-500 text-white" />;
            case 'rencana':
            default:
                return <Tag value="Rencana Kunjungan" className="px-3 py-1 text-xs bg-bluegray-500" />;
        }
    };

    const formatDateString = (dateStr: string) => {
        if (!dateStr) return '-';
        try {
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return dateStr;
            return d.toLocaleString('id-ID', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }) + ' WIB';
        } catch (e) {
            return dateStr;
        }
    };

    return (
        <div className="flex align-items-center justify-content-center min-h-screen bg-slate-50 p-3">
            <div className="w-full max-w-xl flex flex-column gap-3">

                {/* Search Form Card */}
                <Card title="Cek Status Kunjungan Tamu" className="shadow-3 border-round p-2" subTitle="Masukkan kode kunjungan Anda untuk melacak status persetujuan & melihat kartu akses QR.">
                    <form onSubmit={handleSearch} className="flex gap-2 align-items-center mt-2">
                        <span className="p-input-icon-left flex-grow-1">
                            <i className="pi pi-search" />
                            <InputText
                                value={visitCode}
                                onChange={(e) => setVisitCode(e.target.value)}
                                placeholder="Contoh: TAMU202606250001"
                                className="w-full"
                                disabled={loading}
                            />
                        </span>
                        <Button label="Cari" icon="pi pi-search" type="submit" loading={loading} className="px-4" />
                    </form>

                    {errorMsg && (
                        <div className="p-3 bg-red-50 text-red-700 border-round mt-3 border-1 border-red-200 text-sm flex gap-2 align-items-center">
                            <i className="pi pi-exclamation-triangle" />
                            <span>{errorMsg}</span>
                        </div>
                    )}
                </Card>

                {/* Booking Status Card */}
                {bookingData && (
                    <Card className="shadow-3 border-round p-3 relative overflow-hidden">
                        {/* Status Ribbon at the top */}
                        <div className="flex justify-content-between align-items-center border-bottom-1 border-200 pb-3 mb-3">
                            <div>
                                <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Status Permohonan</span>
                                <div className="mt-1">{getApprovalTag(bookingData.status_persetujuan)}</div>
                            </div>
                            <div className="text-right">
                                <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Status Kunjungan</span>
                                <div className="mt-1">{getVisitStatusTag(bookingData.status)}</div>
                            </div>
                        </div>

                        {/* General details */}
                        <div className="grid">
                            <div className="col-12 md:col-7 flex flex-column gap-3">
                                <div>
                                    <span className="block text-xs font-semibold text-slate-400">NAMA TAMU</span>
                                    <span className="text-slate-800 font-bold text-lg">{bookingData.nama_tamu}</span>
                                </div>
                                {bookingData.instansi_tamu && bookingData.instansi_tamu !== '-' && (
                                    <div>
                                        <span className="block text-xs font-semibold text-slate-400">INSTANSI / PERUSAHAAN</span>
                                        <span className="text-slate-700 font-medium">{bookingData.instansi_tamu}</span>
                                    </div>
                                )}
                                <div>
                                    <span className="block text-xs font-semibold text-slate-400">TUJUAN KUNJUNGAN</span>
                                    <span className="text-slate-700 font-medium">{bookingData.VisitPurposeName}</span>
                                </div>
                                {bookingData.nama_host && (
                                    <div>
                                        <span className="block text-xs font-semibold text-slate-400">DITEMUI OLEH (HOST)</span>
                                        <span className="text-slate-700 font-medium">{bookingData.nama_host}</span>
                                    </div>
                                )}
                                <div>
                                    <span className="block text-xs font-semibold text-slate-400">RENCANA KEDATANGAN</span>
                                    <span className="text-primary font-semibold">{formatDateString(bookingData.waktu_masuk)}</span>
                                </div>
                                {bookingData.catatan_kunjungan && (
                                    <div>
                                        <span className="block text-xs font-semibold text-slate-400">KEPERLUAN / CATATAN</span>
                                        <span className="text-slate-600 text-sm block bg-slate-100 p-2 border-round border-300 border-1 mt-1">{bookingData.catatan_kunjungan}</span>
                                    </div>
                                )}
                            </div>

                            {/* QR Code Section */}
                            <div className="col-12 md:col-5 flex flex-column align-items-center justify-content-center border-top-1 md:border-top-none md:border-left-1 border-200 pt-3 md:pt-0 md:pl-3">
                                {bookingData.status_persetujuan?.toLowerCase() === 'approved' && bookingData.qr_image_url ? (
                                    <div className="text-center flex flex-column align-items-center gap-2">
                                        <div className="p-2 bg-white border-round border-300 border-1 shadow-2">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={bookingData.qr_image_url} alt="Akses QR Code" className="w-10rem h-10rem" />
                                        </div>
                                        <span className="text-xs font-bold text-slate-700 tracking-widest mt-1">{bookingData.kode_kunjungan}</span>
                                        <span className="text-xs text-slate-500 font-medium">Tunjukkan QR ini ke Resepsionis</span>
                                        <Button
                                            label="Unduh QR"
                                            icon="pi pi-download"
                                            className="p-button-outlined p-button-sm mt-1"
                                            onClick={() => {
                                                if (bookingData.qr_image_url) {
                                                    const link = document.createElement('a');
                                                    link.href = bookingData.qr_image_url;
                                                    link.download = `QR_${bookingData.kode_kunjungan}.png`;
                                                    document.body.appendChild(link);
                                                    link.click();
                                                    document.body.removeChild(link);
                                                }
                                            }}
                                        />
                                    </div>
                                ) : bookingData.status_persetujuan?.toLowerCase() === 'rejected' ? (
                                    <div className="text-center text-red-500 p-3 flex flex-column align-items-center gap-2">
                                        <i className="pi pi-times-circle text-4xl" />
                                        <span className="text-sm font-semibold">Kunjungan Ditolak</span>
                                        <span className="text-xs text-slate-500">Permohonan Anda ditolak. Silakan hubungi admin atau jadwalkan ulang.</span>
                                    </div>
                                ) : (
                                    <div className="text-center text-orange-500 p-3 flex flex-column align-items-center gap-2">
                                        <i className="pi pi-clock text-4xl" />
                                        <span className="text-sm font-semibold">Menunggu Persetujuan</span>
                                        <span className="text-xs text-slate-500">QR Code akses akan diterbitkan segera setelah kunjungan disetujui oleh host/admin.</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>
                )}

                <div className="text-center mt-2 flex justify-content-between px-2">
                    <Link href="/visitor/booking">
                        <span className="text-sm font-semibold text-primary hover:underline cursor-pointer flex align-items-center gap-1">
                            <i className="pi pi-arrow-left text-xs" />
                            Kembali ke Form Pendaftaran
                        </span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
