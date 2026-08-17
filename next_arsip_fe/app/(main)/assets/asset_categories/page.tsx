'use client'
import postData from "@/lib/axios/postData";
import { Toast } from "primereact/toast";
import { useEffect, useRef, useState } from "react";
import { showError, showSuccess } from "@/lib/tools/generalTools";
import { useFormik } from "formik";
import { initValue, State } from "./components/interfaces";
import Table from "./components/display/table";
import { FilterMatchMode } from "primereact/api";
import Form from "./components/display/form";
import { useSession } from "next-auth/react";
import { apiEndpointCreate, apiEndpointDelete, apiEndpointGet, apiEndpointUpdate } from "./components/endpoints";

const Page = () => {
    const toast = useRef<Toast>(null)
    const { data: session } = useSession()

    const [state, setState] = useState<State>({
        load: false,
        data: [],
        add: false,
        edit: false,
        delete: false,
        selectedUsers: [],
        searchVal: '',
        filters: { global: { value: null, matchMode: FilterMatchMode.CONTAINS } },
        session: null,
        submittedData: null
    })

    const formik = useFormik({
        initialValues: {
            Code: '',
            Name: '',
            Description: ''
        },
        validate: (data: initValue) => {
            let errors = {} as initValue;
            if (!data.Name) {
                errors.Name = 'Nama wajib diisi';
            }

            if (!data.Description) {
                errors.Description = 'Description wajib diisi';
            }

            if (!data.Code && state.edit) {
                errors.Code = 'Code wajib diisi';
            }

            return errors;
        },
        onSubmit: async (data) => {
            setState((p) => ({ ...p, load: true }));

            try {
                const isEdit = Boolean(state.edit);
                const cEndPoint = isEdit ? apiEndpointUpdate : apiEndpointCreate;

                const oHeaders: Record<string, string> = {
                    'X-Level': '1'
                };

                const oBody: Record<string, any> = {
                    Name: data.Name,
                    Description: data.Description
                };

                if (isEdit) {
                    oBody['Code'] = data.Code;
                }

                const vaData = await postData(cEndPoint, oBody, oHeaders);
                const res = vaData.data;

                showSuccess(toast, res.data?.message || 'Berhasil Menyimpan Data');
                formik.resetForm();
                setState((p: any) => ({ ...p, add: false, edit: false, delete: false }));
                await getData(apiEndpointGet);
            } catch (error: any) {
                const e = error?.response?.data || error;
                showError(toast, e?.message || 'Terjadi Kesalahan');
            } finally {
                setState((p) => ({ ...p, load: false, submittedData: null }));
            }
        },
    });

    const handleDelete = async () => {
        setState((p) => ({ ...p, load: true }));

        try {
            if (state.selectedUsers.length < 1) {
                showError(toast, 'Tidak Ada Kategori yang Dipilih')
                return
            }

            const vaCode = state.selectedUsers.map((v) => v.Code);

            const vaData = await postData(apiEndpointDelete, { Code: vaCode });
            const res = vaData.data;

            showSuccess(toast, res.data?.message || 'Berhasil Menghapus Data');
            setState((p) => ({ ...p, selectedUsers: [], add: false, edit: false, delete: false }));
            await getData(apiEndpointGet);
        } catch (error: any) {
            const e = error?.response?.data || error;
            showError(toast, e?.message || 'Terjadi Kesalahan');
        } finally {
            setState((p) => ({ ...p, load: false }));
        }
    };


    const getData = async (apiEndpoint: string) => {
        setState((p) => ({ ...p, load: true }));
        try {
            const res = await postData(apiEndpoint);
            setState((p) => ({
                ...p,
                data: res.data.data
            }));

        } catch (error: any) {
            const e = error?.response?.data || error;
            showError(toast, e?.message || 'Terjadi Kesalahan');
        } finally {
            setState((p) => ({ ...p, load: false }));
        }
    }


    useEffect(() => {
        if (session) {
            setState((prev) => ({
                ...prev,
                session: session
            }));
        }
    }, [session]);

    return <>
        <Toast ref={toast} position="top-right" />
        <Table getData={getData} state={state} setState={setState} formik={formik} toast={toast} />

    </>
}

export default Page
