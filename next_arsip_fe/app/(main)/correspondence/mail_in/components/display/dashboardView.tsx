'use client'

import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Tag } from "primereact/tag";
import { TableData } from "../interfaces";
import TrackingPanel from "./trackingPanel";

export type FilterKey = "all" | "needs_action" | "archived";

export interface DashboardViewProps {
    letters: TableData[];
    dispositions: Record<string, any>[];
    activeFilter: FilterKey;
    loading: boolean;
    onFilterChange: (val: FilterKey) => void;
    onRefresh: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (value?: string) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(date);
};

const formatTime = (value?: string) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit" }).format(date);
};

const getStatus = (value?: string) => String(value || "baru").toLowerCase();

const statusLabel: Record<string, string> = {
    baru: "Baru",
    diproses: "Diproses",
    didisposisi: "Menunggu Disposisi",
    selesai: "Selesai",
};

const renderStatusTag = (statusValue?: string) => {
    const status = getStatus(statusValue);
    const severityMap: Record<string, "info" | "warning" | "success" | "danger"> = {
        baru: "info",
        didisposisi: "warning",
        diproses: "warning",
        selesai: "success",
    };
    const iconMap: Record<string, string> = {
        baru: "pi pi-envelope",
        didisposisi: "pi pi-share-alt",
        diproses: "pi pi-cog",
        selesai: "pi pi-check-circle",
    };
    return (
        <Tag
            value={statusLabel[status] || status}
            severity={severityMap[status] || "info"}
            icon={iconMap[status] || "pi pi-circle"}
            style={{ fontSize: "0.72rem", padding: "0.3rem 0.65rem" }} />
    );
};

const DashboardView = ({
    letters,
    dispositions,
    activeFilter,
    loading,
    onFilterChange,
    onRefresh,
}: DashboardViewProps) => {

    const waitingDisposition = letters.filter((l) => l.status === "baru" || l.status === "didisposisi").length;
    const completedLetters = letters.filter((l) => l.status === "selesai").length;
    const efficiency = letters.length ? Math.round((completedLetters / letters.length) * 100) : 0;

    const filteredLetters = letters.filter((letter) => {
        if (activeFilter === "needs_action") return letter.status !== "selesai";
        if (activeFilter === "archived") return letter.status === "selesai";
        return true;
    });

    const recentLetters = letters.slice(0, 3);

    // ─── Column Templates ────────────────────────────────────────────────────

    const letterNoTemplate = (rowData: TableData) => (
        <div className="flex align-items-center gap-2">
            <div className="flex align-items-center justify-content-center border-round surface-100" style={{ width: "2rem", height: "2rem" }}>
                <i className="pi pi-file text-primary text-sm" />
            </div>
            <div>
                <div className="font-semibold text-sm text-900">{rowData.nomor_agenda || rowData.nomor_surat}</div>
                <div className="text-xs text-color-secondary">{rowData.instansi_pengirim || rowData.nama_pengirim || "-"}</div>
            </div>
        </div>
    );

    const letterSubjectTemplate = (rowData: TableData) => (
        <div>
            <div className="font-semibold text-sm text-900">{rowData.perihal || "-"}</div>
            <div className="text-xs text-color-secondary mt-1">{rowData.nomor_surat || "-"}</div>
        </div>
    );

    const letterDateTemplate = (rowData: TableData) => (
        <div>
            <div className="font-semibold text-sm text-900">{formatDate(rowData.tanggal_diterima)}</div>
            <div className="text-xs text-color-secondary mt-1">{formatTime(rowData.tanggal_diterima)} WIB</div>
        </div>
    );

    return (
        <div className="flex flex-column gap-4">
            {/* ─── Hero Section ────────────────────────────────────────────── */}
            <Card className="border-none shadow-1 border-round-2xl overflow-hidden relative">
                <div className="flex flex-column md:flex-row align-items-center justify-content-between gap-3 z-1 relative">
                    <div>
                        <span className="text-primary font-bold text-xs uppercase" style={{ letterSpacing: "0.1em" }}>Halaman Kerja Terlindungi</span>
                        <h1 className="m-0 text-900 font-extrabold text-3xl mt-1 mb-2" style={{ letterSpacing: "-0.03em" }}>Surat Masuk</h1>
                        <p className="m-0 text-color-secondary text-sm font-medium">Monitoring alur disposisi surat masuk dalam satu dashboard arsip.</p>
                    </div>
                </div>
            </Card>

            {/* ─── Metrics Grid ────────────────────────────────────────────── */}
            <div className="grid">
                <div className="col-12 md:col-4">
                    <Card className="border-none shadow-1 border-round-xl p-1 bg-white h-full">
                        <div className="flex align-items-center gap-3">
                            <div className="flex align-items-center justify-content-center border-round-xl" style={{ width: "3.5rem", height: "3.5rem", background: "#EEF2FF", color: "#4F46E5" }}>
                                <i className="pi pi-envelope text-2xl" />
                            </div>
                            <div>
                                <span className="text-xs font-semibold text-color-secondary uppercase" style={{ letterSpacing: "0.05em" }}>Total Diterima</span>
                                <div className="text-3xl font-extrabold text-900 mt-1">{letters.length.toLocaleString("id-ID")}</div>
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="col-12 md:col-4">
                    <Card className="border-none shadow-1 border-round-xl p-1 bg-white h-full">
                        <div className="flex align-items-center gap-3">
                            <div className="flex align-items-center justify-content-center border-round-xl" style={{ width: "3.5rem", height: "3.5rem", background: "#FFFBEB", color: "#D97706" }}>
                                <i className="pi pi-clock text-2xl" />
                            </div>
                            <div>
                                <span className="text-xs font-semibold text-color-secondary uppercase" style={{ letterSpacing: "0.05em" }}>Menunggu Disposisi</span>
                                <div className="text-3xl font-extrabold text-900 mt-1">{waitingDisposition.toLocaleString("id-ID")}</div>
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="col-12 md:col-4">
                    <Card className="border-none shadow-1 border-round-xl p-1 bg-white h-full">
                        <div className="flex align-items-center justify-content-between gap-3">
                            <div className="flex align-items-center gap-3">
                                <div className="flex align-items-center justify-content-center border-round-xl" style={{ width: "3.5rem", height: "3.5rem", background: "#F0FDF4", color: "#16A34A" }}>
                                    <i className="pi pi-percentage text-2xl" />
                                </div>
                                <div>
                                    <span className="text-xs font-semibold text-color-secondary uppercase" style={{ letterSpacing: "0.05em" }}>Efisiensi Proses</span>
                                    <div className="text-xs text-color-secondary mt-1">
                                        <span className="font-bold text-900">{completedLetters}</span> dari {letters.length} surat selesai
                                    </div>
                                </div>
                            </div>
                            <div className="flex align-items-center justify-content-center border-circle font-extrabold text-base"
                                style={{ width: "3rem", height: "3rem", background: "linear-gradient(135deg, #10B981 0%, #059669 100%)", color: "#fff", flexShrink: 0 }}>
                                {efficiency}%
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* ─── Main Section ────────────────────────────────────────────── */}
            <div className="grid">
                {/* Left Panel: Table */}
                <div className="col-12 lg:col-8">
                    <Card className="border-none shadow-1 border-round-2xl h-full">
                        <div className="flex flex-column sm:flex-row align-align-items-center sm:align-items-center justify-content-between gap-3 mb-4">
                            <div className="flex gap-2">
                                <Button label="Semua Surat"
                                    onClick={() => onFilterChange("all")}
                                    text={activeFilter !== "all"}
                                    className={`text-sm py-2 px-3 border-round-lg font-semibold transition-colors transition-duration-150 mr-2 ${
                                        activeFilter === "all"
                                            ? "text-white shadow-2"
                                            : "surface-100 text-color-secondary hover:surface-200 border-none"
                                    }`}
                                    style={
                                        activeFilter === "all"
                                            ? { backgroundColor: "#10b981", border: "none" }
                                            : { border: "none" }
                                    } />
                                <Button label="Perlu Tindakan"
                                    onClick={() => onFilterChange("needs_action")}
                                    text={activeFilter !== "needs_action"}
                                    className={`text-sm py-2 px-3 border-round-lg font-semibold transition-colors transition-duration-150 mr-2 ${
                                        activeFilter === "needs_action"
                                            ? "text-white shadow-2"
                                            : "surface-100 text-color-secondary hover:surface-200 border-none"
                                    }`}
                                    style={
                                        activeFilter === "needs_action"
                                            ? { backgroundColor: "#10b981", border: "none" }
                                            : { border: "none" }
                                    } />
                                <Button label="Selesai / Arsip"
                                    onClick={() => onFilterChange("archived")}
                                    text={activeFilter !== "archived"}
                                    className={`text-sm py-2 px-3 border-round-lg font-semibold transition-colors transition-duration-150 ${
                                        activeFilter === "archived"
                                            ? "text-white shadow-2"
                                            : "surface-100 text-color-secondary hover:surface-200 border-none"
                                    }`}
                                    style={
                                        activeFilter === "archived"
                                            ? { backgroundColor: "#10b981", border: "none" }
                                            : { border: "none" }
                                    } />
                            </div>
                            <Button text
                                size="small"
                                icon="pi pi-refresh"
                                label="Refresh"
                                loading={loading}
                                onClick={onRefresh} />
                        </div>

                        <DataTable
                            value={filteredLetters.slice(0, 6)}
                            loading={loading}
                            emptyMessage={
                                <div className="flex flex-column align-items-center py-5 gap-2 text-color-secondary">
                                    <i className="pi pi-inbox text-3xl text-300" />
                                    <span className="text-sm font-semibold">Belum ada data surat masuk.</span>
                                </div>
                            }
                            className="text-sm"
                            rowHover>
                            <Column header="No / Pengirim" body={letterNoTemplate} style={{ minWidth: "180px" }} />
                            <Column header="Perihal" body={letterSubjectTemplate} style={{ minWidth: "200px" }} />
                            <Column header="Tanggal Diterima" body={letterDateTemplate} style={{ width: "160px" }} />
                            <Column header="Status Disposisi" body={(r) => renderStatusTag(r.status)} style={{ width: "150px" }} />
                        </DataTable>

                        <div className="flex align-items-center justify-content-start mt-4 pt-3 border-top-1 surface-border">
                            <span className="text-xs text-color-secondary font-medium">
                                Menampilkan {Math.min(filteredLetters.length, 6)} dari {filteredLetters.length.toLocaleString("id-ID")} entri
                            </span>
                        </div>
                    </Card>
                </div>

                {/* Right Panel: Recent Activities & Queue */}
                <div className="col-12 lg:col-4 flex flex-column gap-4">
                    {/* Recent Activity */}
                    <Card className="border-none shadow-1 border-round-2xl">
                        <div className="font-bold text-900 mb-3 flex align-items-center gap-2">
                            <i className="pi pi-history text-primary" />
                            <span>Aktivitas Terbaru</span>
                        </div>
                        <div className="flex flex-column gap-3">
                            {recentLetters.map((letter) => (
                                <div className="flex align-align-items-center gap-3 p-2 border-round hover:surface-50 transition-colors" key={letter.surat_masuk_id}>
                                    <div className="flex align-items-center justify-content-center border-circle bg-blue-50 border-1 border-blue-100 flex-shrink-0" style={{ width: "2rem", height: "2rem" }}>
                                        <i className="pi pi-envelope text-blue-500 text-xs" />
                                    </div>
                                    <div className="overflow-hidden">
                                        <div className="font-semibold text-sm text-900 truncate">{letter.nama_pengirim || letter.instansi_pengirim || "Surat Masuk"}</div>
                                        <p className="m-0 text-xs text-color-secondary mt-1 text-ellipsis">{letter.perihal || letter.nomor_surat}</p>
                                    </div>
                                </div>
                            ))}
                            {!loading && recentLetters.length === 0 && (
                                <p className="text-xs text-color-secondary text-center py-3 m-0">Aktivitas terbaru belum tersedia.</p>
                            )}
                        </div>
                    </Card>

                    {/* Disposition Queue */}
                    <Card className="border-none shadow-1 border-round-2xl text-white p-1" style={{ backgroundColor: "#10b981" }}>
                        <div className="p-3">
                            <div className="flex align-items-center justify-content-between mb-3">
                                <span className="text-xs font-semibold uppercase text-white-alpha-80" style={{ letterSpacing: "0.1em" }}>Disposisi Queue</span>
                                <i className="pi pi-send text-white-alpha-80" />
                            </div>
                            <div className="text-3xl font-extrabold mb-1">{dispositions.length.toLocaleString("id-ID")}</div>
                            <p className="m-0 text-xs text-white-alpha-90 leading-normal">Surat yang sedang dalam alur disposisi aktif berjenjang pimpinan dan staf.</p>
                        </div>
                    </Card>
                </div>
            </div>

            <TrackingPanel dispositions={dispositions} loading={loading} />
        </div>
    );
};

export default DashboardView;
