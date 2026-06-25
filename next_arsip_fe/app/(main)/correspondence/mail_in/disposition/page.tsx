'use client'

import postData from "@/lib/axios/postData";
import { showError, showSuccess } from "@/lib/tools/generalTools";
import { Toast } from "primereact/toast";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { apiEndpointGet } from "../components/endpoints";
import { TableData } from "../components/interfaces";
import { mapIncomingLetterRow } from "../components/mappers";
import DispositionView from "./components/display/dispositionView";

const dispositionEndpoint = "/correspondence/letter-disposition-data";
const dispositionCreateEndpoint = "/correspondence/letter-disposition-create";
const dispositionProcessEndpoint = "/correspondence/letter-disposition-process";
const dispositionCompleteEndpoint = "/correspondence/letter-disposition-complete";
const dispositionReferenceEndpoint = "/correspondence/disposition-reference-data";

type DialogMode = "create" | "forward" | "process" | "complete";

type UserOption = {
    user_id: number;
    fullname: string;
    username: string;
};

type InstructionOption = {
    disposition_instruction_id: number;
    instruction_name: string;
    instruction_code: string;
};

const emptyForm = {
    incoming_letter_id: null as number | null,
    parent_disposition_id: null as number | null,
    from_user_id: null as number | null,
    to_user_id: null as number | null,
    disposition_instruction_id: null as number | null,
    instruction: "",
    disposition_note: "",
    due_date: "",
};

const getStatus = (value?: string) => String(value || "baru").toLowerCase();

const Page = () => {
    const toast = useRef<Toast>(null);
    const [letters, setLetters] = useState<TableData[]>([]);
    const [dispositions, setDispositions] = useState<Record<string, any>[]>([]);
    const [users, setUsers] = useState<UserOption[]>([]);
    const [instructions, setInstructions] = useState<InstructionOption[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [dialogMode, setDialogMode] = useState<DialogMode | null>(null);
    const [selectedLetter, setSelectedLetter] = useState<TableData | null>(null);
    const [selectedDisposition, setSelectedDisposition] = useState<Record<string, any> | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [actionNote, setActionNote] = useState("");

    const fetchData = useCallback(async (keyword = search) => {
        setLoading(true);

        try {
            const [letterRes, dispositionRes, referenceRes] = await Promise.all([
                postData(apiEndpointGet, { keyword }),
                postData(dispositionEndpoint, { keyword }),
                postData(dispositionReferenceEndpoint),
            ]);

            setLetters((letterRes.data?.data || []).map(mapIncomingLetterRow));
            setDispositions(dispositionRes.data?.data || []);
            setUsers(referenceRes.data?.data?.users || []);
            setInstructions(referenceRes.data?.data?.instructions || []);
        } catch (error: any) {
            const e = error?.response?.data || error;
            showError(toast, e?.message || "Data workflow disposisi gagal diambil");
        } finally {
            setLoading(false);
        }
    }, [search]);

    useEffect(() => {
        const timer = window.setTimeout(() => fetchData(search), 350);
        return () => window.clearTimeout(timer);
    }, [fetchData, search]);

    const letterOptions = useMemo(() => {
        return letters
            .filter((letter) => letter.status !== "selesai")
            .map((letter) => ({
                label: `${letter.agenda_number || letter.letter_number} - ${letter.subject || "-"}`,
                value: letter.incoming_letter_id,
            }));
    }, [letters]);

    const openCreateDialog = (letter?: TableData) => {
        setSelectedLetter(letter || null);
        setSelectedDisposition(null);
        setActionNote("");
        setForm({
            ...emptyForm,
            incoming_letter_id: letter?.incoming_letter_id || null,
        });
        setDialogMode("create");
    };

    const openForwardDialog = (disposition: Record<string, any>) => {
        setSelectedDisposition(disposition);
        setSelectedLetter(letters.find((letter) => letter.incoming_letter_id === disposition.incoming_letter_id) || null);
        setActionNote("");
        setForm({
            ...emptyForm,
            incoming_letter_id: disposition.incoming_letter_id,
            parent_disposition_id: disposition.disposition_id,
            from_user_id: disposition.to_user_id || null,
        });
        setDialogMode("forward");
    };

    const openActionDialog = (mode: "process" | "complete", disposition: Record<string, any>) => {
        setSelectedDisposition(disposition);
        setSelectedLetter(letters.find((letter) => letter.incoming_letter_id === disposition.incoming_letter_id) || null);
        setActionNote("");
        setDialogMode(mode);
    };

    const closeDialog = () => {
        setDialogMode(null);
        setSelectedLetter(null);
        setSelectedDisposition(null);
        setForm(emptyForm);
        setActionNote("");
    };

    const saveDisposition = async () => {
        if (!form.incoming_letter_id) {
            showError(toast, "Pilih surat yang akan didisposisikan");
            return;
        }

        if (!form.to_user_id) {
            showError(toast, "Pilih tujuan disposisi");
            return;
        }

        setLoading(true);

        try {
            const payload = {
                incoming_letter_id: form.incoming_letter_id,
                parent_disposition_id: form.parent_disposition_id,
                from_user_id: form.from_user_id,
                to_user_id: form.to_user_id,
                disposition_instruction_id: form.disposition_instruction_id,
                instruction: form.instruction || null,
                disposition_note: form.disposition_note || null,
                due_date: form.due_date || null,
            };

            const res = await postData(dispositionCreateEndpoint, payload);
            showSuccess(toast, res.data?.message || "Disposisi berhasil dibuat");
            closeDialog();
            await fetchData();
        } catch (error: any) {
            const e = error?.response?.data || error;
            showError(toast, e?.message || "Disposisi gagal dibuat");
        } finally {
            setLoading(false);
        }
    };

    const saveAction = async () => {
        if (!selectedDisposition?.disposition_id) {
            showError(toast, "Pilih disposisi terlebih dahulu");
            return;
        }

        setLoading(true);

        try {
            const endpoint = dialogMode === "complete" ? dispositionCompleteEndpoint : dispositionProcessEndpoint;
            const payload = dialogMode === "complete"
                ? { disposition_id: selectedDisposition.disposition_id, complete_note: actionNote || null }
                : { disposition_id: selectedDisposition.disposition_id, process_note: actionNote || null };

            const res = await postData(endpoint, payload);
            showSuccess(toast, res.data?.message || "Status disposisi berhasil diperbarui");
            closeDialog();
            await fetchData();
        } catch (error: any) {
            const e = error?.response?.data || error;
            showError(toast, e?.message || "Status disposisi gagal diperbarui");
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
