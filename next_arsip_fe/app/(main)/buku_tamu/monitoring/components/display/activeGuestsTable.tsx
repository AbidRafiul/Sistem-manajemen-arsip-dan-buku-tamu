"use client";
import React from 'react';
import { Card } from 'primereact/card';

interface ActiveGuestsTableProps {
    activeGuests: any[];
}

export default function ActiveGuestsTable({ activeGuests }: ActiveGuestsTableProps) {
    const formatTime = (dateTimeString: string) => {
        if (!dateTimeString) return '';
        try {
            const parts = dateTimeString.split(' ');
            if (parts.length > 1) {
                const timeParts = parts[1].split(':');
                if (timeParts.length > 1) {
                    return `${timeParts[0]}:${timeParts[1]}`;
                }
            }
            const date = new Date(dateTimeString);
            return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        } catch (e) {
            return dateTimeString;
        }
    };

    return (
        <Card 
            title={
                <div className="flex align-items-center justify-content-between border-bottom-1 border-100 pb-3">
                    <div className="flex align-items-center gap-2">
                        <span className="live-pulse-dot" />
                        <span className="text-lg font-bold text-900">Tamu Sedang Berkunjung (Live)</span>
                    </div>
                    <span className="text-xs text-color-secondary font-medium px-2 py-1 bg-100 border-round">
                        {activeGuests.length} Tamu Aktif
                    </span>
                </div>
            }
            className="border-none shadow-1 border-round-2xl bg-white"
        >
            {activeGuests.length > 0 ? (
                <div className="flex flex-column gap-3 mt-2">
                    {activeGuests.map((guest, idx) => (
                        <div 
                            key={guest.id_kunjungan || idx} 
                            className="flex flex-column md:flex-row md:align-items-center justify-content-between p-3 border-round-xl border-1 border-50 premium-hover-card"
                            style={{ background: '#fafafa' }}
                        >
                            <div className="flex align-items-center gap-3">
                                {guest.PhotoFaceUrl ? (
                                    <img 
                                        src={guest.PhotoFaceUrl} 
                                        alt={guest.nama_tamu} 
                                        className="border-round-circle object-cover shadow-1"
                                        style={{ width: '3.5rem', height: '3.5rem' }} 
                                    />
                                ) : (
                                    <div 
                                        className="flex align-items-center justify-content-center border-round-circle bg-primary-100 text-primary font-bold text-lg"
                                        style={{ width: '3.5rem', height: '3.5rem', background: '#e0f2fe', color: '#0284c7' }}
                                    >
                                        {guest.nama_tamu ? guest.nama_tamu.trim().split(/\s+/).map((n: string) => n[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() : 'T'}
                                    </div>
                                )}
                                <div>
                                    <div className="text-base font-bold text-900">{guest.nama_tamu}</div>
                                    <div className="text-xs text-color-secondary mt-1 flex align-items-center gap-1">
                                        <i className="pi pi-building text-xs" />
                                        <span>{guest.instansi_tamu || '-'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 md:gap-4 align-items-center mt-3 md:mt-0 pt-3 md:pt-0 border-top-1 md:border-top-none border-100">
                                <div className="flex flex-column">
                                    <span className="text-200 text-xs font-bold uppercase tracking-wider" style={{ color: '#94a3b8' }}>Tujuan</span>
                                    <span className="text-sm font-semibold text-700 mt-1 bg-blue-50 text-blue-700 px-2 py-1 border-round-md" style={{ background: '#eff6ff', color: '#1d4ed8' }}>
                                        {guest.VisitPurposeName || 'Kunjungan'}
                                    </span>
                                </div>

                                <div className="flex flex-column">
                                    <span className="text-200 text-xs font-bold uppercase tracking-wider" style={{ color: '#94a3b8' }}>Menemui</span>
                                    <span className="text-sm font-semibold text-800 mt-1 flex align-items-center gap-1">
                                        <i className="pi pi-user text-xs text-500" />
                                        {guest.HostFullname || guest.nama_host || '-'}
                                    </span>
                                </div>

                                <div className="flex flex-column">
                                    <span className="text-200 text-xs font-bold uppercase tracking-wider" style={{ color: '#94a3b8' }}>Masuk</span>
                                    <span className="text-sm font-semibold text-800 mt-1 flex align-items-center gap-1">
                                        <i className="pi pi-clock text-xs text-500" />
                                        {formatTime(guest.waktu_masuk)}
                                    </span>
                                </div>

                                <div className="flex align-self-end md:align-self-center ml-auto">
                                    <span className="px-2 py-1 text-xs font-bold border-round-xl" style={{ background: '#fffbeb', color: '#b45309', border: '1px solid #fef3c7' }}>
                                        Sedang Berkunjung
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-column align-items-center justify-content-center py-6 text-center">
                    <div className="border-circle bg-100 p-3 mb-3 flex align-items-center justify-content-center" style={{ width: '4.5rem', height: '4.5rem', background: '#f8fafc' }}>
                        <i className="pi pi-inbox text-3xl text-400" style={{ color: '#94a3b8' }} />
                    </div>
                    <h3 className="m-0 text-800 font-bold text-lg">Belum Ada Tamu Aktif</h3>
                    <p className="m-0 text-color-secondary text-sm mt-1 max-w-20rem">
                        Semua tamu yang check-in hari ini telah menyelesaikan kunjungan mereka.
                    </p>
                </div>
            )}
        </Card>
    );
}
