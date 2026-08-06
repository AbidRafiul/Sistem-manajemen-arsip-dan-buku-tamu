'use client';
import postData from '@/lib/axios/postData';
import { Toast } from 'primereact/toast';
import { useEffect, useRef, useState } from 'react';
import { showError, showSuccess } from '@/lib/tools/generalTools';
import { useFormik } from 'formik';
import { initValue, NavState, State } from './components/interfaces';
import { FilterMatchMode } from 'primereact/api';
import Form from './components/display/form';
import { useSession } from "next-auth/react";
import formUpload from '@/lib/axios/formData';
import { apiEndpointCreate, apiEndpointGet } from './components/endpoints';

const Page = () => {
    const toast = useRef<Toast>(null);
    const { data: session } = useSession();

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
        submittedData: null,
        imgPrev: null
    });

    const formik = useFormik<initValue>({
        initialValues: {
            msNamaPerusahaan: '',
            msAlamatPerusahaan: '',
            msKotaPerusahaan: '',
            msTeleponPerusahaan: '',
            msNamaPimpinan: '',
            msEmailPerusahaan: '',
            msWebsitePerusahaan: '',
            msNomorIzin: '',
            msLogoPerusahaan: ''
        },
        validate: (data: initValue) => {
            let errors = {};
            // Validasi name

            return errors;
        },
        onSubmit: async (data) => {
            setState((p) => ({ ...p, load: true }));

            try {
                const oHeaders = {
                    'X-Level': '1'
                };

                const formData = new FormData();
                const { msLogoPerusahaan, ...rest } = data;

                const key = Object.keys(rest);
                const keterangan = Object.values(rest);

                formData.append('kode', JSON.stringify(key));
                formData.append('keterangan', JSON.stringify(keterangan));

                if (msLogoPerusahaan) {
                    formData.append('msLogoPerusahaan', msLogoPerusahaan);
                }

                const vaData = await formUpload(apiEndpointCreate, formData, oHeaders);
                const res = vaData.data;

                showSuccess(toast, res.data?.message || 'Konfigurasi berhasil disimpan');
                
                await getData(apiEndpointGet);
            } catch (error: any) {
                const e = error?.response?.data || error;
                showError(toast, e?.message || 'Terjadi kesalahan yang tidak terduga');
            } finally {
                setState((p) => ({ ...p, load: false, submittedData: null }));
            }
        }
    });

    const getData = async (apiEndpoint: string) => {
        setState((p) => ({ ...p, load: true }));
        try {
            const res = await postData(apiEndpoint, {
                kode: ['msNamaPerusahaan', 'msAlamatPerusahaan', 'msKotaPerusahaan', 'msTeleponPerusahaan', 'msNamaPimpinan', 'msEmailPerusahaan', 'msWebsitePerusahaan', 'msNomorIzin', 'msLogoPerusahaan']
            });

            const { msLogoPerusahaan, ...vaValues } = res.data?.data || {};

            formik.setValues(vaValues || {});

            setState((p) => ({
                ...p,
                imgPrev: msLogoPerusahaan
            }));
        } catch (error: any) {
            const e = error?.response?.data || error;
            showError(toast, e?.message || 'Terjadi Kesalahan');
        } finally {
            setState((p) => ({ ...p, load: false }));
        }
    };

    useEffect(() => {
        if (session) {
            setState((prev) => ({
                ...prev,
                session: session
            }));
        }
    }, [session]);

    useEffect(() => {
        getData(apiEndpointGet);
    }, []);

    return (
        <>
            <div className="">
                <Toast ref={toast} position="top-right" />
                <Form formik={formik} state={state} setState={setState} toast={toast} getData={getData} />
            </div>
        </>
    );
};

export default Page;
