'use client';

import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import Link from 'next/link';
import postData from '@/lib/axios/postData';

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
            const response = await postData("/buku-tamu/visit-booking/status", {
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
                return <Tag severity="success" value="Disetujui / Approved" icon="pi pi-check-circle" className="px-3 py-2 text-xs font-bold border-round-lg" />;
            case 'rejected':
                return <Tag severity="danger" value="Ditolak / Rejected" icon="pi pi-times-circle" className="px-3 py-2 text-xs font-bold border-round-lg" />;
            case 'pending':
            default:
                return <Tag severity="warning" value="Menunggu Persetujuan" icon="pi pi-info-circle" className="px-3 py-2 text-xs font-bold border-round-lg" />;
        }
    };

    const getVisitStatusTag = (statusKunjungan: string) => {
        switch (statusKunjungan?.toLowerCase()) {
            case 'in':
                return <Tag severity="info" value="Sedang Berkunjung (Checked-In)" className="px-3 py-2 text-xs font-bold border-round-lg" />;
            case 'out':
                return <Tag value="Selesai (Checked-Out)" className="px-3 py-2 text-xs font-bold border-round-lg bg-slate-500 text-white" />;
            case 'rencana':
            default:
                return <Tag value="Rencana Kunjungan" className="px-3 py-2 text-xs font-bold border-round-lg bg-bluegray-500" />;
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
        <div 
            className="flex flex-column align-items-center justify-content-center min-h-screen py-6 px-3 relative overflow-hidden" 
            style={{ 
                background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 40%, #0f172a 100%)',
                color: '#334155'
            }}
        >
            {/* Ambient glowing background spheres */}
            <div 
                className="absolute border-circle pointer-events-none opacity-20 filter blur-3xl"
                style={{
                    width: '400px',
                    height: '400px',
                    background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)',
                    top: '-100px',
                    right: '-100px'
                }}
            />
            <div 
                className="absolute border-circle pointer-events-none opacity-20 filter blur-3xl"
                style={{
                    width: '350px',
                    height: '350px',
                    background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)',
                    bottom: '-80px',
                    left: '-80px'
                }}
            />

            {styleOverrides()}
            
            <div className="w-full flex flex-column gap-4 relative z-1" style={{ maxWidth: '460px' }}>

                {/* BRAND LOGO HEADER */}
                <div className="flex flex-column align-items-center text-center mb-1">
                    <div className="flex align-items-center gap-2 mb-1">
                        <div 
                            className="flex align-items-center justify-content-center border-round-xl shadow-4"
                            style={{ 
                                width: '42px', 
                                height: '42px', 
                                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                                boxShadow: '0 8px 20px rgba(99, 102, 241, 0.35)'
                            }}
                        >
                            <i className="pi pi-shield text-xl text-white font-bold" />
                        </div>
                        <span className="font-black text-2xl tracking-wide text-white" style={{ letterSpacing: '0.05em' }}>ARSIPKU</span>
                    </div>
                    <span className="text-xs uppercase font-bold tracking-widest text-indigo-200 opacity-80" style={{ letterSpacing: '0.15em' }}>Sistem Manajemen Buku Tamu</span>
                </div>

                {/* SEARCH CARD */}
                <div 
                    className="w-full bg-white border-round-2xl shadow-6 overflow-hidden transition-all transition-duration-200"
                    style={{ boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)' }}
                >
                    {/* Header */}
                    <div 
                        className="p-4 text-center text-white relative overflow-hidden" 
                        style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)' }}
                    >
                        <div className="inline-flex align-items-center justify-content-center border-circle mb-2 shadow-2" style={{ background: 'rgba(255, 255, 255, 0.12)', width: '50px', height: '50px' }}>
                            <i className="pi pi-search text-xl text-white" />
                        </div>
                        <h2 className="m-0 text-xl font-extrabold text-white tracking-tight">Cek Status Kunjungan</h2>
                        <p className="m-0 mt-1 text-xs text-indigo-200 line-height-3">Masukkan kode booking Anda untuk melacak status kunjungan</p>
                    </div>

                    {/* Form Input */}
                    <div className="p-4 bg-white">
                        <form onSubmit={handleSearch} className="flex flex-column gap-3">
                            <div className="field flex flex-column gap-2 mb-0">
                                <label htmlFor="visit_code" className="font-bold text-xs uppercase tracking-wider text-700">Kode Kunjungan / Booking</label>
                                <div className="flex gap-2">
                                    <InputText
                                        id="visit_code"
                                        value={visitCode}
                                        onChange={(e) => setVisitCode(e.target.value)}
                                        placeholder="Contoh: 21072026-0001"
                                        className="flex-1 text-sm font-semibold"
                                        disabled={loading}
                                    />
                                    <Button 
                                        label="Cari" 
                                        icon="pi pi-search" 
                                        type="submit" 
                                        loading={loading} 
                                        className="font-bold border-round-xl px-4 text-sm text-white transition-all transition-duration-150"
                                        style={{ 
                                            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', 
                                            border: 'none',
                                            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.35)'
                                        }}
                                    />
                                </div>
                            </div>
                        </form>

                        {errorMsg && (
                            <div className="p-3 bg-red-50 text-red-700 border-round-xl mt-3 border-1 border-red-200 text-xs flex gap-2 align-items-center shadow-1">
                                <i className="pi pi-exclamation-triangle text-base text-red-500" />
                                <span className="font-semibold">{errorMsg}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* DIGITAL BOARDING PASS CARD (RESULTS) */}
                {bookingData && (
                    <div className="ticket-card animate-fade-in shadow-6">
                        {/* Ticket Header status */}
                        <div className="ticket-header-status" style={{ 
                            background: bookingData.status_persetujuan?.toLowerCase() === 'approved' 
                                ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
                                : bookingData.status_persetujuan?.toLowerCase() === 'rejected'
                                ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                                : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                            color: '#ffffff'
                        }}>
                            <div className="text-center">
                                <span className="text-xs text-white-alpha-80 font-bold uppercase tracking-wider block mb-1">Status Kunjungan</span>
                                <h3 className="m-0 text-lg font-black text-white uppercase tracking-wide">
                                    {bookingData.status_persetujuan?.toLowerCase() === 'approved' 
                                        ? 'DISETUJUI' 
                                        : bookingData.status_persetujuan?.toLowerCase() === 'rejected'
                                        ? 'DITOLAK'
                                        : 'MENUNGGU PERSETUJUAN'}
                                </h3>
                            </div>
                        </div>

                        {/* Ticket Body */}
                        <div className="ticket-body">
                            {/* Visitor Info */}
                            <div className="px-1">
                                <div className="ticket-detail-row">
                                    <span className="ticket-detail-label">Nama Tamu</span>
                                    <span className="ticket-detail-value">{bookingData.nama_tamu}</span>
                                </div>
                                <div className="ticket-detail-row">
                                    <span className="ticket-detail-label">Instansi</span>
                                    <span className="ticket-detail-value">{bookingData.instansi_tamu || '-'}</span>
                                </div>
                                <div className="ticket-detail-row">
                                    <span className="ticket-detail-label">Tujuan Kunjungan</span>
                                    <span className="ticket-detail-value">{bookingData.VisitPurposeName}</span>
                                </div>
                                <div className="ticket-detail-row">
                                    <span className="ticket-detail-label">Pegawai</span>
                                    <span className="ticket-detail-value">{bookingData.nama_host || '-'}</span>
                                </div>
                                <div className="ticket-detail-row">
                                    <span className="ticket-detail-label">Waktu Kedatangan</span>
                                    <span className="ticket-detail-value">{formatDateString(bookingData.waktu_masuk)}</span>
                                </div>
                                <div className="ticket-detail-row">
                                    <span className="ticket-detail-label">Alur Kunjungan</span>
                                    <span className="ticket-detail-value font-bold text-indigo-600">
                                        {bookingData.status?.toLowerCase() === 'in' 
                                            ? 'Sedang Berkunjung (In)' 
                                            : bookingData.status?.toLowerCase() === 'out'
                                            ? 'Selesai (Out)'
                                            : 'Rencana Kunjungan'}
                                    </span>
                                </div>
                                {bookingData.catatan_kunjungan && (
                                    <div className="flex flex-column gap-1 mt-2 pt-2 border-top-1 border-100">
                                        <span className="ticket-detail-label block mb-1">Catatan Keperluan:</span>
                                        <span className="text-xs text-700 block bg-slate-50 p-2.5 border-round-xl border-1 border-200 line-height-3 font-medium">
                                            {bookingData.catatan_kunjungan}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Ticket Stub Cutout line */}
                            <div className="ticket-stub-line" />

                            {/* QR & Barcode Section */}
                            <div className="text-center px-1">
                                {bookingData.status_persetujuan?.toLowerCase() === 'approved' && bookingData.qr_image_url ? (
                                    <div className="flex flex-column align-items-center gap-2">
                                        <div className="p-3 bg-white border-round-2xl border-200 border-1 shadow-2 inline-block">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={bookingData.qr_image_url} alt="Akses QR Code" className="w-10rem h-10rem block" />
                                        </div>
                                        <span className="text-base font-black text-900 tracking-widest mt-1 block uppercase" style={{ letterSpacing: '0.1em' }}>{bookingData.kode_kunjungan}</span>
                                        
                                        {/* Simulated Barcode */}
                                        <div className="flex justify-content-center align-items-center gap-1 my-2 opacity-75 w-full">
                                            {[2,1,4,1,3,2,1,4,1,2,3,1,4,2,1,3,2,1,4,1,2,3,1,4].map((width, idx) => (
                                                <div key={idx} className="bg-900" style={{ width: `${width}px`, height: '32px' }} />
                                            ))}
                                        </div>

                                        <p className="text-xs text-500 line-height-3 mt-1" style={{ color: '#64748b' }}>
                                            Tunjukkan QR Code ini kepada petugas resepsionis di lokasi check-in.
                                        </p>

                                        <Button
                                            label="Unduh QR Code"
                                            icon="pi pi-download"
                                            className="p-button-outlined p-button-sm border-round-xl font-bold py-3 mt-2 w-full transition-all transition-duration-150"
                                            style={{ borderColor: '#6366f1', color: '#6366f1' }}
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
                                    <div className="text-center text-red-500 py-3 flex flex-column align-items-center gap-2">
                                        <i className="pi pi-times-circle text-5xl" />
                                        <span className="text-sm font-bold">Kunjungan Ditolak</span>
                                        <p className="text-xs text-500 line-height-3 m-0">
                                            Mohon maaf, pengajuan kunjungan Anda ditolak. Silakan buat pengajuan kunjungan baru atau hubungi admin kantor.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="text-center text-amber-600 py-3 flex flex-column align-items-center gap-2">
                                        <i className="pi pi-clock text-5xl text-amber-500 animate-spin" style={{ animationDuration: '3s' }} />
                                        <span className="text-sm font-bold">Menunggu Persetujuan</span>
                                        <p className="text-xs text-600 line-height-3 m-0">
                                            QR Code akses masuk akan otomatis diterbitkan di sini setelah pengajuan kunjungan disetujui oleh Pegawai/Host bersangkutan.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Back to Booking Link */}
                <div className="text-center mt-1">
                    <Link href="/visitor/booking" className="no-underline">
                        <span className="inline-flex align-items-center gap-2 px-4 py-3 border-round-xl text-xs font-bold text-white bg-white-alpha-10 hover:bg-white-alpha-20 border-1 border-white-alpha-20 transition-all transition-duration-150 cursor-pointer shadow-2">
                            <i className="pi pi-arrow-left text-xs text-indigo-300" />
                            <span>Kembali ke Form Pendaftaran</span>
                        </span>
                    </Link>
                </div>
            </div>
        </div>
    );
}

function styleOverrides() {
    return (
        <style jsx global>{`
            .p-inputtext:focus {
                border-color: #6366f1 !important;
                box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.25) !important;
            }
            .p-inputtext {
                transition: all 0.25s ease-in-out !important;
                border-radius: 12px !important;
                border: 1.5px solid #cbd5e1 !important;
                padding: 0.75rem 1rem !important;
                background: #ffffff !important;
            }
            .ticket-card {
                background: #ffffff;
                border-radius: 24px;
                box-shadow: 0 20px 45px rgba(0, 0, 0, 0.25);
                width: 100%;
                overflow: hidden;
                border: none;
            }
            .ticket-header-status {
                padding: 1.5rem;
                text-align: center;
            }
            .ticket-body {
                padding: 1.5rem;
            }
            .ticket-stub-line {
                border-top: 2.5px dashed #cbd5e1;
                position: relative;
                margin: 1.5rem 0;
            }
            .ticket-stub-line::before {
                content: '';
                position: absolute;
                left: -28px;
                top: -11px;
                width: 22px;
                height: 22px;
                background: #1e1b4b;
                border-radius: 50%;
            }
            .ticket-stub-line::after {
                content: '';
                position: absolute;
                right: -28px;
                top: -11px;
                width: 22px;
                height: 22px;
                background: #1e1b4b;
                border-radius: 50%;
            }
            .ticket-detail-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 0.75rem;
                font-size: 0.85rem;
            }
            .ticket-detail-label {
                color: #64748b;
                font-weight: 500;
            }
            .ticket-detail-value {
                color: #1e293b;
                font-weight: 600;
                text-align: right;
            }
            .animate-fade-in {
                animation: fadeIn 0.4s ease-out forwards;
            }
            @keyframes fadeIn {
                from {
                    opacity: 0;
                    transform: translateY(12px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        `}</style>
    );
}

