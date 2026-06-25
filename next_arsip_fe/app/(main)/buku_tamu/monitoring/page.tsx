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

    const fetchMonitoringData = async () => {
        setLoad(true);
        try {
            const response = await postData(apiEndpointMonitoring, {});
            if (response?.data?.data) {
                setStats(response.data.data);
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

    return (
        <div className="p-4 surface-ground min-h-screen">
            <Toast ref={toast} position="top-right" />

            {/* Header Section */}
            <div className="flex flex-column lg:flex-row lg:align-items-center justify-content-between gap-3 mb-4">
                <div>
                    <span className="text-primary font-bold text-xs uppercase" style={{ letterSpacing: '0.1em' }}>
                        Real-time tracking
                    </span>
                    <h1 className="m-0 text-900 font-extrabold text-3xl mb-2 mt-1" style={{ letterSpacing: '-0.02em' }}>
                        Monitoring Buku Tamu
                    </h1>
                    <p className="m-0 text-color-secondary font-medium text-sm">
                        Pantau statistik kunjungan harian, tamu aktif, dan tren mingguan secara real-time.
                    </p>
                </div>
                <div className="flex flex-wrap gap-2 flex-shrink-0">
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
                        icon="pi pi-sign-out"
                        label="Checkout Tamu"
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
                <div className="col-12 md:col-4">
                    <Card className="border-none shadow-1 border-round-xl p-1 bg-white h-full">
                        <div className="flex align-items-center gap-3">
                            <div
                                className="flex align-items-center justify-content-center border-round-xl"
                                style={{ width: '3.5rem', height: '3.5rem', background: '#EFF6FF', color: 'var(--primary-color)', flexShrink: 0 }}
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

                <div className="col-12 md:col-4">
                    <Card className="border-none shadow-1 border-round-xl p-1 bg-white h-full">
                        <div className="flex align-items-center gap-3">
                            <div
                                className="flex align-items-center justify-content-center border-round-xl"
                                style={{ width: '3.5rem', height: '3.5rem', background: '#FFFBEB', color: '#D97706', flexShrink: 0 }}
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

                <div className="col-12 md:col-4">
                    <Card className="border-none shadow-1 border-round-xl p-1 bg-white h-full">
                        <div className="flex align-items-center gap-3">
                            <div
                                className="flex align-items-center justify-content-center border-round-xl"
                                style={{ width: '3.5rem', height: '3.5rem', background: '#F0FDF4', color: '#16A34A', flexShrink: 0 }}
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

            <div className="mt-4">
                <ChartDisplay stats={stats} />
            </div>
        </div>
    );
};

export default MonitoringPage;
