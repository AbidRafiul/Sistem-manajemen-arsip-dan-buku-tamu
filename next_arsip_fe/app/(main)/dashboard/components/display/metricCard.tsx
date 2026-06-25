import React from 'react';
import { Skeleton } from 'primereact/skeleton';
import { Card } from 'primereact/card';

interface MetricCardsProps {
    data: {
        arsipAktif: number;
        tamuHariIni: number;
        menungguDisposisi: number;
        retensiExpired: number;
    };
    isLoading: boolean;
}

export default function MetricCards({ data, isLoading }: MetricCardsProps) {
    const vaMetrics = [
        {
            label: 'Arsip Aktif',
            value: data.arsipAktif.toLocaleString('id-ID'),
            // note: '+4.2% bulan ini',
            icon: 'pi pi-folder-open',
            tone: 'indigo'
        },
        {
            label: 'Tamu Berkunjung',
            value: data.tamuHariIni.toLocaleString('id-ID'),
            note: 'aktif hari ini',
            icon: 'pi pi-id-card',
            tone: 'emerald'
        },
        {
            label: 'Surat Disposisi',
            value: data.menungguDisposisi.toLocaleString('id-ID'),
            note: 'menunggu tindak lanjut',
            icon: 'pi pi-inbox',
            tone: 'amber'
        },
        {
            label: 'Retensi Expired',
            value: data.retensiExpired.toLocaleString('id-ID'),
            note: 'perlu review',
            icon: 'pi pi-exclamation-triangle',
            tone: 'rose'
        }
    ];

    const getColorClass = (tone: string) => {
        switch(tone) {
            case 'indigo': return 'text-indigo-600 bg-indigo-50';
            case 'emerald': return 'text-green-600 bg-green-50';
            case 'amber': return 'text-orange-600 bg-orange-50';
            case 'rose': return 'text-pink-600 bg-pink-50';
            default: return 'text-blue-600 bg-blue-50';
        }
    };

    if (isLoading) {
        return (
            <div className="grid">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="col-12 md:col-6 xl:col-3">
                        <Skeleton height="8.5rem" borderRadius="16px" className="shadow-1" />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid">
            {vaMetrics.map((oMetric) => (
                <div className="col-12 md:col-6 xl:col-3" key={oMetric.label}>
                    <Card className="shadow-1 border-round-2xl border-none h-full" pt={{ body: { className: 'p-4' }, content: { className: 'p-0 m-0' } }}>
                        <div className="flex justify-content-between align-items-start">
                            <div>
                                <span className="block text-color-secondary font-semibold text-sm mb-2">{oMetric.label}</span>
                                <div className="text-900 font-extrabold text-3xl mb-2" style={{ letterSpacing: '-0.02em' }}>{oMetric.value}</div>
                                {oMetric.note && <span className="text-color-secondary text-xs font-medium bg-gray-50 px-2 py-1 border-round">{oMetric.note}</span>}
                            </div>
                            <div className={`flex align-items-center justify-content-center border-round-xl ${getColorClass(oMetric.tone)}`} style={{ width: '3rem', height: '3rem' }}>
                                <i className={`${oMetric.icon} text-xl`}></i>
                            </div>
                        </div>
                    </Card>
                </div>
            ))}
        </div>
    );
}
