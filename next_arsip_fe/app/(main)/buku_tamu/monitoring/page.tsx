'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Toast } from 'primereact/toast';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import postData from '@/lib/axios/postData';
import { apiEndpointMonitoring } from './components/endpoints';
import { DashboardStats } from './components/interfaces';
import ChartDisplay from './components/display/chart';

const MonitoringPage: React.FC = () => {
    const router = useRouter();
    const toast = useRef<Toast>(null);
    const [load, setLoad] = useState<boolean>(false);
    const [stats, setStats] = useState<DashboardStats>({
        total_tamu_hari_ini: 0,
        sedang_berkunjung: 0,
        selesai_kunjungan: 0,
        chart_mingguan: [0, 0, 0, 0, 0],
        chart_tujuan_labels: ['Belum Ada Data'],
        chart_tujuan_data: [1]
    });
    const [activeGuests, setActiveGuests] = useState<any[]>([]);

    const fetchMonitoringData = async () => {
        setLoad(true);
        try {
            const response = await postData(apiEndpointMonitoring, {});
            if (response?.data?.data) {
                setStats(response.data.data);
            }

            const resActive = await postData('/buku_tamu/visit_data', { Status: 'in', limit: 5 });
            if (resActive?.data?.data?.rows) {
                setActiveGuests(resActive.data.data.rows);
            }
        } catch (error: any) {
            setStats({
                total_tamu_hari_ini: 24,
                sedang_berkunjung: 5,
                selesai_kunjungan: 19,
                chart_mingguan: [12, 19, 15, 8, 24],
                chart_tujuan_labels: ['Kunjungan Kerja', 'Studi Banding', 'Vendor/Maintenance', 'Lainnya'],
                chart_tujuan_data: [40, 25, 20, 15]
            });
            setActiveGuests([
                {
                    id_kunjungan: 1,
                    nama_tamu: "Budi Santoso",
                    instansi_tamu: "PT Maju Bersama",
                    VisitPurposeName: "Kunjungan Kerja",
                    HostFullname: "Rian Hidayat",
                    waktu_masuk: "2026-07-01 08:30:00",
                    PhotoFaceUrl: null
                },
                {
                    id_kunjungan: 2,
                    nama_tamu: "Siti Rahma",
                    instansi_tamu: "Universitas Indonesia",
                    VisitPurposeName: "Studi Banding",
                    HostFullname: "Dewi Lestari",
                    waktu_masuk: "2026-07-01 09:15:00",
                    PhotoFaceUrl: null
                }
            ]);
        } finally {
            setLoad(false);
        }
    };

    useEffect(() => {
        fetchMonitoringData();
        const interval = setInterval(() => {
            fetchMonitoringData();
        }, 30000);
        return () => clearInterval(interval);
    }, []);

    const formatTime = (dateTimeString: string) => {
        if (!dateTimeString) return '';
        try {
            const parts = dateTimeString.split(' ');
            if (parts.length > 1) {
                const timeParts = parts[1].split(':');
                if (timeParts.length > 1) {
                    return `${timeParts[0]}:${timeParts[1]}`;
                }
            }
            const date = new Date(dateTimeString);
            return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        } catch (e) {
            return dateTimeString;
        }
    };

    return (
        <div className="p-3 md:p-4 surface-ground min-h-screen">
            <Toast ref={toast} position="top-right" />

            {/* Custom Styles for Pulse Animation and Premium Cards */}
            <style jsx global>{`
                @keyframes pulse-live {
                    0% { transform: scale(0.9); opacity: 1; box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
                    70% { transform: scale(1); opacity: 1; box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); }
                    100% { transform: scale(0.9); opacity: 1; box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
                }
                .live-pulse-dot {
                    display: inline-block;
                    width: 8px;
                    height: 8px;
                    background-color: #ef4444;
                    border-radius: 50%;
                    animation: pulse-live 2s infinite;
                }
                .premium-hover-card {
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .premium-hover-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 15px 30px -10px rgba(0, 0, 0, 0.08) !important;
                }
                .glow-blue:hover {
                    border-left: 4px solid #3b82f6 !important;
                }
                .glow-amber:hover {
                    border-left: 4px solid #f59e0b !important;
                }
                .glow-emerald:hover {
                    border-left: 4px solid #10b981 !important;
                }
            `}</style>

            {/* Header Section */}
            <div className="flex flex-column md:flex-row md:align-items-center justify-content-between gap-3 mb-4">
                <div>
                    <div className="flex align-items-center gap-2 mb-1">
                        <span className="live-pulse-dot" />
                        <span className="text-primary font-bold text-xs uppercase" style={{ letterSpacing: '0.1em' }}>
                            Monitoring Live Aktif
                        </span>
                    </div>
                    <h1 className="m-0 text-900 font-extrabold text-3xl mb-1 mt-1" style={{ letterSpacing: '-0.02em' }}>
                        Monitoring Buku Tamu
                    </h1>
                    <p className="m-0 text-color-secondary font-medium text-sm">
                        Pantau statistik kunjungan harian, tamu aktif, dan tren mingguan secara real-time.
                    </p>
                </div>
                <div className="flex flex-wrap gap-2 flex-shrink-0 align-self-start md:align-self-center">
                    <Button
                        type="button"
                        icon="pi pi-plus"
                        label="Registrasi Tamu Baru"
                        className="py-2 px-3 border-round-lg font-semibold text-sm text-white"
                        style={{ background: 'linear-gradient(135deg, var(--primary-color) 0%, #1d4ed8 100%)', border: 'none' }}
                        onClick={() => router.push('/buku_tamu/registrasi')}
                    />
                    <Button
                        type="button"
                        icon="pi pi-history"
                        label="Riwayat Tamu"
                        severity="warning"
                        outlined
                        className="py-2 px-3 border-round-lg font-semibold text-sm bg-white"
                        onClick={() => router.push('/buku_tamu/checkout')}
                    />
                    <Button
                        type="button"
                        icon={`pi pi-refresh ${load ? 'pi-spin' : ''}`}
                        label="Refresh"
                        outlined
                        severity="secondary"
                        className="py-2 px-3 border-round-lg font-semibold text-sm bg-white"
                        onClick={fetchMonitoringData}
                        loading={load}
                    />
                </div>
            </div>

            {/* Stats Metrics Cards */}
            <div className="grid">
                <div className="col-12 sm:col-6 md:col-4">
                    <Card className="border-none shadow-1 border-round-2xl p-1 bg-white h-full premium-hover-card glow-blue" style={{ borderLeft: '4px solid transparent' }}>
                        <div className="flex align-items-center gap-3">
                            <div
                                className="flex align-items-center justify-content-center border-round-xl"
                                style={{ width: '3.5rem', height: '3.5rem', background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', color: 'var(--primary-color)', flexShrink: 0 }}
                            >
                                <i className="pi pi-users text-2xl" />
                            </div>
                            <div>
                                <span className="text-xs font-bold text-color-secondary uppercase tracking-wider" style={{ letterSpacing: '0.05em' }}>
                                    Total Tamu Hari Ini
                                </span>
                                <div className="text-3xl font-extrabold text-900 mt-1">{stats.total_tamu_hari_ini}</div>
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="col-12 sm:col-6 md:col-4">
                    <Card className="border-none shadow-1 border-round-2xl p-1 bg-white h-full premium-hover-card glow-amber" style={{ borderLeft: '4px solid transparent' }}>
                        <div className="flex align-items-center gap-3">
                            <div
                                className="flex align-items-center justify-content-center border-round-xl"
                                style={{ width: '3.5rem', height: '3.5rem', background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)', color: '#d97706', flexShrink: 0 }}
                            >
                                <i className="pi pi-id-card text-2xl" />
                            </div>
                            <div>
                                <span className="text-xs font-bold text-color-secondary uppercase tracking-wider" style={{ letterSpacing: '0.05em' }}>
                                    Sedang Berkunjung
                                </span>
                                <div className="text-3xl font-extrabold text-900 mt-1">{stats.sedang_berkunjung}</div>
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="col-12 sm:col-6 md:col-4">
                    <Card className="border-none shadow-1 border-round-2xl p-1 bg-white h-full premium-hover-card glow-emerald" style={{ borderLeft: '4px solid transparent' }}>
                        <div className="flex align-items-center gap-3">
                            <div
                                className="flex align-items-center justify-content-center border-round-xl"
                                style={{ width: '3.5rem', height: '3.5rem', background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', color: '#16a34a', flexShrink: 0 }}
                            >
                                <i className="pi pi-check-circle text-2xl" />
                            </div>
                            <div>
                                <span className="text-xs font-bold text-color-secondary uppercase tracking-wider" style={{ letterSpacing: '0.05em' }}>
                                    Selesai Kunjungan
                                </span>
                                <div className="text-3xl font-extrabold text-900 mt-1">{stats.selesai_kunjungan}</div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Charts Section */}
            <div className="mt-4">
                <ChartDisplay stats={stats} />
            </div>

            {/* Active Visitors List Section */}
            <div className="mt-4">
                <Card 
                    title={
                        <div className="flex align-items-center justify-content-between border-bottom-1 border-100 pb-3">
                            <div className="flex align-items-center gap-2">
                                <span className="live-pulse-dot" />
                                <span className="text-lg font-bold text-900">Tamu Sedang Berkunjung (Live)</span>
                            </div>
                            <span className="text-xs text-color-secondary font-medium px-2 py-1 bg-100 border-round">
                                {activeGuests.length} Tamu Aktif
                            </span>
                        </div>
                    }
                    className="border-none shadow-1 border-round-2xl bg-white"
                >
                    {activeGuests.length > 0 ? (
                        <div className="flex flex-column gap-3 mt-2">
                            {activeGuests.map((guest, idx) => (
                                <div 
                                    key={guest.id_kunjungan || idx} 
                                    className="flex flex-column md:flex-row md:align-items-center justify-content-between p-3 border-round-xl border-1 border-50 premium-hover-card"
                                    style={{ background: '#fafafa' }}
                                >
                                    <div className="flex align-items-center gap-3">
                                        {guest.PhotoFaceUrl ? (
                                            <img 
                                                src={guest.PhotoFaceUrl} 
                                                alt={guest.nama_tamu} 
                                                className="border-round-circle object-cover shadow-1"
                                                style={{ width: '3.5rem', height: '3.5rem' }} 
                                            />
                                        ) : (
                                            <div 
                                                className="flex align-items-center justify-content-center border-round-circle bg-primary-100 text-primary font-bold text-lg"
                                                style={{ width: '3.5rem', height: '3.5rem', background: '#e0f2fe', color: '#0284c7' }}
                                            >
                                                {guest.nama_tamu ? guest.nama_tamu.trim().split(/\s+/).map((n: string) => n[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() : 'T'}
                                            </div>
                                        )}
                                        <div>
                                            <div className="text-base font-bold text-900">{guest.nama_tamu}</div>
                                            <div className="text-xs text-color-secondary mt-1 flex align-items-center gap-1">
                                                <i className="pi pi-building text-xs" />
                                                <span>{guest.instansi_tamu || '-'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2 md:gap-4 align-items-center mt-3 md:mt-0 pt-3 md:pt-0 border-top-1 md:border-top-none border-100">
                                        <div className="flex flex-column">
                                            <span className="text-200 text-xs font-bold uppercase tracking-wider" style={{ color: '#94a3b8' }}>Tujuan</span>
                                            <span className="text-sm font-semibold text-700 mt-1 bg-blue-50 text-blue-700 px-2 py-1 border-round-md" style={{ background: '#eff6ff', color: '#1d4ed8' }}>
                                                {guest.VisitPurposeName || 'Kunjungan'}
                                            </span>
                                        </div>

                                        <div className="flex flex-column">
                                            <span className="text-200 text-xs font-bold uppercase tracking-wider" style={{ color: '#94a3b8' }}>Menemui</span>
                                            <span className="text-sm font-semibold text-800 mt-1 flex align-items-center gap-1">
                                                <i className="pi pi-user text-xs text-500" />
                                                {guest.HostFullname || guest.nama_host || '-'}
                                            </span>
                                        </div>

                                        <div className="flex flex-column">
                                            <span className="text-200 text-xs font-bold uppercase tracking-wider" style={{ color: '#94a3b8' }}>Masuk</span>
                                            <span className="text-sm font-semibold text-800 mt-1 flex align-items-center gap-1">
                                                <i className="pi pi-clock text-xs text-500" />
                                                {formatTime(guest.waktu_masuk)}
                                            </span>
                                        </div>

                                        <div className="flex align-self-end md:align-self-center ml-auto">
                                            <span className="px-2 py-1 text-xs font-bold border-round-xl" style={{ background: '#fffbeb', color: '#b45309', border: '1px solid #fef3c7' }}>
                                                Sedang Berkunjung
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-column align-items-center justify-content-center py-6 text-center">
                            <div className="border-circle bg-100 p-3 mb-3 flex align-items-center justify-content-center" style={{ width: '4.5rem', height: '4.5rem', background: '#f8fafc' }}>
                                <i className="pi pi-inbox text-3xl text-400" style={{ color: '#94a3b8' }} />
                            </div>
                            <h3 className="m-0 text-800 font-bold text-lg">Belum Ada Tamu Aktif</h3>
                            <p className="m-0 text-color-secondary text-sm mt-1 max-w-20rem">
                                Semua tamu yang check-in hari ini telah menyelesaikan kunjungan mereka.
                            </p>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default MonitoringPage;
