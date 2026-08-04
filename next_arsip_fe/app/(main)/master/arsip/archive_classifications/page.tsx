"use client";
import postData from '@/lib/axios/postData';
import getDataInterceptor from '@/lib/axios/getData';
import putData from '@/lib/axios/putData';
import deleteData from '@/lib/axios/deleteData';
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
        filters: { global: { value: null, matchMode: FilterMatchMode.CONTAINS } },
        session: null
    });

    const formik = useFormik({
        initialValues: {
            id_klasifikasi: '',
            kode_klasifikasi: '',
            nama_klasifikasi: '',
            deskripsi: '',
            status: 'active'
        },
        validate: (data: initValue) => {
            let errors = {} as any;
            if (!data.kode_klasifikasi) {
                errors.kode_klasifikasi = 'Kode klasifikasi wajib diisi';
            }
            if (!data.nama_klasifikasi) {
                errors.nama_klasifikasi = 'Nama klasifikasi wajib diisi';
            }
            return errors;
        },
        onSubmit: async (data) => {
            await handleSave(data);
        }
    });

    const handleSave = async (input: initValue) => {
        setState((p) => ({ ...p, load: true }));
        try {
            const isEdit = Boolean(input.id_klasifikasi);
            if (isEdit) {
                const cEndPoint = `${apiEndpointUpdate}/${input.id_klasifikasi}`;
                const oBody = {
                    kode_klasifikasi: input.kode_klasifikasi,
                    nama_klasifikasi: input.nama_klasifikasi,
                    deskripsi: input.deskripsi,
                    status: input.status
                };
                const res = await putData(cEndPoint, oBody);
                showSuccess(toast, res.data?.message || 'Berhasil Memperbarui Data');
            } else {
                const oBody = {
                    kode_klasifikasi: input.kode_klasifikasi,
                    nama_klasifikasi: input.nama_klasifikasi,
                    deskripsi: input.deskripsi
                };
                const res = await postData(apiEndpointCreate, oBody);
                showSuccess(toast, res.data?.message || 'Berhasil Menyimpan Data');
            }
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
            for (const item of state.selectedData) {
                const cEndPoint = `${apiEndpointDelete}/${item.id_klasifikasi}`;
                await deleteData(cEndPoint);
            }
            showSuccess(toast, 'Berhasil Menghapus Data');
            setState((p) => ({ ...p, selectedData: [], delete: false }));
            getData(apiEndpointGet);
        } catch (error: any) {
            showError(toast, error?.response?.data?.message || 'Terjadi Kesalahan');
        } finally {
            setState((p) => ({ ...p, load: false }));
        }
    };

    const getData = async (apiEndpoint: string) => {
        setState((p) => ({ ...p, load: true }));
        try {
            const res = await getDataInterceptor(apiEndpoint);
            setState((p) => ({ ...p, data: res.data.data || [] }));
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
        <div className="w-full">
            <Toast ref={toast} position="top-right" />
            <Table state={state} toast={toast} setState={setState} formik={formik} getData={getData} handleSave={handleSave} handleDelete={handleDelete} />
            <Form formik={formik} state={state} setState={setState} toast={toast} getData={getData} handleSave={handleSave} handleDelete={handleDelete} />
        </div>
    );
};

export default Page;
