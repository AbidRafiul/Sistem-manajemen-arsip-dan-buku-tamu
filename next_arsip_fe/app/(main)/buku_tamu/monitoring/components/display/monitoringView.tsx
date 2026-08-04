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
    lastUpdated?: string;
    onRefresh: () => void;
    onRegisterNew: () => void;
    onViewHistory: () => void;
}

export default function MonitoringView({
    stats,
    activeGuests,
    load,
    lastUpdated,
    onRefresh,
    onRegisterNew,
    onViewHistory
}: MonitoringViewProps) {
    return (
        <div className="w-full">
            {/* Header Section */}
            <div className="flex flex-column md:flex-row md:align-items-center justify-content-between gap-3 mb-4">
                <div>
                    <span className="text-primary font-bold text-xs uppercase" style={{ letterSpacing: '0.1em' }}>
                        Monitoring Real-Time
                    </span>
                    <h1 className="m-0 text-900 font-extrabold text-3xl mb-2 mt-1" style={{ letterSpacing: '-0.02em' }}>
                        Monitoring Buku Tamu
                    </h1>
                    <p className="m-0 text-color-secondary font-medium">
                        Pantau statistik kunjungan harian, tamu aktif, dan tren mingguan secara real-time.
                    </p>
                </div>
                <div className="flex flex-wrap gap-2 flex-shrink-0 align-self-start md:align-self-center">
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
