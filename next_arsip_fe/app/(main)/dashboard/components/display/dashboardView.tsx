import React from 'react';
import { Button } from 'primereact/button';
import MetricCards from './metricCard';
import AnalyticsChart from './analyticsChart';
import AuditTimeline from './auditTimeline';
import { SummaryData, ChartData, AuditLog } from '../interfaces';

interface DashboardViewProps {
    data: SummaryData;
    chartData: ChartData;
    auditLogs: AuditLog[];
    isLoading: boolean;
}

export default function DashboardView({ data, chartData, auditLogs, isLoading }: DashboardViewProps) {
    const cTanggalHariIni = new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });

    return (
        <div className="flex flex-column gap-4">
            {/* Page Header */}
            <div className="flex flex-column md:flex-row md:align-items-center justify-content-between gap-3">
                <div>
                    <span className="text-primary font-bold text-xs uppercase" style={{ letterSpacing: '0.1em' }}>
                        Ringkasan
                    </span>
                    <h2 className="m-0 text-900 font-bold text-2xl mb-1 mt-1">
                        Dashboard
                    </h2>
                    <p className="m-0 text-color-secondary text-sm">
                        Ringkasan aktivitas arsip, kunjungan, surat, dan retensi dalam satu tampilan operasional.
                    </p>
                </div>
                <Button
                    type="button"
                    icon="pi pi-calendar"
                    label={cTanggalHariIni}
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
                    <AnalyticsChart chartData={chartData} isLoading={isLoading} />
                </div>
                <div className="col-12 xl:col-4">
                    <AuditTimeline logs={auditLogs} isLoading={isLoading} />
                </div>
            </div>
        </div>
    );
}
