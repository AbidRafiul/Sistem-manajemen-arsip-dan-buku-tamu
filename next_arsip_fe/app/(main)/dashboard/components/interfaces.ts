export interface SummaryData {
    arsipAktif: number;
    tamuHariIni: number;
    menungguDisposisi: number;
    retensiExpired: number;
}

export interface ChartData {
    labels: string[];
    data: number[];
}

export interface AuditLog {
    id: number;
    user: string;
    action: string;
    time: string;
    color: string;
}

export interface DashboardState {
    load: boolean;
    summary: SummaryData;
    chartData: ChartData;
    auditLogs: AuditLog[];
}
