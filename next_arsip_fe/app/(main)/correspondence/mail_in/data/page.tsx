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
    surat_masuk_id: null,
    nomor_agenda: "",
    nomor_surat: "",
    tanggal_surat: "",
    tanggal_diterima: "",
    nama_pengirim: "",
    instansi_pengirim: "",
    perihal: "",
    keterangan_lampiran: "",
    file_surat: null,
    jenis_surat_id: null,
    jenis_dokumen_id: null,
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

            if (state.edit && !data.nomor_agenda) errors.nomor_agenda = "Nomor agenda wajib diisi";
            if (!data.nomor_surat) errors.nomor_surat = "Nomor surat wajib diisi";
            if (!data.tanggal_surat) errors.tanggal_surat = "Tanggal surat wajib diisi";
            if (!data.tanggal_diterima) errors.tanggal_diterima = "Tanggal diterima wajib diisi";
            if (!data.nama_pengirim) errors.nama_pengirim = "Pengirim wajib diisi";
            if (!data.perihal) errors.perihal = "Perihal wajib diisi";
            if (!data.jenis_surat_id) errors.jenis_surat_id = "Jenis surat wajib dipilih";
            if (state.edit && !data.surat_masuk_id) errors.surat_masuk_id = "surat_masuk_id wajib diisi";

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
        <>
            <Toast ref={toast} position="top-right" />
            <Table getData={getData} state={state} setState={setState} formik={formik} toast={toast} />
        </>
    );
};

export default Page;
