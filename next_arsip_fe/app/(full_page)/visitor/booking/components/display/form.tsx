'use client';

import React, { useRef } from 'react';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import Link from 'next/link';
import { VisitorBookingFormData } from '../interfaces';
import SignaturePad from '@/app/(main)/buku_tamu/registrasi/components/display/SignaturePad';

interface FormProps {
    form: VisitorBookingFormData;
    handleChange: (field: string, value: any) => void;
    identityFile: File | null;
    selfieFile: File | null;
    setIdentityFile: (file: File | null) => void;
    setSelfieFile: (file: File | null) => void;
    purposes: any[];
    branches: any[];
    hosts: any[];
    loading: boolean;
    handleSubmit: (e: React.FormEvent) => void;
    handleReset: () => void;
}

export default function VisitorBookingForm({
    form,
    handleChange,
    identityFile,
    selfieFile,
    setIdentityFile,
    setSelfieFile,
    purposes,
    branches = [],
    hosts = [],
    loading,
    handleSubmit,
    handleReset
}: FormProps) {
    const identityTypes = [
        { label: 'KTP', value: 'ktp' },
        { label: 'SIM', value: 'sim' },
        { label: 'Paspor', value: 'paspor' }
    ];

    const fileInputRefIdentity = useRef<HTMLInputElement>(null);
    const fileInputRefSelfie = useRef<HTMLInputElement>(null);

    return (
        <form onSubmit={handleSubmit} className="flex flex-column gap-4 w-full">
            {styleOverrides()}

            {/* SEKSI 1: PROFIL TAMU */}
            <div>
                <div className="custom-section-title">
                    <i className="pi pi-user mr-2" />
                    Profil Pengunjung
                </div>

                <div className="grid row-gap-3 col-gap-2">
                    <div className="col-12 field flex flex-column gap-2 mb-0">
                        <label htmlFor="nama_tamu" className="font-semibold text-xs text-700">Nama Lengkap *</label>
                        <InputText
                            id="nama_tamu"
                            value={form.nama_tamu}
                            onChange={(e) => handleChange('nama_tamu', e.target.value)}
                            placeholder="Masukkan nama lengkap Anda"
                            className="w-full"
                        />
                    </div>

                    <div className="col-12 md:col-6 field flex flex-column gap-2 mb-0">
                        <label htmlFor="nomor_telepon" className="font-semibold text-xs text-700">Nomor WhatsApp *</label>
                        <InputText
                            id="nomor_telepon"
                            value={form.nomor_telepon}
                            onChange={(e) => handleChange('nomor_telepon', e.target.value)}
                            placeholder="Contoh: 0812345678"
                            className="w-full"
                        />
                    </div>

                    <div className="col-12 md:col-6 field flex flex-column gap-2 mb-0">
                        <label htmlFor="email_tamu" className="font-semibold text-xs text-700">Alamat Email</label>
                        <InputText
                            id="email_tamu"
                            value={form.email_tamu}
                            onChange={(e) => handleChange('email_tamu', e.target.value)}
                            placeholder="tamu@email.com"
                            className="w-full"
                        />
                    </div>

                    <div className="col-12 field flex flex-column gap-2 mb-0">
                        <label htmlFor="instansi_tamu" className="font-semibold text-xs text-700">Instansi / Perusahaan</label>
                        <InputText
                            id="instansi_tamu"
                            value={form.instansi_tamu}
                            onChange={(e) => handleChange('instansi_tamu', e.target.value)}
                            placeholder="Nama instansi atau organisasi asal"
                            className="w-full"
                        />
                    </div>

                    <div className="col-12 md:col-5 field flex flex-column gap-2 mb-0">
                        <label htmlFor="jenis_identitas" className="font-semibold text-xs text-700">Jenis ID</label>
                        <Dropdown
                            id="jenis_identitas"
                            value={form.jenis_identitas}
                            options={identityTypes}
                            onChange={(e) => handleChange('jenis_identitas', e.value)}
                            placeholder="Pilih ID"
                            showClear
                            className="w-full"
                        />
                    </div>

                    <div className="col-12 md:col-7 field flex flex-column gap-2 mb-0">
                        <label htmlFor="nomor_identitas" className="font-semibold text-xs text-700">Nomor ID</label>
                        <InputText
                            id="nomor_identitas"
                            value={form.nomor_identitas}
                            onChange={(e) => handleChange('nomor_identitas', e.target.value)}
                            placeholder="Masukkan nomor identitas"
                            className="w-full"
                        />
                    </div>

                    {/* CUSTOM FILE UPLOAD IDENTITAS */}
                    <div className="col-12 md:col-6 field flex flex-column gap-2 mb-0">
                        <label className="font-semibold text-xs text-700">Foto Identitas (KTP/SIM)</label>
                        <input
                            type="file"
                            ref={fileInputRefIdentity}
                            onChange={(e) => setIdentityFile(e.target.files?.[0] || null)}
                            className="hidden"
                            accept="image/*"
                        />
                        <div
                            onClick={() => fileInputRefIdentity.current?.click()}
                            className="border-dashed border-2 border-300 border-round-xl p-3 flex flex-column align-items-center justify-content-center cursor-pointer hover:border-primary hover:bg-indigo-50 transition-all transition-duration-200"
                            style={{ minHeight: '100px', background: '#f8fafc' }}
                        >
                            {identityFile ? (
                                <div className="flex align-items-center gap-2 text-sm text-green-600 font-semibold w-full px-2">
                                    <i className="pi pi-id-card text-2xl text-green-500" />
                                    <span className="truncate flex-1 text-xs">{identityFile.name}</span>
                                    <i
                                        className="pi pi-times-circle text-base text-500 hover:text-red-500 ml-2"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setIdentityFile(null);
                                            if (fileInputRefIdentity.current) fileInputRefIdentity.current.value = '';
                                        }}
                                    />
                                </div>
                            ) : (
                                <>
                                    <i className="pi pi-upload text-xl text-500 mb-1" />
                                    <span className="text-xs text-600 font-medium">Pilih / Unggah KTP/SIM</span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* CUSTOM FILE UPLOAD SELFIE */}
                    <div className="col-12 md:col-6 field flex flex-column gap-2 mb-0">
                        <label className="font-semibold text-xs text-700">Foto Selfie Tamu</label>
                        <input
                            type="file"
                            ref={fileInputRefSelfie}
                            onChange={(e) => setSelfieFile(e.target.files?.[0] || null)}
                            className="hidden"
                            accept="image/*"
                        />
                        <div
                            onClick={() => fileInputRefSelfie.current?.click()}
                            className="border-dashed border-2 border-300 border-round-xl p-3 flex flex-column align-items-center justify-content-center cursor-pointer hover:border-primary hover:bg-indigo-50 transition-all transition-duration-200"
                            style={{ minHeight: '100px', background: '#f8fafc' }}
                        >
                            {selfieFile ? (
                                <div className="flex align-items-center gap-2 text-sm text-green-600 font-semibold w-full px-2">
                                    <i className="pi pi-camera text-2xl text-green-500" />
                                    <span className="truncate flex-1 text-xs">{selfieFile.name}</span>
                                    <i
                                        className="pi pi-times-circle text-base text-500 hover:text-red-500 ml-2"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelfieFile(null);
                                            if (fileInputRefSelfie.current) fileInputRefSelfie.current.value = '';
                                        }}
                                    />
                                </div>
                            ) : (
                                <>
                                    <i className="pi pi-camera text-xl text-500 mb-1" />
                                    <span className="text-xs text-600 font-medium">Ambil / Unggah Selfie</span>
                                </>
                            )}
                        </div>
                    </div>
                    {/* CANVAS SIGNATURE */}
                    <div className="col-12 field flex flex-column gap-2 mb-0 mt-2">
                        <SignaturePad onChange={(val) => handleChange('signature_data', val)} />
                    </div>
                </div>
            </div>

            {/* SEKSI 2: DETAIL KUNJUNGAN */}
            <div>
                <div className="custom-section-title">
                    <i className="pi pi-calendar-plus mr-2" />
                    Detail Kunjungan
                </div>

                <div className="grid row-gap-3 col-gap-2">
                    <div className="col-12 field flex flex-column gap-2 mb-0">
                        <label htmlFor="id_cabang" className="font-semibold text-xs text-700">Kantor / Cabang Tujuan *</label>
                        <Dropdown
                            id="id_cabang"
                            value={form.id_cabang}
                            options={branches}
                            optionLabel="name"
                            optionValue="id"
                            onChange={(e) => handleChange('id_cabang', e.value)}
                            placeholder="Pilih kantor / cabang yang ingin dituju"
                            className="w-full"
                        />
                    </div>

                    <div className="col-12 field flex flex-column gap-2 mb-0">
                        <label htmlFor="id_tujuan_kunjungan" className="font-semibold text-xs text-700">Tujuan Kunjungan *</label>
                        <Dropdown
                            id="id_tujuan_kunjungan"
                            value={form.id_tujuan_kunjungan}
                            options={purposes}
                            optionLabel="name"
                            optionValue="id"
                            onChange={(e) => handleChange('id_tujuan_kunjungan', e.value)}
                            placeholder="Pilih tujuan kedatangan Anda"
                            className="w-full"
                        />
                    </div>

                    <div className="col-12 md:col-6 field flex flex-column gap-2 mb-0">
                        <label htmlFor="visit_type" className="font-semibold text-xs text-700">Tipe Kunjungan *</label>
                        <Dropdown
                            id="visit_type"
                            value={form.visit_type || 'personal'}
                            options={[
                                { label: 'Personal (Individu)', value: 'personal' },
                                { label: 'Group (Rombongan)', value: 'group' }
                            ]}
                            onChange={(e) => handleChange('visit_type', e.value)}
                            className="w-full"
                        />
                    </div>

                    {form.visit_type === 'group' && (
                        <div className="col-12 field flex flex-column gap-3 mb-0 border-top-1 border-100 pt-3">
                            <div className="flex justify-content-between align-items-center mb-2">
                                <span className="font-bold text-sm text-800">Daftar Anggota Rombongan</span>
                                <Button
                                    type="button"
                                    label="Tambah Anggota"
                                    icon="pi pi-plus"
                                    className="p-button-outlined p-button-sm py-1 px-2 text-xs"
                                    onClick={() => {
                                        const currentMembers = form.group_members || [];
                                        const updated = [...currentMembers, { name: '', phone: '', idNumber: '', identityFile: null }];
                                        handleChange('group_members', updated);
                                        handleChange('guest_count', updated.length + 1);
                                    }}
                                />
                            </div>

                            {(form.group_members || []).map((member, index) => (
                                <div key={index} className="p-3 surface-50 border-round-lg border-1 border-200 flex flex-column gap-2 mb-2 relative">
                                    <Button
                                        type="button"
                                        icon="pi pi-times"
                                        className="p-button-rounded p-button-text p-button-danger absolute p-1 text-xs"
                                        style={{ top: '8px', right: '8px', width: '24px', height: '24px' }}
                                        onClick={() => {
                                            const currentMembers = form.group_members || [];
                                            const updated = currentMembers.filter((_, i) => i !== index);
                                            handleChange('group_members', updated);
                                            handleChange('guest_count', updated.length + 1);
                                        }}
                                    />
                                    <div className="font-semibold text-xs text-600 mb-1 flex align-items-center gap-2">
                                        <span>Anggota #{index + 1}</span>
                                        <Button
                                            type="button"
                                            label="Salin dari Tamu Utama"
                                            className="p-button-text p-button-sm p-0 text-xs font-medium text-primary hover:underline ml-2"
                                            style={{ height: 'auto', minWidth: 'auto' }}
                                            onClick={() => {
                                                const currentMembers = [...(form.group_members || [])];
                                                currentMembers[index] = {
                                                    ...currentMembers[index],
                                                    name: form.nama_tamu,
                                                    phone: form.nomor_telepon,
                                                    idNumber: form.nomor_identitas,
                                                };
                                                handleChange('group_members', currentMembers);
                                            }}
                                        />
                                    </div>
                                    <div className="grid row-gap-2">
                                        <div className="col-12 md:col-4 field m-0 flex flex-column gap-1">
                                            <label className="text-xs font-semibold text-700">Nama Lengkap</label>
                                            <InputText
                                                value={member.name}
                                                onChange={(e) => {
                                                    const currentMembers = [...(form.group_members || [])];
                                                    currentMembers[index].name = e.target.value;
                                                    handleChange('group_members', currentMembers);
                                                }}
                                                placeholder="Nama lengkap"
                                                className="w-full"
                                            />
                                        </div>
                                        <div className="col-12 md:col-4 field m-0 flex flex-column gap-1">
                                            <label className="text-xs font-semibold text-700">No. HP (Opsional)</label>
                                            <InputText
                                                value={member.phone}
                                                onChange={(e) => {
                                                    const currentMembers = [...(form.group_members || [])];
                                                    currentMembers[index].phone = e.target.value;
                                                    handleChange('group_members', currentMembers);
                                                }}
                                                placeholder="No. HP"
                                                className="w-full"
                                            />
                                        </div>
                                        <div className="col-12 md:col-4 field m-0 flex flex-column gap-1">
                                            <label className="text-xs font-semibold text-700">No. ID / KTP (Opsional)</label>
                                            <InputText
                                                value={member.idNumber}
                                                onChange={(e) => {
                                                    const currentMembers = [...(form.group_members || [])];
                                                    currentMembers[index].idNumber = e.target.value;
                                                    handleChange('group_members', currentMembers);
                                                }}
                                                placeholder="No. ID"
                                                className="w-full"
                                            />
                                        </div>
                                    </div>
                                    <div className="field m-0 mt-2 flex flex-column gap-1">
                                        <label className="text-xs font-semibold text-700">Foto KTP/SIM (Opsional)</label>
                                        <input
                                            type="file"
                                            id={`member-file-${index}`}
                                            onChange={(e) => {
                                                const currentMembers = [...(form.group_members || [])];
                                                currentMembers[index].identityFile = e.target.files?.[0] || null;
                                                handleChange('group_members', currentMembers);
                                            }}
                                            className="hidden"
                                            accept="image/*"
                                        />
                                        <div
                                            onClick={() => {
                                                const element = document.getElementById(`member-file-${index}`);
                                                element?.click();
                                            }}
                                            className="border-dashed border-2 border-300 border-round-xl p-2 flex flex-column align-items-center justify-content-center cursor-pointer hover:border-primary hover:bg-indigo-50 transition-all transition-duration-200"
                                            style={{ minHeight: '50px', background: '#f8fafc' }}
                                        >
                                            {member.identityFile ? (
                                                <span className="text-xs text-green-600 font-semibold truncate max-w-full">{member.identityFile.name}</span>
                                            ) : (
                                                <span className="text-xs text-500">Pilih Foto KTP/SIM</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <div className="col-12 md:col-6 field flex flex-column gap-2 mb-0">
                                <label htmlFor="guest_count" className="font-semibold text-xs text-700">Total Jumlah Tamu</label>
                                <InputText
                                    id="guest_count"
                                    type="number"
                                    readOnly
                                    disabled
                                    value={String(form.guest_count || 1)}
                                    className="w-full bg-gray-100"
                                />
                            </div>
                        </div>
                    )}

                    <div className="col-12 field flex flex-column gap-2 mb-0">
                        <label htmlFor="nama_host" className="font-semibold text-xs text-700">Pegawai yang Ingin Ditemui</label>
                        <Dropdown
                            id="nama_host"
                            value={form.id_user_host}
                            options={hosts}
                            optionLabel="name"
                            optionValue="id"
                            filter
                            onChange={(e) => {
                                const selectedHost = hosts.find((h: any) => h.id === e.value);
                                handleChange('id_user_host', e.value);
                                handleChange('nama_host', selectedHost ? selectedHost.name : '');
                            }}
                            placeholder={form.id_cabang ? "Pilih pegawai yang ingin ditemui" : "Pilih kantor / cabang tujuan terlebih dahulu"}
                            disabled={!form.id_cabang}
                            className="w-full"
                        />
                    </div>

                    <div className="col-12 field flex flex-column gap-2 mb-0">
                        <label htmlFor="waktu_masuk" className="font-semibold text-xs text-700">Rencana Waktu Kedatangan *</label>
                        <Calendar
                            id="waktu_masuk"
                            value={form.waktu_masuk}
                            onChange={(e) => handleChange('waktu_masuk', e.value)}
                            showTime
                            hourFormat="24"
                            placeholder="Pilih tanggal dan jam kedatangan"
                            showIcon
                            className="w-full"
                        />
                    </div>

                    <div className="col-12 field flex flex-column gap-2 mb-0">
                        <label htmlFor="catatan_kunjungan" className="font-semibold text-xs text-700">Catatan / Keperluan Tambahan</label>
                        <InputTextarea
                            id="catatan_kunjungan"
                            value={form.catatan_kunjungan}
                            onChange={(e) => handleChange('catatan_kunjungan', e.target.value)}
                            rows={3}
                            placeholder="Tuliskan poin pembahasan atau pesan (opsional)"
                            className="w-full"
                        />
                    </div>
                </div>
            </div>

            {/* BUTTONS ACTIONS */}
            <div className="flex flex-column sm:flex-row justify-content-end gap-2 mt-2 pt-3 border-top-1 border-100">
                <Button
                    type="button"
                    label="Bersihkan Form"
                    icon="pi pi-refresh"
                    className="p-button-outlined p-button-secondary font-semibold border-round-lg py-3 px-4 text-sm"
                    onClick={handleReset}
                />
                <Button
                    type="submit"
                    label="Jadwalkan Kunjungan"
                    icon="pi pi-calendar-plus"
                    loading={loading}
                    className="font-bold border-round-lg py-3 px-5 text-sm text-white"
                    style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', border: 'none', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)' }}
                />
            </div>
        </form>
    );
}

function styleOverrides() {
    return (
        <style jsx global>{`
            .p-inputtext:focus, 
            .p-dropdown:not(.p-disabled).p-focus, 
            .p-calendar:not(.p-disabled).p-focus .p-inputtext {
                border-color: #6366f1 !important;
                box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15) !important;
            }
            .p-inputtext, 
            .p-dropdown, 
            .p-calendar .p-inputtext {
                transition: all 0.25s ease-in-out !important;
                border-radius: 8px !important;
                border: 1.5px solid #cbd5e1 !important;
                padding: 0.75rem 1rem !important;
            }
            .p-dropdown .p-dropdown-label {
                padding: 0 !important;
            }
            .p-calendar.p-inputwrapper {
                display: flex;
                position: relative;
            }
            .p-calendar.p-inputwrapper .p-inputtext {
                border-top-right-radius: 0 !important;
                border-bottom-right-radius: 0 !important;
                border-right: none !important;
            }
            .p-calendar.p-inputwrapper .p-datepicker-trigger {
                border-top-left-radius: 0 !important;
                border-bottom-left-radius: 0 !important;
                background: #6366f1 !important;
                color: #ffffff !important;
                border: 1.5px solid #6366f1 !important;
                padding: 0 1.25rem !important;
                border-top-right-radius: 8px !important;
                border-bottom-right-radius: 8px !important;
            }
            .p-calendar.p-inputwrapper .p-datepicker-trigger:hover {
                background: #4f46e5 !important;
            }
            .custom-section-title {
                font-size: 0.875rem;
                font-weight: 700;
                letter-spacing: 0.05em;
                color: #6366f1;
                text-transform: uppercase;
                border-bottom: 1.5px solid #f1f5f9;
                padding-bottom: 0.5rem;
                margin-bottom: 1rem;
            }
        `}</style>
    );
}
