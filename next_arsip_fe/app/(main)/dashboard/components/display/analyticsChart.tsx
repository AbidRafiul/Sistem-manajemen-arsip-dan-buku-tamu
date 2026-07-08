import React from 'react';
import { Chart } from 'primereact/chart';
import { Skeleton } from 'primereact/skeleton';
import { Card } from 'primereact/card';
import { ChartData } from '../interfaces';

interface AnalyticsChartProps {
    chartData: ChartData;
    isLoading: boolean;
}

export default function AnalyticsChart({ chartData, isLoading }: AnalyticsChartProps) {
    if (isLoading) {
        return (
            <Card className="shadow-1 border-round-2xl border-none h-full">
                <Skeleton width="100%" height="400px" borderRadius="16px" />
            </Card>
        );
    }

    const oChartData = {
        labels: chartData.labels,
        datasets: [
            {
                label: 'Dokumen Diunggah',
                data: chartData.data,
                fill: true,
                borderColor: '#4F46E5', // Indigo 600
                tension: 0.4,
                backgroundColor: 'rgba(79, 70, 229, 0.1)'
            }
        ]
    };

    const chartOptions = {
        maintainAspectRatio: false,
        aspectRatio: 0.8,
        plugins: { legend: { display: false } },
        scales: {
            y: {
                beginAtZero: false,
                grid: { color: 'rgba(226, 232, 240, 0.7)', drawBorder: false },
                ticks: { color: '#94a3b8', font: { family: 'Inter', weight: 700 } },
                border: { display: false }
            },
            x: {
                grid: { display: false },
                ticks: { color: '#64748b', font: { family: 'Inter', weight: 800 } },
                border: { display: false }
            }
        }
    };

    return (
        <Card className="shadow-1 border-round-2xl border-none h-full" pt={{ body: { className: 'p-4 flex flex-column h-full' }, content: { className: 'flex-1 p-0 m-0' } }}>
            <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-start mb-4 gap-3">
                <div>
                    <h2 className="m-0 text-900 font-bold text-xl mb-1" style={{ letterSpacing: '-0.02em' }}>Aktivitas Mingguan</h2>
                    <p className="m-0 text-color-secondary text-sm font-medium">Tren unggah dokumen dan aktivitas sistem selama 7 hari terakhir.</p>
                </div>
                <div className="flex align-items-center gap-2 bg-indigo-50 text-indigo-600 px-3 py-2 border-round-3xl font-semibold text-xs border-1 border-indigo-100 shadow-1" style={{ width: 'fit-content' }}>
                    <span className="border-circle bg-indigo-600" style={{ width: '8px', height: '8px' }}></span>
                    Dokumen Diunggah
                </div>
            </div>
            <div style={{ height: '350px' }}>
                <Chart type="line" data={oChartData} options={chartOptions} style={{ height: '100%' }} />
            </div>
        </Card>
    );
}
