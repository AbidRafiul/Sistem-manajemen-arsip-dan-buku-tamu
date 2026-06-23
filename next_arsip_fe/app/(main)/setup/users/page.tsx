'use client'
import postData from "@/lib/axios/postData";
import apiGetData from "@/lib/axios/getData";
import { Toast } from "primereact/toast";
import { useEffect, useRef, useState } from "react";
import { showError, showSuccess } from "@/lib/tools/generalTools";
import { useFormik } from "formik";
import { initValue, NavState, State } from "./components/interfaces";
import Table from "./components/display/table";
import { FilterMatchMode } from "primereact/api";
import Form from "./components/display/form";
import { useSession } from "next-auth/react";
import { DataRekap } from "@/types/print-tools";
import Print from "./components/display/print";
import { 
    apiEndpointGetNavDataEdit, 
    apiEndpointUpdateNav, 
    apiEndpointCreate, 
    apiEndpointUpdate, 
    apiEndpointDelete, 
    apiEndpointGet 
} from "./components/endpoints";
import NavForm from "./components/display/navbar";

const Page = () => {
    const toast = useRef<Toast>(null)
    const { data: session } = useSession()

    // 1. TAMBAH MASTER DATA KE STATE GLOBAL
    const [state, setState] = useState<State & { masterData?: any }>({
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
        masterData: {
            branches: [],
            positions: [],
            divisions: [],
            departments: [],
            workUnits: [],
            roles: [] // Tempat nyimpen data mst_roles
        }
    })

    const [dataRekap, setDataRekap] = useState<DataRekap>({
        data: {},
        dataTotal: [],
        head: [],
        load: false,
        columnStyles: {},
        show: false,
        adjust: false,
        fileName: `laporan-user-${new Date().toISOString().slice(0, 10)}`,
        judul1: 'Laporan USER',
        judul2: ''
    });

    const [navBar, setNavBar] = useState<NavState>({
        data: [],
        menu: [],
        userId: "",
        load: false,
        show: false,
    })

    const formik = useFormik({
        initialValues: {
            user_id: '',
            fullname: '',
            username: '',
            password: '',
            telp: '',
            status: '0',
            role: '', // 2. PERBAIKAN: Jangan pakai 'superadmin', kosongkan saja karena isinya angka ID
        },
        validate: (data: initValue) => {
            let errors = {} as initValue;
            
            if (!data.fullname) {
                errors.fullname = 'Nama wajib diisi';
            } else if (data.fullname.length < 3) {
                errors.fullname = 'Nama harus terdiri dari minimal 3 karakter';
            } else if (!/^[a-zA-Z\s]+$/.test(data.fullname)) {
                errors.fullname = 'Nama hanya boleh berisi huruf dan spasi';
            }

            if (!data.username) {
                errors.username = 'Username wajib diisi';
            }

            if (!data.password && !state.edit) {
                errors.password = 'Password wajib diisi';
            }

            if (data.password) {
                if (data.password.length < 8) {
                    errors.password = 'Password harus terdiri dari minimal 8 karakter';
                } else if (!/[A-Z]/.test(data.password)) {
                    errors.password = 'Password harus mengandung huruf besar';
                } else if (!/[a-z]/.test(data.password)) {
                    errors.password = 'Password harus mengandung huruf kecil';
                } else if (!/[0-9]/.test(data.password)) {
                    errors.password = 'Password harus mengandung angka';
                } else if (!/[\W_]/.test(data.password)) {
                    errors.password = 'Password harus mengandung simbol';
                }
            }

            if (!data.telp) {
                errors.telp = 'Nomor HP wajib diisi';
            } else if (!/^(08|(\+62))\d{8,13}$/.test(data.telp)) {
                errors.telp = 'Nomor HP harus dimulai dengan 08 dan panjang 9-13 digit';
            }

            return errors;
        },
        onSubmit: (data) => {
            setState(p => ({ ...p, submittedData: data }));
        },
    });

    // A. Mengambil Master Data (Dropdown)
    useEffect(() => {
        if (state.add || state.edit) {
            const vaEndpoints = [
                { key: 'branches', path: '/master/organisasi/branches' },
                { key: 'positions', path: '/master/organisasi/positions' },
                { key: 'divisions', path: '/master/organisasi/divisions' },
                { key: 'departments', path: '/master/organisasi/department' },
                { key: 'workUnits', path: '/master/organisasi/work-unit' },
                { key: 'roles', path: '/setup/roles' } // Mengambil Role Dinamis
            ];

            const token = (session as any)?.accessToken || localStorage.getItem('token');
            const myUserId = (session as any)?.user?.UserId || (session as any)?.user?.id || '';

            vaEndpoints.forEach((oItem) => {
                apiGetData(oItem.path, {}, {
                    Authorization: `Bearer ${token}`,
                    'x-uniqueid': myUserId,
                    'x-timestamp': new Date().toISOString()
                })
                .then((oRes) => {
                    setState((prev: any) => ({
                        ...prev,
                        masterData: { ...prev.masterData, [oItem.key]: oRes.data.data }
                    }));
                })
                .catch((e) => console.error(`Error loading ${oItem.key}:`, e));
            });
        }
    }, [state.add, state.edit, session]);

    // B. Handle Save / Update
    const handleSave = async (input: initValue) => {
        setState((p) => ({ ...p, load: true }));

        try {
            const idUser = input.user_id;
            const isEdit = Boolean(idUser);
            const cEndPoint = isEdit ? apiEndpointUpdate : apiEndpointCreate;

            const oHeaders: Record<string, string> = {
                'X-Credential': JSON.stringify({
                    username: input.username,
                    password: input.password
                })
            };

            const oBody: Record<string, any> = {
                fullname: input.fullname,
                username: input.username,
                password: input.password,
                telp: input.telp,
                status: input.status,
                role: input.role,
                branch_id: input.branch_id,
                position_id: input.position_id,
                division_id: input.division_id,
                department_id: input.department_id,
                work_unit_id: input.work_unit_id
            };

            if (isEdit) oBody['user_id'] = idUser;

            const vaData = await postData(cEndPoint, oBody, oHeaders);
            showSuccess(toast, vaData.data?.data?.message || 'Berhasil Menyimpan Data');
            formik.resetForm();
            setState((p) => ({ ...p, add: false, edit: false, delete: false }));

            // Refresh tabel
            getData(apiEndpointGet);
        } catch (error: any) {
            const e = error?.response?.data || error;
            showError(toast, e?.message || 'Terjadi Kesalahan');
        } finally {
            setState((p) => ({ ...p, load: false, submittedData: null }));
        }
    };

    // C. Handle Delete
    const handleDelete = async () => {
        setState((p) => ({ ...p, load: true }));

        try {
            if (state.selectedUsers.length < 1) return;

            const vaUserId = state.selectedUsers.map((v: any) => v.user_id);
            const finalPayload = { userId: vaUserId.map(Number) };

            const vaData = await postData(apiEndpointDelete, finalPayload);
            showSuccess(toast, vaData.data?.data?.message || 'Berhasil Menghapus Data');

            setState((p) => ({ ...p, selectedUsers: [], delete: false }));
            
            // Refresh tabel
            getData(apiEndpointGet);
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

    const getNav = async (userId: string | number) => {
        setNavBar((p) => ({ ...p, load: true }));

        try {
            const headers = {
                'X-Level': '1',
            };
                const vaData = await apiGetData(apiEndpointGetNavDataEdit, { UserId: userId }, headers);
            
            let res = vaData.data;
            setNavBar((p) => ({
                ...p,
                data: JSON.parse(JSON.stringify(res.data)),
                menu: JSON.parse(JSON.stringify(res.menu)),
                userId,
                show: true
            }));
        } catch (error: any) {
            const e = error?.response?.data || error;
            showError(toast, e?.message || 'Terjadi Kesalahan');
        } finally {
            setNavBar((p) => ({ ...p, load: false }));
        }
    };

    const handleSaveNavbar = async () => {
        setNavBar((p) => ({ ...p, load: true }));

        try {
            const res = await postData(
                apiEndpointUpdateNav,
                {
                    UserId: navBar.userId,
                    Menu: JSON.stringify(navBar.menu),
                },
            );
            showSuccess(toast, res.data.message);
            setNavBar((p) => ({ ...p, show: false, }));
        } catch (error: any) {
            const e = error?.response?.data || error;
            showError(toast, e?.message || 'Terjadi Kesalahan');
        } finally {
            setNavBar((p) => ({ ...p, load: false }));
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
        <div className="p-4">
            <Toast ref={toast} position="top-right" />

            <Table getNav={getNav} dataRekap={dataRekap} setDataRekap={setDataRekap} state={state} toast={toast} setState={setState} formik={formik} getData={getData} />
            <Print dataRekap={dataRekap} setDataRekap={setDataRekap} state={state} toast={toast} setState={setState} formik={formik} getData={getData} />
            <NavForm navBar={navBar} setNavBar={setNavBar} handleSaveNavbar={handleSaveNavbar} />
            
            {/* 3. KOMPONEN FORM DIPANGGIL DI SINI DENGAN PROPS YANG LENGKAP */}
            <Form 
                formik={formik} 
                state={state} 
                setState={setState} 
                toast={toast} 
                getData={getData} 
                handleSave={handleSave} 
                handleDelete={handleDelete} 
            />
        </div>
    </>
}

export default Page