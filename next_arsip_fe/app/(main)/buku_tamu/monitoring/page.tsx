"use client";
import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Toast } from 'primereact/toast';
import postData from '@/lib/axios/postData';
import { apiEndpointMonitoring } from './components/endpoints';
import { DashboardStats } from './components/interfaces';
import MonitoringView from './components/display/monitoringView';

const MonitoringPage: React.FC = () => {
    const router = useRouter();
    const toast = useRef<Toast>(null);
    const [load, setLoad] = useState<boolean>(false);
    const [lastUpdated, setLastUpdated] = useState<string>('');
    const [stats, setStats] = useState<DashboardStats>({
        total_tamu_hari_ini: 0,
        sedang_berkunjung: 0,
        selesai_kunjungan: 0,
        chart_mingguan: [0, 0, 0, 0, 0, 0, 0],
        chart_tujuan_labels: [],
        chart_tujuan_data: []
    });
    const [activeGuests, setActiveGuests] = useState<any[]>([]);

    const fetchMonitoringData = async () => {
        setLoad(true);
        try {
            const response = await postData(apiEndpointMonitoring, {});
            if (response?.data?.data) {
                setStats(response.data.data);
            }

            const resActive = await postData('/buku-tamu/visit-data', { Status: 'in', limit: 5 });
            if (resActive?.data?.data?.rows) {
                setActiveGuests(resActive.data.data.rows);
            }

            const now = new Date();
            const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB';
            setLastUpdated(timeStr);
        } catch (error: any) {
            console.error("Gagal mengambil data monitoring tamu:", error);
            // Default Fallbacks
            setStats({
                total_tamu_hari_ini: 0,
                sedang_berkunjung: 0,
                selesai_kunjungan: 0,
                chart_mingguan: [0, 0, 0, 0, 0, 0, 0],
                chart_tujuan_labels: [],
                chart_tujuan_data: []
            });
            setActiveGuests([]);
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

    const handleRegisterNew = () => {
        router.push('/buku_tamu/registrasi');
    };

    const handleViewHistory = () => {
        router.push('/buku_tamu/checkout');
    };

    return (
        <>
            <Toast ref={toast} position="top-right" />
            <MonitoringView
                stats={stats}
                activeGuests={activeGuests}
                load={load}
                lastUpdated={lastUpdated}
                onRefresh={fetchMonitoringData}
                onRegisterNew={handleRegisterNew}
                onViewHistory={handleViewHistory}
            />
        </>
    );
};

export default MonitoringPage;

