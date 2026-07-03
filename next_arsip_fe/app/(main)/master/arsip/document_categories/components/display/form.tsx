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
            <Button type="button" label="Batal" icon="pi pi-times" severity="secondary" outlined onClick={hideDialog} disabled={state.load} />
            <Button type="button" label="Hapus" icon="pi pi-check" severity="danger" loading={state?.load} disabled={state?.load} onClick={handleDelete} />
        </div>
    );

    return (
        <>
            <Dialog visible={isDialogVisible} style={{ width: '500px' }} header={state.add ? 'Tambah Kategori Dokumen' : 'Ubah Kategori Dokumen'} modal onHide={hideDialog} className="p-fluid">
                <form onSubmit={formik?.handleSubmit} className="flex gap-3 flex-column mt-3">
                    <div className="flex flex-column gap-2 w-full">
                        <label htmlFor="kode_klasifikasi" className="font-bold text-sm text-800">Klasifikasi Arsip</label>
                        <Dropdown 
                            id="kode_klasifikasi" 
                            name="kode_klasifikasi" 
                            value={formik?.values.kode_klasifikasi} 
                            options={state.classifications.map((item: any) => ({
                                label: `${item.kode_klasifikasi} - ${item.nama_klasifikasi}`,
                                value: item.kode_klasifikasi
                            }))} 
                            onChange={formik?.handleChange} 
                            className={isFormFieldInvalid('kode_klasifikasi') ? 'p-invalid' : ''} 
                            placeholder="Pilih Klasifikasi Arsip"
                            filter
                        />
                        {getFormErrorMessage('kode_klasifikasi')}
                    </div>

                    <div className="flex flex-column gap-2 w-full">
                        <label htmlFor="kode_kategori_dokumen" className="font-bold text-sm text-800">Kode Kategori</label>
                        <InputText id="kode_kategori_dokumen" name="kode_kategori_dokumen" value={formik?.values.kode_kategori_dokumen} onChange={formik?.handleChange} className={isFormFieldInvalid('kode_kategori_dokumen') ? 'p-invalid' : ''} placeholder="Contoh: ADM-UMUM, KEU-TRANS" />
                        {getFormErrorMessage('kode_kategori_dokumen')}
                    </div>

                    <div className="flex flex-column gap-2 w-full">
                        <label htmlFor="nama_kategori_dokumen" className="font-bold text-sm text-800">Nama Kategori</label>
                        <InputText id="nama_kategori_dokumen" name="nama_kategori_dokumen" value={formik?.values.nama_kategori_dokumen} onChange={formik?.handleChange} className={isFormFieldInvalid('nama_kategori_dokumen') ? 'p-invalid' : ''} placeholder="Contoh: Administrasi Umum, Keuangan Transaksi" />
                        {getFormErrorMessage('nama_kategori_dokumen')}
                    </div>

                    <div className="flex flex-column gap-2 w-full">
                        <label htmlFor="deskripsi" className="font-bold text-sm text-800">Deskripsi</label>
                        <InputText id="deskripsi" name="deskripsi" value={formik?.values.deskripsi} onChange={formik?.handleChange} className={isFormFieldInvalid('deskripsi') ? 'p-invalid' : ''} placeholder="Keterangan singkat kategori dokumen" />
                        {getFormErrorMessage('deskripsi')}
                    </div>

                    <div className="flex justify-content-end gap-2 mt-3">
                        <Button type="button" label="Batal" icon="pi pi-times" severity="secondary" outlined onClick={hideDialog} className="w-auto" />
                        <Button type="submit" label={state?.edit ? 'Perbarui' : 'Simpan'} icon="pi pi-check" className="w-auto" loading={state?.load} disabled={state?.load} />
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
