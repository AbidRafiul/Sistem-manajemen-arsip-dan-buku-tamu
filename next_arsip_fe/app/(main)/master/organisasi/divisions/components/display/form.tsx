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
            <Button type="button" label="Hapus" icon="pi pi-check" severity="danger" loading={state?.load} disabled={state?.load} onClick={handleDelete} />
        </div>
    );
    return (
        <>
            <Dialog visible={isDialogVisible} style={{ width: '70%' }} header={state.add ? 'Tambah Data' : 'Ubah Data'} modal onHide={hideDialog}>
                <form onSubmit={formik?.handleSubmit} className="flex gap-2 flex-column mt-2">
                    <div className="flex md:flex-row flex-column gap-2 w-full">
                        <div className="flex flex-column gap-2 w-full">
                            <label htmlFor="id_departemen" className="font-bold">Departemen</label>
                            <div className="p-inputgroup">
                                <Dropdown id="id_departemen" name="id_departemen" value={formik?.values.id_departemen} options={state?.masterData || []} optionLabel="nama_departemen" optionValue="id_departemen" onChange={formik?.handleChange} placeholder="Pilih Departemen" filter showClear className={isFormFieldInvalid('id_departemen') ? 'p-invalid w-full' : 'w-full'} />
                            </div>
                            {getFormErrorMessage('id_departemen')}
                        </div>
                        <div className="flex flex-column gap-2 w-full">
                            <label htmlFor="kode_divisi" className="font-bold">Kode Divisi</label>
                            <div className="p-inputgroup">
                                <InputText id="kode_divisi" name="kode_divisi" value={formik?.values.kode_divisi} style={{ padding: '1rem' }} onChange={formik?.handleChange} className={isFormFieldInvalid('kode_divisi') ? 'p-invalid' : ''} />
                            </div>
                            {getFormErrorMessage('kode_divisi')}
                        </div>
                    </div>
                    <div className="flex md:flex-row flex-column gap-2 w-full">
                        <div className="flex flex-column gap-2 w-full">
                            <label htmlFor="nama_divisi" className="font-bold">Nama Divisi</label>
                            <div className="p-inputgroup">
                                <InputText id="nama_divisi" name="nama_divisi" value={formik?.values.nama_divisi} style={{ padding: '1rem' }} onChange={formik?.handleChange} className={isFormFieldInvalid('nama_divisi') ? 'p-invalid' : ''} />
                            </div>
                            {getFormErrorMessage('nama_divisi')}
                        </div>
                        <div className="flex flex-column gap-2 w-full">
                            <label htmlFor="deskripsi" className="font-bold">Deskripsi</label>
                            <div className="p-inputgroup">
                                <InputText id="deskripsi" name="deskripsi" value={formik?.values.deskripsi} style={{ padding: '1rem' }} onChange={formik?.handleChange} className={isFormFieldInvalid('deskripsi') ? 'p-invalid' : ''} />
                            </div>
                            {getFormErrorMessage('deskripsi')}
                        </div>
                    </div>
                    <div className="flex md:flex-row flex-column gap-2 w-full">
                        <div className="flex flex-column gap-2 w-full md:w-6">
                            <label htmlFor="status" className="font-bold">Status</label>
                            <div className="p-inputgroup">
                                <Dropdown id="status" name="status" value={formik?.values.status} options={[{ label: "Aktif", value: "active" }, { label: "Tidak Aktif", value: "nonactive" }]} onChange={formik?.handleChange} className={isFormFieldInvalid('status') ? 'p-invalid w-full' : 'w-full'} />
                            </div>
                            {getFormErrorMessage('status')}
                        </div>
                    </div>
                    <div className="flex md:flex-row flex-column gap-2 w-full">
                        <div className="flex flex-column gap-2 w-full md:w-6">
                            <label htmlFor="status" className="font-bold">Status</label>
                            <div className="p-inputgroup">
                                <Dropdown id="status" name="status" value={formik?.values.status} options={[{ label: "Aktif", value: "active" }, { label: "Tidak Aktif", value: "nonactive" }]} onChange={formik?.handleChange} className={isFormFieldInvalid('status') ? 'p-invalid w-full' : 'w-full'} />
                            </div>
                            {getFormErrorMessage('status')}
                        </div>
                    </div>
                    <Button type="submit" label={state?.edit ? 'Perbarui' : 'Simpan'} className="mt-2" loading={state?.load} disabled={state?.load} />
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
