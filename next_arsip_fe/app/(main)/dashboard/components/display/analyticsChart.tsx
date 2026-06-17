import React from 'react';
import { Chart } from 'primereact/chart';
import { Skeleton } from 'primereact/skeleton';

export default function AnalyticsChart({ isLoading }: { isLoading: boolean }) {
    if (isLoading) {
        return (
            <div className="dashboard-panel-card">
                <Skeleton width="100%" height="430px" borderRadius="24px" />
            </div>
        );
    }

    const chartData = {
        labels: ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'],
        datasets: [
            {
                label: 'Dokumen Diunggah',
                data: [65, 59, 80, 81, 56, 55, 40],
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
        <article className="dashboard-panel-card dashboard-chart-panel">
            <div className="dashboard-panel-header">
                <div>
                    <h2>Aktivitas Mingguan</h2>
                    <p>Tren unggah dokumen dan aktivitas sistem selama 7 hari terakhir.</p>
                </div>
                <div className="dashboard-chart-pill">
                    <span></span>
                    Dokumen Diunggah
                </div>
            </div>
            <div className="dashboard-chart-canvas">
                <Chart type="line" data={chartData} options={chartOptions} style={{ height: '100%' }} />
            </div>
        </article>
    );
}
