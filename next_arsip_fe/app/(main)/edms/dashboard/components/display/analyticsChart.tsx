"use client";
import React from 'react';
import { Chart } from 'primereact/chart';
import { Skeleton } from 'primereact/skeleton';
import { Card } from 'primereact/card';
import { WeeklyTrendData } from '../interfaces';

interface AnalyticsChartProps {
    weeklyTrend?: WeeklyTrendData;
    isLoading: boolean;
}

export default function AnalyticsChart({ weeklyTrend, isLoading }: AnalyticsChartProps) {
    if (isLoading) {
        return (
            <Card className="border-none shadow-1 border-round-2xl p-4 bg-white h-full">
                <Skeleton width="40%" height="2rem" className="mb-2" />
                <Skeleton width="100%" height="250px" borderRadius="16px" />
            </Card>
        );
    }

    const labels = weeklyTrend?.labels || [];
    const dataPoints = weeklyTrend?.data || [];

    const oChartData = {
        labels: labels,
        datasets: [
            {
                label: 'Dokumen Terarsip',
                data: dataPoints,
                fill: true,
                borderColor: '#4f46e5', // Indigo 600
                backgroundColor: 'rgba(79, 70, 229, 0.08)',
                tension: 0.4,
                borderWidth: 3,
                pointBackgroundColor: '#4f46e5',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7
            }
        ]
    };

    const chartOptions = {
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                padding: 12,
                backgroundColor: '#0f172a',
                titleColor: '#ffffff',
                bodyColor: '#e2e8f0',
                bodyFont: {
                    family: 'Inter',
                    weight: 'bold'
                },
                titleFont: {
                    family: 'Inter',
                    weight: 'bold'
                },
                cornerRadius: 8,
                displayColors: false
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(226, 232, 240, 0.6)',
                    drawBorder: false
                },
                ticks: {
                    color: '#64748b',
                    font: {
                        family: 'Inter',
                        weight: 600,
                        size: 11
                    },
                    stepSize: 1
                },
                border: {
                    display: false
                }
            },
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    color: '#64748b',
                    font: {
                        family: 'Inter',
                        weight: 600,
                        size: 11
                    }
                },
                border: {
                    display: false
                }
            }
        }
    };

    return (
        <Card className="border-none shadow-1 border-round-2xl overflow-hidden bg-white h-full">
            <div className="flex flex-column mb-4">
                <h3 className="text-xl font-bold text-900 m-0" style={{ letterSpacing: '-0.02em' }}>
                    Tren Pengarsipan 7 Hari Terakhir
                </h3>
                <p className="text-sm text-color-secondary mt-1 m-0">
                    Aktivitas penyimpanan berkas baru yang masuk ke dalam sistem.
                </p>
            </div>
            
            <div style={{ height: '280px', position: 'relative' }}>
                {dataPoints.length > 0 ? (
                    <Chart type="line" data={oChartData} options={chartOptions} style={{ width: '100%', height: '100%' }} />
                ) : (
                    <div className="flex flex-column align-items-center justify-content-center h-full text-color-secondary text-center p-4">
                        <i className="pi pi-chart-line text-5xl mb-2 text-300" />
                        <span className="text-sm font-semibold">Tidak ada aktivitas pengarsipan baru</span>
                    </div>
                )}
            </div>
        </Card>
    );
}
