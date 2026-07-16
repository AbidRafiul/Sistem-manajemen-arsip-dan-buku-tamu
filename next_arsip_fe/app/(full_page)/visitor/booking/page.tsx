'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { showError } from '@/lib/tools/generalTools';
import Link from 'next/link';
import axios from 'axios';
import VisitorBookingForm from './components/display/form';
import { VisitorBookingFormData } from './components/interfaces';

interface PurposeOption {
    id: string | number;
    name: string;
}

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
                const response = await axios.post("http://localhost:8000/api/v1/buku_tamu/visit_data/purposes", {});
                if (response.data?.status === '00' && Array.isArray(response.data?.data)) {
                    setPurposes(response.data.data);
                }
            } catch (err) {
                console.error("Gagal memuat tujuan kunjungan:", err);
            }
        };
        const fetchBranches = async () => {
            try {
                const response = await axios.post("http://localhost:8000/api/v1/buku_tamu/visit_data/branches", {});
                if (response.data?.status === '00' && Array.isArray(response.data?.data)) {
                    setBranches(response.data.data);
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
            const response = await axios.post("http://localhost:8000/api/v1/buku_tamu/visit_data/users", { id_cabang: branchId });
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
            formData.append('GuestName', form.nama_tamu);
            formData.append('PhoneNumber', form.nomor_telepon);
            formData.append('GuestEmail', form.email_tamu || '');
            formData.append('GuestCompany', form.instansi_tamu || '-');
            formData.append('VisitPurposeId', String(form.id_tujuan_kunjungan));
            formData.append('BranchId', String(form.id_cabang));
            formData.append('id_cabang', String(form.id_cabang));
            formData.append('CheckInTime', form.waktu_masuk ? formatDateForBackend(form.waktu_masuk) : '');
            formData.append('VisitNotes', form.catatan_kunjungan || '');
            formData.append('IdentityType', form.jenis_identitas || '');
            formData.append('IdentityNumber', form.nomor_identitas || '');
            formData.append('HostName', form.nama_host || '');
            formData.append('VisitType', form.visit_type || 'personal');
            formData.append('GuestCount', String(form.guest_count || 1));
            if (form.signature_data) {
                formData.append('SignatureData', form.signature_data);
            }

            if (form.visit_type === 'group' && form.group_members && form.group_members.length > 0) {
                const membersToSend = form.group_members.map((m) => ({
                    name: m.name,
                    phone: m.phone,
                    idNumber: m.idNumber,
                }));
                formData.append('GroupMembers', JSON.stringify(membersToSend));

                form.group_members.forEach((member, index) => {
                    if (member.identityFile) {
                        formData.append(`MemberIdentityFile_${index}`, member.identityFile);
                    }
                });
            }

            if (identityFile) formData.append('IdentityFile', identityFile);
            if (selfieFile) formData.append('SelfieFile', selfieFile);

            const response = await axios.post("http://localhost:8000/api/v1/buku_tamu/visit_booking", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

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
                <div className="flex align-items-center justify-content-center min-h-screen py-5 px-3" style={{ background: 'linear-gradient(135deg, #f1f5f9 0%, #cbd5e1 100%)' }}>
                    <style jsx>{`
                    .ticket-card {
                        background: #ffffff;
                        border-radius: 20px;
                        box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
                        width: 100%;
                        max-width: 450px;
                        overflow: hidden;
                        border: none;
                    }
                    .ticket-header {
                        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                        color: #ffffff;
                        padding: 2rem 1.5rem;
                        text-align: center;
                    }
                    .ticket-body {
                        padding: 1.5rem;
                    }
                    .ticket-stub-line {
                        border-top: 2.5px dashed #e2e8f0;
                        position: relative;
                        margin: 1.5rem 0;
                    }
                    .ticket-stub-line::before {
                        content: '';
                        position: absolute;
                        left: -26px;
                        top: -11px;
                        width: 20px;
                        height: 20px;
                        background: #cbd5e1;
                        border-radius: 50%;
                    }
                    .ticket-stub-line::after {
                        content: '';
                        position: absolute;
                        right: -26px;
                        top: -11px;
                        width: 20px;
                        height: 20px;
                        background: #cbd5e1;
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
                `}</style>

                    <div className="ticket-card">
                        {/* Header */}
                        <div className="ticket-header">
                            <div className="inline-flex align-items-center justify-content-center border-circle mb-2" style={{ background: 'rgba(255, 255, 255, 0.2)', width: '60px', height: '60px' }}>
                                <i className="pi pi-check-circle text-3xl text-white" />
                            </div>
                            <h2 className="m-0 text-xl font-bold text-white">Pendaftaran Berhasil!</h2>
                            <p className="m-0 mt-1 text-white-alpha-80 text-xs">Rencana kunjungan Anda telah dijadwalkan</p>
                        </div>

                        <div className="ticket-body">
                            {/* Summary Details */}
                            <div className="px-2 mb-2">
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
                                    <span className="ticket-detail-value">
                                        {form.waktu_masuk ? form.waktu_masuk.toLocaleString('id-ID', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        }) : '-'}
                                    </span>
                                </div>
                            </div>

                            {/* Dashed Line separator with physical ticket cutout holes */}
                            <div className="ticket-stub-line" />

                            {/* Digital Ticket Block */}
                            <div className="text-center">
                                <span className="text-xs text-500 font-bold uppercase tracking-wider block mb-2" style={{ color: '#64748b' }}>KODE KUNJUNGAN TAMU</span>
                                <div className="font-bold text-3xl text-primary tracking-widest my-2 uppercase select-all" style={{ color: '#4f46e5' }}>
                                    {visitCode}
                                </div>

                                {/* Simulated Barcode */}
                                <div className="flex justify-content-center align-items-center gap-1 my-3 opacity-60">
                                    {[2, 1, 4, 1, 3, 2, 1, 4, 1, 2, 3, 1, 4, 2, 1, 3, 2, 1, 4, 1, 2, 3, 1, 4].map((width, idx) => (
                                        <div key={idx} className="bg-900" style={{ width: `${width}px`, height: '35px' }} />
                                    ))}
                                </div>

                                <p className="text-xs text-500 line-height-3 mb-4 mt-2 px-3" style={{ color: '#64748b' }}>
                                    Tunjukkan kode / barcode ini kepada resepsionis saat Anda check-in di lokasi kedatangan.
                                </p>

                                <div className="flex flex-column gap-2 mt-3">
                                    <Button
                                        label="Buat Pendaftaran Baru"
                                        icon="pi pi-plus"
                                        className="w-full font-bold py-3 border-round-lg text-sm text-white"
                                        style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', border: 'none' }}
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
                                            className="w-full font-semibold py-3 border-round-lg text-sm"
                                            style={{ borderColor: '#6366f1', color: '#6366f1' }}
                                        />
                                    </Link>
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

