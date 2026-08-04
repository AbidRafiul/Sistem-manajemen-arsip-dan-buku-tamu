"use client";
import postData from '@/lib/axios/postData';
import { Toast } from 'primereact/toast';
import { useEffect, useRef, useState } from 'react';
import { showError, showSuccess } from '@/lib/tools/generalTools';
import { useFormik } from 'formik';
import { initValue, State } from './components/interfaces';
import Table from './components/display/table';
import { FilterMatchMode } from 'primereact/api';
import Form from './components/display/form';
import PermissionsModal from './components/display/permissions_modal';
import { useSession } from 'next-auth/react';
import { apiEndpointCreate, apiEndpointUpdate, apiEndpointDelete, apiEndpointGet, apiEndpointPermissionsGet, apiEndpointPermissionsUpdate } from './components/endpoints';

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
        session: null,
        permissionsVisible: false,
        activeRoleForPermissions: null,
        permissionsNodes: [],
        permissionsLoading: false,
        permissionsSaving: false
    });

    const formik = useFormik({
        initialValues: {
            id_peran: '',
            kode_peran: '',
            nama_peran: '',
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

    const handleSave = async (input: initValue) => {
        setState((p) => ({ ...p, load: true }));
        try {
            const isEdit = Boolean(input.id_peran);
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
            const ids = state.selectedData.map((v: any) => v.id_peran);
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

    useEffect(() => {
        if (state.permissionsVisible && state.activeRoleForPermissions) {
            loadPermissions();
        } else {
            setState(p => ({ ...p, permissionsNodes: [] }));
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.permissionsVisible, state.activeRoleForPermissions]);

    const loadPermissions = async () => {
        setState(p => ({ ...p, permissionsLoading: true }));
        try {
            const res = await postData(apiEndpointPermissionsGet, { id_peran: state.activeRoleForPermissions.id_peran });
            setState(p => ({ ...p, permissionsNodes: res.data.data || [] }));
        } catch (error: any) {
            showError(toast, error?.response?.data?.message || 'Gagal memuat hak akses');
        } finally {
            setState(p => ({ ...p, permissionsLoading: false }));
        }
    };

    const collectPermissions = (nodesList: any[], flatList: any[] = []) => {
        nodesList.forEach(node => {
            flatList.push(node.data);
            if (node.children && node.children.length > 0) {
                collectPermissions(node.children, flatList);
            }
        });
        return flatList;
    };

    const handleSavePermissions = async () => {
        setState(p => ({ ...p, permissionsSaving: true }));
        try {
            const allPermissions = collectPermissions(state.permissionsNodes || []);
            await postData(apiEndpointPermissionsUpdate, { 
                id_peran: state.activeRoleForPermissions.id_peran,
                permissions: allPermissions
            });
            showSuccess(toast, 'Hak akses berhasil disimpan');
            setState((prev: any) => ({ ...prev, permissionsVisible: false, activeRoleForPermissions: null }));
        } catch (error: any) {
            showError(toast, error?.response?.data?.message || 'Gagal menyimpan hak akses');
        } finally {
            setState(p => ({ ...p, permissionsSaving: false }));
        }
    };

    return (
        <div className="w-full">
            <Toast ref={toast} position="top-right" />
            <Table state={state} toast={toast} setState={setState} formik={formik} getData={getData} handleSave={handleSave} handleDelete={handleDelete} />
            <Form formik={formik} state={state} setState={setState} toast={toast} getData={getData} handleSave={handleSave} handleDelete={handleDelete} />
            <PermissionsModal state={state} setState={setState} toast={toast} handleSavePermissions={handleSavePermissions} />
        </div>
    );
};
export default Page;
