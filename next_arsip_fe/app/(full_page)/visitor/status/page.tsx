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
        <div className="flex flex-column align-items-center justify-content-center min-h-screen py-6 px-3" style={{ background: 'linear-gradient(135deg, #f1f5f9 0%, #cbd5e1 100%)' }}>
            {styleOverrides()}
            
            <div className="w-full flex flex-column gap-4" style={{ maxWidth: '480px' }}>

                {/* SEARCH CARD */}
                <div className="w-full bg-white border-round-2xl shadow-3 overflow-hidden">
                    {/* Header */}
                    <div className="p-4 text-center text-white" style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)' }}>
                        <div className="inline-flex align-items-center justify-content-center border-circle mb-2" style={{ background: 'rgba(255, 255, 255, 0.15)', width: '50px', height: '50px' }}>
                            <i className="pi pi-search text-xl text-white" />
                        </div>
                        <h2 className="m-0 text-xl font-bold text-white">Cek Status Kunjungan</h2>
                        <p className="m-0 mt-1 text-xs" style={{ color: '#cbd5e1' }}>Masukkan kode booking Anda untuk melacak status kunjungan</p>
                    </div>

                    {/* Form Input */}
                    <div className="p-4">
                        <form onSubmit={handleSearch} className="flex flex-column gap-3">
                            <div className="field flex flex-column gap-2 mb-0">
                                <label htmlFor="visit_code" className="font-semibold text-xs text-700">Kode Kunjungan / Booking</label>
                                <div className="flex gap-2">
                                    <InputText
                                        id="visit_code"
                                        value={visitCode}
                                        onChange={(e) => setVisitCode(e.target.value)}
                                        placeholder="Contoh: TAMU202607010001"
                                        className="flex-1"
                                        disabled={loading}
                                    />
                                    <Button 
                                        label="Cari" 
                                        icon="pi pi-search" 
                                        type="submit" 
                                        loading={loading} 
                                        className="font-bold border-round-lg px-4 text-sm text-white"
                                        style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', border: 'none' }}
                                    />
                                </div>
                            </div>
                        </form>

                        {errorMsg && (
                            <div className="p-3 bg-red-50 text-red-700 border-round-lg mt-3 border-1 border-red-200 text-xs flex gap-2 align-items-center">
                                <i className="pi pi-exclamation-triangle" />
                                <span>{errorMsg}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* DIGITAL BOARDING PASS CARD (RESULTS) */}
                {bookingData && (
                    <div className="ticket-card animate-fade-in">
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
                                <h3 className="m-0 text-lg font-bold text-white uppercase tracking-wide">
                                    {bookingData.status_persetujuan?.toLowerCase() === 'approved' 
                                        ? 'DISETUJUI / APPROVED' 
                                        : bookingData.status_persetujuan?.toLowerCase() === 'rejected'
                                        ? 'DITOLAK / REJECTED'
                                        : 'MENUNGGU PERSETUJUAN'}
                                </h3>
                            </div>
                        </div>

                        {/* Ticket Body */}
                        <div className="ticket-body">
                            {/* Visitor Info */}
                            <div className="px-2">
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
                                    <span className="ticket-detail-value">
                                        {bookingData.status?.toLowerCase() === 'in' 
                                            ? 'Sedang Berkunjung' 
                                            : bookingData.status?.toLowerCase() === 'out'
                                            ? 'Selesai (Checked-Out)'
                                            : 'Rencana Kunjungan'}
                                    </span>
                                </div>
                                {bookingData.catatan_kunjungan && (
                                    <div className="flex flex-column gap-1 mt-2 pt-2 border-top-1 border-100">
                                        <span className="ticket-detail-label block mb-1">Catatan Keperluan:</span>
                                        <span className="text-xs text-600 block bg-slate-50 p-2 border-round-lg border-1 border-200 line-height-3 font-medium">
                                            {bookingData.catatan_kunjungan}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Ticket Stub Cutout line */}
                            <div className="ticket-stub-line" />

                            {/* QR & Barcode Section */}
                            <div className="text-center px-2">
                                {bookingData.status_persetujuan?.toLowerCase() === 'approved' && bookingData.qr_image_url ? (
                                    <div className="flex flex-column align-items-center gap-2">
                                        <div className="p-3 bg-white border-round-xl border-200 border-1 shadow-1 inline-block">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={bookingData.qr_image_url} alt="Akses QR Code" className="w-10rem h-10rem block" />
                                        </div>
                                        <span className="text-sm font-bold text-800 tracking-widest mt-1 block uppercase">{bookingData.kode_kunjungan}</span>
                                        
                                        {/* Simulated Barcode */}
                                        <div className="flex justify-content-center align-items-center gap-1 my-3 opacity-60 w-full">
                                            {[2,1,4,1,3,2,1,4,1,2,3,1,4,2,1,3,2,1,4,1,2,3,1,4].map((width, idx) => (
                                                <div key={idx} className="bg-900" style={{ width: `${width}px`, height: '35px' }} />
                                            ))}
                                        </div>

                                        <p className="text-xs text-500 line-height-3 mt-1" style={{ color: '#64748b' }}>
                                            Tunjukkan QR Code ini kepada petugas resepsionis di lokasi check-in.
                                        </p>

                                        <Button
                                            label="Unduh QR Code"
                                            icon="pi pi-download"
                                            className="p-button-outlined p-button-sm border-round-lg font-bold py-3 mt-2 w-full"
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
                <div className="text-center">
                    <Link href="/visitor/booking" className="no-underline">
                        <span className="inline-flex align-items-center gap-2 px-4 py-3 border-round-xl text-sm font-semibold text-600 hover:text-900 bg-white shadow-1 border-1 border-200 transition-all transition-duration-150 cursor-pointer">
                            <i className="pi pi-arrow-left text-xs" />
                            Kembali ke Form Pendaftaran
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
                box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15) !important;
            }
            .p-inputtext {
                transition: all 0.25s ease-in-out !important;
                border-radius: 8px !important;
                border: 1.5px solid #cbd5e1 !important;
                padding: 0.75rem 1rem !important;
            }
            .ticket-card {
                background: #ffffff;
                border-radius: 20px;
                box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
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
                border-top: 2.5px dashed #e2e8f0;
                position: relative;
                margin: 1.5rem 0;
            }
            .ticket-stub-line::before {
                content: '';
                position: absolute;
                left: -26px;
                top: -11px;
                width: 20px;
                height: 20px;
                background: #cbd5e1;
                border-radius: 50%;
            }
            .ticket-stub-line::after {
                content: '';
                position: absolute;
                right: -26px;
                top: -11px;
                width: 20px;
                height: 20px;
                background: #cbd5e1;
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
                    transform: translateY(10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        `}</style>
    );
}
