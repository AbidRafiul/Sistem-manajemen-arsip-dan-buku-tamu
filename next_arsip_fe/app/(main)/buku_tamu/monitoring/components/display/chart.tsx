'use client'

import React from 'react';
import { Chart } from 'primereact/chart';
import { DashboardStats } from "@/app/(main)/buku_tamu/monitoring/components/interfaces";

interface ChartDisplayProps {
    stats: DashboardStats;
}

export default function ChartDisplay({ stats }: ChartDisplayProps) {
    const lineChartData = {
        labels: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'],
        datasets: [
            {
                label: 'Jumlah Kunjungan Tamu',
                data: stats.chart_mingguan,
                fill: true,
                borderColor: '#4f46e5',
                backgroundColor: 'rgba(79, 70, 229, 0.1)',
                tension: 0.4
            }
        ]
    };

    const doughnutChartData = {
        labels: stats.chart_tujuan_labels,
        datasets: [
            {
                data: stats.chart_tujuan_data,
                backgroundColor: ['#4f46e5', '#10b981', '#f59e0b', '#ef4444'],
                hoverBackgroundColor: ['#4338ca', '#059669', '#d97706', '#dc2626']
            }
        ]
    };

    return (
        <div className="grid mt-2">
            <div className="col-12 md:col-8">
                <div className="card shadow-2 border-round p-4 bg-white h-full">
                    <h5 className="text-slate-700 font-bold mb-4">Tren Kunjungan Tamu (Mingguan)</h5>
                    <Chart type="line" data={lineChartData} style={{ position: 'relative', height: '300px' }} />
                </div>
            </div>
            <div className="col-12 md:col-4">
                <div className="card shadow-2 border-round p-4 bg-white h-full flex flex-column align-items-center">
                    <h5 className="text-slate-700 font-bold mb-4 w-full text-left">Persentase Tujuan Kunjungan</h5>
                    <div className="w-9 md:w-11 flex justify-content-center align-items-center mt-2">
                        <Chart type="doughnut" data={doughnutChartData} style={{ position: 'relative', width: '100%', maxWidth: '240px' }} />
                    </div>
                </div>
            </div>
        </div>
    );
}