'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { showError, showSuccess } from '@/lib/tools/generalTools';
import Link from 'next/link';
import postData from '@/lib/axios/postData';
import formUpload from '@/lib/axios/formData';
import VisitorBookingForm from './components/display/form';
import { VisitorBookingFormData } from './components/interfaces';

interface PurposeOption {
    id: string | number;
    name: string;
}

interface BranchRaw {
    id: number;
    name: string;
    id_induk: number | null;
}

const groupBranches = (list: BranchRaw[]): any[] => {
    const pusat: any[] = [];
    const cabang: any[] = [];
    const unit: any[] = [];

    const sortedList = [...list].sort((a, b) => a.name.localeCompare(b.name));

    for (const item of sortedList) {
        const lowerName = item.name.toLowerCase();
        if (lowerName.includes('kecamatan') || lowerName.includes('unit')) {
            unit.push({ id: item.id, name: item.name });
        } else if (lowerName.includes('pusat')) {
            pusat.push({ id: item.id, name: item.name });
        } else {
            cabang.push({ id: item.id, name: item.name });
        }
    }

    const groups: any[] = [];
    if (pusat.length > 0) {
        groups.push({
            label: 'Kantor Pusat',
            items: pusat
        });
    }
    if (cabang.length > 0) {
        groups.push({
            label: 'Kantor Cabang',
            items: cabang
        });
    }
    if (unit.length > 0) {
        groups.push({
            label: 'Unit / Kecamatan',
            items: unit
        });
    }

    return groups;
};

export default function VisitorBookingPage() {
    const toast = useRef<Toast>(null);
    const [loading, setLoading] = useState(false);
    const [bookingSuccess, setBookingSuccess] = useState(false);
    const [visitCode, setVisitCode] = useState('');
    const [purposes, setPurposes] = useState<PurposeOption[]>([]);
    const [branches, setBranches] = useState<any[]>([]);
    const [hosts, setHosts] = useState<any[]>([]);

    const [identityFile, setIdentityFile] = useState<File | null>(null);
    const [selfieFile, setSelfieFile] = useState<File | null>(null);

    const [form, setForm] = useState<VisitorBookingFormData>({
        nama_tamu: '',
        nomor_telepon: '',
        email_tamu: '',
        instansi_tamu: '',
        jenis_identitas: null,
        nomor_identitas: '',
        id_tujuan_kunjungan: null,
        id_cabang: null,
        id_user_host: null,
        nama_host: '',
        catatan_kunjungan: '',
        waktu_masuk: undefined,
        visit_type: 'personal',
        guest_count: 1,
        signature_data: null,
        group_members: []
    });

    useEffect(() => {
        const fetchPurposes = async () => {
            try {
                const response = await postData("/buku_tamu/visit_data/purposes", {});
                if (response.data?.status === '00' && Array.isArray(response.data?.data)) {
                    setPurposes(response.data.data);
                }
            } catch (err) {
                console.error("Gagal memuat tujuan kunjungan:", err);
            }
        };
        const fetchBranches = async () => {
            try {
                const response = await postData("/buku_tamu/visit_data/branches", {});
                if (response.data?.status === '00' && Array.isArray(response.data?.data)) {
                    const formatted = groupBranches(response.data.data);
                    setBranches(formatted);
                }
            } catch (err) {
                console.error("Gagal memuat daftar cabang:", err);
            }
        };
        fetchPurposes();
        fetchBranches();
    }, []);

    const fetchHosts = async (branchId: number | null) => {
        if (!branchId) {
            setHosts([]);
            return;
        }
        try {
            const response = await postData("/buku_tamu/visit_data/users", { id_cabang: branchId });
            if (response.data?.status === '00' && Array.isArray(response.data?.data)) {
                setHosts(response.data.data);
            }
        } catch (err) {
            console.error("Gagal memuat daftar pegawai:", err);
        }
    };

    const handleChange = (field: string, value: any) => {
        if (field === 'id_cabang') {
            setForm((prev) => ({
                ...prev,
                id_cabang: value,
                id_user_host: null,
                nama_host: ''
            }));
            fetchHosts(value);
        } else {
            setForm((prev) => ({ ...prev, [field]: value }));
        }
    };

    const formatDateForBackend = (date: Date) => {
        const pad = (num: number) => String(num).padStart(2, '0');
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    };

    const handleReset = () => {
        setHosts([]);
        setForm({
            nama_tamu: '',
            nomor_telepon: '',
            email_tamu: '',
            instansi_tamu: '',
            jenis_identitas: null,
            nomor_identitas: '',
            id_tujuan_kunjungan: null,
            id_cabang: null,
            id_user_host: null,
            nama_host: '',
            catatan_kunjungan: '',
            waktu_masuk: undefined,
            visit_type: 'personal',
            guest_count: 1,
            signature_data: null,
            group_members: []
        });
        setIdentityFile(null);
        setSelfieFile(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.nama_tamu || !form.nomor_telepon || !form.waktu_masuk || !form.id_tujuan_kunjungan || !form.id_cabang) {
            showError(toast, 'Mohon isi semua field wajib (Nama, No. Telepon, Kantor Tujuan, Tujuan Kunjungan, dan Rencana Kunjungan)');
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('nama_tamu', form.nama_tamu);
            formData.append('nomor_telepon', form.nomor_telepon);
            formData.append('email_tamu', form.email_tamu || '');
            formData.append('instansi_tamu', form.instansi_tamu || '-');
            formData.append('id_tujuan_kunjungan', String(form.id_tujuan_kunjungan));
            formData.append('id_cabang', String(form.id_cabang));
            formData.append('waktu_masuk', form.waktu_masuk ? formatDateForBackend(form.waktu_masuk) : '');
            formData.append('catatan_kunjungan', form.catatan_kunjungan || '');
            formData.append('jenis_identitas', form.jenis_identitas || '');
            formData.append('nomor_identitas', form.nomor_identitas || '');
            formData.append('nama_host', form.nama_host || '');
            formData.append('tipe_kunjungan', form.visit_type || 'personal');
            formData.append('jumlah_tamu', String(form.guest_count || 1));
            formData.append('status_persetujuan', 'pending');
            if (form.signature_data) {
                formData.append('tanda_tangan_data', form.signature_data);
            }

            if (form.visit_type === 'group' && form.group_members && form.group_members.length > 0) {
                const membersToSend = form.group_members.map((m) => ({
                    name: m.name,
                    phone: m.phone,
                    idNumber: m.idNumber,
                }));
                formData.append('anggota_rombongan', JSON.stringify(membersToSend));

                form.group_members.forEach((member, index) => {
                    if (member.identityFile) {
                        formData.append(`foto_identitas_anggota_${index}`, member.identityFile);
                    }
                });
            }

            if (identityFile) formData.append('foto_identitas', identityFile);
            if (selfieFile) formData.append('foto_wajah', selfieFile);

            const response = await formUpload("/buku_tamu/visit_booking", formData);

            if (response.data?.status === '00') {
                setVisitCode(response.data?.data?.kode_kunjungan || 'SUCCESS-QR');
                setBookingSuccess(true);
            } else {
                showError(toast, response.data?.message || 'Gagal melakukan pendaftaran');
            }
        } catch (error: any) {
            showError(toast, error?.response?.data?.message || 'Sistem sedang maintenance, silakan coba lagi nanti.');
        } finally {
            setLoading(false);
        }
    };

    if (bookingSuccess) {
        return (
            <>
                <Toast ref={toast} />
                <div 
                    className="flex flex-column align-items-center justify-content-center min-h-screen py-6 px-3 relative overflow-hidden" 
                    style={{ 
                        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 40%, #0f172a 100%)',
                        color: '#334155'
                    }}
                >
                    {/* Ambient glowing background spheres */}
                    <div 
                        className="absolute border-circle pointer-events-none opacity-20 filter blur-3xl"
                        style={{
                            width: '400px',
                            height: '400px',
                            background: 'radial-gradient(circle, #10b981 0%, transparent 70%)',
                            top: '-100px',
                            right: '-100px'
                        }}
                    />
                    <div 
                        className="absolute border-circle pointer-events-none opacity-20 filter blur-3xl"
                        style={{
                            width: '350px',
                            height: '350px',
                            background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)',
                            bottom: '-80px',
                            left: '-80px'
                        }}
                    />

                    <style jsx>{`
                        .ticket-card {
                            background: #ffffff;
                            border-radius: 24px;
                            box-shadow: 0 20px 45px rgba(0, 0, 0, 0.25);
                            width: 100%;
                            max-width: 460px;
                            overflow: hidden;
                            border: none;
                        }
                        .ticket-header {
                            background: linear-gradient(135deg, #059669 0%, #10b981 100%);
                            color: #ffffff;
                            padding: 2rem 1.5rem;
                            text-align: center;
                        }
                        .ticket-body {
                            padding: 1.5rem;
                        }
                        .ticket-stub-line {
                            border-top: 2.5px dashed #cbd5e1;
                            position: relative;
                            margin: 1.5rem 0;
                        }
                        .ticket-stub-line::before {
                            content: '';
                            position: absolute;
                            left: -28px;
                            top: -11px;
                            width: 22px;
                            height: 22px;
                            background: #1e1b4b;
                            border-radius: 50%;
                        }
                        .ticket-stub-line::after {
                            content: '';
                            position: absolute;
                            right: -28px;
                            top: -11px;
                            width: 22px;
                            height: 22px;
                            background: #1e1b4b;
                            border-radius: 50%;
                        }
                        .ticket-detail-row {
                            display: flex;
                            justify-content: space-between;
                            margin-bottom: 0.75rem;
                            font-size: 0.85rem;
                        }
                        .ticket-detail-label {
                            color: #64748b;
                            font-weight: 500;
                        }
                        .ticket-detail-value {
                            color: #1e293b;
                            font-weight: 600;
                            text-align: right;
                        }
                        .animate-fade-in {
                            animation: fadeIn 0.4s ease-out forwards;
                        }
                        @keyframes fadeIn {
                            from {
                                opacity: 0;
                                transform: translateY(12px);
                            }
                            to {
                                opacity: 1;
                                transform: translateY(0);
                            }
                        }
                    `}</style>

                    <div className="w-full flex flex-column gap-4 relative z-1 align-items-center" style={{ maxWidth: '460px' }}>

                        {/* BRAND LOGO HEADER */}
                        <div className="flex flex-column align-items-center text-center mb-1">
                            <div className="flex align-items-center gap-2 mb-1">
                                <div 
                                    className="flex align-items-center justify-content-center border-round-xl shadow-4"
                                    style={{ 
                                        width: '42px', 
                                        height: '42px', 
                                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                        boxShadow: '0 8px 20px rgba(16, 185, 129, 0.35)'
                                    }}
                                >
                                    <i className="pi pi-shield text-xl text-white font-bold" />
                                </div>
                                <span className="font-black text-2xl tracking-wide text-white" style={{ letterSpacing: '0.05em' }}>ARSIPKU</span>
                            </div>
                            <span className="text-xs uppercase font-bold tracking-widest text-emerald-200 opacity-80" style={{ letterSpacing: '0.15em' }}>Sistem Manajemen Buku Tamu</span>
                        </div>

                        <div className="ticket-card animate-fade-in shadow-6">
                            {/* Header */}
                            <div className="ticket-header relative overflow-hidden">
                                <div className="inline-flex align-items-center justify-content-center border-circle mb-2 shadow-2" style={{ background: 'rgba(255, 255, 255, 0.2)', width: '56px', height: '56px' }}>
                                    <i className="pi pi-check text-2xl font-black text-white" />
                                </div>
                                <h2 className="m-0 text-xl font-black text-white">Pendaftaran Berhasil!</h2>
                                <p className="m-0 mt-1 text-white-alpha-90 text-xs">Rencana kunjungan Anda telah dijadwalkan</p>
                            </div>

                            <div className="ticket-body">
                                {/* Summary Details */}
                                <div className="px-1">
                                    <div className="ticket-detail-row">
                                        <span className="ticket-detail-label">Nama Tamu</span>
                                        <span className="ticket-detail-value">{form.nama_tamu}</span>
                                    </div>
                                    <div className="ticket-detail-row">
                                        <span className="ticket-detail-label">Instansi</span>
                                        <span className="ticket-detail-value">{form.instansi_tamu || '-'}</span>
                                    </div>
                                    <div className="ticket-detail-row">
                                        <span className="ticket-detail-label">Pegawai</span>
                                        <span className="ticket-detail-value">{form.nama_host || '-'}</span>
                                    </div>
                                    <div className="ticket-detail-row">
                                        <span className="ticket-detail-label">Waktu Kedatangan</span>
                                        <span className="ticket-detail-value font-bold text-emerald-600">
                                            {form.waktu_masuk ? form.waktu_masuk.toLocaleString('id-ID', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            }) + ' WIB' : '-'}
                                        </span>
                                    </div>
                                </div>

                                {/* Dashed Line separator with physical ticket cutout holes */}
                                <div className="ticket-stub-line" />

                                {/* Digital Ticket Block */}
                                <div className="text-center px-1">
                                    <span className="text-xs text-500 font-bold uppercase tracking-wider block mb-2" style={{ color: '#64748b', letterSpacing: '0.05em' }}>KODE KUNJUNGAN TAMU</span>
                                    
                                    <div className="flex align-items-center justify-content-center gap-2 my-2">
                                        <div 
                                            className="font-black text-3xl tracking-widest uppercase select-all px-3 py-1 border-round-xl" 
                                            style={{ color: '#1e1b4b', background: '#eff6ff', border: '1px solid #bfdbfe' }}
                                        >
                                            {visitCode}
                                        </div>
                                        <Button 
                                            icon="pi pi-copy" 
                                            className="p-button-rounded p-button-text p-button-sm text-indigo-600 p-button-outlined"
                                            style={{ borderColor: '#c7d2fe', background: '#f5f3ff' }}
                                            tooltip="Salin Kode"
                                            tooltipOptions={{ position: 'top' }}
                                            onClick={() => {
                                                if (navigator.clipboard) {
                                                    navigator.clipboard.writeText(visitCode);
                                                    showSuccess(toast, 'Kode Kunjungan berhasil disalin!');
                                                }
                                            }}
                                        />
                                    </div>

                                    {/* Simulated Barcode Visual */}
                                    <div className="flex justify-content-center align-items-center gap-1 my-3 opacity-75 w-full">
                                        {[2, 1, 4, 1, 3, 2, 1, 4, 1, 2, 3, 1, 4, 2, 1, 3, 2, 1, 4, 1, 2, 3, 1, 4].map((width, idx) => (
                                            <div key={idx} className="bg-900" style={{ width: `${width}px`, height: '32px' }} />
                                        ))}
                                    </div>

                                    <p className="text-xs text-500 line-height-3 mb-4 mt-2 px-1" style={{ color: '#64748b' }}>
                                        Simpan kode di atas atau tunjukkan kepada petugas resepsionis saat Anda tiba di lokasi kedatangan.
                                    </p>

                                    <div className="flex flex-column gap-2 mt-3">
                                        <Button
                                            label="Buat Pendaftaran Baru"
                                            icon="pi pi-plus"
                                            className="w-full font-bold py-3 border-round-xl text-sm text-white transition-all transition-duration-150"
                                            style={{ 
                                                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', 
                                                border: 'none',
                                                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.35)'
                                            }}
                                            onClick={() => {
                                                setBookingSuccess(false);
                                                handleReset();
                                            }}
                                        />
                                        <Link href="/visitor/status" className="w-full no-underline">
                                            <Button
                                                label="Cek Status Kunjungan"
                                                icon="pi pi-search"
                                                outlined
                                                className="w-full font-bold py-3 border-round-xl text-sm transition-all transition-duration-150"
                                                style={{ borderColor: '#6366f1', color: '#4f46e5' }}
                                            />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Toast ref={toast} />
            <div className="min-h-screen flex flex-column lg:flex-row bg-50">
                {/* PANEL KIRI: Banner Selamat Datang (Sticky pada Desktop) */}
                <div className="col-12 lg:col-5 flex flex-column justify-content-between p-5 md:p-6 lg:h-screen lg:sticky top-0 overflow-y-auto text-white" style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)' }}>
                    <div className="flex align-items-center gap-3">
                        <div className="flex align-items-center justify-content-center border-circle" style={{ background: 'rgba(255, 255, 255, 0.15)', width: '45px', height: '45px' }}>
                            <i className="pi pi-shield text-xl text-white" />
                        </div>
                        <span className="font-extrabold text-xl tracking-tight" style={{ color: '#ffffff' }}>Arsipku</span>
                    </div>

                    <div className="my-5 lg:my-0">
                        <h1 className="text-4xl lg:text-5xl font-extrabold line-height-2 mb-3" style={{ color: '#ffffff' }}>
                            Registrasi Kunjungan Tamu
                        </h1>
                        <p className="text-sm lg:text-base line-height-3 mb-5 max-w-lg" style={{ color: '#cbd5e1' }}>
                            Silakan buat janji temu / booking kedatangan Anda ke kantor kami. Proses ini cepat, aman, dan membantu kami memberikan layanan terbaik saat Anda tiba di lokasi.
                        </p>

                        {/* ALUR REGISTRASI */}
                        <div className="flex flex-column gap-4">
                            <div className="flex align-items-start gap-3">
                                <div className="flex align-items-center justify-content-center border-circle bg-indigo-500 text-white font-bold text-sm" style={{ width: '28px', height: '28px', minWidth: '28px' }}>1</div>
                                <div>
                                    <h4 className="font-bold m-0 mb-1 text-sm lg:text-base" style={{ color: '#ffffff' }}>Isi Data Kunjungan</h4>
                                    <p className="text-xs lg:text-sm m-0" style={{ color: '#94a3b8' }}>Lengkapi formulir profil dan rencana waktu kedatangan Anda.</p>
                                </div>
                            </div>
                            <div className="flex align-items-start gap-3">
                                <div className="flex align-items-center justify-content-center border-circle bg-indigo-500 text-white font-bold text-sm" style={{ width: '28px', height: '28px', minWidth: '28px' }}>2</div>
                                <div>
                                    <h4 className="font-bold m-0 mb-1 text-sm lg:text-base" style={{ color: '#ffffff' }}>Dapatkan Kode Booking</h4>
                                    <p className="text-xs lg:text-sm m-0" style={{ color: '#94a3b8' }}>Setelah pendaftaran berhasil, Anda akan menerima kode kunjungan unik.</p>
                                </div>
                            </div>
                            <div className="flex align-items-start gap-3">
                                <div className="flex align-items-center justify-content-center border-circle bg-indigo-500 text-white font-bold text-sm" style={{ width: '28px', height: '28px', minWidth: '28px' }}>3</div>
                                <div>
                                    <h4 className="font-bold m-0 mb-1 text-sm lg:text-base" style={{ color: '#ffffff' }}>Tunjukkan Kode Saat Tiba</h4>
                                    <p className="text-xs lg:text-sm m-0" style={{ color: '#94a3b8' }}>Tunjukkan kode kunjungan kepada resepsionis saat check-in di lokasi.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="text-xs mt-5 lg:mt-0 pt-4 border-top-1 border-white-alpha-10" style={{ color: '#64748b' }}>
                        &copy; 2026 Arsipku. Sistem Manajemen Arsip & Buku Tamu.
                    </div>
                </div>

                {/* PANEL KANAN: Formulir Kunjungan (Scrollable secara Mandiri) */}
                <div className="col-12 lg:col-7 flex align-items-center justify-content-center p-4 sm:p-5 md:p-6" style={{ background: '#f8fafc' }}>
                    <div className="w-full bg-white border-round-2xl shadow-2 p-4 sm:p-5" style={{ maxWidth: '640px' }}>
                        <div className="mb-4">
                            <h2 className="text-2xl font-bold text-900 mb-1">Formulir Pendaftaran</h2>
                            <p className="text-600 text-sm m-0">Lengkapi data rencana kedatangan Anda di bawah ini.</p>
                        </div>

                        <VisitorBookingForm
                            form={form}
                            handleChange={handleChange}
                            identityFile={identityFile}
                            selfieFile={selfieFile}
                            setIdentityFile={setIdentityFile}
                            setSelfieFile={setSelfieFile}
                            purposes={purposes}
                            branches={branches}
                            hosts={hosts}
                            loading={loading}
                            handleSubmit={handleSubmit}
                            handleReset={handleReset}
                        />

                        {/* Status Link */}
                        <div className="text-center mt-4 pt-3 border-top-1 border-100">
                            <Link href="/visitor/status" className="no-underline">
                                <span className="text-sm font-semibold text-primary hover:underline cursor-pointer block py-2 border-round hover:bg-blue-50 transition-all transition-duration-150">
                                    Sudah punya kode kunjungan? Cek Status di Sini
                                </span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

