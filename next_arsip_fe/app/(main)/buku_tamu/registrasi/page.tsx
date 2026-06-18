'use client'

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import postData from '@/lib/axios/postData';
import { showError, showSuccess } from '@/lib/tools/generalTools';
import RegistrasiForm from './components/display/form';
import VisitorCardModal from './components/display/table';
import { apiEndpointGetPurpose, apiEndpointGetUser, apiEndpointRegistrasi } from "./components/endpoints";
import { RegistrasiFormData, GeneratedCardData } from "./components/interfaces";

const initialFormState: RegistrasiFormData = {
    guest_name: '',
    phone_number: '',
    guest_email: '',
    guest_company: '',
    guest_position: '',
    identity_type: null,
    identity_number: '',
    visit_purpose_id: null,
    host_user_id: null,
    host_name: '',
    visit_notes: '',
    check_in_time: null
};

export default function RegistrasiKunjunganPage() {
    const router = useRouter();
    const toast = useRef<Toast>(null);
    const [loading, setLoading] = useState(false);
    const [showCardDialog, setShowCardDialog] = useState(false);
    const [generatedCard, setGeneratedCard] = useState<GeneratedCardData | null>(null);

    const [visitPurposeOptions, setVisitPurposeOptions] = useState([]);
    const [hostUserOptions, setHostUserOptions] = useState([]);
    
    const [identityFile, setIdentityFile] = useState<File | null>(null);
    const [selfieFile, setSelfieFile] = useState<File | null>(null);
    const [formData, setFormData] = useState<RegistrasiFormData>(initialFormState);

    useEffect(() => {
        const fetchMasterData = async () => {
            try {
                const resPurpose = await postData(apiEndpointGetPurpose, {});
                if (resPurpose?.data?.status === '00') setVisitPurposeOptions(resPurpose.data.data);

                const resHost = await postData(apiEndpointGetUser, {});
                if (resHost?.data?.status === '00') setHostUserOptions(resHost.data.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchMasterData();
    }, []);

    const handleChange = (field: string, value: any) => {
        if (field === 'reset') {
            setFormData(initialFormState);
            setIdentityFile(null);
            setSelfieFile(null);
        } else {
            setFormData((prev: RegistrasiFormData) => ({ ...prev, [field]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.guest_name || !formData.phone_number || !formData.visit_purpose_id || !formData.check_in_time) {
            showError(toast, 'Nama, No. Telepon, Tujuan Kunjungan, dan Rencana Kedatangan wajib diisi!');
            return;
        }

        setLoading(true);
        try {
            const submitData = new FormData();

            Object.entries(formData).forEach(([key, val]: [string, any]) => {
                if (val !== null && val !== undefined && val !== '') {
                    if (key === 'check_in_time' && val instanceof Date) {
                        submitData.append('CheckInTime', val.toISOString());
                    } else {
                        const backendKeys: Record<string, string> = {
                            guest_name: 'GuestName',
                            phone_number: 'PhoneNumber',
                            guest_email: 'GuestEmail',
                            guest_company: 'GuestCompany',
                            guest_position: 'GuestPosition',
                            identity_type: 'IdentityType',
                            identity_number: 'IdentityNumber',
                            visit_purpose_id: 'VisitPurposeId',
                            host_user_id: 'HostUserId',
                            host_name: 'HostName',
                            visit_notes: 'VisitNotes'
                        };
                        submitData.append(backendKeys[key] || key, String(val));
                    }
                }
            });

            if (identityFile) submitData.append('IdentityFile', identityFile);
            if (selfieFile) submitData.append('SelfieFile', selfieFile);

            const response = await postData(apiEndpointRegistrasi, submitData, { 'Content-Type': 'multipart/form-data' });
            
            if (response?.data?.status === '00') {
                showSuccess(toast, 'Check-In Berhasil!');
                setGeneratedCard(response?.data?.data || {
                    visit_code: 'VIST-' + Math.floor(100000 + Math.random() * 900000),
                    guest_name: formData.guest_name,
                    guest_company: formData.guest_company || '-',
                    qr_image_url: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=' + formData.guest_name
                });
                setShowCardDialog(true);
            } else {
                throw new Error(response?.data?.message || 'Gagal meregistrasi kunjungan');
            }
        } catch (error: any) {
            showError(toast, error?.message || 'Terjadi kesalahan sistem');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 bg-slate-50 min-h-screen">
            <Toast ref={toast} position="top-right" />
            
            <div className="flex justify-content-between align-items-center mb-4">
                <h4 className="m-0 font-bold text-slate-800">Booking / Registrasi Kunjungan</h4>
                <Button type="button" label="Kembali ke Monitoring" icon="pi pi-arrow-left" className="p-button-outlined p-button-sm bg-white px-3 py-2 border-round border-300 hover:surface-100 text-slate-700" onClick={() => router.push('/buku_tamu/monitoring')} />
            </div>

            <RegistrasiForm 
                formData={formData}
                handleChange={handleChange}
                setIdentityFile={setIdentityFile}
                setSelfieFile={setSelfieFile}
                visitPurposeOptions={visitPurposeOptions}
                hostUserOptions={hostUserOptions}
                loading={loading}
                handleSubmit={handleSubmit}
            />

            <VisitorCardModal 
                visible={showCardDialog}
                onHide={() => { setShowCardDialog(false); router.push('/buku_tamu/checkout'); }}
                cardData={generatedCard}
            />
        </div>
    );
}