'use client';

import React from 'react';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Card } from 'primereact/card';
import { Dropdown } from 'primereact/dropdown';
import { FileUpload } from 'primereact/fileupload';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { RegistrasiFormData } from '@/app/(main)/buku_tamu/registrasi/components/interfaces';

interface FormProps {
    formData: RegistrasiFormData;
    handleChange: (field: string, value: any) => void;
    setIdentityFile: (file: File | null) => void;
    setSelfieFile: (file: File | null) => void;
    visitPurposeOptions: any[];
    hostUserOptions: any[];
    loading: boolean;
    handleSubmit: (e: React.FormEvent) => void;
}

export default function RegistrasiForm({ formData, handleChange, setIdentityFile, setSelfieFile, visitPurposeOptions, hostUserOptions, loading, handleSubmit }: FormProps) {
    const identityTypes = [
        { label: 'KTP', value: 'ktp' },
        { label: 'SIM', value: 'sim' },
        { label: 'Paspor', value: 'paspor' }
    ];

    return (
        <form onSubmit={handleSubmit} className="grid">
            <div className="col-12 lg:col-6 p-fluid flex flex-column gap-3">
                <Card
                    title={
                        <div className="flex align-items-center gap-2 mb-2">
                            <i className="pi pi-user text-primary text-xl" />
                            <span className="text-xl font-bold text-900">Data Lengkap Tamu</span>
                        </div>
                    }
                    className="border-none shadow-1 border-round-2xl p-2 bg-white"
                >
                    <div className="flex flex-column gap-3 mt-2">
                        <div className="field">
                            <label htmlFor="guest_name" className="font-semibold block mb-2 text-sm text-800">
                                Nama Lengkap Tamu <span className="p-error">*</span>
                            </label>
                            <InputText id="guest_name" value={formData.guest_name || ''} onChange={(e) => handleChange('guest_name', e.target.value)} placeholder="Masukkan nama lengkap tamu" className="p-inputtext-sm" />
                        </div>
                        <div className="field">
                            <label htmlFor="phone_number" className="font-semibold block mb-2 text-sm text-800">
                                Nomor Telepon / WhatsApp <span className="p-error">*</span>
                            </label>
                            <InputText id="phone_number" value={formData.phone_number || ''} onChange={(e) => handleChange('phone_number', e.target.value)} placeholder="Contoh: 0812345678" className="p-inputtext-sm" />
                        </div>
                        <div className="field">
                            <label htmlFor="guest_email" className="font-semibold block mb-2 text-sm text-800">Email Tamu</label>
                            <InputText id="guest_email" value={formData.guest_email || ''} onChange={(e) => handleChange('guest_email', e.target.value)} placeholder="Contoh: tamu@email.com" className="p-inputtext-sm" />
                        </div>
                        <div className="field">
                            <label htmlFor="guest_company" className="font-semibold block mb-2 text-sm text-800">Instansi / Perusahaan</label>
                            <InputText id="guest_company" value={formData.guest_company || ''} onChange={(e) => handleChange('guest_company', e.target.value)} placeholder="Nama instansi/perusahaan asal" className="p-inputtext-sm" />
                        </div>
                        <div className="grid">
                            <div className="field col-4">
                                <label htmlFor="identity_type" className="font-semibold block mb-2 text-sm text-800">Jenis ID</label>
                                <Dropdown id="identity_type" value={formData.identity_type} options={identityTypes} onChange={(e) => handleChange('identity_type', e.value)} placeholder="Pilih" showClear className="p-inputtext-sm" />
                            </div>
                            <div className="field col-8">
                                <label htmlFor="identity_number" className="font-semibold block mb-2 text-sm text-800">Nomor ID</label>
                                <InputText id="identity_number" value={formData.identity_number || ''} onChange={(e) => handleChange('identity_number', e.target.value)} placeholder="Masukkan nomor identitas" className="p-inputtext-sm" />
                            </div>
                        </div>
                        <div className="field">
                            <label className="font-semibold block mb-2 text-sm text-800">Unggah Identitas</label>
                            <FileUpload mode="basic" accept="image/*" maxFileSize={2000000} onSelect={(e) => setIdentityFile(e.files[0])} chooseLabel="Pilih Foto ID" className="w-full text-sm" />
                        </div>
                        <div className="field">
                            <label className="font-semibold block mb-2 text-sm text-800">Foto Selfie Tamu</label>
                            <FileUpload mode="basic" accept="image/*" maxFileSize={2000000} onSelect={(e) => setSelfieFile(e.files[0])} chooseLabel="Ambil/Pilih Foto Selfie" className="w-full text-sm" />
                        </div>
                    </div>
                </Card>
            </div>

            <div className="col-12 lg:col-6 p-fluid flex flex-column gap-3">
                <Card
                    title={
                        <div className="flex align-items-center gap-2 mb-2">
                            <i className="pi pi-info-circle text-primary text-xl" />
                            <span className="text-xl font-bold text-900">Informasi Kunjungan</span>
                        </div>
                    }
                    className="border-none shadow-1 border-round-2xl p-2 bg-white"
                >
                    <div className="flex flex-column gap-3 mt-2">
                        <div className="field">
                            <label htmlFor="visit_purpose_id" className="font-semibold block mb-2 text-sm text-800">
                                Tujuan Kunjungan <span className="p-error">*</span>
                            </label>
                            <Dropdown id="visit_purpose_id" value={formData.visit_purpose_id} options={visitPurposeOptions} optionLabel="name" optionValue="id" onChange={(e) => handleChange('visit_purpose_id', e.value)} placeholder="Pilih Tujuan Kunjungan" className="p-inputtext-sm" />
                        </div>
                        <div className="field">
                            <label htmlFor="host_user_id" className="font-semibold block mb-2 text-sm text-800">Pegawai yang Ditemui</label>
                            <Dropdown id="host_user_id" value={formData.host_user_id} options={hostUserOptions} optionLabel="nama_lengkap" optionValue="id_pengguna" onChange={(e) => handleChange('host_user_id', e.value)} placeholder="Cari & pilih pegawai internal" filter showClear className="p-inputtext-sm" />
                        </div>
                        <div className="field">
                            <label htmlFor="host_name" className="font-semibold block mb-2 text-sm text-800">Nama Pegawai Manual</label>
                            <InputText id="host_name" value={formData.host_name || ''} onChange={(e) => handleChange('host_name', e.target.value)} placeholder="Isi manual jika tidak terdaftar di sistem" className="p-inputtext-sm" />
                        </div>
                        <div className="field">
                            <label htmlFor="check_in_time" className="font-semibold block mb-2 text-sm text-800">
                                Rencana Waktu Kedatangan <span className="p-error">*</span>
                            </label>
                            <Calendar id="check_in_time" value={formData.check_in_time} onChange={(e) => handleChange('check_in_time', e.value)} showTime hourFormat="24" placeholder="Pilih tanggal dan jam rencana" minDate={new Date()} showIcon className="p-inputtext-sm" />
                        </div>
                        <div className="field">
                            <label htmlFor="visit_notes" className="font-semibold block mb-2 text-sm text-800">Catatan Tambahan</label>
                            <InputTextarea id="visit_notes" value={formData.visit_notes || ''} onChange={(e) => handleChange('visit_notes', e.target.value)} rows={4} placeholder="Tuliskan poin pembahasan..." autoResize className="p-inputtext-sm" />
                        </div>
                    </div>
                </Card>

                <div className="flex justify-content-end gap-2 mt-3">
                    <Button type="button" label="Reset Form" icon="pi pi-refresh" severity="secondary" outlined className="py-2 px-4 font-semibold text-sm border-round-lg" onClick={() => handleChange('reset', null)} />
                    <Button type="submit" label="Daftarkan Rencana Kunjungan" icon="pi pi-check" loading={loading} className="py-2 px-4 font-semibold text-sm border-round-lg text-white" style={{ background: 'linear-gradient(135deg, var(--primary-color) 0%, #1d4ed8 100%)', border: 'none' }} />
                </div>
            </div>
        </form>
    );
}
