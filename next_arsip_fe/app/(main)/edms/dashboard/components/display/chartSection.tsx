"use client";
import React from 'react';
import { Chart } from 'primereact/chart';
import { Card } from 'primereact/card';
import { Skeleton } from 'primereact/skeleton';
import { ChartSectionProps } from '../interfaces';

export default function ChartSection({ chartData, isLoading }: ChartSectionProps) {
    if (isLoading) {
        return (
            <Card className="border-none shadow-1 border-round-2xl p-4 bg-white">
                <div className="grid">
                    <div className="col-12 md:col-6 flex justify-content-center">
                        <Skeleton shape="circle" size="250px" />
                    </div>
                    <div className="col-12 md:col-6 flex flex-column justify-content-center gap-3">
                        <Skeleton width="100%" height="2rem" />
                        <Skeleton width="80%" height="1.5rem" />
                        <Skeleton width="90%" height="1.5rem" />
                    </div>
                </div>
            </Card>
        );
    }

    // Color palette for chart
    const colors = ['#4f46e5', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#64748b'];
    const hoverColors = ['#4338ca', '#2563eb', '#059669', '#d97706', '#db2777', '#7c3aed', '#475569'];

    const hasData = chartData && chartData.length> 0;

    const oChartData = {
        labels: hasData ? chartData.map((d) => d.label) : ['Belum Ada Data'],
        datasets: [
            {
                data: hasData ? chartData.map((d) => d.count) : [1],
                backgroundColor: hasData ? colors.slice(0, chartData.length) : ['#e2e8f0'],
                hoverBackgroundColor: hasData ? hoverColors.slice(0, chartData.length) : ['#cbd5e1'],
                borderWidth: 2,
                borderColor: '#ffffff'
            }
        ]
    };

    const chartOptions = {
        plugins: {
            legend: {
                display: false
            }
        },
        maintainAspectRatio: false,
        cutout: '75%' // Doughnut cut-out style
    };

    const totalCount = chartData.reduce((sum, item) => sum + item.count, 0);

    return (
        <Card className="border-none shadow-1 border-round-2xl overflow-hidden bg-white">
            <div className="flex flex-column mb-4">
                <h3 className="text-xl font-bold text-900 m-0" style={{ letterSpacing: '-0.02em' }}>
                    Distribusi Berdasarkan Jenis Dokumen
                </h3>
                <p className="text-sm text-color-secondary mt-1 m-0">
                    Proporsi penyebaran arsip aktif berdasarkan klasifikasi jenis dokumen dinas.
                </p>
            </div>

            <div className="grid align-items-center">
                <div className="col-12 md:col-6 flex justify-content-center relative" style={{ height: '300px' }}>
                    {hasData ? (
                        <>
                            <Chart type="doughnut" data={oChartData} options={chartOptions} style={{ position: 'relative', width: '100%', height: '100%' }} />
                            {/* Center Summary Text */}
                            <div className="absolute flex flex-column align-items-center justify-content-center" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none' }}>
                                <span className="text-4xl font-extrabold text-900 line-height-1">{totalCount}</span>
                                <span className="text-xs text-color-secondary font-bold uppercase mt-1">Total Arsip</span>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-column align-items-center justify-content-center text-center text-color-secondary p-4">
                            <i className="pi pi-chart-pie text-5xl mb-2 text-300" />
                            <span className="text-sm font-semibold">Tidak ada data dokumen aktif</span>
                        </div>
                    )}
                </div>

                <div className="col-12 md:col-6">
                    <div className="flex flex-column gap-2 mt-4 md:mt-0">
                        <span className="text-xs font-bold text-color-secondary uppercase tracking-wider mb-2" style={{ letterSpacing: '0.05em' }}>
                            Breakdown Detail
                        </span>
                        
                        {hasData ? (
                            chartData.map((item, index) => {
                                const percentage = totalCount> 0 ? ((item.count / totalCount) * 100).toFixed(1) : '0.0';
                                const color = colors[index % colors.length];
                                return (
                                    <div
                                        key={`list-item-${index}`}
                                        className="flex align-items-center justify-content-between p-3 border-round-xl border-1 border-50 premium-hover-card"
                                        style={{ background: '#fafafa', transition: 'all 0.2s ease' }}>
                                        <div className="flex align-items-center gap-3">
                                            <span className="inline-block flex-shrink-0" style={{ width: '12px', height: '12px', backgroundColor: color, borderRadius: '3px' }} />
                                            <div>
                                                <span className="font-bold text-sm text-800 block">{item.label}</span>
                                                <span className="text-xs text-color-secondary font-medium">{item.count} Dokumen</span>
                                            </div>
                                        </div>
                                        <span className="text-sm font-extrabold text-primary bg-blue-50 px-2 py-1 border-round-md" style={{ color: color, backgroundColor: `${color}0b` }}>
                                            {percentage}%
                                        </span>
                                    </div>
                                );
                            })
                        ) : (
                            <span className="text-sm text-color-secondary">Belum ada rincian data untuk ditampilkan.</span>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    );
}
