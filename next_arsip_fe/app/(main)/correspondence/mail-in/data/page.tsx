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
    IncomingLetterId: null,
    AgendaNumber: "",
    LetterNumber: "",
    LetterDate: "",
    ReceivedDate: "",
    SenderName: "",
    SenderInstitution: "",
    Subject: "",
    AttachmentDescription: "",
    LetterFile: null,
    LetterTypeId: null,
    DocumentTypeId: null,
    ArchiveClassificationId: null,
    ConfidentialityLevelId: null,
    Status: "baru",
    CreatedBy: null,
    UpdatedBy: null,
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

            if (!data.AgendaNumber) errors.AgendaNumber = "Nomor agenda wajib diisi";
            if (!data.LetterNumber) errors.LetterNumber = "Nomor surat wajib diisi";
            if (!data.LetterDate) errors.LetterDate = "Tanggal surat wajib diisi";
            if (!data.ReceivedDate) errors.ReceivedDate = "Tanggal diterima wajib diisi";
            if (!data.SenderName) errors.SenderName = "Pengirim wajib diisi";
            if (!data.Subject) errors.Subject = "Perihal wajib diisi";
            if (state.edit && !data.IncomingLetterId) errors.IncomingLetterId = "IncomingLetterId wajib diisi";

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
