'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { InputTextarea } from 'primereact/inputtextarea';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import postData from '@/lib/axios/postData';
import { showError, showSuccess } from '@/lib/tools/generalTools';

export default function RegistrasiKunjunganPage() {
    const router = useRouter();
    const toast = React.useRef<Toast>(null);
    const [loading, setLoading] = useState(false);

    const [visitPurposeOptions, setVisitPurposeOptions] = useState([]);
    const [hostUserOptions, setHostUserOptions] = useState([]);

    const [formData, setFormData] = useState({
        GuestName: '',
        PhoneNumber: '',
        GuestEmail: '',
        GuestCompany: '',
        GuestPosition: '',
        IdentityType: null,
        IdentityNumber: '',
        VisitPurposeId: null,
        HostUserId: null,
        HostName: '',
        VisitNotes: '',
        CheckInTime: null as Date | null
    });

    const identityTypes = [
        { label: 'KTP', value: 'ktp' },
        { label: 'SIM', value: 'sim' },
        { label: 'Paspor', value: 'paspor' }
    ];

    useEffect(() => {
        const fetchMasterData = async () => {
            try {
                // Menggunakan rute fallback palsu yang sudah kita buat di backend kemarin
                const resPurpose = await postData('/master/visit-purpose/vp-data', {});
                if (resPurpose?.data?.status === '00') setVisitPurposeOptions(resPurpose.data.data);

                const resHost = await postData('/setup/user-login/user-dropdown', {});
                if (resHost?.data?.status === '00') setHostUserOptions(resHost.data.data);
            } catch (err) {
                console.error("Gagal memuat data dropdown master", err);
            }
        };
        fetchMasterData();
    }, []);

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.GuestName || !formData.PhoneNumber || !formData.VisitPurposeId || !formData.CheckInTime) {
            showError(toast, 'Nama, No. Telepon, Tujuan Kunjungan, dan Rencana Kedatangan wajib diisi!');
            return;
        }

        setLoading(true);
        try {
            const submitData = new FormData();

            // Loop data dengan casting type 'any' agar TypeScript tidak komplain di FormData
            Object.entries(formData).forEach(([key, val]: [string, any]) => {
                if (val !== null && val !== undefined && val !== '') {
                    if (key === 'CheckInTime' && val instanceof Date) {
                        submitData.append(key, val.toISOString());
                    } else {
                        submitData.append(key, String(val));
                    }
                }
            });

            const response = await postData('/buku_tamu/visit-registrasi', submitData, { 'Content-Type': 'multipart/form-data' });
            if (response?.data?.status === '00') {
                showSuccess(toast, 'Rencana kunjungan berhasil didaftarkan!');
                setTimeout(() => {
                    router.push('/buku_tamu/monitoring');
                }, 1500);
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
        <div className="p-4">
            <Toast ref={toast} />
            <div className="flex justify-content-between align-items-center mb-4">
                <h2 className="text-2xl font-bold m-0 text-900">Booking / Registrasi Kunjungan</h2>
                <Button type="button" label="Kembali ke Monitoring" icon="pi pi-arrow-left" className="p-button-outlined" onClick={() => router.push('/buku_tamu/monitoring')} />
            </div>

            <form onSubmit={handleSubmit} className="grid">
                <div className="col-12 lg:col-6 p-fluid flex flex-column gap-3">
                    <Card title="Data Lengkap Tamu" className="shadow-2 border-round">
                        <div className="flex flex-column gap-3">
                            <div className="field">
                                <label htmlFor="GuestName" className="font-semibold block mb-1">Nama Tamu <span className="text-red-500">*</span></label>
                                <InputText id="GuestName" value={formData.GuestName} onChange={(e) => handleChange('GuestName', e.target.value)} placeholder="Masukkan nama lengkap tamu" />
                            </div>
                            <div className="field">
                                <label htmlFor="PhoneNumber" className="font-semibold block mb-1">Nomor Telepon <span className="text-red-500">*</span></label>
                                <InputText id="PhoneNumber" value={formData.PhoneNumber} onChange={(e) => handleChange('PhoneNumber', e.target.value)} placeholder="Contoh: 0812345678" />
                            </div>
                            <div className="field">
                                <label htmlFor="GuestEmail" className="font-semibold block mb-1">Email Tamu</label>
                                <InputText id="GuestEmail" value={formData.GuestEmail} onChange={(e) => handleChange('GuestEmail', e.target.value)} placeholder="Contoh: tamu@email.com" />
                            </div>
                            <div className="field">
                                <label htmlFor="GuestCompany" className="font-semibold block mb-1">Instansi / Perusahaan</label>
                                <InputText id="GuestCompany" value={formData.GuestCompany} onChange={(e) => handleChange('GuestCompany', e.target.value)} placeholder="Nama instansi/perusahaan asal" />
                            </div>
                            <div className="field">
                                <label htmlFor="GuestPosition" className="font-semibold block mb-1">Jabatan</label>
                                <InputText id="GuestPosition" value={formData.GuestPosition} onChange={(e) => handleChange('GuestPosition', e.target.value)} placeholder="Jabatan tamu" />
                            </div>
                            <div className="grid">
                                <div className="field col-4">
                                    <label htmlFor="IdentityType" className="font-semibold block mb-1">Jenis ID</label>
                                    <Dropdown id="IdentityType" value={formData.IdentityType} options={identityTypes} onChange={(e) => handleChange('IdentityType', e.value)} placeholder="Pilih" />
                                </div>
                                <div className="field col-8">
                                    <label htmlFor="IdentityNumber" className="font-semibold block mb-1">Nomor ID (NIK/SIM)</label>
                                    <InputText id="IdentityNumber" value={formData.IdentityNumber} onChange={(e) => handleChange('IdentityNumber', e.target.value)} placeholder="Masukkan nomor identitas" disabled={!formData.IdentityType} />
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="col-12 lg:col-6 p-fluid flex flex-column gap-3">
                    <Card title="Informasi Kunjungan" className="shadow-2 border-round">
                        <div className="flex flex-column gap-3">
                            <div className="field">
                                <label htmlFor="VisitPurposeId" className="font-semibold block mb-1">Tujuan Kunjungan <span className="text-red-500">*</span></label>
                                <Dropdown id="VisitPurposeId" value={formData.VisitPurposeId} options={visitPurposeOptions} optionLabel="VisitPurposeName" optionValue="VisitPurposeId" onChange={(e) => handleChange('VisitPurposeId', e.value)} placeholder="Pilih Tujuan Kunjungan" />
                            </div>
                            <div className="field">
                                <label htmlFor="HostUserId" className="font-semibold block mb-1">Pegawai yang Ditemui (Host)</label>
                                <Dropdown id="HostUserId" value={formData.HostUserId} options={hostUserOptions} optionLabel="Fullname" optionValue="UserId" onChange={(e) => handleChange('HostUserId', e.value)} placeholder="Cari & Pilih Pegawai Internal" filter showClear />
                            </div>
                            <div className="field">
                                <label htmlFor="HostName" className="font-semibold block mb-1">Nama Pegawai (Manual)</label>
                                <InputText id="HostName" value={formData.HostName} onChange={(e) => handleChange('HostName', e.target.value)} placeholder="Isi manual jika tidak terdaftar di sistem" />
                            </div>
                            <div className="field">
                                <label htmlFor="CheckInTime" className="font-semibold block mb-1">Rencana Waktu Kedatangan <span className="text-red-500">*</span></label>
                                <Calendar id="CheckInTime" value={formData.CheckInTime} onChange={(e) => handleChange('CheckInTime', e.value)} showTime hourFormat="24" placeholder="Pilih tanggal dan jam rencana" minDate={new Date()} showIcon />
                            </div>
                            <div className="field">
                                <label htmlFor="VisitNotes" className="font-semibold block mb-1">Catatan Tambahan</label>
                                <InputTextarea id="VisitNotes" value={formData.VisitNotes} onChange={(e) => handleChange('VisitNotes', e.target.value)} rows={4} placeholder="Tuliskan poin pembahasan..." autoResize />
                            </div>
                        </div>
                    </Card>

                    <div className="flex justify-content-end gap-2 mt-2">
                        <Button type="button" label="Reset Form" icon="pi pi-refresh" severity="secondary" outlined onClick={() => setFormData({ GuestName: '', PhoneNumber: '', GuestEmail: '', GuestCompany: '', GuestPosition: '', IdentityType: null, IdentityNumber: '', VisitPurposeId: null, HostUserId: null, HostName: '', VisitNotes: '', CheckInTime: null })} />
                        <Button type="submit" label="Daftarkan Rencana Kunjungan" icon="pi pi-check" severity="success" loading={loading} />
                    </div>
                </div>
            </form>
        </div>
    );
}