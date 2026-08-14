import React from 'react';
import { Skeleton } from 'primereact/skeleton';
import { Card } from 'primereact/card';
import { Timeline } from 'primereact/timeline';

interface AuditTimelineProps {
    logs: any[];
    isLoading: boolean;
}

export default function AuditTimeline({ logs, isLoading }: AuditTimelineProps) {
    if (isLoading) {
        return (
            <Card className="shadow-1 border-round-2xl border-none h-full">
                <Skeleton width="100%" height="400px" borderRadius="16px" />
            </Card>
        );
    }

    const customizedMarker = (item: any) => {
        return (
            <span className="flex w-2rem h-2rem align-items-center justify-content-center text-white border-circle z-1 shadow-1" style={{ backgroundColor: item.color }}>
                <i className="pi pi-check text-xs"></i>
            </span>
        );
    };

    const customizedContent = (item: any) => {
        return (
            <div className="mb-4">
                <div className="font-bold text-900 text-sm mb-1">{item.action}</div>
                <div className="text-color-secondary text-sm">{item.user}</div>
                <div className="text-color-secondary text-xs mt-2 font-medium bg-gray-50 inline-block px-2 py-1 border-round border-1 border-200">{item.time}</div>
            </div>
        );
    };

    return (
        <Card className="shadow-1 border-round-2xl border-none h-full" pt={{ body: { className: 'p-4 flex flex-column h-full' }, content: { className: 'flex-1 p-0 m-0' } }}>
            <div className="mb-4">
                <h2 className="m-0 text-900 font-bold text-xl mb-1" style={{ letterSpacing: '-0.02em' }}>Log Audit</h2>
                <p className="m-0 text-color-secondary text-sm font-medium">Aktivitas terbaru yang butuh visibilitas.</p>
            </div>
            
            <div style={{ height: '350px', overflowY: 'auto', paddingRight: '8px' }} className="flex flex-column gap-3">
                {logs && logs.length> 0 ? (
                    logs.map((item) => (
                        <div key={item.id} className="flex align-align-items-center gap-3 p-3 bg-gray-50 border-round-xl border-1 border-100 hover:bg-gray-100 transition-duration-150 shadow-sm">
                            <div className="flex align-items-center justify-content-center border-circle text-white shadow-1" style={{ width: '2.5rem', height: '2.5rem', backgroundColor: item.color, flexShrink: 0 }}>
                                <i className="pi pi-user text-sm"></i>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-content-between align-items-center gap-2 mb-1">
                                    <span className="font-bold text-900 text-sm truncate">{item.user}</span>
                                    <span className="text-color-secondary text-xs font-semibold whitespace-nowrap bg-white px-2 py-0.5 border-round border-1 border-200 shadow-sm">{item.time}</span>
                                </div>
                                <span className="text-700 text-sm block line-height-3">{item.action}</span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-column align-items-center justify-content-center h-full text-color-secondary py-5">
                        <i className="pi pi-inbox text-3xl mb-2"></i>
                        <span className="text-sm font-medium">Belum ada riwayat aktivitas</span>
                    </div>
                )}
            </div>
        </Card>
    );
}
