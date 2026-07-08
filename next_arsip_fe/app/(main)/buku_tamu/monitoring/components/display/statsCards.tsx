"use client";
import React from 'react';
import { Card } from 'primereact/card';
import { DashboardStats } from '../interfaces';

interface StatsCardsProps {
    stats: DashboardStats;
}

export default function StatsCards({ stats }: StatsCardsProps) {
    return (
        <div className="grid">
            {/* Total Tamu Hari Ini */}
            <div className="col-12 sm:col-6 md:col-4">
                <Card className="border-none shadow-1 border-round-2xl p-1 bg-white h-full premium-hover-card glow-blue" style={{ borderLeft: '4px solid transparent' }}>
                    <div className="flex align-items-center gap-3">
                        <div
                            className="flex align-items-center justify-content-center border-round-xl"
                            style={{ width: '3.5rem', height: '3.5rem', background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', color: 'var(--primary-color)', flexShrink: 0 }}
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

            {/* Sedang Berkunjung */}
            <div className="col-12 sm:col-6 md:col-4">
                <Card className="border-none shadow-1 border-round-2xl p-1 bg-white h-full premium-hover-card glow-amber" style={{ borderLeft: '4px solid transparent' }}>
                    <div className="flex align-items-center gap-3">
                        <div
                            className="flex align-items-center justify-content-center border-round-xl"
                            style={{ width: '3.5rem', height: '3.5rem', background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)', color: '#d97706', flexShrink: 0 }}
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

            {/* Selesai Kunjungan */}
            <div className="col-12 sm:col-6 md:col-4">
                <Card className="border-none shadow-1 border-round-2xl p-1 bg-white h-full premium-hover-card glow-emerald" style={{ borderLeft: '4px solid transparent' }}>
                    <div className="flex align-items-center gap-3">
                        <div
                            className="flex align-items-center justify-content-center border-round-xl"
                            style={{ width: '3.5rem', height: '3.5rem', background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', color: '#16a34a', flexShrink: 0 }}
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
    );
}
