'use client'

import postData from "@/lib/axios/postData";
import { showError } from "@/lib/tools/generalTools";
import { useRouter } from "next/navigation";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { useEffect, useMemo, useRef, useState } from "react";
import { apiEndpointGet } from "./components/endpoints";
import { TableData } from "./components/interfaces";
import { mapIncomingLetterRow } from "./components/mappers";
import styles from "./mail_in_dashboard.module.css";

type FilterKey = "all" | "needs_action" | "archived";

const dispositionEndpoint = "/correspondence/letter-disposition-data";

const statusClass: Record<string, string> = {
    baru: styles.statusWaiting,
    diproses: styles.statusProcess,
    didisposisi: styles.statusWaiting,
    selesai: styles.statusDone,
};

const statusLabel: Record<string, string> = {
    baru: "Baru",
    diproses: "Diproses",
    didisposisi: "Menunggu Disposisi",
    selesai: "Selesai",
};

const formatDate = (value?: string) => {
    if (!value) return "-";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";

    return new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(date);
};

const formatTime = (value?: string) => {
    if (!value) return "";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    return new Intl.DateTimeFormat("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
};

const Page = () => {
    const toast = useRef<Toast>(null);
    const router = useRouter();
    const [letters, setLetters] = useState<TableData[]>([]);
    const [dispositions, setDispositions] = useState<Record<string, any>[]>([]);
    const [search, setSearch] = useState("");
    const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
    const [loading, setLoading] = useState(true);

    const fetchDashboard = async (keyword = "") => {
        setLoading(true);

        try {
            const [letterRes, dispositionRes] = await Promise.all([
                postData(apiEndpointGet, { keyword }),
                postData(dispositionEndpoint, { keyword }),
            ]);

            setLetters((letterRes.data?.data || []).map(mapIncomingLetterRow));
            setDispositions(dispositionRes.data?.data || []);
        } catch (error: any) {
            const e = error?.response?.data || error;
            showError(toast, e?.message || "Data dashboard surat masuk gagal diambil");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = window.setTimeout(() => fetchDashboard(search), 350);
        return () => window.clearTimeout(timer);
    }, [search]);

    const filteredLetters = useMemo(() => {
        if (activeFilter === "needs_action") {
            return letters.filter((letter) => letter.status !== "selesai");
        }

        if (activeFilter === "archived") {
            return letters.filter((letter) => letter.status === "selesai");
        }

        return letters;
    }, [activeFilter, letters]);

    const waitingDisposition = letters.filter((letter) => letter.status === "baru" || letter.status === "didisposisi").length;
    const completedLetters = letters.filter((letter) => letter.status === "selesai").length;
    const efficiency = letters.length ? Math.round((completedLetters / letters.length) * 100) : 0;
    const tableRows = filteredLetters.slice(0, 6);
    const recentLetters = letters.slice(0, 3);

    return (
        <div className={styles.page}>
            <Toast ref={toast} position="top-right" />

            <section className={styles.hero}>
                <div>
                    <span className={styles.eyebrow}>Protected Workspace</span>
                    <h1>Incoming Mail</h1>
                    <p>Kelola dan pantau alur disposisi surat masuk dalam satu dashboard arsip.</p>
                </div>

                <div className={styles.heroActions}>
                    <span className={styles.searchBox}>
                        <i className="pi pi-search" />
                        <InputText
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari surat masuk..."
                        />
                    </span>
                    <Button
                        label="Input Incoming Mail"
                        icon="pi pi-plus-circle"
                        onClick={() => router.push("/correspondence/mail_in/data")}
                    />
                </div>
            </section>

            <section className={styles.metricsGrid}>
                <article className={styles.metricCard}>
                    <span className={styles.metricIcon}><i className="pi pi-envelope" /></span>
                    <small>Total Received</small>
                    <strong>{letters.length.toLocaleString("id-ID")}</strong>
                </article>
                <article className={styles.metricCard}>
                    <span className={`${styles.metricIcon} ${styles.metricIconWarm}`}><i className="pi pi-clock" /></span>
                    <small>Waiting Disposition</small>
                    <strong>{waitingDisposition.toLocaleString("id-ID")}</strong>
                </article>
                <article className={styles.metricWide}>
                    <div>
                        <small>Processing Efficiency</small>
                        <strong>{efficiency}%</strong>
                        <p>{completedLetters.toLocaleString("id-ID")} dari {letters.length.toLocaleString("id-ID")} surat selesai diproses</p>
                    </div>
                    <span className={styles.progressRing}>{loading ? "..." : `${efficiency}%`}</span>
                </article>
            </section>

            <section className={styles.tablePanel}>
                <div className={styles.tableToolbar}>
                    <div className={styles.tabGroup}>
                        {[
                            { key: "all", label: "All Mail" },
                            { key: "needs_action", label: "Needs Action" },
                            { key: "archived", label: "Archived" },
                        ].map((item) => (
                            <button
                                key={item.key}
                                type="button"
                                className={activeFilter === item.key ? styles.activeTab : ""}
                                onClick={() => setActiveFilter(item.key as FilterKey)}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                    <Button
                        text
                        icon="pi pi-refresh"
                        label="Refresh"
                        loading={loading}
                        onClick={() => fetchDashboard(search)}
                    />
                </div>

                <div className={styles.tableWrap}>
                    <table>
                        <thead>
                            <tr>
                                <th>No / Sender</th>
                                <th>Subject</th>
                                <th>Date Received</th>
                                <th>Disposition Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tableRows.map((letter) => {
                                const status = String(letter.status || "baru").toLowerCase();

                                return (
                                    <tr key={letter.incoming_letter_id}>
                                        <td>
                                            <div className={styles.senderCell}>
                                                <span><i className="pi pi-file" /></span>
                                                <div>
                                                    <strong>{letter.agenda_number || letter.letter_number}</strong>
                                                    <small>{letter.sender_institution || letter.sender_name || "-"}</small>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <strong>{letter.subject || "-"}</strong>
                                            <small>{letter.letter_number || "-"}</small>
                                        </td>
                                        <td>
                                            <strong>{formatDate(letter.received_date)}</strong>
                                            <small>{formatTime(letter.received_date)}</small>
                                        </td>
                                        <td>
                                            <span className={`${styles.statusPill} ${statusClass[status] || styles.statusProcess}`}>
                                                {statusLabel[status] || letter.status}
                                            </span>
                                        </td>
                                        <td>
                                            <Button
                                                rounded
                                                text
                                                icon="pi pi-arrow-right"
                                                tooltip="Buka data surat"
                                                onClick={() => router.push("/correspondence/mail_in/data")}
                                            />
                                        </td>
                                    </tr>
                                );
                            })}
                            {!loading && tableRows.length === 0 && (
                                <tr>
                                    <td colSpan={5} className={styles.emptyState}>Belum ada data surat masuk.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className={styles.tableFooter}>
                    <span>Showing {tableRows.length ? 1 : 0} to {tableRows.length} of {filteredLetters.length.toLocaleString("id-ID")} entries</span>
                    <Button text label="Open Data Surat Masuk" icon="pi pi-list" onClick={() => router.push("/correspondence/mail_in/data")} />
                </div>
            </section>

            <section className={styles.bottomGrid}>
                <div className={styles.activity}>
                    <h2>Recent Activity</h2>
                    {recentLetters.map((letter) => (
                        <div className={styles.activityItem} key={letter.incoming_letter_id}>
                            <span />
                            <div>
                                <strong>{letter.sender_name || letter.sender_institution || "Surat masuk"}</strong>
                                <p>{letter.subject || letter.letter_number}</p>
                            </div>
                        </div>
                    ))}
                    {!loading && recentLetters.length === 0 && <p className={styles.mutedText}>Aktivitas terbaru belum tersedia.</p>}
                </div>

                <div className={styles.helpPanel}>
                    <h2>Disposition Queue</h2>
                    <strong>{dispositions.length.toLocaleString("id-ID")}</strong>
                    <p>Data diambil dari endpoint disposisi surat untuk memantau antrian tindak lanjut.</p>
                    <Button text label="Lihat Disposisi" icon="pi pi-send" onClick={() => router.push("/correspondence/mail_in/disposition")} />
                </div>
            </section>
        </div>
    );
};

export default Page;
