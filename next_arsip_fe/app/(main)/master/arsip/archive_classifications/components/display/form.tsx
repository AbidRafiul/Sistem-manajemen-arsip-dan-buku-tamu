"use client";
import React from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';

const Form = ({ state, setState, formik, handleDelete }: any) => {
    const isDialogVisible = state.add || state.edit;
    const isFormFieldInvalid = (name: string) => !!(formik?.touched && formik.touched[name] && formik?.errors && formik.errors[name]);
    const getFormErrorMessage = (name: string) => {
        return isFormFieldInvalid(name) ? <small className="p-error block mt-1">{formik.errors[name] as string}</small> : <small className="p-error block mt-1">&nbsp;</small>;
    };

    const hideDialog = () => {
        setState((p: any) => ({ ...p, add: false, edit: false, delete: false }));
        formik.resetForm();
    };

    const deleteFooterTemplate = (
        <div className="flex justify-content-center gap-2">
            
            <Button type="button" label="Ya, Hapus" icon="pi pi-trash" severity="danger" loading={state?.load} disabled={state?.load} onClick={handleDelete} />
        </div>
    );

    return (
        <>
            <Dialog visible={isDialogVisible} style={{ width: '500px' }} header={state.add ? 'Tambah Klasifikasi Arsip' : 'Ubah Klasifikasi Arsip'} modal onHide={hideDialog} className="p-fluid">
                <form onSubmit={formik?.handleSubmit} className="flex flex-column gap-4 mt-2 fadein animation-duration-300">
                    <div className="flex flex-column gap-2 w-full">
                        <label htmlFor="kode_klasifikasi" className="font-semibold text-sm text-700">Kode Klasifikasi</label>
                        <InputText id="kode_klasifikasi" name="kode_klasifikasi" value={formik?.values.kode_klasifikasi} onChange={formik?.handleChange} className={isFormFieldInvalid('kode_klasifikasi') ? 'p-invalid' : ''} placeholder="Contoh: 001, 100, KP.01" />
                        {getFormErrorMessage('kode_klasifikasi')}
                    </div>

                    <div className="flex flex-column gap-2 w-full">
                        <label htmlFor="nama_klasifikasi" className="font-semibold text-sm text-700">Nama Klasifikasi</label>
                        <InputText id="nama_klasifikasi" name="nama_klasifikasi" value={formik?.values.nama_klasifikasi} onChange={formik?.handleChange} className={isFormFieldInvalid('nama_klasifikasi') ? 'p-invalid' : ''} placeholder="Contoh: Kepegawaian, Keuangan, Umum" />
                        {getFormErrorMessage('nama_klasifikasi')}
                    </div>

                    <div className="flex flex-column gap-2 w-full">
                        <label htmlFor="deskripsi" className="font-semibold text-sm text-700">Deskripsi</label>
                        <InputText id="deskripsi" name="deskripsi" value={formik?.values.deskripsi} onChange={formik?.handleChange} className={isFormFieldInvalid('deskripsi') ? 'p-invalid' : ''} placeholder="Keterangan singkat kode klasifikasi" />
                        {getFormErrorMessage('deskripsi')}
                    </div>

                    {state.edit && (
                        <div className="flex flex-column gap-2 w-full">
                            <label htmlFor="status" className="font-semibold text-sm text-700">Status</label>
                            <Dropdown id="status" name="status" value={formik?.values.status} options={[{label: "Aktif", value: "active"}, {label: "Tidak Aktif", value: "nonactive"}]} onChange={formik?.handleChange} className={isFormFieldInvalid('status') ? 'p-invalid' : ''} />
                            {getFormErrorMessage('status')}
                        </div>
                    )}

                    <div className="flex mt-4 pt-3 border-top-1 surface-border">
                        
                        <div className="flex mt-4 pt-3 border-top-1 surface-border">
                        
                        <Button type="submit" label={state?.edit ? 'Perbarui' : 'Simpan'} icon="pi pi-check" className=" w-full" loading={state?.load} disabled={state?.load} />
                    </div>
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
