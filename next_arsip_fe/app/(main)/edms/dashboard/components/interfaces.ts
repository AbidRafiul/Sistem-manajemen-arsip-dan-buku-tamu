export interface ArchiveSummaryMetrics {
    pengarsipanDokumen: number;
    dokumenDipinjam: number;
    dokumenDariSurat: number;
}

export interface ChartDataGroup {
    label: string;
    count: number;
}

export interface WeeklyTrendData {
    labels: string[];
    data: number[];
}

export interface BorrowedItem {
    id_peminjaman: number;
    kode_dokumen: string;
    nama_dokumen: string;
    nama_peminjam: string;
    tanggal_pinjam: string;
    tanggal_pengembalian: string;
    keperluan: string;
    status: string;
}

export interface ArchiveDashboardState {
    load: boolean;
    metrics: ArchiveSummaryMetrics;
    chartData: ChartDataGroup[];
    weeklyTrend?: WeeklyTrendData;
    borrowedList?: BorrowedItem[];
}

export interface MetricCardsProps {
    metrics: ArchiveSummaryMetrics;
    isLoading: boolean;
}

export interface ChartSectionProps {
    chartData: ChartDataGroup[];
    isLoading: boolean;
}
