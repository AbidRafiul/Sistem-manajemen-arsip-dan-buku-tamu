'use client'

import getDataRequest from "@/lib/axios/getData";
import { showError } from "@/lib/tools/generalTools";
import { useFormik } from "formik";
import { useSession } from "next-auth/react";
import { FilterMatchMode } from "primereact/api";
import { Toast } from "primereact/toast";
import { useEffect, useRef, useState } from "react";
import Table from "./components/display/table";
import { initValue, State } from "./components/interfaces";
import { mapOutgoingLetterRow } from "./components/mappers";

const initialValues: initValue = {
    id_surat_keluar: null,
    nomor_surat: "",
    nomor_agenda: "",
    tanggal_surat: "",
    tanggal_kirim: "",
    id_jenis_surat: null,
    perihal: "",
    tujuan: "",
    instansi_tujuan: "",
    media_pengiriman: "",
    id_template: null,
    isi_surat: "",
    isi_surat_final: "",
    nama_pengirim: "",
    jabatan: "",
    status: "draft",
    file_surat: null,
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
        jenisSuratFilter: null,
        tanggalMulai: "",
        tanggalAkhir: "",
        filters: { global: { value: null, matchMode: FilterMatchMode.CONTAINS } },
        session: null,
        submittedData: null,
    });

    const formik = useFormik({
        initialValues,
        validate: (data: initValue) => {
            const errors = {} as Partial<Record<keyof initValue, string>>;

            if (!data.nomor_surat) errors.nomor_surat = "Nomor surat wajib diisi";
            if (!data.tanggal_surat) errors.tanggal_surat = "Tanggal surat wajib diisi";
            if (!data.perihal) errors.perihal = "Perihal wajib diisi";
            if (!data.tujuan) errors.tujuan = "Tujuan wajib diisi";
            if (!data.id_jenis_surat) errors.id_jenis_surat = "Jenis surat wajib dipilih";
            if (state.edit && !data.id_surat_keluar) errors.id_surat_keluar = "ID surat keluar wajib diisi";

            return errors;
        },
        onSubmit: (data) => {
            setState((p) => ({ ...p, submittedData: data }));
        },
    });

    const getData = async (apiEndpoint: string, payload: Record<string, any> = {}) => {
        setState((p) => ({ ...p, load: true }));

        try {
            const res = await getDataRequest(apiEndpoint, payload);
            setState((p) => ({
                ...p,
                data: (res.data?.data || []).map(mapOutgoingLetterRow),
            }));
        } catch (error: any) {
            const e = error?.response?.data || error;
            showError(toast, e?.message || "Data surat keluar gagal diambil");
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
