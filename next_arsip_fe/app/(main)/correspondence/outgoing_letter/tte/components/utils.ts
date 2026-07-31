import { formatDateCalendar } from "@/lib/tools/dateTools";

export const formatDate = (date?: string | null) => {
    if (!date) return "-";
    return formatDateCalendar(date, "dd MMM yyyy", null, "id") || "-";
};

export const formatDateTime = (date?: string | null) => {
    if (!date) return "-";
    return formatDateCalendar(date, "dd MMM yyyy HH:mm", null, "id") || "-";
};

export const formatFileSize = (size?: number | null) => {
    if (!size || size <= 0) return "-";
    if (size < 1024) return `${size} B`;
    const kb = size / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
};

export const statusTone = (status: string) => {
    const value = String(status || "").toLowerCase();
    if (["aktif", "disetujui", "terkirim", "selesai"].includes(value)) return "success";
    if (["menunggu", "draft", "pending"].includes(value)) return "warning";
    if (["gagal", "ditolak", "nonaktif", "dibatalkan"].includes(value)) return "danger";
    return "info";
};

export const statusIcon = (status: string) => {
    const value = String(status || "").toLowerCase();
    if (["aktif", "disetujui", "terkirim", "selesai"].includes(value)) return "pi pi-check-circle";
    if (["menunggu", "draft", "pending"].includes(value)) return "pi pi-clock";
    if (["gagal", "ditolak", "nonaktif", "dibatalkan"].includes(value)) return "pi pi-times-circle";
    return "pi pi-info-circle";
};

export const buildJoinLabel = (row: Record<string, any>) => {
    return row.nama_lengkap || row.nama_pengguna || row.username_pengguna || "-";
};
