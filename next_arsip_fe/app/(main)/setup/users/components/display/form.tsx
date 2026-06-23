'use client';

import { Dialog } from 'primereact/dialog';
import { FormProps, initValue } from '../interfaces';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { useEffect } from 'react';

// Form sekarang menerima handleSave dan handleDelete dari page.tsx
const Form = ({ state, setState, formik, handleSave, handleDelete }: FormProps) => {

    const deleteFooterTemplate = (
        <div className="flex justify-content-center gap-2">
            <Button
                label="Batal"
                icon="pi pi-times"
                severity="secondary"
                outlined
                onClick={() => {
                    setState((p: any) => ({ ...p, add: false, edit: false, delete: false }));
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

    // Formik submit trigger
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
                    setState((p: any) => ({ ...p, add: false, edit: false, delete: false }));
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
                                    onChange={(e) => formik?.setFieldValue('fullname', e.target.value)}
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
                                    onChange={(e) => formik?.setFieldValue('username', e.target.value)}
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
                                    onChange={(e) => formik?.setFieldValue('telp', e.target.value)}
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
                                onChange={(e) => formik?.setFieldValue('password', e.target.value)}
                                className={isFormFieldInvalid('password') ? 'p-invalid' : ''}
                            />
                        </div>
                        {isFormFieldInvalid('password') ? getFormErrorMessage('password') : ''}
                    </div>

                    <div className="grid">
                        {/* DATA DROPDOWN SEKARANG DIAMBIL DARI state.masterData YANG DIKIRIM DARI page.tsx */}
                        <div className="col-12 md:col-6 field">
                            <label htmlFor="branch_id">Cabang</label>
                            <Dropdown
                                id="branch_id"
                                name="branch_id"
                                value={formik?.values.branch_id}
                                options={state.masterData?.branches || []}
                                optionLabel="name"
                                optionValue="id"
                                onChange={(e) => formik?.setFieldValue('branch_id', e.value)}
                                placeholder="Pilih Cabang"
                                className="w-full"
                            />
                        </div>

                        <div className="col-12 md:col-6 field">
                            <label htmlFor="position_id">Posisi</label>
                            <Dropdown
                                id="position_id"
                                name="position_id"
                                value={formik?.values.position_id}
                                options={state.masterData?.positions || []}
                                optionLabel="name"
                                optionValue="id"
                                onChange={(e) => formik?.setFieldValue('position_id', e.value)}
                                placeholder="Pilih Posisi"
                                className="w-full"
                            />
                        </div>

                        <div className="col-12 md:col-6 field">
                            <label htmlFor="division_id">Divisi</label>
                            <Dropdown
                                id="division_id"
                                name="division_id"
                                value={formik?.values.division_id}
                                options={state.masterData?.divisions || []}
                                optionLabel="name"
                                optionValue="id"
                                onChange={(e) => formik?.setFieldValue('division_id', e.value)}
                                placeholder="Pilih Divisi"
                                className="w-full"
                            />
                        </div>

                        <div className="col-12 md:col-6 field">
                            <label htmlFor="department_id">Departemen</label>
                            <Dropdown
                                id="department_id"
                                name="department_id"
                                value={formik?.values.department_id}
                                options={state.masterData?.departments || []}
                                optionLabel="name"
                                optionValue="id"
                                onChange={(e) => formik?.setFieldValue('department_id', e.value)}
                                placeholder="Pilih Departemen"
                                className="w-full"
                            />
                        </div>

                        <div className="col-12 md:col-6 field">
                            <label htmlFor="work_unit_id">Unit Kerja</label>
                            <Dropdown
                                id="work_unit_id"
                                name="work_unit_id"
                                value={formik?.values.work_unit_id}
                                options={state.masterData?.workUnits || []}
                                optionLabel="name"
                                optionValue="id"
                                onChange={(e) => formik?.setFieldValue('work_unit_id', e.value)}
                                placeholder="Pilih Unit Kerja"
                                className="w-full"
                            />
                        </div>
                    </div>

                    {formik.values.role === 1 && state.edit ? (
                        ''
                    ) : (
                        <div className="flex flex-column gap-2 w-full">
                            <label htmlFor="role">Role</label>
                            <div className="p-inputgroup">
                                {/* ROLE DINAMIS DIAMBIL DARI STATE GLOBAL */}
                                <Dropdown
                                    id="role"
                                    name="role"
                                    options={state.masterData?.roles || []}
                                    optionLabel="role_name" 
                                    optionValue="role_id"   
                                    value={formik?.values.role}
                                    onChange={(e) => formik?.setFieldValue('role', e.value)}
                                    placeholder="Pilih Role"
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
                                onChange={(e) => formik?.setFieldValue('status', e.value)}
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
                onHide={() => setState((p: any) => ({ ...p, add: false, edit: false, delete: false }))}
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