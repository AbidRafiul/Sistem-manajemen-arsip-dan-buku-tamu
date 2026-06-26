'use client';

import postData from '@/lib/axios/postData';
import { showError, showSuccess } from '@/lib/tools/generalTools';
import { Toast } from 'primereact/toast';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { apiEndpointGet } from '../components/endpoints';
import { TableData } from '../components/interfaces';
import { mapIncomingLetterRow } from '../components/mappers';
import DispositionView from './components/display/dispositionView';

const dispositionEndpoint = '/correspondence/letter-disposition-data';
const dispositionCreateEndpoint = '/correspondence/letter-disposition-create';
const dispositionProcessEndpoint = '/correspondence/letter-disposition-process';
const dispositionCompleteEndpoint = '/correspondence/letter-disposition-complete';
const dispositionReferenceEndpoint = '/correspondence/disposition-reference-data';

type DialogMode = 'create' | 'forward' | 'process' | 'complete';

type UserOption = {
    user_id: number;
    fullname: string;
    username: string;
};

type InstructionOption = {
    instruksi_disposisi_id: number;
    nama_instruksi: string;
    kode_instruksi: string;
};

const emptyForm = {
    surat_masuk_id: null as number | null,
    disposisi_induk_id: null as number | null,
    dari_pengguna_id: null as number | null,
    kepada_pengguna_id: null as number | null,
    instruksi_disposisi_id: null as number | null,
    instruksi: '',
    catatan_disposisi: '',
    batas_waktu: ''
};

const getStatus = (value?: string) => String(value || 'baru').toLowerCase();

const toNumber = (value: unknown) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
};

const normalizeUsers = (rows: Record<string, any>[]): UserOption[] => {
    return rows
        .map((row) => ({
            user_id: toNumber(row.id_pengguna ?? row.user_id ?? row.UserId ?? row.nama_pengguna),
            fullname: row.nama_lengkap || row.fullname || row.full_name || row.nama_pengguna || row.username || '',
            username: row.nama_pengguna || row.username || ''
        }))
        .filter((row) => row.user_id > 0);
};

const normalizeInstructions = (rows: Record<string, any>[]): InstructionOption[] => {
    return rows
        .map((row) => ({
            instruksi_disposisi_id: toNumber(row.instruksi_disposisi_id ?? row.instruksi_diposisi_id ?? row.disposition_instruction_id),
            nama_instruksi: row.nama_instruksi || row.instruction_name || '',
            kode_instruksi: row.kode_instruksi || row.instruction_code || ''
        }))
        .filter((row) => row.instruksi_disposisi_id > 0);
};

const getDispositionId = (disposition: Record<string, any> | null) => {
    if (!disposition) return null;
    return disposition.disposisi_surat_id ?? disposition.disposisi_id ?? disposition.disid_jabatan ?? disposition.disposition_id ?? null;
};

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
                const [letterRes, dispositionRes, referenceRes] = await Promise.all([
                    postData(apiEndpointGet, { keyword }),
                    postData(dispositionEndpoint, { keyword }),
                    postData(dispositionReferenceEndpoint)
                ]);

                setLetters((letterRes.data?.data || []).map(mapIncomingLetterRow));
                setDispositions(dispositionRes.data?.data || []);
                setUsers(normalizeUsers(referenceRes.data?.data?.users || []));
                setInstructions(normalizeInstructions(referenceRes.data?.data?.instructions || []));
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
            .filter((letter) => getStatus(letter.status) !== 'selesai')
            .map((letter) => ({
                label: `${letter.nomor_agenda || letter.nomor_surat} - ${letter.perihal || '-'}`,
                value: letter.surat_masuk_id
            }));
    }, [letters]);

    const openCreateDialog = (letter?: TableData) => {
        setSelectedLetter(letter || null);
        setSelectedDisposition(null);
        setActionNote('');
        setForm({
            ...emptyForm,
            surat_masuk_id: letter?.surat_masuk_id || null
        });
        setDialogMode('create');
    };

    const openForwardDialog = (disposition: Record<string, any>) => {
        setSelectedDisposition(disposition);
        setSelectedLetter(letters.find((letter) => letter.surat_masuk_id === disposition.surat_masuk_id) || null);
        setActionNote('');
        setForm({
            surat_masuk_id: disposition.surat_masuk_id || null,
            disposisi_induk_id: getDispositionId(disposition),
            dari_pengguna_id: disposition.kepada_pengguna_id || null
        });
        setDialogMode('forward');
    };

    const openActionDialog = (mode: 'process' | 'complete', disposition: Record<string, any>) => {
        setSelectedDisposition(disposition);
        setSelectedLetter(letters.find((letter) => letter.surat_masuk_id === disposition.surat_masuk_id) || null);
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
        if (!form.surat_masuk_id) {
            showError(toast, 'Pilih surat yang akan didisposisikan');
            return;
        }

        if (!form.kepada_pengguna_id) {
            showError(toast, 'Pilih tujuan disposisi');
            return;
        }

        setLoading(true);

        try {
            const payload = {
                surat_masuk_id: form.surat_masuk_id,
                disposisi_induk_id: form.disposisi_induk_id,
                dari_pengguna_id: form.dari_pengguna_id,
                kepada_pengguna_id: form.kepada_pengguna_id,
                instruksi_disposisi_id: form.instruksi_disposisi_id,
                instruksi: form.instruksi || null,
                catatan_disposisi: form.catatan_disposisi || null,
                batas_waktu: form.batas_waktu || null
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
        const disposisiSuratId = getDispositionId(selectedDisposition);

        if (!disposisiSuratId) {
            showError(toast, 'Pilih disposisi terlebih dahulu');
            return;
        }

        setLoading(true);

        try {
            const payload =
                dialogMode === 'complete'
                    ? { disid_jabatan: disposisiSuratId, complete_note: actionNote || null }
                    : { disposisi_id: disposisiSuratId, process_note: actionNote || null };

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

    const handleFormChange = (key: string, value: any) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    return (
        <div>
            <Toast ref={toast} position="top-right" />
            <DispositionView
                toast={toast}
                letters={letters}
                dispositions={dispositions}
                users={users}
                instructions={instructions}
                search={search}
                loading={loading}
                dialogMode={dialogMode}
                selectedLetter={selectedLetter}
                selectedDisposition={selectedDisposition}
                form={form}
                actionNote={actionNote}
                statusSummary={statusSummary}
                letterOptions={letterOptions}
                onSearchChange={setSearch}
                onFormChange={handleFormChange}
                onActionNoteChange={setActionNote}
                onOpenCreate={openCreateDialog}
                onOpenForward={openForwardDialog}
                onOpenAction={openActionDialog}
                onCloseDialog={closeDialog}
                onSaveDisposition={saveDisposition}
                onSaveAction={saveAction}
                onRefresh={() => fetchData(search)}
            />
        </div>
    );
};

export default Page;
