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
            <Button
                type="button"
                label="Hapus"
                icon="pi pi-check"
                severity="danger"
                className="mt-2"
                loading={state?.load}
                disabled={state?.load}
                onClick={handleDelete}
            />
        </div>
    );

    const isFormFieldInvalid = (name: keyof initValue) => !!(formik?.touched[name] && formik?.errors[name]);

    const getFormErrorMessage = (name: keyof initValue) => {
        return isFormFieldInvalid(name) ? <small className="p-error">{formik?.errors[name]}</small> : <small className="p-error">&nbsp;</small>;
    };

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
                            <label htmlFor="fullname">Nama Lengkap</label>
                            <div className="p-inputgroup">
                                <InputText
                                    id="nama_lengkap"
                                    name="nama_lengkap"
                                    value={formik?.values.nama_lengkap}
                                    style={{ padding: '1rem' }}
                                    placeholder="nama_lengkap"
                                    onChange={(e) => formik?.setFieldValue('nama_lengkap', e.target.value)}
                                    className={isFormFieldInvalid('nama_lengkap') ? 'p-invalid' : ''}
                                />
                            </div>
                            {isFormFieldInvalid('nama_lengkap') ? getFormErrorMessage('nama_lengkap') : ''}
                        </div>
                        <div className="flex flex-column gap-2 w-full">
                            <label htmlFor="nama_pengguna">nama_pengguna</label>
                            <div className="p-inputgroup">
                                <InputText
                                    id="nama_pengguna"
                                    name="nama_pengguna"
                                    value={formik?.values.nama_pengguna}
                                    style={{ padding: '1rem' }}
                                    placeholder="nama_pengguna"
                                    onChange={(e) => formik?.setFieldValue('nama_pengguna', e.target.value)}
                                    className={isFormFieldInvalid('nama_pengguna') ? 'p-invalid' : ''}
                                />
                            </div>
                            {isFormFieldInvalid('nama_pengguna') ? getFormErrorMessage('nama_pengguna') : ''}
                        </div>
                    </div>

                    <div className="flex md:flex-row flex-column gap-2 w-full">
                        <div className="flex flex-column gap-2 w-full">
                            <label htmlFor="telp">No. Telepon</label>
                            <div className="p-inputgroup">
                                <InputText
                                    id="telepon"
                                    name="telepon"
                                    keyfilter={'int'}
                                    value={formik?.values.telepon}
                                    style={{ padding: '1rem' }}
                                    onChange={(e) => formik?.setFieldValue('telepon', e.target.value)}
                                    placeholder="089222333444"
                                    className={isFormFieldInvalid('telepon') ? 'p-invalid' : ''}
                                />
                            </div>
                            {isFormFieldInvalid('telepon') ? getFormErrorMessage('telepon') : ''}
                        </div>
                    </div>

                    <div className="flex flex-column gap-2 w-full">
                        <label htmlFor="kata_sandi">kata_sandi</label>
                        <div className="p-inputgroup">
                            <Password
                                id="kata_sandi"
                                name="kata_sandi"
                                toggleMask
                                value={formik?.values.kata_sandi}
                                onChange={(e) => formik?.setFieldValue('kata_sandi', e.target.value)}
                                className={isFormFieldInvalid('kata_sandi') ? 'p-invalid' : ''}
                            />
                        </div>
                        {isFormFieldInvalid('kata_sandi') ? getFormErrorMessage('kata_sandi') : ''}
                    </div>

                    <div className="grid">
                        {/* DATA DROPDOWN SEKARANG DIAMBIL DARI state.masterData YANG DIKIRIM DARI page.tsx */}
                        <div className="col-12 md:col-6 field">
                            <label htmlFor="id_cabang">Cabang</label>
                            <Dropdown
                                id="id_cabang"
                                name="id_cabang"
                                value={formik?.values.id_cabang}
                                options={state.masterData?.branches || []}
                                optionLabel="name"
                                optionValue="id"
                                onChange={(e) => formik?.setFieldValue('id_cabang', e.value)}
                                placeholder="Pilih Cabang"
                                className="w-full"
                            />
                        </div>

                        <div className="col-12 md:col-6 field">
                            <label htmlFor="id_jabatan">Posisi</label>
                            <Dropdown
                                id="id_jabatan"
                                name="id_jabatan"
                                value={formik?.values.id_jabatan}
                                options={state.masterData?.positions || []}
                                optionLabel="name"
                                optionValue="id"
                                onChange={(e) => formik?.setFieldValue('id_jabatan', e.value)}
                                placeholder="Pilih Posisi"
                                className="w-full"
                            />
                        </div>

                        <div className="col-12 md:col-6 field">
                            <label htmlFor="id_divisi">Divisi</label>
                            <Dropdown
                                id="id_divisi"
                                name="id_divisi"
                                value={formik?.values.id_divisi}
                                options={state.masterData?.divisions || []}
                                optionLabel="name"
                                optionValue="id"
                                onChange={(e) => formik?.setFieldValue('id_divisi', e.value)}
                                placeholder="Pilih Divisi"
                                className="w-full"
                            />
                        </div>

                        <div className="col-12 md:col-6 field">
                            <label htmlFor="id_departemen">Departemen</label>
                            <Dropdown
                                id="id_departemen"
                                name="id_departemen"
                                value={formik?.values.id_departemen}
                                options={state.masterData?.departments || []}
                                optionLabel="name"
                                optionValue="id"
                                onChange={(e) => formik?.setFieldValue('id_departemen', e.value)}
                                placeholder="Pilih Departemen"
                                className="w-full"
                            />
                        </div>

                        <div className="col-12 md:col-6 field">
                            <label htmlFor="id_unit_kerja">Unit Kerja</label>
                            <Dropdown
                                id="id_unit_kerja"
                                name="id_unit_kerja"
                                value={formik?.values.id_unit_kerja}
                                options={state.masterData?.workUnits || []}
                                optionLabel="name"
                                optionValue="id"
                                onChange={(e) => formik?.setFieldValue('id_unit_kerja', e.value)}
                                placeholder="Pilih Unit Kerja"
                                className="w-full"
                            />
                        </div>
                    </div>

                    {formik.values.id_peran === 1 && state.edit ? (
                        ''
                    ) : (
                        <div className="flex flex-column gap-2 w-full">
                            <label htmlFor="role">Role</label>
                            <div className="p-inputgroup">
                                {/* ROLE DINAMIS DIAMBIL DARI STATE GLOBAL */}
                                <Dropdown
                                    id="role_peran"
                                    name="role_peran"
                                    options={state.masterData?.roles || []}
                                    optionLabel="name"
                                    optionValue="id"
                                    value={formik?.values.id_peran}
                                    onChange={(e) => formik?.setFieldValue('id_peran', e.value)}
                                    placeholder="Pilih Role"
                                    className={isFormFieldInvalid('id_peran') ? 'p-invalid' : ''}
                                />
                            </div>
                            {isFormFieldInvalid('id_peran') ? getFormErrorMessage('id_peran') : ''}
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
                                    { kode: '0', label: 'Nonaktif' },
                                    { kode: '1', label: 'Aktif' }
                                ]}
                                value={formik?.values.status}
                                onChange={(e) => formik?.setFieldValue('status', e.value)}
                                className={isFormFieldInvalid('status') ? 'p-invalid' : ''}
                            />
                        </div>
                        {isFormFieldInvalid('status') ? getFormErrorMessage('status') : ''}
                    </div>
                    <Button type="submit" label={state?.edit ? 'Perbarui' : 'Simpan'} className="mt-2" loading={state?.load} />
                </form>
            </Dialog>

            <Dialog
                header="Konfirmasi Hapus"
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
                        <h3 className="font-bold mb-2">{state.selectedUsers.length > 1 ? `Hapus ${state.selectedUsers.length} pengguna?` : 'Hapus pengguna ini?'}</h3>
                        <p className="text-color-secondary">
                            {state.selectedUsers.length > 1 ? (
                                `Anda akan menghapus ${state.selectedUsers.length} pengguna yang dipilih`
                            ) : (
                                <>
                                    You are going to delete this unit as follow : <strong>{state.selectedUsers[0]?.id_pengguna || ''}</strong>
                                    {`(${state.selectedUsers[0]?.nama_lengkap})`}.
                                </>
                            )}
                            <br />
                            Tindakan ini tidak dapat dibatalkan
                        </p>
                    </div>
                </div>
            </Dialog>
        </>
    );
};

export default Form;
