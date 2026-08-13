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
            if (parts.length> 1) {
                const timeParts = parts[1].split(':');
                if (timeParts.length> 1) {
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
        <Card className="shadow-1 border-round-2xl border-none" pt={{ body: { className: 'p-4' }, content: { className: 'p-0 m-0' } }}>
            <div className="flex align-items-center justify-content-between mb-4 pb-3 border-bottom-1 border-100">
                <div>
                    <h2 className="m-0 text-900 font-bold text-xl mb-1" style={{ letterSpacing: '-0.02em' }}>Tamu Sedang Berkunjung</h2>
                    <p className="m-0 text-color-secondary text-sm font-medium">Daftar tamu aktif yang saat ini berada di dalam gedung.</p>
                </div>
                <span className="text-xs font-bold text-orange-700 bg-orange-50 px-3 py-1.5 border-round-xl">
                    {activeGuests.length} Tamu Aktif
                </span>
            </div>

            {activeGuests.length> 0 ? (
                <div className="flex flex-column gap-3">
                    {activeGuests.map((guest, idx) => (
                        <div 
                            key={guest.id_kunjungan || idx} 
                            className="flex flex-column md:flex-row md:align-items-center justify-content-between p-3 border-round-xl bg-gray-50 border-1 border-100">
                            <div className="flex align-items-center gap-3">
                                {guest.PhotoFaceUrl ? (
                                    <img 
                                        src={guest.PhotoFaceUrl} 
                                        alt={guest.nama_tamu} 
                                        className="border-round-circle object-cover shadow-1"
                                        style={{ width: '3.25rem', height: '3.25rem' }} />
                                ) : (
                                    <div 
                                        className="flex align-items-center justify-content-center border-round-circle font-bold text-sm bg-blue-100 text-blue-700"
                                        style={{ width: '3.25rem', height: '3.25rem' }}>
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

                            <div className="flex flex-wrap gap-3 md:gap-4 align-items-center mt-3 md:mt-0 pt-3 md:pt-0 border-top-1 md:border-top-none border-100">
                                <div className="flex flex-column">
                                    <span className="text-color-secondary text-xs font-semibold uppercase">Tujuan</span>
                                    <span className="text-xs font-semibold text-indigo-700 mt-1 bg-indigo-50 px-2 py-1 border-round">
                                        {guest.VisitPurposeName || 'Kunjungan'}
                                    </span>
                                </div>

                                <div className="flex flex-column">
                                    <span className="text-color-secondary text-xs font-semibold uppercase">Menemui</span>
                                    <span className="text-xs font-semibold text-800 mt-1 flex align-items-center gap-1">
                                        <i className="pi pi-user text-xs text-500" />
                                        {guest.HostFullname || guest.nama_host || '-'}
                                    </span>
                                </div>

                                <div className="flex flex-column">
                                    <span className="text-color-secondary text-xs font-semibold uppercase">Jam Masuk</span>
                                    <span className="text-xs font-semibold text-800 mt-1 flex align-items-center gap-1">
                                        <i className="pi pi-clock text-xs text-500" />
                                        {formatTime(guest.waktu_masuk)}
                                    </span>
                                </div>

                                <div className="flex align-self-end md:align-self-center ml-auto">
                                    <span className="px-2.5 py-1 text-xs font-bold border-round-xl text-orange-700 bg-orange-50">
                                        Sedang Berkunjung
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-column align-items-center justify-content-center py-6 text-center">
                    <div className="border-circle bg-gray-50 p-3 mb-3 flex align-items-center justify-content-center" style={{ width: '4rem', height: '4rem' }}>
                        <i className="pi pi-inbox text-3xl text-400" />
                    </div>
                    <h3 className="m-0 text-800 font-bold text-base">Belum Ada Tamu Aktif</h3>
                    <p className="m-0 text-color-secondary text-sm mt-1 max-w-20rem">
                        Semua tamu yang check-in hari ini telah menyelesaikan kunjungan mereka.
                    </p>
                </div>
            )}
        </Card>
    );
}
