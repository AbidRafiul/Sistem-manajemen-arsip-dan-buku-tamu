'use client'

import { Card } from "primereact/card";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Tag } from "primereact/tag";

interface TrackingPanelProps {
    dispositions: Record<string, any>[];
    loading: boolean;
}

const formatDate = (value?: string) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(date);
};

const getStatus = (value?: string) => String(value || "baru").toLowerCase();

const statusLabel: Record<string, string> = {
    baru: "Baru",
    didisposisi: "Didisposisi",
    dibaca: "Dibaca",
    diproses: "Diproses",
    selesai: "Selesai",
};

const renderStatusTag = (statusValue?: string) => {
    const status = getStatus(statusValue);
    const severityMap: Record<string, "info" | "warning" | "success" | "danger"> = {
        baru: "info",
        didisposisi: "warning",
        dibaca: "warning",
        diproses: "warning",
        selesai: "success",
    };
    const iconMap: Record<string, string> = {
        baru: "pi pi-envelope",
        didisposisi: "pi pi-share-alt",
        dibaca: "pi pi-eye",
        diproses: "pi pi-cog",
        selesai: "pi pi-check-circle",
    };

    return (
        <Tag
            value={statusLabel[status] || status}
            severity={severityMap[status] || "info"}
            icon={iconMap[status] || "pi pi-circle"}
            style={{ fontSize: "0.72rem", padding: "0.3rem 0.65rem" }}
        />
    );
};

const trackingReceiverTemplate = (item: Record<string, any>) => (
    <div>
        <div className="font-semibold text-sm text-900">{item.to_user_name || "-"}</div>
        <div className="text-xs text-color-secondary">{item.nomor_agenda || item.nomor_surat || "-"} - {item.perihal || "-"}</div>
    </div>
);

const trackingProcessedTemplate = (item: Record<string, any>) => {
    const status = getStatus(item.status);
    const processedBy = item.processed_by_name || (status === "baru" ? "-" : item.to_user_name);

    return (
        <div>
            <div className="font-semibold text-sm text-900">{processedBy || "-"}</div>
            <div className="text-xs text-color-secondary">
                {item.disposisi_induk_id ? `Disposisi lanjutan #${item.disposisi_induk_id}` : "Disposisi awal"}
            </div>
        </div>
    );
};

const trackingTimeTemplate = (item: Record<string, any>) => {
    const processedAt = item.processed_at || item.completed_at || item.received_at || item.updated_at;

    return (
        <div>
            <div className="font-semibold text-sm text-900">{processedAt ? formatDate(processedAt) : "-"}</div>
            <div className="text-xs text-color-secondary">{item.nama_instruksi || item.instruksi || "Instruksi belum diisi"}</div>
        </div>
    );
};

const TrackingPanel = ({ dispositions, loading }: TrackingPanelProps) => (
    <Card className="shadow-1 border-round-2xl border-none">
        <div className="flex align-items-center gap-2 mb-3">
            <i className="pi pi-history text-primary" />
            <span className="font-bold text-900">Tracking Surat</span>
            <span className="text-color-secondary text-sm ml-1">- Riwayat penerimaan dan proses disposisi</span>
        </div>
        <DataTable
            value={dispositions}
            loading={loading}
            paginator
            rows={8}
            emptyMessage={
                <div className="flex flex-column align-items-center py-4 gap-2 text-color-secondary">
                    <i className="pi pi-list text-2xl text-300" />
                    <span className="text-sm">Belum ada tracking disposisi.</span>
                </div>
            }
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
            className="text-sm"
            rowHover
        >
            <Column header="Penerima" body={trackingReceiverTemplate} style={{ minWidth: "200px" }} />
            <Column header="Diproses Oleh" body={trackingProcessedTemplate} style={{ minWidth: "180px" }} />
            <Column header="Waktu Proses" body={trackingTimeTemplate} style={{ width: "140px" }} />
            <Column header="Status" body={(r) => renderStatusTag(r.status)} style={{ width: "120px" }} />
        </DataTable>
    </Card>
);

export default TrackingPanel;
