'use client'

import React from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { GeneratedCardData } from "@/app/(main)/buku_tamu/registrasi/components/interfaces";

interface TableProps {
    visible: boolean;
    onHide: () => void;
    cardData: GeneratedCardData | null;
}

export default function VisitorCardModal({ visible, onHide, cardData }: TableProps) {
    return (
        <Dialog header="Visitor Card (Kartu Akses Tamu)" visible={visible} modal style={{ width: '400px' }} onHide={onHide}>
            {cardData && (
                <div className="flex flex-column align-items-center text-center p-3 border-round border-1 surface-100 shadow-1">
                    <div className="text-xl font-bold text-indigo-700 mb-1">VISITOR CARD</div>
                    <div className="text-xs text-600 mb-3">DocArchive Enterprise Records</div>
                    
                    <div className="bg-white p-3 border-round shadow-2 mb-3">
                        <img src={cardData.qr_image_url} alt="QR Code Tamu" style={{ width: '150px', height: '150px' }} />
                    </div>
                    
                    <div className="text-lg font-bold text-800">{cardData.guest_name}</div>
                    <div className="text-sm text-600 mb-2">{cardData.guest_company}</div>
                    <div className="text-xs bg-indigo-100 text-indigo-800 px-3 py-1 border-round font-mono font-bold">{cardData.visit_code}</div>
                    
                    <div className="text-xs text-green-600 mt-3 flex align-items-center gap-1">
                        <i className="pi pi-whatsapp"></i> Notifikasi otomatis terkirim ke Pegawai
                    </div>
                    
                    <Button label="Cetak Kartu Akses" icon="pi pi-print" className="p-button-sm mt-4 w-full" onClick={() => window.print()} />
                </div>
            )}
        </Dialog>
    );
}