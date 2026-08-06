"use client";
import React from 'react';
import { Card } from 'primereact/card';
import { Skeleton } from 'primereact/skeleton';
import { MetricCardsProps } from '../interfaces';

export default function MetricCards({ metrics, isLoading }: MetricCardsProps) {
    const cardsConfig = [
        {
            title: 'Pengarsipan Dokumen',
            value: metrics.pengarsipanDokumen,
            description: 'Total berkas dokumen aktif tersimpan',
            icon: 'pi pi-folder-open',
            gradient: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
            shadowColor: 'rgba(79, 70, 229, 0.2)'
        },
        {
            title: 'Dokumen Dipinjam',
            value: metrics.dokumenDipinjam,
            description: 'Berkas yang sedang dipinjam aktif',
            icon: 'pi pi-share-alt',
            gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            shadowColor: 'rgba(245, 158, 11 0.2)'
        },
        {
            title: 'Dokumen Dari Modul Surat',
            value: metrics.dokumenDariSurat,
            description: 'Surat masuk yang telah terarsip',
            icon: 'pi pi-envelope',
            gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            shadowColor: 'rgba(16, 185, 129, 0.2)'
        }
    ];

    if (isLoading) {
        return (
            <div className="grid">
                {[1, 2, 3].map((i) => (
                    <div className="col-12 md:col-4" key={`skeleton-${i}`}>
                        <Card className="border-none shadow-1 border-round-2xl p-2 bg-white">
                            <div className="flex justify-content-between align-items-center mb-3">
                                <Skeleton width="60%" height="1.5rem" />
                                <Skeleton shape="circle" size="2.5rem" />
                            </div>
                            <Skeleton width="40%" height="2.5rem" className="mb-2" />
                            <Skeleton width="80%" height="1rem" />
                        </Card>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid">
            {cardsConfig.map((card, index) => (
                <div className="col-12 md:col-4" key={`metric-${index}`}>
                    <Card
                        className="border-none shadow-2 border-round-2xl overflow-hidden position-relative bg-white premium-hover-card"
                        style={{
                            boxShadow: `0 10px 30px -10px ${card.shadowColor}`,
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                    >
                        <div className="flex justify-content-between align-align-items-center">
                            <div>
                                <span className="text-sm font-bold text-color-secondary uppercase tracking-wider block" style={{ letterSpacing: '0.05em' }}>
                                    {card.title}
                                </span>
                                <span className="text-4xl font-black text-900 mt-2 block" style={{ letterSpacing: '-0.03em' }}>
                                    {card.value.toLocaleString('id-ID')}
                                </span>
                            </div>
                            <div
                                className="flex align-items-center justify-content-center border-round-2xl text-white shadow-2"
                                style={{
                                    width: '3.5rem',
                                    height: '3.5rem',
                                    background: card.gradient,
                                    boxShadow: `0 4px 15px 0 ${card.shadowColor}`
                                }}
                            >
                                <i className={`${card.icon} text-2xl`} />
                            </div>
                        </div>
                        <div className="mt-3 flex align-items-center gap-1 text-xs text-color-secondary font-medium">
                            <i className="pi pi-info-circle text-xs" />
                            <span>{card.description}</span>
                        </div>
                    </Card>
                </div>
            ))}
        </div>
    );
}
