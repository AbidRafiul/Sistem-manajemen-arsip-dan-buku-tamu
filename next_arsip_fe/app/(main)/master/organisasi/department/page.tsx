"use client";
import postData from '@/lib/axios/postData';
import apiGetData from '@/lib/axios/getData';
import { Toast } from 'primereact/toast';
import { useEffect, useRef, useState } from 'react';
import { showError, showSuccess } from '@/lib/tools/generalTools';
import { useFormik } from 'formik';
import { initValue, State } from './components/interfaces';
import Table from './components/display/table';
import { FilterMatchMode } from 'primereact/api';
import Form from './components/display/form';
import { useSession } from 'next-auth/react';
import { apiEndpointCreate, apiEndpointUpdate, apiEndpointDelete, apiEndpointGet } from './components/endpoints';

const Page = () => {
    const toast = useRef<Toast>(null);
    const { data: session } = useSession();

    const [state, setState] = useState<State>({
        load: false,
        data: [],
        add: false,
        edit: false,
        delete: false,
        selectedData: [],
        searchVal: '',
        masterData: [],
        filters: { global: { value: null, matchMode: FilterMatchMode.CONTAINS } },
        session: null
    });

    const formik = useFormik({
        initialValues: {
            id_departemen: '',
            id_cabang: '',
            kode_departemen: '',
            nama_departemen: '',
            deskripsi: '',
            status: 'active'
        },
        validate: (data: initValue) => {
            let errors = {} as initValue;
            return errors;
        },
        onSubmit: async (data) => {
            await handleSave(data);
        }
    });


    // Fetch master data
    useEffect(() => {
        if (state.add || state.edit) {
            const token = (session as any)?.accessToken || localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };
            postData('/master/organisasi/branches/get_data', {}, headers).then(res => {
                setState(prev => ({ ...prev, masterData: res.data.data || [] }));
            }).catch(e => console.error(e));
        }
    }, [state.add, state.edit, session]);

    const handleSave = async (input: initValue) => {
        setState((p) => ({ ...p, load: true }));
        try {
            const isEdit = Boolean(input.id_departemen);
            const cEndPoint = isEdit ? apiEndpointUpdate : apiEndpointCreate;
            const oBody = { ...input };

            const vaData = await postData(cEndPoint, oBody);
            showSuccess(toast, vaData.data?.data?.message || 'Berhasil Menyimpan Data');
            formik.resetForm();
            setState((p) => ({ ...p, add: false, edit: false }));
            getData(apiEndpointGet);
        } catch (error: any) {
            showError(toast, error?.response?.data?.message || 'Terjadi Kesalahan');
        } finally {
            setState((p) => ({ ...p, load: false }));
        }
    };

    const handleDelete = async () => {
        setState((p) => ({ ...p, load: true }));
        try {
            if (state.selectedData.length < 1) return;
            const ids = state.selectedData.map((v: any) => v.id_departemen);
            // We use NamaPengguna key for soft deletes in legacy code if needed, but standard is id.
            // Let's match the backend standard for deletions which is mostly an array of IDs.
            // The backend for master uses body.id
            const finalPayload = { id: ids.map(Number) };

            const vaData = await postData(apiEndpointDelete, finalPayload);
            showSuccess(toast, vaData.data?.data?.message || 'Berhasil Menghapus Data');
            setState((p) => ({ ...p, selectedData: [], delete: false }));
            getData(apiEndpointGet);
        } catch (error: any) {
            showError(toast, error?.response?.data?.message || 'Terjadi Kesalahan');
        } finally {
            setState((p) => ({ ...p, load: false }));
        }
    }

    const getData = async (apiEndpoint: string) => {
        setState((p) => ({ ...p, load: true }));
        try {
            const res = await postData(apiEndpoint);
            setState((p) => ({ ...p, data: res.data.data }));
        } catch (error: any) {
            showError(toast, error?.response?.data?.message || 'Terjadi Kesalahan');
        } finally {
            setState((p) => ({ ...p, load: false }));
        }
    };

    useEffect(() => {
        if (session) {
            setState((prev) => ({ ...prev, session: session }));
        }
    }, [session]);

    return (
        <div className="p-4">
            <Toast ref={toast} position="top-right" />
            <Table state={state} toast={toast} setState={setState} formik={formik} getData={getData} handleSave={handleSave} handleDelete={handleDelete} />
            <Form formik={formik} state={state} setState={setState} toast={toast} getData={getData} handleSave={handleSave} handleDelete={handleDelete} />
        </div>
    );
};
export default Page;
