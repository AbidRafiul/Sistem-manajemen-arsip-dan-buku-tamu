"use client";
import React from 'react';
import { Button } from 'primereact/button';
import MetricCards from './metricCards';
import ChartSection from './chartSection';
import AnalyticsChart from './analyticsChart';
import BorrowedList from './borrowedList';
import { ArchiveDashboardState } from '../interfaces';

interface DashboardViewProps {
    state: ArchiveDashboardState;
    onRefresh: () => void;
}

export default function DashboardView({ state, onRefresh }: DashboardViewProps) {

    return (
        <div className="flex flex-column gap-4">
            {/* Styles for pulse indicator and card animation */}
            <style jsx global>{`
                @keyframes pulse-live {
                    0% { transform: scale(0.9); opacity: 1; box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.7); }
                    70% { transform: scale(1); opacity: 1; box-shadow: 0 0 0 6px rgba(79, 70, 229, 0); }
                    100% { transform: scale(0.9); opacity: 1; box-shadow: 0 0 0 0 rgba(79, 70, 229, 0); }
                }
                .live-pulse-indigo {
                    display: inline-block;
                    width: 8px;
                    height: 8px;
                    background-color: #4f46e5;
                    border-radius: 50%;
                    animation: pulse-live 2s infinite;
                }
                .premium-hover-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 15px 30px -10px rgba(0, 0, 0, 0.1) !important;
                }
            `}</style>

            {/* Header Section */}
            <div className="flex flex-column md:flex-row md:align-items-center justify-content-between gap-3">
                <div>
                    <div className="flex align-items-center gap-2 mb-1">
                        <span className="live-pulse-indigo" />
                        <span className="text-primary font-bold text-xs uppercase" style={{ letterSpacing: '0.1em' }}>
                            Live Monitoring Arsip
                        </span>
                    </div>
                    <h2 className="m-0 text-900 font-bold text-2xl mb-1">
                        Dashboard Kearsipan (EDMS)
                    </h2>
                    <p className="m-0 text-color-secondary font-medium text-sm">
                        Ringkasan statistik berkas, peminjaman aktif, dan sebaran dokumen berdasarkan jenis.
                    </p>
                </div>

                <div className="flex align-items-center ml-auto md:ml-0 flex-shrink-0 align-self-start md:align-self-center">
                    <Button
                        type="button"
                        icon={`pi pi-refresh ${state.load ? 'pi-spin' : ''}`}
                        label="Segarkan"
                        className="p-button-outlined p-button-sm border-round-lg text-xs"
                        onClick={onRefresh}
                        disabled={state.load}
                    />
                </div>
            </div>

            {/* Metric Cards */}
            <MetricCards metrics={state.metrics} isLoading={state.load} />

            {/* Charts Section */}
            <div className="grid">
                <div className="col-12 lg:col-7">
                    <AnalyticsChart weeklyTrend={state.weeklyTrend} isLoading={state.load} />
                </div>
                <div className="col-12 lg:col-5">
                    <ChartSection chartData={state.chartData} isLoading={state.load} />
                </div>
            </div>

            {/* Borrowed Documents Section */}
            <div>
                <BorrowedList list={state.borrowedList} isLoading={state.load} />
            </div>
        </div>
    );
}
