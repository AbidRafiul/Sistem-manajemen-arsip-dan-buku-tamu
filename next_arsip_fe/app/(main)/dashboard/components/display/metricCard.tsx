import React from 'react';
import { Skeleton } from 'primereact/skeleton';

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

    if (isLoading) {
        return (
            <div className="dashboard-metrics-grid">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="dashboard-metric-card">
                        <Skeleton height="6.75rem" borderRadius="18px" />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="dashboard-metrics-grid">
            {vaMetrics.map((oMetric) => (
                <article className="dashboard-metric-card" key={oMetric.label}>
                    <div className={`dashboard-metric-icon dashboard-tone-${oMetric.tone}`}>
                        <i className={oMetric.icon}></i>
                    </div>
                    <div className="dashboard-metric-content">
                        <p>{oMetric.label}</p>
                        <h3>{oMetric.value}</h3>
                        <span>{oMetric.note}</span>
                    </div>
                </article>
            ))}
        </div>
    );
}
