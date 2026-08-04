'use client';
import postData from '@/lib/axios/postData';
import apiGetData from '@/lib/axios/getData';
import { Toast } from 'primereact/toast';
import { useEffect, useRef, useState } from 'react';
import { showError, showSuccess } from '@/lib/tools/generalTools';
import { useFormik } from 'formik';
import { initValueMenu, State } from './components/interfaces';
import Table from './components/display/table';
import { FilterMatchMode } from 'primereact/api';
import Form from './components/display/form';
import { useSession } from 'next-auth/react';
import { 
    apiEndpointCreateMenu, 
    apiEndpointUpdateMenu, 
    apiEndpointDeleteMenu, 
    apiEndpointGetMenu 
} from './components/endpoints';

const MenuPage = () => {
    const toast = useRef<Toast>(null);
    const { data: session } = useSession();

    // 1. STATE GLOBAL KHUSUS MENU
    const [state, setState] = useState<State & { masterData?: any }>({
        load: false,
        data: [], 
        add: false,
        edit: false,
        delete: false,
        selectedData: [], 
        searchVal: '',
        filters: { global: { value: null, matchMode: FilterMatchMode.CONTAINS } },
        session: null,
        submittedData: null,
        masterData: {
            roles: [], 
            parentMenus: [] 
        }
    });

    // 2. FORMIK KHUSUS MENU
    const formik = useFormik({
        initialValues: {
            id_menu: '',
            kode_menu: '',
            nama_menu: '',
            jalur_menu: '',
            ikon_menu: '',
            urutan: 0,
            status_aktif: 1,
            id_menu_induk: '', 
            id_peran: [] 
        },
        validate: (data: initValueMenu) => {
            let errors = {} as any;

            if (!data.kode_menu) errors.kode_menu = 'Kode menu wajib diisi';
            if (!data.nama_menu) errors.nama_menu = 'Nama menu wajib diisi';
            if (data.urutan < 0) errors.urutan = 'Urutan tidak boleh minus';

            return errors;
        },
        onSubmit: async (data) => {
            await handleSave(data);
        }
    });

    // 3. AMBIL MASTER DATA
    useEffect(() => {
        if (state.add || state.edit) {
            const token = (session as any)?.accessToken || localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            Promise.all([
                postData('/master/organisasi/roles/get_data', {}, headers),
                postData(apiEndpointGetMenu, {}, headers)
            ]).then(([resRoles, resMenus]) => {
                setState((prev: any) => ({
                    ...prev,
                    masterData: { 
                        roles: resRoles.data.data, 
                        parentMenus: resMenus.data.data 
                    }
                }));
            }).catch(e => console.error("Gagal load master data menu:", e));
        }
    }, [state.add, state.edit, session]);

    // 4. HANDLE SAVE / UPDATE MENU
    const handleSave = async (input: initValueMenu) => {
        // FIX: Ubah add jadi load
        setState((p: any) => ({ ...p, load: true }));

        try {
            const idMenu = input.id_menu;
            const isEdit = Boolean(idMenu);
            const cEndPoint = isEdit ? apiEndpointUpdateMenu : apiEndpointCreateMenu;

            const oBody: Record<string, any> = {
                kode_menu: input.kode_menu,
                nama_menu: input.nama_menu,
                jalur_menu: input.jalur_menu,
                ikon_menu: input.ikon_menu,
                urutan: input.urutan,
                status_aktif: input.status_aktif,
                id_menu_induk: input.id_menu_induk || null,
                id_peran: input.id_peran 
            };

            if (isEdit) oBody['id_menu'] = idMenu;

            const vaData = await postData(cEndPoint, oBody);
            await postData('setup/menu/rebuild', {});
            showSuccess(toast, vaData.data?.message || 'Menu Berhasil Disimpan & Cache Diperbarui!');
            
            formik.resetForm();
            setState((p: any) => ({ ...p, add: false, edit: false }));

            getData(apiEndpointGetMenu);
        } catch (error: any) {
            showError(toast, error?.response?.data?.message || 'Terjadi Kesalahan');
        } finally {
            setState((p: any) => ({ ...p, load: false, submittedData: null }));
        }
    };

    // 5. HANDLE DELETE MENU
    const handleDelete = async () => {
        // FIX: Ubah add jadi load
        setState((p: any) => ({ ...p, load: true }));

        try {
            if (state.selectedData.length < 1) return;

            const vaIdMenu = state.selectedData.map((v: any) => v.id_menu);
            const finalPayload = { IdMenu: vaIdMenu.map(Number) };

            const vaData = await postData(apiEndpointDeleteMenu, finalPayload);
            showSuccess(toast, vaData.data?.message || 'Menu Berhasil Dihapus');

            setState((p: any) => ({ ...p, selectedData: [], delete: false }));
            getData(apiEndpointGetMenu);
        } catch (error: any) {
            showError(toast, error?.response?.data?.message || 'Terjadi Kesalahan');
        } finally {
            // FIX: Ubah add jadi load
            setState((p: any) => ({ ...p, load: false }));
        }
    }

    const getData = async (apiEndpoint: string) => {
        // FIX: Ubah add jadi load
        setState((p: any) => ({ ...p, load: true }));
        try {
            const res = await postData(apiEndpoint);
            setState((p: any) => ({ ...p, data: res.data.data }));
        } catch (error: any) {
            showError(toast, error?.response?.data?.message || 'Terjadi Kesalahan');
        } finally {
            // FIX: Ubah add jadi load
            setState((p: any) => ({ ...p, load: false }));
        }
    };

    useEffect(() => {
        if(session) getData(apiEndpointGetMenu);
    }, [session]);

    return (
        <>
            <Toast ref={toast} position="top-right" />
            
            <Table 
                state={state} 
                toast={toast} 
                setState={setState} 
                formik={formik} 
                getData={getData} 
                handleSave={handleSave} 
                handleDelete={handleDelete} 
            />

            <Form 
                formik={formik} 
                state={state} 
                setState={setState} 
                toast={toast} 
                getData={getData} 
                handleSave={handleSave} 
                handleDelete={handleDelete} 
            />
        </>
    );
};

export default MenuPage;