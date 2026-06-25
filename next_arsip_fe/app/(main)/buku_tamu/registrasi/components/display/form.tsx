'use client';

import React from 'react';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { InputTextarea } from 'primereact/inputtextarea';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { FileUpload } from 'primereact/fileupload';
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
                <Card title="Data Lengkap Tamu" className="shadow-2 border-round">
                    <div className="flex flex-column gap-3">
                        <div className="field">
                            <label htmlFor="guest_name" className="font-semibold block mb-1">
                                Nama Tamu <span className="text-red-500">*</span>
                            </label>
                            <InputText id="guest_name" value={formData.guest_name} onChange={(e) => handleChange('guest_name', e.target.value)} placeholder="Masukkan nama lengkap tamu" />
                        </div>
                        <div className="field">
                            <label htmlFor="phone_number" className="font-semibold block mb-1">
                                Nomor Telepon <span className="text-red-500">*</span>
                            </label>
                            <InputText id="phone_number" value={formData.phone_number} onChange={(e) => handleChange('phone_number', e.target.value)} placeholder="Contoh: 0812345678" />
                        </div>
                        <div className="field">
                            <label htmlFor="guest_surel" className="font-semibold block mb-1">
                                surel Tamu
                            </label>
                            <InputText id="guest_surel" value={formData.guest_surel} onChange={(e) => handleChange('guest_surel', e.target.value)} placeholder="Contoh: tamu@surel.com" />
                        </div>
                        <div className="field">
                            <label htmlFor="guest_company" className="font-semibold block mb-1">
                                Instansi / Perusahaan
                            </label>
                            <InputText id="guest_company" value={formData.guest_company} onChange={(e) => handleChange('guest_company', e.target.value)} placeholder="Nama instansi/perusahaan asal" />
                        </div>
                        <div className="grid grid-nogutter gap-2">
                            <div className="field col">
                                <label htmlFor="identity_type" className="font-semibold block mb-1">
                                    Jenis ID
                                </label>
                                <Dropdown id="identity_type" value={formData.identity_type} options={identityTypes} onChange={(e) => handleChange('identity_type', e.value)} placeholder="Pilih" />
                            </div>
                            <div className="field col-8">
                                <label htmlFor="identity_number" className="font-semibold block mb-1">
                                    Nomor ID (NIK/SIM)
                                </label>
                                <InputText id="identity_number" value={formData.identity_number} onChange={(e) => handleChange('identity_number', e.target.value)} placeholder="Masukkan nomor identitas" disabled={!formData.identity_type} />
                            </div>
                        </div>
                        <div className="field">
                            <label className="font-semibold block mb-1">Unggah Identitas (KTP/SIM/Paspor)</label>
                            <FileUpload mode="basic" accept="image/*" maxFileSize={2000000} onSelect={(e) => setIdentityFile(e.files[0])} chooseLabel="Pilih Foto ID" className="w-full" />
                        </div>
                        <div className="field">
                            <label className="font-semibold block mb-1">Foto Selfie Tamu</label>
                            <FileUpload mode="basic" accept="image/*" maxFileSize={2000000} onSelect={(e) => setSelfieFile(e.files[0])} chooseLabel="Ambil/Pilih Foto Selfie" className="w-full" />
                        </div>
                    </div>
                </Card>
            </div>

            <div className="col-12 lg:col-6 p-fluid flex flex-column gap-3">
                <Card title="Informasi Kunjungan" className="shadow-2 border-round">
                    <div className="flex flex-column gap-3">
                        <div className="field">
                            <label htmlFor="visit_purpose_id" className="font-semibold block mb-1">
                                Tujuan Kunjungan <span className="text-red-500">*</span>
                            </label>
                            <Dropdown
                                id="visit_purpose_id"
                                value={formData.visit_purpose_id}
                                options={visitPurposeOptions}
                                optionLabel="VisitPurposeName"
                                optionValue="VisitPurposeId"
                                onChange={(e) => handleChange('visit_purpose_id', e.value)}
                                placeholder="Pilih Tujuan Kunjungan"
                            />
                        </div>
                        <div className="field">
                            <label htmlFor="host_id_pengguna" className="font-semibold block mb-1">
                                Pegawai yang Ditemui (Host)
                            </label>
                            <Dropdown
                                id="host_id_pengguna"
                                value={formData.host_id_pengguna}
                                options={hostUserOptions}
                                optionLabel="nama_lengkap"
                                optionValue="UniqueId"
                                onChange={(e) => handleChange('host_id_pengguna', e.value)}
                                placeholder="Cari & Pilih Pegawai Internal"
                                filter
                                showClear
                            />
                        </div>
                        <div className="field">
                            <label htmlFor="host_name" className="font-semibold block mb-1">
                                Nama Pegawai (Manual)
                            </label>
                            <InputText id="host_name" value={formData.host_name} onChange={(e) => handleChange('host_name', e.target.value)} placeholder="Isi manual jika tidak terdaftar di sistem" />
                        </div>
                        <div className="field">
                            <label htmlFor="check_in_time" className="font-semibold block mb-1">
                                Rencana Waktu Kedatangan <span className="text-red-500">*</span>
                            </label>
                            <Calendar id="check_in_time" value={formData.check_in_time} onChange={(e) => handleChange('check_in_time', e.value)} showTime hourFormat="24" placeholder="Pilih tanggal dan jam rencana" minDate={new Date()} showIcon />
                        </div>
                        <div className="field">
                            <label htmlFor="visit_notes" className="font-semibold block mb-1">
                                Catatan Tambahan
                            </label>
                            <InputTextarea id="visit_notes" value={formData.visit_notes} onChange={(e) => handleChange('visit_notes', e.target.value)} rows={4} placeholder="Tuliskan poin pembahasan..." autoResize />
                        </div>
                    </div>
                </Card>

                <div className="flex justify-content-end gap-2 mt-2">
                    <Button type="button" label="Reset Form" icon="pi pi-refresh" severity="secondary" outlined onClick={() => handleChange('reset', null)} />
                    <Button type="submit" label="Daftarkan Rencana Kunjungan" icon="pi pi-check" severity="success" loading={loading} />
                </div>
            </div>
        </form>
    );
}
