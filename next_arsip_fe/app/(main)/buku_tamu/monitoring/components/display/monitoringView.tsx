"use client";
import React from 'react';
import { Button } from 'primereact/button';
import StatsCards from './statsCards';
import ChartDisplay from './chart';
import ActiveGuestsTable from './activeGuestsTable';
import { DashboardStats } from '../interfaces';

interface MonitoringViewProps {
    stats: DashboardStats;
    activeGuests: any[];
    load: boolean;
    onRefresh: () => void;
    onRegisterNew: () => void;
    onViewHistory: () => void;
}

export default function MonitoringView({
    stats,
    activeGuests,
    load,
    onRefresh,
    onRegisterNew,
    onViewHistory
}: MonitoringViewProps) {
    return (
        <div className="p-3 md:p-4 surface-ground min-h-screen">
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
                        onClick={onRegisterNew}
                    />
                    <Button
                        type="button"
                        icon="pi pi-history"
                        label="Riwayat Tamu"
                        severity="warning"
                        outlined
                        className="py-2 px-3 border-round-lg font-semibold text-sm bg-white"
                        onClick={onViewHistory}
                    />
                    <Button
                        type="button"
                        icon={`pi pi-refresh ${load ? 'pi-spin' : ''}`}
                        label="Refresh"
                        outlined
                        severity="secondary"
                        className="py-2 px-3 border-round-lg font-semibold text-sm bg-white"
                        onClick={onRefresh}
                        loading={load}
                    />
                </div>
            </div>

            {/* Stats Metrics Cards */}
            <div className="mb-4">
                <StatsCards stats={stats} />
            </div>

            {/* Charts Section */}
            <div className="mb-4">
                <ChartDisplay stats={stats} />
            </div>

            {/* Active Visitors List Section */}
            <div className="mb-4">
                <ActiveGuestsTable activeGuests={activeGuests} />
            </div>
        </div>
    );
}
