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
                label: 'Jumlah Kunjungan',
                data: stats.chart_mingguan,
                fill: true,
                borderColor: '#6366f1', // Indigo primary color
                backgroundColor: 'rgba(99, 102, 241, 0.08)', // Indigo translucent area
                borderWidth: 3,
                tension: 0.4,
                pointBackgroundColor: '#6366f1',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7
            }
        ]
    };

    const doughnutChartData = {
        labels: stats.chart_tujuan_labels,
        datasets: [
            {
                data: stats.chart_tujuan_data,
                backgroundColor: ['#6366f1', '#14b8a6', '#f59e0b', '#ef4444'], // Indigo, Teal, Amber, Red
                hoverBackgroundColor: ['#4f46e5', '#0d9488', '#d97706', '#dc2626'],
                borderWidth: 2,
                borderColor: '#ffffff'
            }
        ]
    };

    const lineChartOptions = {
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false // Hide the legend for line chart, it's cleaner and title explains it.
            },
            tooltip: {
                padding: 10,
                bodyFont: {
                    family: "'Inter', sans-serif"
                },
                titleFont: {
                    family: "'Inter', sans-serif",
                    weight: 'bold'
                }
            }
        },
        scales: {
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    color: '#64748b',
                    font: {
                        family: "'Inter', sans-serif",
                        size: 11,
                        weight: '500'
                    }
                }
            },
            y: {
                grid: {
                    color: '#f1f5f9'
                },
                border: {
                    dash: [5, 5] // Dashed grid lines
                },
                ticks: {
                    color: '#64748b',
                    font: {
                        family: "'Inter', sans-serif",
                        size: 11,
                        weight: '500'
                    }
                }
            }
        }
    };

    const doughnutChartOptions = {
        maintainAspectRatio: false,
        cutout: '75%', // Modern sleek donut ring
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    boxWidth: 8,
                    boxHeight: 8,
                    usePointStyle: true, // Circular bullet point style instead of rectangles
                    padding: 16,
                    font: {
                        family: "'Inter', sans-serif",
                        size: 11,
                        weight: '500'
                    },
                    color: '#475569'
                }
            },
            tooltip: {
                padding: 10,
                bodyFont: {
                    family: "'Inter', sans-serif"
                }
            }
        }
    };

    return (
        <div className="grid mt-2">
            <div className="col-12 lg:col-8">
                <Card 
                    title={
                        <div className="flex align-items-center gap-2 mb-2 pb-2 border-bottom-1 border-100">
                            <i className="pi pi-chart-line text-primary text-xl" style={{ color: '#6366f1' }} />
                            <span className="text-lg font-bold text-900">Tren Kunjungan Tamu (Mingguan)</span>
                        </div>
                    }
                    className="border-none shadow-1 border-round-2xl bg-white h-full premium-hover-card"
                    pt={{ content: { style: { padding: 0 } } }}
                >
                    <div style={{ height: '320px', position: 'relative' }} className="mt-3 px-2">
                        <Chart type="line" data={lineChartData} options={lineChartOptions} style={{ height: '100%' }} />
                    </div>
                </Card>
            </div>
            <div className="col-12 lg:col-4">
                <Card 
                    title={
                        <div className="flex align-items-center gap-2 mb-2 pb-2 border-bottom-1 border-100">
                            <i className="pi pi-chart-pie text-primary text-xl" style={{ color: '#6366f1' }} />
                            <span className="text-lg font-bold text-900">Persentase Tujuan</span>
                        </div>
                    }
                    className="border-none shadow-1 border-round-2xl bg-white h-full flex flex-column premium-hover-card"
                    pt={{ content: { style: { padding: 0 } } }}
                >
                    <div className="flex justify-content-center align-items-center mt-4 px-2" style={{ height: '260px', position: 'relative' }}>
                        <Chart type="doughnut" data={doughnutChartData} options={doughnutChartOptions} style={{ width: '100%', maxWidth: '240px' }} />
                    </div>
                </Card>
            </div>
        </div>
    );
}
