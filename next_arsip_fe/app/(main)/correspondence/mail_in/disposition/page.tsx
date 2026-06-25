'use client';

import postData from '@/lib/axios/postData';
import { showError, showSuccess } from '@/lib/tools/generalTools';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Toast } from 'primereact/toast';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { apiEndpointGet } from '../components/endpoints';
import { TableData } from '../components/interfaces';
import { mapIncomingLetterRow } from '../components/mappers';
import styles from '../mail_in_dashboard.module.css';

const dispositionEndpoint = '/correspondence/letter-disposition-data';
const dispositionCreateEndpoint = '/correspondence/letter-disposition-create';
const dispositionProcessEndpoint = '/correspondence/letter-disposition-process';
const dispositionCompleteEndpoint = '/correspondence/letter-disposition-complete';
const dispositionReferenceEndpoint = '/correspondence/disposition-reference-data';

type DialogMode = 'create' | 'forward' | 'process' | 'complete';

type UserOption = {
    id_pengguna: number;
    nama_lengkap: string;
    nama_pengguna: string;
};

type InstructionOption = {
    disposition_instruction_id: number;
    instruction_name: string;
    instruction_code: string;
};

const statusClass: Record<string, string> = {
    baru: styles.statusWaiting,
    didisposisi: styles.statusWaiting,
    dibaca: styles.statusProcess,
    diproses: styles.statusProcess,
    selesai: styles.statusDone
};

const statusLabel: Record<string, string> = {
    baru: 'Baru',
    didisposisi: 'Didisposisi',
    dibaca: 'Dibaca',
    diproses: 'Diproses',
    selesai: 'Selesai'
};

const emptyForm = {
    incoming_letter_id: null as number | null,
    parent_disid_jabatan: null as number | null,
    from_id_pengguna: null as number | null,
    to_id_pengguna: null as number | null,
    disposition_instruction_id: null as number | null,
    instruction: '',
    disposition_note: '',
    due_date: ''
};

const formatDate = (value?: string) => {
    if (!value) return '-';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';

    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    }).format(date);
};

const getStatus = (value?: string) => String(value || 'baru').toLowerCase();

const Page = () => {
    const toast = useRef<Toast>(null);
    const [letters, setLetters] = useState<TableData[]>([]);
    const [dispositions, setDispositions] = useState<Record<string, any>[]>([]);
    const [users, setUsers] = useState<UserOption[]>([]);
    const [instructions, setInstructions] = useState<InstructionOption[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [dialogMode, setDialogMode] = useState<DialogMode | null>(null);
    const [selectedLetter, setSelectedLetter] = useState<TableData | null>(null);
    const [selectedDisposition, setSelectedDisposition] = useState<Record<string, any> | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [actionNote, setActionNote] = useState('');

    const fetchData = useCallback(
        async (keyword = search) => {
            setLoading(true);

            try {
                const [letterRes, dispositionRes, referenceRes] = await Promise.all([postData(apiEndpointGet, { keyword }), postData(dispositionEndpoint, { keyword }), postData(dispositionReferenceEndpoint)]);

                setLetters((letterRes.data?.data || []).map(mapIncomingLetterRow));
                setDispositions(dispositionRes.data?.data || []);
                setUsers(referenceRes.data?.data?.users || []);
                setInstructions(referenceRes.data?.data?.instructions || []);
            } catch (error: any) {
                const e = error?.response?.data || error;
                showError(toast, e?.message || 'Data workflow disposisi gagal diambil');
            } finally {
                setLoading(false);
            }
        },
        [search]
    );

    useEffect(() => {
        const timer = window.setTimeout(() => fetchData(search), 350);
        return () => window.clearTimeout(timer);
    }, [fetchData, search]);

    const letterOptions = useMemo(() => {
        return letters
            .filter((letter) => letter.status !== 'selesai')
            .map((letter) => ({
                label: `${letter.agenda_number || letter.letter_number} - ${letter.subject || '-'}`,
                value: letter.incoming_letter_id
            }));
    }, [letters]);

    const openCreateDialog = (letter?: TableData) => {
        setSelectedLetter(letter || null);
        setSelectedDisposition(null);
        setActionNote('');
        setForm({
            ...emptyForm,
            incoming_letter_id: letter?.incoming_letter_id || null
        });
        setDialogMode('create');
    };

    const openForwardDialog = (disposition: Record<string, any>) => {
        setSelectedDisposition(disposition);
        setSelectedLetter(letters.find((letter) => letter.incoming_letter_id === disposition.incoming_letter_id) || null);
        setActionNote('');
        setForm({
            ...emptyForm,
            incoming_letter_id: disposition.incoming_letter_id,
            parent_disid_jabatan: disposition.disid_jabatan,
            from_id_pengguna: disposition.to_id_pengguna || null
        });
        setDialogMode('forward');
    };

    const openActionDialog = (mode: 'process' | 'complete', disposition: Record<string, any>) => {
        setSelectedDisposition(disposition);
        setSelectedLetter(letters.find((letter) => letter.incoming_letter_id === disposition.incoming_letter_id) || null);
        setActionNote('');
        setDialogMode(mode);
    };

    const closeDialog = () => {
        setDialogMode(null);
        setSelectedLetter(null);
        setSelectedDisposition(null);
        setForm(emptyForm);
        setActionNote('');
    };

    const saveDisposition = async () => {
        if (!form.incoming_letter_id) {
            showError(toast, 'Pilih surat yang akan didisposisikan');
            return;
        }

        if (!form.to_id_pengguna) {
            showError(toast, 'Pilih tujuan disposisi');
            return;
        }

        setLoading(true);

        try {
            const payload = {
                incoming_letter_id: form.incoming_letter_id,
                parent_disid_jabatan: form.parent_disid_jabatan,
                from_id_pengguna: form.from_id_pengguna,
                to_id_pengguna: form.to_id_pengguna,
                disposition_instruction_id: form.disposition_instruction_id,
                instruction: form.instruction || null,
                disposition_note: form.disposition_note || null,
                due_date: form.due_date || null,
                created_by: null,
                updated_by: null
            };

            const res = await postData(dispositionCreateEndpoint, payload);
            showSuccess(toast, res.data?.message || 'Disposisi berhasil dibuat');
            closeDialog();
            await fetchData();
        } catch (error: any) {
            const e = error?.response?.data || error;
            showError(toast, e?.message || 'Disposisi gagal dibuat');
        } finally {
            setLoading(false);
        }
    };

    const saveAction = async () => {
        if (!selectedDisposition?.disid_jabatan) {
            showError(toast, 'Pilih disposisi terlebih dahulu');
            return;
        }

        setLoading(true);

        try {
            const endpoint = dialogMode === 'complete' ? dispositionCompleteEndpoint : dispositionProcessEndpoint;
            const payload =
                dialogMode === 'complete'
                    ? { disid_jabatan: selectedDisposition.disid_jabatan, complete_note: actionNote || null, updated_by: null }
                    : { disid_jabatan: selectedDisposition.disid_jabatan, process_note: actionNote || null, updated_by: null };

            const res = await postData(endpoint, payload);
            showSuccess(toast, res.data?.message || 'Status disposisi berhasil diperbarui');
            closeDialog();
            await fetchData();
        } catch (error: any) {
            const e = error?.response?.data || error;
            showError(toast, e?.message || 'Status disposisi gagal diperbarui');
        } finally {
            setLoading(false);
        }
    };

    const statusSummary = useMemo(() => {
        return letters.reduce<Record<string, number>>((acc, letter) => {
            const status = getStatus(letter.status);
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {});
    }, [letters]);

    const pendingLetters = letters.filter((letter) => letter.status !== 'selesai').slice(0, 6);
    const recentDispositions = dispositions.slice(0, 8);
    const renderStatus = (statusValue?: string) => {
        const status = getStatus(statusValue);
        return <span className={`${styles.statusPill} ${statusClass[status] || styles.statusProcess}`}>{statusLabel[status] || status}</span>;
    };

    const dialogTitle = {
        create: 'Buat Disposisi Surat',
        forward: 'Teruskan Disposisi',
        process: 'Proses Disposisi',
        complete: 'Selesaikan Disposisi'
    };

    return (
        <div className={styles.page}>
            <Toast ref={toast} position="top-right" />

            <section className={styles.hero}>
                <div>
                    <span className={styles.eyebrow}>Mail In</span>
                    <h1>Workflow Disposisi</h1>
                    <p>Kelola disposisi berjenjang, instruksi pimpinan, catatan, dan tracking status surat masuk.</p>
                </div>
                <div className={styles.heroActions}>
                    <span className={styles.searchBox}>
                        <i className="pi pi-search" />
                        <InputText value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari surat atau disposisi..." />
                    </span>
                    <Button icon="pi pi-send" label="Buat Disposisi" onClick={() => openCreateDialog()} />
                    <Button text icon="pi pi-refresh" label="Refresh" loading={loading} onClick={() => fetchData(search)} />
                </div>
            </section>

            <section className={styles.metricsGrid}>
                <article className={styles.metricCard}>
                    <span className={styles.metricIcon}>
                        <i className="pi pi-envelope" />
                    </span>
                    <small>Baru</small>
                    <strong>{(statusSummary.baru || 0).toLocaleString('id-ID')}</strong>
                </article>
                <article className={styles.metricCard}>
                    <span className={`${styles.metricIcon} ${styles.metricIconWarm}`}>
                        <i className="pi pi-share-alt" />
                    </span>
                    <small>Didisposisi</small>
                    <strong>{(statusSummary.didisposisi || 0).toLocaleString('id-ID')}</strong>
                </article>
                <article className={styles.metricWide}>
                    <div>
                        <small>Diproses / Selesai</small>
                        <strong>
                            {(statusSummary.diproses || 0).toLocaleString('id-ID')} / {(statusSummary.selesai || 0).toLocaleString('id-ID')}
                        </strong>
                        <p>Status surat bergerak otomatis dari aksi disposisi, bukan input manual.</p>
                    </div>
                    <span className={styles.progressRing}>{letters.length ? `${Math.round(((statusSummary.selesai || 0) / letters.length) * 100)}%` : '0%'}</span>
                </article>
            </section>

            <section className={styles.workflowGrid}>
                <div className={styles.tablePanel}>
                    <div className={styles.tableToolbar}>
                        <strong>Surat Perlu Disposisi</strong>
                        <span>{pendingLetters.length.toLocaleString('id-ID')} ditampilkan</span>
                    </div>
                    <div className={styles.tableWrap}>
                        <table>
                            <thead>
                                <tr>
                                    <th>No / Pengirim</th>
                                    <th>Perihal</th>
                                    <th>Status</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingLetters.map((letter) => (
                                    <tr key={letter.incoming_letter_id}>
                                        <td>
                                            <strong>{letter.agenda_number || letter.letter_number || '-'}</strong>
                                            <small>{letter.sender_name || '-'}</small>
                                        </td>
                                        <td>
                                            <strong>{letter.subject || '-'}</strong>
                                            <small>{letter.attachment_description || 'Tanpa keterangan lampiran'}</small>
                                        </td>
                                        <td>{renderStatus(letter.status)}</td>
                                        <td>
                                            <Button size="small" icon="pi pi-send" label={letter.status === 'baru' ? 'Disposisikan' : 'Tambah'} onClick={() => openCreateDialog(letter)} />
                                        </td>
                                    </tr>
                                ))}
                                {!loading && pendingLetters.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className={styles.emptyState}>
                                            Tidak ada surat yang menunggu disposisi.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className={styles.helpPanel}>
                    <h2>Alur Realita</h2>
                    <div className={styles.workflowSteps}>
                        <span>Surat Baru</span>
                        <span>Disposisi Pimpinan</span>
                        <span>Proses Unit</span>
                        <span>Teruskan bila perlu</span>
                        <span>Selesai</span>
                    </div>
                </div>
            </section>

            <section className={styles.tablePanel}>
                <div className={styles.tableToolbar}>
                    <strong>Alur Disposisi Berjenjang</strong>
                    <span>{dispositions.length.toLocaleString('id-ID')} disposisi</span>
                </div>
                <div className={styles.tableWrap}>
                    <table>
                        <thead>
                            <tr>
                                <th>Surat</th>
                                <th>Alur</th>
                                <th>Instruksi Pimpinan</th>
                                <th>Due Date</th>
                                <th>Status</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentDispositions.map((row) => {
                                const status = getStatus(row.status);
                                const isDone = status === 'selesai';
                                const isProcess = status === 'diproses';

                                return (
                                    <tr key={row.disid_jabatan}>
                                        <td>
                                            <strong>{row.agenda_number || row.letter_number || '-'}</strong>
                                            <small>{row.subject || '-'}</small>
                                        </td>
                                        <td>
                                            <strong>
                                                {row.from_user_name || 'Sekretariat'} → {row.to_user_name || '-'}
                                            </strong>
                                            <small>{row.parent_disid_jabatan ? `Lanjutan dari #${row.parent_disid_jabatan}` : 'Disposisi awal'}</small>
                                        </td>
                                        <td>
                                            <strong>{row.instruction_name || row.instruction || '-'}</strong>
                                            <small>{row.disposition_note || '-'}</small>
                                        </td>
                                        <td>{formatDate(row.due_date)}</td>
                                        <td>{renderStatus(row.status)}</td>
                                        <td>
                                            <div className={styles.actionButtons}>
                                                {!isDone && !isProcess && <Button size="small" text icon="pi pi-play" label="Proses" onClick={() => openActionDialog('process', row)} />}
                                                {!isDone && <Button size="small" text icon="pi pi-share-alt" label="Teruskan" onClick={() => openForwardDialog(row)} />}
                                                {!isDone && <Button size="small" text icon="pi pi-check" label="Selesai" onClick={() => openActionDialog('complete', row)} />}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {!loading && recentDispositions.length === 0 && (
                                <tr>
                                    <td colSpan={6} className={styles.emptyState}>
                                        Belum ada disposisi. Mulai dari tombol Buat Disposisi.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            <section className={styles.tablePanel}>
                <div className={styles.tableToolbar}>
                    <strong>Tracking Surat</strong>
                    <span>Riwayat penerimaan dan proses disposisi</span>
                </div>
                <div className={styles.tableWrap}>
                    <table>
                        <thead>
                            <tr>
                                <th>Penerima</th>
                                <th>Diproses Oleh</th>
                                <th>Waktu Proses</th>
                                <th>Status Terakhir</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dispositions.map((item) => {
                                const status = getStatus(item.status);
                                const processedAt = item.processed_at || item.completed_at || item.received_at || item.updated_at;
                                const processedBy = item.processed_by_name || (status === 'baru' ? '-' : item.to_user_name);

                                return (
                                    <tr key={`tracking-${item.disid_jabatan}`}>
                                        <td>
                                            <strong>{item.to_user_name || '-'}</strong>
                                            <small>
                                                {item.agenda_number || item.letter_number || '-'} · {item.subject || '-'}
                                            </small>
                                        </td>
                                        <td>
                                            <strong>{processedBy || '-'}</strong>
                                            <small>{item.parent_disid_jabatan ? `Disposisi lanjutan #${item.parent_disid_jabatan}` : 'Disposisi awal'}</small>
                                        </td>
                                        <td>
                                            <strong>{processedAt ? formatDate(processedAt) : '-'}</strong>
                                            <small>{item.instruction_name || item.instruction || 'Instruksi belum diisi'}</small>
                                        </td>
                                        <td>{renderStatus(item.status)}</td>
                                    </tr>
                                );
                            })}
                            {!loading && dispositions.length === 0 && (
                                <tr>
                                    <td colSpan={4} className={styles.emptyState}>
                                        Belum ada tracking disposisi.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            <section className={styles.bottomGrid}>
                <div className={styles.helpPanel}>
                    <h2>Catatan Workflow</h2>
                    <p>Disposisi awal dibuat oleh sekretariat/pimpinan. Jika penerima perlu mendelegasikan ke unit lain, gunakan Teruskan agar parent disposisi tetap tercatat.</p>
                </div>
            </section>

            <Dialog header={dialogMode ? dialogTitle[dialogMode] : 'Disposisi'} visible={Boolean(dialogMode)} modal style={{ width: '42rem', maxWidth: '95vw' }} onHide={closeDialog}>
                {(dialogMode === 'create' || dialogMode === 'forward') && (
                    <div className="flex flex-column gap-3">
                        <div className="flex flex-column gap-2">
                            <label htmlFor="incoming_letter_id">Surat</label>
                            <Dropdown
                                id="incoming_letter_id"
                                value={form.incoming_letter_id}
                                options={letterOptions}
                                onChange={(e) => setForm((prev) => ({ ...prev, incoming_letter_id: e.value }))}
                                placeholder="Pilih surat"
                                filter
                                disabled={dialogMode === 'forward' || Boolean(selectedLetter)}
                            />
                        </div>
                        {dialogMode === 'forward' && selectedDisposition && (
                            <div className={styles.noticeBox}>
                                Disposisi ini menjadi lanjutan dari #{selectedDisposition.disid_jabatan}: {selectedDisposition.to_user_name || '-'}
                            </div>
                        )}
                        <div className="flex flex-column gap-2">
                            <label htmlFor="to_id_pengguna">Tujuan Disposisi</label>
                            <Dropdown
                                id="to_id_pengguna"
                                value={form.to_id_pengguna}
                                options={users}
                                optionLabel="nama_lengkap"
                                optionValue="id_pengguna"
                                onChange={(e) => setForm((prev) => ({ ...prev, to_id_pengguna: e.value }))}
                                placeholder="Pilih pimpinan/unit/staf"
                                filter
                            />
                        </div>
                        <div className="flex flex-column gap-2">
                            <label htmlFor="disposition_instruction_id">Instruksi Pimpinan</label>
                            <Dropdown
                                id="disposition_instruction_id"
                                value={form.disposition_instruction_id}
                                options={instructions}
                                optionLabel="instruction_name"
                                optionValue="disposition_instruction_id"
                                onChange={(e) => setForm((prev) => ({ ...prev, disposition_instruction_id: e.value }))}
                                placeholder="Pilih instruksi"
                                showClear
                            />
                        </div>
                        <div className="flex flex-column gap-2">
                            <label htmlFor="instruction">Instruksi Tambahan</label>
                            <InputText id="instruction" value={form.instruction} onChange={(e) => setForm((prev) => ({ ...prev, instruction: e.target.value }))} placeholder="Contoh: Mohon telaah dan siapkan bahan tindak lanjut" />
                        </div>
                        <div className="flex flex-column gap-2">
                            <label htmlFor="disposition_note">Catatan Disposisi</label>
                            <InputTextarea id="disposition_note" value={form.disposition_note} onChange={(e) => setForm((prev) => ({ ...prev, disposition_note: e.target.value }))} rows={3} placeholder="Tambahkan catatan khusus untuk penerima" />
                        </div>
                        <div className="flex flex-column gap-2">
                            <label htmlFor="due_date">Batas Waktu</label>
                            <InputText id="due_date" type="date" value={form.due_date} onChange={(e) => setForm((prev) => ({ ...prev, due_date: e.target.value }))} />
                        </div>
                        <div className="flex justify-content-end gap-2">
                            <Button label="Batal" icon="pi pi-times" severity="secondary" outlined onClick={closeDialog} disabled={loading} />
                            <Button label={dialogMode === 'forward' ? 'Teruskan' : 'Buat Disposisi'} icon="pi pi-send" onClick={saveDisposition} loading={loading} />
                        </div>
                    </div>
                )}

                {(dialogMode === 'process' || dialogMode === 'complete') && (
                    <div className="flex flex-column gap-3">
                        <div className={styles.noticeBox}>
                            {selectedDisposition?.agenda_number || selectedDisposition?.letter_number || '-'} · {selectedDisposition?.subject || '-'}
                        </div>
                        <div className="flex flex-column gap-2">
                            <label htmlFor="action_note">{dialogMode === 'complete' ? 'Catatan Penyelesaian' : 'Catatan Proses'}</label>
                            <InputTextarea
                                id="action_note"
                                value={actionNote}
                                onChange={(e) => setActionNote(e.target.value)}
                                rows={4}
                                placeholder={dialogMode === 'complete' ? 'Contoh: Sudah ditindaklanjuti dan dokumen diarsipkan' : 'Contoh: Sedang ditelaah oleh unit terkait'}
                            />
                        </div>
                        <div className="flex justify-content-end gap-2">
                            <Button label="Batal" icon="pi pi-times" severity="secondary" outlined onClick={closeDialog} disabled={loading} />
                            <Button label={dialogMode === 'complete' ? 'Selesaikan' : 'Proses'} icon={dialogMode === 'complete' ? 'pi pi-check' : 'pi pi-play'} onClick={saveAction} loading={loading} />
                        </div>
                    </div>
                )}
            </Dialog>
        </div>
    );
};

export default Page;
