'use client'

import postData from "@/lib/axios/postData";
import { showError } from "@/lib/tools/generalTools";
import { useFormik } from "formik";
import { useSession } from "next-auth/react";
import { FilterMatchMode } from "primereact/api";
import { Toast } from "primereact/toast";
import { useEffect, useRef, useState } from "react";
import Table from "../components/display/table";
import { initValue, State } from "../components/interfaces";
import { mapIncomingLetterRow } from "../components/mappers";

const initialValues: initValue = {
    incoming_letter_id: null,
    agenda_number: "",
    letter_number: "",
    letter_date: "",
    received_date: "",
    sender_name: "",
    sender_institution: "",
    subject: "",
    attachment_description: "",
    letter_file: null,
    letter_type_id: null,
    document_type_id: null,
    archive_classification_id: null,
    confidentiality_level_id: null,
    status: "baru",
    created_by: null,
    updated_by: null,
};

const Page = () => {
    const toast = useRef<Toast>(null);
    const { data: session } = useSession();

    const [state, setState] = useState<State>({
        load: false,
        detail: false,
        detailLoad: false,
        detailData: null,
        data: [],
        add: false,
        edit: false,
        delete: false,
        selectedLetters: [],
        searchVal: "",
        statusFilter: "",
        filters: { global: { value: null, matchMode: FilterMatchMode.CONTAINS } },
        session: null,
        submittedData: null,
    });

    const formik = useFormik({
        initialValues,
        validate: (data: initValue) => {
            const errors = {} as Partial<Record<keyof initValue, string>>;

            if (!data.agenda_number) errors.agenda_number = "Nomor agenda wajib diisi";
            if (!data.letter_number) errors.letter_number = "Nomor surat wajib diisi";
            if (!data.letter_date) errors.letter_date = "Tanggal surat wajib diisi";
            if (!data.received_date) errors.received_date = "Tanggal diterima wajib diisi";
            if (!data.sender_name) errors.sender_name = "Pengirim wajib diisi";
            if (!data.subject) errors.subject = "Perihal wajib diisi";
            if (state.edit && !data.incoming_letter_id) errors.incoming_letter_id = "incoming_letter_id wajib diisi";

            return errors;
        },
        onSubmit: (data) => {
            setState((p) => ({ ...p, submittedData: data }));
        },
    });

    const getData = async (apiEndpoint: string, payload: Record<string, any> = {}) => {
        setState((p) => ({ ...p, load: true }));

        try {
            const res = await postData(apiEndpoint, payload);
            setState((p) => ({
                ...p,
                data: (res.data?.data || []).map(mapIncomingLetterRow),
            }));
        } catch (error: any) {
            const e = error?.response?.data || error;
            showError(toast, e?.message || "Terjadi Kesalahan");
        } finally {
            setState((p) => ({ ...p, load: false }));
        }
    };

    useEffect(() => {
        if (session) {
            setState((prev) => ({
                ...prev,
                session,
            }));
        }
    }, [session]);

    return (
        <div className="p-4">
            <Toast ref={toast} position="top-right" />
            <Table getData={getData} state={state} setState={setState} formik={formik} toast={toast} />
        </div>
    );
};

export default Page;
