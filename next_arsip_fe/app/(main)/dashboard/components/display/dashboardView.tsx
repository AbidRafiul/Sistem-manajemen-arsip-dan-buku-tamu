import React from 'react';
import { Button } from 'primereact/button';
import MetricCards from './metricCard';
import AnalyticsChart from './analyticsChart';
import AuditTimeline from './auditTimeline';

interface SummaryData {
    arsipAktif: number;
    tamuHariIni: number;
    menungguDisposisi: number;
    retensiExpired: number;
}

interface AuditLog {
    id: number;
    user: string;
    action: string;
    time: string;
    color: string;
}

interface DashboardViewProps {
    data: SummaryData;
    auditLogs: AuditLog[];
    isLoading: boolean;
}

export default function DashboardView({ data, auditLogs, isLoading }: DashboardViewProps) {
    return (
        <div className="flex flex-column gap-4">
            {/* Page Header */}
            <div className="flex flex-column md:flex-row md:align-items-center justify-content-between gap-3 mb-2">
                <div>
                    <span className="text-primary font-bold text-xs uppercase" style={{ letterSpacing: '0.1em' }}>
                        Ringkasan
                    </span>
                    <h1 className="m-0 text-900 font-extrabold text-3xl mb-2 mt-1" style={{ letterSpacing: '-0.02em' }}>
                        Dashboard
                    </h1>
                    <p className="m-0 text-color-secondary font-medium">
                        Ringkasan aktivitas arsip, kunjungan, surat, dan retensi dalam satu tampilan operasional.
                    </p>
                </div>
                <Button
                    type="button"
                    icon="pi pi-calendar"
                    label="17 Jun 2026"
                    outlined
                    severity="secondary"
                    className="bg-white border-300 text-700 font-semibold shadow-1"
                    style={{ whiteSpace: 'nowrap' }}
                />
            </div>

            {/* Metric Summary Cards */}
            <MetricCards data={data} isLoading={isLoading} />

            {/* Bottom Grid: Chart + Audit Trail */}
            <div className="grid">
                <div className="col-12 xl:col-8">
                    <AnalyticsChart isLoading={isLoading} />
                </div>
                <div className="col-12 xl:col-4">
                    <AuditTimeline logs={auditLogs} isLoading={isLoading} />
                </div>
            </div>
        </div>
    );
}
