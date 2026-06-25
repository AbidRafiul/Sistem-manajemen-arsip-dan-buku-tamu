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
        <Card className="shadow-1 border-round-2xl border-none h-full" pt={{ body: { className: 'p-4' } }}>
            <div className="mb-4">
                <h2 className="m-0 text-900 font-bold text-xl mb-1" style={{ letterSpacing: '-0.02em' }}>Log Audit</h2>
                <p className="m-0 text-color-secondary text-sm font-medium">Aktivitas terbaru yang butuh visibilitas.</p>
            </div>
            
            <Timeline 
                value={logs} 
                align="left"
                marker={customizedMarker} 
                content={customizedContent} 
                className="w-full" 
                pt={{ event: { className: 'min-h-0' } }} 
            />
        </Card>
    );
}
