'use client';

import React, { useEffect, useState } from 'react';
import DashboardView from './components/display/dashboardView';

export default function DashboardPage() {
    const [loading, setLoading] = useState(true);
    const [summaryData, setSummaryData] = useState({
        arsipAktif: 0,
        tamuHariIni: 0,
        menungguDisposisi: 0,
        retensiExpired: 0
    });
    const [auditLogs, setAuditLogs] = useState<any[]>([]);

    useEffect(() => {
        const nTimer = fetchDashboardData();

        return () => {
            window.clearTimeout(nTimer);
        };
    }, []);

    const fetchDashboardData = () => {
        try {
            setLoading(true);

            return window.setTimeout(() => {
                setSummaryData({
                    arsipAktif: 12842,
                    tamuHariIni: 24,
                    menungguDisposisi: 12,
                    retensiExpired: 5
                });
                setAuditLogs([
                    { id: 1, user: "Abid Rafi'ul S.", action: 'Login ke sistem', time: 'Baru saja', color: '#6366f1' },
                    { id: 2, user: 'Maya Putri', action: 'Menyetujui Peminjaman #LN-002', time: '1 jam yang lalu', color: '#10b981' },
                    { id: 3, user: 'Budi Wibowo', action: 'Menambahkan Arsip Baru', time: '3 jam yang lalu', color: '#0ea5e9' }
                ]);
                setLoading(false);
            }, 1000);
        } catch (error) {
            console.error('Gagal memuat data dashboard:', error);
            setLoading(false);
            return 0;
        }
    };

    return (
        <DashboardView
            data={summaryData}
            auditLogs={auditLogs}
            isLoading={loading}
        />
    );
}
