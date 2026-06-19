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
import getData from '@/lib/axios/getData'; // 🔥 1. IMPORT UTILITY GET DATA BARU

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
            // 🔥 FIX 1: Tangkap ID baik U besar maupun u kecil
            const idUser = input.UserId || input.userId;
            const isEdit = Boolean(idUser);

            console.log('INPUT DATA YANG DIKIRIM:', input);
            console.log('APAKAH INI EDIT?', isEdit);

            const cEndPoint = isEdit ? apiEndpointUpdate : apiEndpointCreate;

            const oHeaders: Record<string, string> = {
                'X-Level': '1',
                'X-Credential': JSON.stringify({
                    Username: input.Username,
                    Password: input.Password
                })
            };

            const oBody: Record<string, any> = {
                Fullname: input.Fullname,
                Username: input.Username,
                Password: input.Password,
                Telp: input.Telp,
                Status: input.Status,
                Role: input.Role,
                BranchId: input.BranchId,
                PositionId: input.PositionId,
                DivisionId: input.DivisionId,
                DepartmentId: input.DepartmentId,
                WorkUnitId: input.WorkUnitId
            };

            // 🔥 FIX 2: Kirim UserId ke backend untuk acuan update
            if (isEdit) {
                oBody['UserId'] = idUser;
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
                return v.UserId;
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
                            <label htmlFor="name">Name</label>
                            <div className="p-inputgroup">
                                <InputText
                                    id="name"
                                    name="name"
                                    value={formik?.values.Fullname}
                                    style={{ padding: '1rem' }}
                                    placeholder="Fullname"
                                    onChange={(e) => {
                                        formik?.setFieldValue('Fullname', e.target.value);
                                    }}
                                    className={isFormFieldInvalid('Fullname') ? 'p-invalid' : ''}
                                />
                            </div>
                            {isFormFieldInvalid('Fullname') ? getFormErrorMessage('Fullname') : ''}
                        </div>
                        <div className="flex flex-column gap-2 w-full">
                            <label htmlFor="Username">Username</label>
                            <div className="p-inputgroup">
                                <InputText
                                    id="Username"
                                    name="Username"
                                    value={formik?.values.Username}
                                    style={{ padding: '1rem' }}
                                    placeholder="Username"
                                    onChange={(e) => {
                                        formik?.setFieldValue('Username', e.target.value);
                                    }}
                                    className={isFormFieldInvalid('Username') ? 'p-invalid' : ''}
                                />
                            </div>
                            {isFormFieldInvalid('Username') ? getFormErrorMessage('Username') : ''}
                        </div>
                    </div>

                    <div className="flex md:flex-row flex-column gap-2 w-full">
                        <div className="flex flex-column gap-2 w-full">
                            <label htmlFor="Telp">Telp</label>
                            <div className="p-inputgroup">
                                <InputText
                                    id="Telp"
                                    name="Telp"
                                    keyfilter={'int'}
                                    value={formik?.values.Telp}
                                    style={{ padding: '1rem' }}
                                    onChange={(e) => {
                                        formik?.setFieldValue('Telp', e.target.value);
                                    }}
                                    placeholder="089222333444"
                                    className={isFormFieldInvalid('Telp') ? 'p-invalid' : ''}
                                />
                            </div>
                            {isFormFieldInvalid('Telp') ? getFormErrorMessage('Telp') : ''}
                        </div>
                    </div>

                    <div className="flex flex-column gap-2 w-full">
                        <label htmlFor="Password">Password</label>
                        <div className="p-inputgroup">
                            <Password
                                id="Password"
                                name="Password"
                                toggleMask
                                value={formik?.values.Password}
                                onChange={(e) => {
                                    formik?.setFieldValue('Password', e.target.value);
                                }}
                                className={isFormFieldInvalid('Password') ? 'p-invalid' : ''}
                            />
                        </div>
                        {isFormFieldInvalid('Password') ? getFormErrorMessage('Password') : ''}
                    </div>

                    <div className="grid">
                        {/* Cabang */}
                        <div className="col-12 md:col-6 field">
                            <label htmlFor="BranchId">Cabang</label>
                            <Dropdown
                                id="BranchId"
                                name="BranchId"
                                value={formik?.values.BranchId}
                                options={masterData?.branches || []}
                                optionLabel="name"
                                optionValue="id"
                                onChange={(e) => formik?.setFieldValue('BranchId', e.value)}
                                placeholder="Pilih Cabang"
                                className="w-full"
                            />
                        </div>

                        {/* Posisi */}
                        <div className="col-12 md:col-6 field">
                            <label htmlFor="PositionId">Posisi</label>
                            <Dropdown
                                id="PositionId"
                                name="PositionId"
                                value={formik?.values.PositionId}
                                options={masterData?.positions || []}
                                optionLabel="name"
                                optionValue="id"
                                onChange={(e) => formik?.setFieldValue('PositionId', e.value)}
                                placeholder="Pilih Posisi"
                                className="w-full"
                            />
                        </div>

                        {/* Divisi */}
                        <div className="col-12 md:col-6 field">
                            <label htmlFor="DivisionId">Divisi</label>
                            <Dropdown
                                id="DivisionId"
                                name="DivisionId"
                                value={formik?.values.DivisionId}
                                options={masterData?.divisions || []}
                                optionLabel="name"
                                optionValue="id"
                                onChange={(e) => formik?.setFieldValue('DivisionId', e.value)}
                                placeholder="Pilih Divisi"
                                className="w-full"
                            />
                        </div>

                        {/* Departemen */}
                        <div className="col-12 md:col-6 field">
                            <label htmlFor="DepartmentId">Departemen</label>
                            <Dropdown
                                id="DepartmentId"
                                name="DepartmentId"
                                value={formik?.values.DepartmentId}
                                options={masterData?.departments || []}
                                optionLabel="name"
                                optionValue="id"
                                onChange={(e) => formik?.setFieldValue('DepartmentId', e.value)}
                                placeholder="Pilih Departemen"
                                className="w-full"
                            />
                        </div>

                        {/* Unit Kerja */}
                        <div className="col-12 md:col-6 field">
                            <label htmlFor="WorkUnitId">Unit Kerja</label>
                            <Dropdown
                                id="WorkUnitId"
                                name="WorkUnitId"
                                value={formik?.values.WorkUnitId}
                                options={masterData?.workUnits || []}
                                optionLabel="name"
                                optionValue="id"
                                onChange={(e) => formik?.setFieldValue('WorkUnitId', e.value)}
                                placeholder="Pilih Unit Kerja"
                                className="w-full"
                            />
                        </div>
                    </div>

                    {formik.values.Role == 'superadmin' && state.edit ? (
                        ''
                    ) : (
                        <div className="flex flex-column gap-2 w-full">
                            <label htmlFor="Role">Role</label>
                            <div className="p-inputgroup">
                                <Dropdown
                                    id="Role"
                                    name="Role"
                                    options={[
                                        // GANTI value DENGAN ANGKA ID DARI TABEL mst_roles LO
                                        { label: 'Administrator', value: 1 },
                                        { label: 'Pimpinan', value: 2 },
                                        { label: 'Sekretaris', value: 3 },
                                        { label: 'Staff Arsip', value: 4 },
                                        { label: 'Staff Umum', value: 5 },
                                        { label: 'Resepsionis', value: 6 }, //  Sekarang mengirimkan angka 6 ke backend
                                        { label: 'Auditor', value: 7 }
                                    ]}
                                    value={formik?.values.Role}
                                    onChange={(e) => {
                                        formik?.setFieldValue('Role', e.value);
                                    }}
                                    className={isFormFieldInvalid('Role') ? 'p-invalid' : ''}
                                />
                            </div>
                            {isFormFieldInvalid('Role') ? getFormErrorMessage('Role') : ''}
                        </div>
                    )}
                    <div className="flex flex-column gap-2 w-full">
                        <label htmlFor="Status">Status</label>
                        <div className="p-inputgroup">
                            <Dropdown
                                id="Status"
                                name="Status"
                                optionValue="kode"
                                optionLabel="label"
                                options={[
                                    { kode: '0', label: 'nonactive' },
                                    { kode: '1', label: 'active' }
                                ]}
                                value={formik?.values.Status}
                                onChange={(e) => {
                                    formik?.setFieldValue('Status', e.value);
                                }}
                                className={isFormFieldInvalid('Status') ? 'p-invalid' : ''}
                            />
                        </div>
                        {isFormFieldInvalid('Status') ? getFormErrorMessage('Status') : ''}
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
                                    You are going to delete this unit as follow : <strong>{state.selectedUsers[0]?.userId || ''}</strong>
                                    {`(${state.selectedUsers[0]?.Fullname})`}.
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
