"use client";
import React from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { TableProps } from '../interfaces';

const Form = ({ state, setState, formik, handleDelete, handleSave }: any) => {
    const isDialogVisible = state.add || state.edit;
        const isFormFieldInvalid = (name: string) => !!(formik?.touched && formik.touched[name] && formik?.errors && formik.errors[name]);
    const getFormErrorMessage = (name: string) => {
        return isFormFieldInvalid(name) ? <small className="p-error">{formik.errors[name] as string}</small> : <small className="p-error">&nbsp;</small>;
    };

        const hideDialog = () => {
        setState((p: any) => ({ ...p, add: false, edit: false, delete: false }));
        formik.resetForm();
    };

    const deleteFooterTemplate = (
        <div className="flex justify-content-center gap-2">
            <Button label="Batal" icon="pi pi-times" severity="secondary" outlined onClick={hideDialog} disabled={state.load} />
            <Button type="button" label="Ya, Hapus" icon="pi pi-trash" severity="danger" loading={state?.load} disabled={state?.load} onClick={handleDelete} />
        </div>
    );
            return (
        <>
            <Dialog visible={isDialogVisible} style={{ width: '70%' }} header={state.add ? 'Tambah Data' : 'Ubah Data'} modal onHide={hideDialog}>
                <form onSubmit={formik?.handleSubmit} className="flex flex-column gap-4 mt-2 fadein animation-duration-300">
                    <div className="flex md:flex-row flex-column gap-2 w-full">
                        <div className="flex flex-column gap-2 w-full">
                            <label htmlFor="kode_jabatan" className="font-semibold text-sm text-700">kode jabatan</label>
                            <div className="p-inputgroup">
                                <InputText id="kode_jabatan" name="kode_jabatan" value={formik?.values.kode_jabatan}  onChange={formik?.handleChange} className={isFormFieldInvalid('kode_jabatan') ? 'p-invalid' : ''} />
                            </div>
                            {getFormErrorMessage('kode_jabatan')}
                        </div>
                        <div className="flex flex-column gap-2 w-full">
                            <label htmlFor="nama_jabatan" className="font-semibold text-sm text-700">nama jabatan</label>
                            <div className="p-inputgroup">
                                <InputText id="nama_jabatan" name="nama_jabatan" value={formik?.values.nama_jabatan}  onChange={formik?.handleChange} className={isFormFieldInvalid('nama_jabatan') ? 'p-invalid' : ''} />
                            </div>
                            {getFormErrorMessage('nama_jabatan')}
                        </div>
                    </div>
                    <div className="flex md:flex-row flex-column gap-2 w-full">
                        <div className="flex flex-column gap-2 w-full">
                            <label htmlFor="tingkat_jabatan" className="font-semibold text-sm text-700">tingkat jabatan</label>
                            <div className="p-inputgroup">
                                <InputText id="tingkat_jabatan" name="tingkat_jabatan" value={formik?.values.tingkat_jabatan}  onChange={formik?.handleChange} className={isFormFieldInvalid('tingkat_jabatan') ? 'p-invalid' : ''} />
                            </div>
                            {getFormErrorMessage('tingkat_jabatan')}
                        </div>
                        <div className="flex flex-column gap-2 w-full">
                            <label htmlFor="deskripsi" className="font-semibold text-sm text-700">deskripsi</label>
                            <div className="p-inputgroup">
                                <InputText id="deskripsi" name="deskripsi" value={formik?.values.deskripsi}  onChange={formik?.handleChange} className={isFormFieldInvalid('deskripsi') ? 'p-invalid' : ''} />
                            </div>
                            {getFormErrorMessage('deskripsi')}
                        </div>
                    </div>
                    <div className="flex md:flex-row flex-column gap-2 w-full">
                        <div className="flex flex-column gap-2 w-full">
                            <label htmlFor="status" className="font-semibold text-sm text-700">Status</label>
                            <div className="p-inputgroup">
                                <Dropdown id="status" name="status" value={formik?.values.status} options={[{label: "Aktif", value: "active"}, {label: "Tidak Aktif", value: "nonactive"}]} onChange={formik?.handleChange} className={isFormFieldInvalid('status') ? 'p-invalid w-full' : 'w-full'} />
                            </div>
                            {getFormErrorMessage('status')}
                        </div>
                        <div className="flex flex-column gap-2 w-full"></div>
                    </div>
                    <div className="flex mt-4 pt-3 border-top-1 surface-border">
                        
                        <Button type="submit" label={state?.edit ? 'Perbarui' : 'Simpan'} icon="pi pi-check" className=" w-full" loading={state?.load} disabled={state?.load} />
                    </div>
                </form>
            </Dialog>

            <Dialog header="Konfirmasi Hapus" visible={state.delete} onHide={hideDialog} modal style={{ width: '25rem' }} footer={deleteFooterTemplate}>
                <div className="flex flex-column align-items-center text-center gap-4 py-4">
                    <i className="pi pi-exclamation-triangle text-red-500 text-6xl" />
                    <div>
                        <h3 className="font-bold mb-2">Hapus data ini?</h3>
                        <p className="text-color-secondary">Tindakan ini tidak dapat dibatalkan.</p>
                    </div>
                </div>
            </Dialog>
        </>
    );
};
export default Form;
