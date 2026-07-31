import React from 'react';
import { Card } from 'primereact/card';
import { DashboardStats } from '../interfaces';

interface StatsCardsProps {
    stats: DashboardStats;
}

export default function StatsCards({ stats }: StatsCardsProps) {
    const vaMetrics = [
        {
            label: 'Total Tamu Hari Ini',
            value: (stats.total_tamu_hari_ini || 0).toLocaleString('id-ID'),
            note: 'akumulasi hari ini',
            icon: 'pi pi-users',
            colorClass: 'text-indigo-600 bg-indigo-50'
        },
        {
            label: 'Sedang Berkunjung',
            value: (stats.sedang_berkunjung || 0).toLocaleString('id-ID'),
            note: 'tamu aktif di lokasi',
            icon: 'pi pi-id-card',
            colorClass: 'text-orange-600 bg-orange-50'
        },
        {
            label: 'Selesai Kunjungan',
            value: (stats.selesai_kunjungan || 0).toLocaleString('id-ID'),
            note: 'telah check-out',
            icon: 'pi pi-check-circle',
            colorClass: 'text-green-600 bg-green-50'
        }
    ];

    return (
        <div className="grid">
            {vaMetrics.map((oMetric) => (
                <div className="col-12 md:col-4" key={oMetric.label}>
                    <Card 
                        className="shadow-1 border-round-2xl border-none h-full hover:shadow-3 hover:-translate-y-1 transition-all transition-duration-200" 
                        pt={{ body: { className: 'p-4' }, content: { className: 'p-0 m-0' } }}
                    >
                        <div className="flex justify-content-between align-items-start">
                            <div>
                                <span className="block text-color-secondary font-semibold text-sm mb-2">{oMetric.label}</span>
                                <div className="text-900 font-extrabold text-3xl mb-2" style={{ letterSpacing: '-0.02em' }}>{oMetric.value}</div>
                                {oMetric.note && <span className="text-color-secondary text-xs font-medium bg-gray-50 px-2 py-1 border-round">{oMetric.note}</span>}
                            </div>
                            <div className={`flex align-items-center justify-content-center border-round-xl ${oMetric.colorClass}`} style={{ width: '3rem', height: '3rem' }}>
                                <i className={`${oMetric.icon} text-xl`}></i>
                            </div>
                        </div>
                    </Card>
                </div>
            ))}
        </div>
    );
}
