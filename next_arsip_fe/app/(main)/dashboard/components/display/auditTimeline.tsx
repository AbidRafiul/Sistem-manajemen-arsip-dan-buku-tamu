import React from 'react';
import { Skeleton } from 'primereact/skeleton';

interface AuditTimelineProps {
    logs: any[];
    isLoading: boolean;
}

export default function AuditTimeline({ logs, isLoading }: AuditTimelineProps) {
    if (isLoading) {
        return (
            <div className="dashboard-panel-card">
                <Skeleton width="100%" height="430px" borderRadius="24px" />
            </div>
        );
    }

    return (
        <article className="dashboard-panel-card dashboard-audit-panel">
            <div className="dashboard-panel-header">
                <div>
                    <h2>Audit Trail</h2>
                    <p>Aktivitas terbaru yang butuh visibilitas.</p>
                </div>
            </div>

            <div className="dashboard-audit-list">
                {logs.map((oLog) => (
                    <div className="dashboard-audit-item" key={oLog.id}>
                        <span className="dashboard-audit-marker" style={{ backgroundColor: oLog.color }}>
                            <i className="pi pi-check"></i>
                        </span>
                        <div>
                            <strong>{oLog.action}</strong>
                            <p>{oLog.user}</p>
                        </div>
                        <em>{oLog.time}</em>
                    </div>
                ))}
            </div>
        </article>
    );
}
