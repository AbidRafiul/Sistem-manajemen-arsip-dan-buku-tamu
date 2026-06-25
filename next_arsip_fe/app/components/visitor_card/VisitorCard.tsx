'use client';

import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface VisitorCardProps {
    visitationData: {
        VisitCode?: string;
        GuestName?: string;
        GuestCompany?: string;
        GuestPosition?: string;
        VisitPurposeName?: string;
        nama_lengkap?: string;
        HostName?: string;
        CheckInTime?: string | Date;
        PhotoFaceUrl?: string;
        Status?: string;
        QRToken?: string;
    } | null;
    showQR?: boolean;
}

export default function VisitorCard({ visitationData, showQR = true }: VisitorCardProps) {
    const [qrSrc, setQrSrc] = useState<string>('');

    useEffect(() => {
        if (visitationData && showQR) {
            const tokenToEncode = visitationData.QRToken || visitationData.VisitCode || 'GUEST';
            QRCode.toDataURL(tokenToEncode, {
                width: 140,
                margin: 1,
                color: { dark: '#1e293b', light: '#ffffff' }
            })
                .then((url) => setQrSrc(url))
                .catch((err) => console.error(err));
        }
    }, [visitationData, showQR]);

    if (!visitationData) return null;

    const isInside = visitationData.Status === 'in';
    const formattedDate = visitationData.CheckInTime
        ? new Date(visitationData.CheckInTime).toLocaleString('id-ID', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
          }) + ' WIB'
        : '-';

    return (
        <div className="visitor-card-printable-area flex justify-center items-center p-3">
            <div
                className="visitor-card bg-white border border-slate-300 rounded-xl p-4 shadow-md text-slate-800 tracking-wide relative overflow-hidden"
                style={{ width: '105mm', height: '74mm', boxSizing: 'border-box', fontFamily: 'system-ui, -apple-system, sans-serif' }}
            >
                <div className={`absolute top-0 left-0 right-0 h-2 ${isInside ? 'bg-emerald-500' : 'bg-slate-400'}`}></div>

                <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3 mt-1">
                    <div className="flex items-center gap-2">
                        <i className="pi pi-building text-xl text-indigo-600"></i>
                        <div>
                            <div className="text-xs font-bold uppercase tracking-wider text-slate-700">BADAN ARSIP & PERPUSTAKAAN</div>
                            <div className="text-[9px] text-slate-500 font-medium">Sistem Manajemen Buku Tamu Digital</div>
                        </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${isInside ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                        {isInside ? '■ SEDANG BERKUNJUNG' : '● SUDAH KELUAR'}
                    </span>
                </div>

                <div className="grid grid-cols-12 gap-3 items-start h-[calc(100%-60px)]">
                    <div className="col-span-8 flex flex-col justify-between h-full pr-1">
                        <div>
                            <div className="flex gap-3 items-start mb-2">
                                {visitationData.PhotoFaceUrl ? (
                                    <img src={visitationData.PhotoFaceUrl} alt="Foto Tamu" className="w-16 h-20 object-cover rounded-lg border border-slate-200 shadow-sm flex-shrink-0" />
                                ) : (
                                    <div className="w-16 h-20 bg-slate-100 border border-slate-200 rounded-lg flex flex-col items-center justify-center text-slate-400 flex-shrink-0">
                                        <i className="pi pi-user text-2xl mb-1"></i>
                                        <span className="text-[8px] font-semibold text-slate-400">NO PHOTO</span>
                                    </div>
                                )}

                                <div className="overflow-hidden">
                                    <h3 className="text-sm font-black text-slate-900 leading-tight uppercase truncate">{visitationData.GuestName || '-'}</h3>
                                    <div className="text-[11px] font-bold text-indigo-600 truncate">{visitationData.GuestCompany || 'Personal / Umum'}</div>
                                    <div className="text-[10px] font-medium text-slate-500 truncate italic">{visitationData.GuestPosition || '-'}</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-1 text-[10px] border-t border-slate-100 pt-1.5">
                                <div className="truncate">
                                    <span className="text-slate-400 font-medium">Tujuan:</span> <span className="text-slate-700 font-bold">{visitationData.VisitPurposeName || 'Keperluan Dinas'}</span>
                                </div>
                                <div className="truncate">
                                    <span className="text-slate-400 font-medium">Bertemu:</span> <span className="text-slate-700 font-bold">{visitationData.nama_lengkap || visitationData.HostName || '-'}</span>
                                </div>
                                <div className="text-[9px]">
                                    <span className="text-slate-400 font-medium">Masuk:</span> <span className="text-slate-600 font-semibold">{formattedDate}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-span-4 flex flex-col items-center justify-between h-full border-l border-dashed border-slate-200 pl-2 text-center">
                        <div className="flex items-center justify-center bg-white p-1 border border-slate-200 rounded-lg shadow-sm">
                            {showQR && qrSrc ? <img src={qrSrc} alt="Access QR Code" className="w-24 h-24 block" /> : <div className="w-24 h-24 flex items-center justify-center text-slate-300 bg-slate-50 text-[10px]">QR Hidden</div>}
                        </div>

                        <div className="w-full mt-1">
                            <div className="text-[11px] font-black tracking-widest text-slate-900 uppercase font-mono bg-slate-100 py-0.5 px-1 rounded border border-slate-200 truncate">{visitationData.VisitCode || 'GUEST'}</div>
                            <div className="text-[7px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Kode Akses Tamu</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
