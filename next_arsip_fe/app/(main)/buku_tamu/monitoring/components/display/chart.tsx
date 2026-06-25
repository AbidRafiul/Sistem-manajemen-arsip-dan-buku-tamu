'use client'

import React from 'react';
import { Card } from 'primereact/card';
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
                borderColor: '#3B82F6', // Theme Blue
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4
            }
        ]
    };

    const doughnutChartData = {
        labels: stats.chart_tujuan_labels,
        datasets: [
            {
                data: stats.chart_tujuan_data,
                backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'], // Blue, Green, Amber, Red
                hoverBackgroundColor: ['#2563EB', '#059669', '#D97706', '#DC2626']
            }
        ]
    };

    const lineChartOptions = {
        maintainAspectRatio: false,
        aspectRatio: 0.6,
        plugins: {
            legend: {
                labels: {
                    font: {
                        family: "'Inter', sans-serif",
                        weight: '600'
                    }
                }
            }
        },
        scales: {
            x: {
                grid: {
                    display: false
                }
            },
            y: {
                grid: {
                    color: '#F1F5F9'
                }
            }
        }
    };

    const doughnutChartOptions = {
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    boxWidth: 12,
                    font: {
                        family: "'Inter', sans-serif"
                    }
                }
            }
        }
    };

    return (
        <div className="grid mt-2">
            <div className="col-12 md:col-8">
                <Card 
                    title={
                        <div className="flex align-items-center gap-2 mb-2">
                            <i className="pi pi-chart-line text-primary text-xl" />
                            <span className="text-lg font-bold text-900">Tren Kunjungan Tamu (Mingguan)</span>
                        </div>
                    }
                    className="border-none shadow-1 border-round-2xl bg-white h-full"
                    pt={{ content: { style: { padding: 0 } } }}
                >
                    <div style={{ height: '300px', position: 'relative' }} className="mt-2">
                        <Chart type="line" data={lineChartData} options={lineChartOptions} style={{ height: '100%' }} />
                    </div>
                </Card>
            </div>
            <div className="col-12 md:col-4">
                <Card 
                    title={
                        <div className="flex align-items-center gap-2 mb-2">
                            <i className="pi pi-chart-pie text-primary text-xl" />
                            <span className="text-lg font-bold text-900">Persentase Tujuan</span>
                        </div>
                    }
                    className="border-none shadow-1 border-round-2xl bg-white h-full flex flex-column"
                    pt={{ content: { style: { padding: 0 } } }}
                >
                    <div className="flex justify-content-center align-items-center mt-3" style={{ height: '240px', position: 'relative' }}>
                        <Chart type="doughnut" data={doughnutChartData} options={doughnutChartOptions} style={{ width: '100%', maxWidth: '220px' }} />
                    </div>
                </Card>
            </div>
        </div>
    );
}
