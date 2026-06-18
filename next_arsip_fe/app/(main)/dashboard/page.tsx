<<<<<<< HEAD
'use client';

import React, { useEffect, useState } from 'react';
import MetricCards from './components/display/metricCard';
import AnalyticsChart from './components/display/analyticsChart';
import AuditTimeline from './components/display/auditTimeline';

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
        <div className="dashboard-page">
            <section className="dashboard-header">
                <div>
                    <span className="dashboard-eyebrow">Executive overview</span>
                    <h1>Executive Dashboard</h1>
                    <p>Ringkasan aktivitas arsip, kunjungan, surat, dan retensi dalam satu tampilan operasional.</p>
                </div>
                <button className="dashboard-date-button" type="button">
                    <i className="pi pi-calendar"></i>
                    <span>17 Jun 2026</span>
                </button>
            </section>

            <MetricCards data={summaryData} isLoading={loading} />

            <section className="dashboard-insight-grid">
                <div className="dashboard-chart-column">
                    <AnalyticsChart isLoading={loading} />
                </div>
                <div className="dashboard-audit-column">
                    <AuditTimeline logs={auditLogs} isLoading={loading} />
                </div>
            </section>
        </div>
    );
}
=======
import React from 'react';

const Dashboard = () => {
    return (
        <div className="card">
            <h1 className="text-2xl font-bold">Ini Halaman Dashboard</h1>
            <p>Selamat datang, Kapten! Akhirnya bisa masuk juga.</p>
        </div>
    );
};

export default Dashboard;
>>>>>>> fix/login-session-crash
