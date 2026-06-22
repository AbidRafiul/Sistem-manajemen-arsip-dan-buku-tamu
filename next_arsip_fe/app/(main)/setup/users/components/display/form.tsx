'use client';

import { Dialog } from 'primereact/dialog';
import { FormProps, initValue } from '../interfaces';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { apiEndpointCreate, apiEndpointDelete, apiEndpointGet, apiEndpointUpdate } from '../endpoints';
import { showError, showSuccess } from '@/lib/tools/generalTools';
import { useState, useEffect } from 'react';
import postData from '@/lib/axios/postData';
import getData from '@/lib/axios/getData'; // 1. IMPORT UTILITY GET DATA BARU

const Form = ({ state, setState, formik, toast, getData: apiGetData }: FormProps) => {
    const [masterData, setMasterData] = useState<any>({
        branches: [],
        positions: [],
        divisions: [],
        departments: [],
        workUnits: []
    });

    useEffect(() => {
        if (state.add || state.edit) {
            const vaEndpoints = [
                { key: 'branches', path: '/master/organisasi/branches' },
                { key: 'positions', path: '/master/organisasi/positions' },
                { key: 'divisions', path: '/master/organisasi/divisions' },
                { key: 'departments', path: '/master/organisasi/department' },
                { key: 'workUnits', path: '/master/organisasi/work-unit' }
            ];

            const token = localStorage.getItem('token');
            const myUserId = '1'; // Sesuai UserId superadmin di database

            vaEndpoints.forEach((oItem) => {
                // 🔥 2. UBAH MENJADI GE-TDATA
                // Parameter: (endpoint, params/query, customHeader)
                getData(
                    oItem.path,
                    {}, // params kosong karena kita tidak melakukan filter query url
                    {
                        Authorization: `Bearer ${token}`,
                        'x-uniqueid': myUserId,
                        'x-timestamp': new Date().toISOString()
                    }
                )
                    .then((oRes) => {
                        setMasterData((prev: any) => ({ ...prev, [oItem.key]: oRes.data.data }));
                    })
                    .catch((e) => console.error(`Error loading ${oItem.key}:`, e));
            });
        }
    }, [state.add, state.edit]);

    const fetchComponentData = async () => {
        setState((p) => ({ ...p, load: true }));

        try {
        } catch (error: any) {
            const e = error?.response?.data || error;
            showError(toast, e?.message || 'Terjadi Kesalahan');
        } finally {
            setState((p) => ({ ...p, load: false }));
        }
    };

    const handleSave = async (input: initValue) => {
        setState((p) => ({ ...p, load: true }));

        try {
            const idUser = input.user_id;
            const isEdit = Boolean(idUser);

            console.log('INPUT DATA YANG DIKIRIM:', input);
            console.log('APAKAH INI EDIT?', isEdit);

            const cEndPoint = isEdit ? apiEndpointUpdate : apiEndpointCreate;

            const oHeaders: Record<string, string> = {
                'X-Level': '1',
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

            if (isEdit) {
                oBody['user_id'] = idUser;
            }

            const vaData = await postData(cEndPoint, oBody, oHeaders);
            const res = vaData.data;

            showSuccess(toast, res.data?.message || 'Berhasil Menyimpan Data');
            formik.resetForm();
            setState((p) => ({ ...p, add: false, edit: false, delete: false }));

            // Refresh data setelah save/update
            await postData(apiEndpointGet, {});
        } catch (error: any) {
            const e = error?.response?.data || error;
            showError(toast, e?.message || 'Terjadi Kesalahan');
        } finally {
            setState((p) => ({ ...p, load: false, submittedData: null }));
        }
    };

    const handleDelete = async () => {
        setState((p) => ({ ...p, load: true }));

        try {
            console.log('STATE SELECTED USERS:', JSON.stringify(state.selectedUsers));

            if (state.selectedUsers.length < 1) return;

            const vaUserId = state.selectedUsers.map((v: any) => {
                console.log('Object Row:', v);
                return v.user_id;
            });

            const finalPayload = { userId: vaUserId.map(Number) };
            console.log('PAYLOAD FINAL KE BACKEND:', finalPayload);

            const vaData = await postData(apiEndpointDelete, finalPayload);
            const res = vaData.data;

            showSuccess(toast, res.data?.message || 'Berhasil Menghapus Data');

            // PERBAIKAN UTAMA:
            // Tarik data terbaru menggunakan postData (karena backend butuh POST)
            const refreshData = await postData(apiEndpointGet, {});

            // Tutup modal & update isi tabel dengan data terbaru
            setState((p) => ({
                ...p,
                selectedUsers: [],
                add: false,
                edit: false,
                delete: false,
                data: refreshData.data.data
            }));
        } catch (error: any) {
            const e = error?.response?.data || error;
            showError(toast, e?.message || 'Terjadi Kesalahan');
        } finally {
            setState((p) => ({ ...p, load: false }));
        }
    };

    const deleteFooterTemplate = (
        <div className="flex justify-content-center gap-2">
            <Button
                label="Batal"
                icon="pi pi-times"
                severity="secondary"
                outlined
                onClick={() => {
                    setState((p) => ({ ...p, add: false, edit: false, delete: false }));
                }}
                disabled={state.load}
            />
            <Button label="Ya, Hapus" icon="pi pi-trash" severity="danger" onClick={handleDelete} loading={state.load} />
        </div>
    );

    const isFormFieldInvalid = (name: keyof initValue) => !!(formik?.touched[name] && formik?.errors[name]);

    const getFormErrorMessage = (name: keyof initValue) => {
        return isFormFieldInvalid(name) ? <small className="p-error">{formik?.errors[name]}</small> : <small className="p-error">&nbsp;</small>;
    };

    useEffect(() => {
        if (state.submittedData) {
            handleSave(state.submittedData);
        }
    }, [state.submittedData]);

    return (
        <>
            <Dialog
                visible={state.add || state.edit}
                header={state.edit ? 'Edit Data User' : 'Tambah Data User'}
                modal
                style={{ width: '70%' }}
                onHide={() => {
                    setState((p) => ({ ...p, add: false, edit: false, delete: false }));
                    formik?.resetForm();
                }}
            >
                <form onSubmit={formik?.handleSubmit} className="flex gap-2 flex-column">
                    <div className="flex md:flex-row flex-column gap-2 w-full">
                        <div className="flex flex-column gap-2 w-full">
                            <label htmlFor="fullname">Name</label>
                            <div className="p-inputgroup">
                                <InputText
                                    id="fullname"
                                    name="fullname"
                                    value={formik?.values.fullname}
                                    style={{ padding: '1rem' }}
                                    placeholder="Fullname"
                                    onChange={(e) => {
                                        formik?.setFieldValue('fullname', e.target.value);
                                    }}
                                    className={isFormFieldInvalid('fullname') ? 'p-invalid' : ''}
                                />
                            </div>
                            {isFormFieldInvalid('fullname') ? getFormErrorMessage('fullname') : ''}
                        </div>
                        <div className="flex flex-column gap-2 w-full">
                            <label htmlFor="username">Username</label>
                            <div className="p-inputgroup">
                                <InputText
                                    id="username"
                                    name="username"
                                    value={formik?.values.username}
                                    style={{ padding: '1rem' }}
                                    placeholder="Username"
                                    onChange={(e) => {
                                        formik?.setFieldValue('username', e.target.value);
                                    }}
                                    className={isFormFieldInvalid('username') ? 'p-invalid' : ''}
                                />
                            </div>
                            {isFormFieldInvalid('username') ? getFormErrorMessage('username') : ''}
                        </div>
                    </div>

                    <div className="flex md:flex-row flex-column gap-2 w-full">
                        <div className="flex flex-column gap-2 w-full">
                            <label htmlFor="telp">Telp</label>
                            <div className="p-inputgroup">
                                <InputText
                                    id="telp"
                                    name="telp"
                                    keyfilter={'int'}
                                    value={formik?.values.telp}
                                    style={{ padding: '1rem' }}
                                    onChange={(e) => {
                                        formik?.setFieldValue('telp', e.target.value);
                                    }}
                                    placeholder="089222333444"
                                    className={isFormFieldInvalid('telp') ? 'p-invalid' : ''}
                                />
                            </div>
                            {isFormFieldInvalid('telp') ? getFormErrorMessage('telp') : ''}
                        </div>
                    </div>

                    <div className="flex flex-column gap-2 w-full">
                        <label htmlFor="password">Password</label>
                        <div className="p-inputgroup">
                            <Password
                                id="password"
                                name="password"
                                toggleMask
                                value={formik?.values.password}
                                onChange={(e) => {
                                    formik?.setFieldValue('password', e.target.value);
                                }}
                                className={isFormFieldInvalid('password') ? 'p-invalid' : ''}
                            />
                        </div>
                        {isFormFieldInvalid('password') ? getFormErrorMessage('password') : ''}
                    </div>

                    <div className="grid">
                        {/* Cabang */}
                        <div className="col-12 md:col-6 field">
                            <label htmlFor="branch_id">Cabang</label>
                            <Dropdown
                                id="branch_id"
                                name="branch_id"
                                value={formik?.values.branch_id}
                                options={masterData?.branches || []}
                                optionLabel="name"
                                optionValue="id"
                                onChange={(e) => formik?.setFieldValue('branch_id', e.value)}
                                placeholder="Pilih Cabang"
                                className="w-full"
                            />
                        </div>

                        {/* Posisi */}
                        <div className="col-12 md:col-6 field">
                            <label htmlFor="position_id">Posisi</label>
                            <Dropdown
                                id="position_id"
                                name="position_id"
                                value={formik?.values.position_id}
                                options={masterData?.positions || []}
                                optionLabel="name"
                                optionValue="id"
                                onChange={(e) => formik?.setFieldValue('position_id', e.value)}
                                placeholder="Pilih Posisi"
                                className="w-full"
                            />
                        </div>

                        {/* Divisi */}
                        <div className="col-12 md:col-6 field">
                            <label htmlFor="division_id">Divisi</label>
                            <Dropdown
                                id="division_id"
                                name="division_id"
                                value={formik?.values.division_id}
                                options={masterData?.divisions || []}
                                optionLabel="name"
                                optionValue="id"
                                onChange={(e) => formik?.setFieldValue('division_id', e.value)}
                                placeholder="Pilih Divisi"
                                className="w-full"
                            />
                        </div>

                        {/* Departemen */}
                        <div className="col-12 md:col-6 field">
                            <label htmlFor="department_id">Departemen</label>
                            <Dropdown
                                id="department_id"
                                name="department_id"
                                value={formik?.values.department_id}
                                options={masterData?.departments || []}
                                optionLabel="name"
                                optionValue="id"
                                onChange={(e) => formik?.setFieldValue('department_id', e.value)}
                                placeholder="Pilih Departemen"
                                className="w-full"
                            />
                        </div>

                        {/* Unit Kerja */}
                        <div className="col-12 md:col-6 field">
                            <label htmlFor="work_unit_id">Unit Kerja</label>
                            <Dropdown
                                id="work_unit_id"
                                name="work_unit_id"
                                value={formik?.values.work_unit_id}
                                options={masterData?.workUnits || []}
                                optionLabel="name"
                                optionValue="id"
                                onChange={(e) => formik?.setFieldValue('work_unit_id', e.value)}
                                placeholder="Pilih Unit Kerja"
                                className="w-full"
                            />
                        </div>
                    </div>

                    {formik.values.role == 'superadmin' && state.edit ? (
                        ''
                    ) : (
                        <div className="flex flex-column gap-2 w-full">
                            <label htmlFor="role">Role</label>
                            <div className="p-inputgroup">
                                <Dropdown
                                    id="role"
                                    name="role"
                                    options={[
                                        { label: 'Administrator', value: 1 },
                                        { label: 'Pimpinan', value: 2 },
                                        { label: 'Sekretaris', value: 3 },
                                        { label: 'Staff Arsip', value: 4 },
                                        { label: 'Staff Umum', value: 5 },
                                        { label: 'Resepsionis', value: 6 },
                                        { label: 'Auditor', value: 7 }
                                    ]}
                                    value={formik?.values.role}
                                    onChange={(e) => {
                                        formik?.setFieldValue('role', e.value);
                                    }}
                                    className={isFormFieldInvalid('role') ? 'p-invalid' : ''}
                                />
                            </div>
                            {isFormFieldInvalid('role') ? getFormErrorMessage('role') : ''}
                        </div>
                    )}
                    <div className="flex flex-column gap-2 w-full">
                        <label htmlFor="status">Status</label>
                        <div className="p-inputgroup">
                            <Dropdown
                                id="status"
                                name="status"
                                optionValue="kode"
                                optionLabel="label"
                                options={[
                                    { kode: '0', label: 'nonactive' },
                                    { kode: '1', label: 'active' }
                                ]}
                                value={formik?.values.status}
                                onChange={(e) => {
                                    formik?.setFieldValue('status', e.value);
                                }}
                                className={isFormFieldInvalid('status') ? 'p-invalid' : ''}
                            />
                        </div>
                        {isFormFieldInvalid('status') ? getFormErrorMessage('status') : ''}
                    </div>
                    <Button type="submit" label={state?.edit ? 'Update' : 'Save'} className="mt-2" loading={state?.load} />
                </form>
            </Dialog>

            <Dialog
                header="Confirm Delete"
                visible={state.delete}
                onHide={() => {
                    setState((p) => ({ ...p, add: false, edit: false, delete: false }));
                }}
                modal
                style={{ width: '25rem' }}
                footer={deleteFooterTemplate}
            >
                <div className="flex flex-column align-items-center text-center gap-4 py-4">
                    <i className="pi pi-exclamation-triangle text-red-500 text-6xl" />

                    <div>
                        <h3 className="font-bold mb-2">{state.selectedUsers.length > 1 ? `Delete ${state.selectedUsers.length} units?` : 'Delete this unit?'}</h3>
                        <p className="text-color-secondary">
                            {state.selectedUsers.length > 1 ? (
                                `You are going to delete all this selected ${state.selectedUsers.length} units`
                            ) : (
                                <>
                                    You are going to delete this unit as follow : <strong>{state.selectedUsers[0]?.user_id || ''}</strong>
                                    {`(${state.selectedUsers[0]?.fullname})`}.
                                </>
                            )}
                            <br />
                            This action can&apos;t be undone
                        </p>
                    </div>
                </div>
            </Dialog>
        </>
    );
};

export default Form;
