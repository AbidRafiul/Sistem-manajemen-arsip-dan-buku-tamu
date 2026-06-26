'use client';

import React, { useState, useEffect } from 'react';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Card } from 'primereact/card';
import { Dropdown } from 'primereact/dropdown';
import Link from 'next/link';
import axios from 'axios';

interface PurposeOption {
    id: string | number;
    name: string;
}

export default function VisitorBookingPage() {
    const [loading, setLoading] = useState(false);
    const [bookingSuccess, setBookingSuccess] = useState(false);
    const [visitCode, setVisitCode] = useState('');
    const [purposes, setPurposes] = useState<PurposeOption[]>([]);
    const [form, setForm] = useState<{
        GuestName: string;
        PhoneNumber: string;
        GuestCompany: string;
        CheckInTime: Date | null | undefined;
        VisitNotes: string;
        VisitPurposeId: string | number | null;
    }>({
        GuestName: '',
        PhoneNumber: '',
        GuestCompany: '',
        CheckInTime: undefined,
        VisitNotes: '',
        VisitPurposeId: null
    });

    useEffect(() => {
        const fetchPurposes = async () => {
            try {
                const response = await axios.post("http://localhost:8000/api/v1/buku_tamu/visit_data/purposes", {});
                if (response.data?.status === '00' && Array.isArray(response.data?.data)) {
                    setPurposes(response.data.data);
                }
            } catch (err) {
                console.error("Gagal memuat tujuan kunjungan:", err);
            }
        };
        fetchPurposes();
    }, []);

    const formatDateForBackend = (date: Date) => {
        const pad = (num: number) => String(num).padStart(2, '0');
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.GuestName || !form.PhoneNumber || !form.CheckInTime || !form.VisitPurposeId) {
            alert('Mohon isi semua field wajib (Nama, No. Telepon, Tujuan Kunjungan, dan Rencana Kunjungan)');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                ...form,
                CheckInTime: form.CheckInTime ? formatDateForBackend(form.CheckInTime) : ''
            };

            const response = await axios.post("http://localhost:8000/api/v1/buku_tamu/visit_booking", payload);

            if (response.data?.status === '00') {
                setVisitCode(response.data?.data?.kode_kunjungan || 'SUCCESS-QR');
                setBookingSuccess(true);
            } else {
                alert(response.data?.message || 'Gagal melakukan pendaftaran');
            }
        } catch (error: any) {
            alert(error?.response?.data?.message || 'Sistem sedang maintenance, silakan coba lagi nanti.');
        } finally {
            setLoading(false);
        }
    };

    if (bookingSuccess) {
        return (
            <div className="flex align-items-center justify-content-center min-h-screen bg-slate-50 p-3">
                <Card title="🎉 Pendaftaran Berhasil!" className="w-full max-w-md shadow-3 text-center border-round p-3">
                    <p className="text-slate-600 mb-4 font-medium text-sm">Silakan simpan atau screenshot kode kunjungan di bawah ini untuk ditunjukkan kepada resepsionis.</p>
                    <div className="p-3 bg-slate-100 border-round font-bold text-2xl text-primary mb-4 tracking-wider border-1 border-300">
                        {visitCode}
                    </div>
                    <div className="flex flex-column gap-2">
                        <Button label="Buat Pendaftaran Baru" icon="pi pi-plus" className="w-full" onClick={() => {
                            setBookingSuccess(false);
                            setForm({ GuestName: '', PhoneNumber: '', GuestCompany: '', CheckInTime: undefined, VisitNotes: '', VisitPurposeId: null });
                        }} />
                        <Link href="/visitor/status" className="w-full">
                            <Button label="Cek Status Kunjungan" icon="pi pi-search" className="w-full p-button-outlined" />
                        </Link>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex align-items-center justify-content-center min-h-screen bg-slate-50 p-3">
            <Card title="Form Pendaftaran Kunjungan Tamu" className="w-full max-w-md shadow-3 border-round p-2" subTitle="Silakan isi data rencana kunjungan Anda di bawah ini">
                <form onSubmit={handleSubmit} className="flex flex-column gap-3">
                    <div className="flex flex-column gap-1">
                        <label htmlFor="GuestName" className="font-semibold text-sm text-slate-700">Nama Lengkap *</label>
                        <InputText id="GuestName" value={form.GuestName} onChange={(e) => setForm({ ...form, GuestName: e.target.value || '' })} placeholder="Masukkan nama Anda" />
                    </div>

                    <div className="flex flex-column gap-1">
                        <label htmlFor="PhoneNumber" className="font-semibold text-sm text-slate-700">No. Telepon / WhatsApp *</label>
                        <InputText id="PhoneNumber" value={form.PhoneNumber} onChange={(e) => setForm({ ...form, PhoneNumber: e.target.value || '' })} placeholder="Contoh: 08123456789" />
                    </div>

                    <div className="flex flex-column gap-1">
                        <label htmlFor="GuestCompany" className="font-semibold text-sm text-slate-700">Instansi / Perusahaan</label>
                        <InputText id="GuestCompany" value={form.GuestCompany} onChange={(e) => setForm({ ...form, GuestCompany: e.target.value || '' })} placeholder="Nama instansi (opsional)" />
                    </div>

                    <div className="flex flex-column gap-1">
                        <label htmlFor="VisitPurposeId" className="font-semibold text-sm text-slate-700">Tujuan Kunjungan *</label>
                        <Dropdown id="VisitPurposeId" value={form.VisitPurposeId} options={purposes} onChange={(e) => setForm({ ...form, VisitPurposeId: e.value })} optionLabel="name" optionValue="id" placeholder="Pilih tujuan kunjungan" className="w-full" />
                    </div>

                    <div className="flex flex-column gap-1">
                        <label htmlFor="CheckInTime" className="font-semibold text-sm text-slate-700">Tanggal & Waktu Rencana Kunjungan *</label>
                        <Calendar id="CheckInTime" value={form.CheckInTime} onChange={(e) => setForm({ ...form, CheckInTime: e.value })} showTime hourFormat="24" placeholder="Pilih tanggal dan jam" showIcon />
                    </div>

                    <div className="flex flex-column gap-1">
                        <label htmlFor="VisitNotes" className="font-semibold text-sm text-slate-700">Catatan / Keperluan Kunjungan</label>
                        <InputTextarea id="VisitNotes" value={form.VisitNotes} onChange={(e) => setForm({ ...form, VisitNotes: e.target.value || '' })} rows={3} placeholder="Tulis keperluan kunjungan Anda..." />
                    </div>

                    <div className="flex flex-column gap-2 mt-2">
                        <Button label="Daftar Kunjungan" icon="pi pi-check" type="submit" loading={loading} className="w-full" />
                        <Link href="/visitor/status" className="w-full text-center">
                            <span className="text-sm font-semibold text-primary hover:underline cursor-pointer block py-1">Sudah punya kode kunjungan? Cek Status di Sini</span>
                        </Link>
                    </div>
                </form>
            </Card>
        </div>
    );
}