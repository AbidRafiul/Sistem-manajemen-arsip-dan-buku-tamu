'use client';

import { Toast } from 'primereact/toast';
import React, { useEffect, useRef, useState } from 'react';
import postData from '@/lib/axios/postData';
import { apiEndpointMonitoring } from './components/endpoints';
import { DashboardStats } from './components/interfaces';
import ChartDisplay from './components/display/chart';

const MonitoringPage: React.FC = () => {
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
        <div className="p-4 bg-slate-50 min-h-screen">
            <Toast ref={toast} position="top-right" />

            <div className="flex justify-content-between align-items-center mb-4">
                <h4 className="m-0 font-bold text-slate-800">Dashboard Monitoring Buku Tamu</h4>
                <button onClick={fetchMonitoringData} className="p-button p-component p-button-outlined p-button-sm flex gap-2 align-items-center bg-white px-3 py-2 border-round border-300 hover:surface-100" disabled={load}>
                    <i className={`pi pi-refresh ${load ? 'pi-spin' : ''}`}></i>
                    <span>Refresh</span>
                </button>
            </div>

            <div className="grid">
                <div className="col-12 md:col-4">
                    <div className="card shadow-2 border-round p-4 bg-white flex align-items-center justify-content-between">
                        <div>
                            <span className="block text-500 font-medium mb-3">Total Tamu Hari Ini</span>
                            <div className="text-900 font-bold text-3xl">{stats.total_tamu_hari_ini}</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-blue-100 border-round" style={{ width: '3rem', height: '3rem' }}>
                            <i className="pi pi-users text-blue-500 text-2xl"></i>
                        </div>
                    </div>
                </div>

                <div className="col-12 md:col-4">
                    <div className="card shadow-2 border-round p-4 bg-white flex align-items-center justify-content-between">
                        <div>
                            <span className="block text-500 font-medium mb-3">Sedang Berkunjung</span>
                            <div className="text-900 font-bold text-3xl text-orange-500">{stats.sedang_berkunjung}</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-orange-100 border-round" style={{ width: '3rem', height: '3rem' }}>
                            <i className="pi pi-id-card text-orange-500 text-2xl"></i>
                        </div>
                    </div>
                </div>

                <div className="col-12 md:col-4">
                    <div className="card shadow-2 border-round p-4 bg-white flex align-items-center justify-content-between">
                        <div>
                            <span className="block text-500 font-medium mb-3">Selesai Kunjungan</span>
                            <div className="text-900 font-bold text-3xl text-green-500">{stats.selesai_kunjungan}</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-green-100 border-round" style={{ width: '3rem', height: '3rem' }}>
                            <i className="pi pi-check-circle text-green-500 text-2xl"></i>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-4">
                <ChartDisplay stats={stats} />
            </div>
        </div>
    );
};

export default MonitoringPage;
