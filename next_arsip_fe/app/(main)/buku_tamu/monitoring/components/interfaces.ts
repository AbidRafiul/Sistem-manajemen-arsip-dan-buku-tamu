export interface DashboardStats {
    total_tamu_hari_ini: number;
    sedang_berkunjung: number;
    selesai_kunjungan: number;
    chart_mingguan: number[];
    chart_trend_labels?: string[];
    chart_trend_data?: number[];
    chart_tujuan_labels: string[];
    chart_tujuan_data: number[];
}