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
                            <label htmlFor="kode_cabang" className="font-semibold text-sm text-700">kode cabang</label>
                            <div className="p-inputgroup">
                                <InputText id="kode_cabang" name="kode_cabang" value={formik?.values.kode_cabang}  onChange={formik?.handleChange} className={isFormFieldInvalid('kode_cabang') ? 'p-invalid' : ''} />
                            </div>
                            {getFormErrorMessage('kode_cabang')}
                        </div>
                        <div className="flex flex-column gap-2 w-full">
                            <label htmlFor="nama_cabang" className="font-semibold text-sm text-700">nama cabang</label>
                            <div className="p-inputgroup">
                                <InputText id="nama_cabang" name="nama_cabang" value={formik?.values.nama_cabang}  onChange={formik?.handleChange} className={isFormFieldInvalid('nama_cabang') ? 'p-invalid' : ''} />
                            </div>
                            {getFormErrorMessage('nama_cabang')}
                        </div>
                    </div>
                    <div className="flex flex-column gap-2 w-full mt-2 mb-2">
                        <label htmlFor="id_induk" className="font-semibold text-sm text-700">Induk Cabang (Opsional)</label>
                        <Dropdown 
                            id="id_induk" 
                            name="id_induk" 
                            value={formik?.values.id_induk} 
                            options={state.data.filter((b: any) => b.id_cabang !== formik?.values.id_cabang)} 
                            optionLabel="nama_cabang" 
                            optionValue="id_cabang" 
                            onChange={formik?.handleChange} 
                            placeholder="Pilih Induk Cabang (Kosongkan jika Cabang Utama)" 
                            showClear 
                            filter 
                            className="w-full" />
                        {getFormErrorMessage('id_induk')}
                    </div>
                    <div className="flex md:flex-row flex-column gap-2 w-full">
                        <div className="flex flex-column gap-2 w-full">
                            <label htmlFor="alamat" className="font-semibold text-sm text-700">alamat</label>
                            <div className="p-inputgroup">
                                <InputText id="alamat" name="alamat" value={formik?.values.alamat}  onChange={formik?.handleChange} className={isFormFieldInvalid('alamat') ? 'p-invalid' : ''} />
                            </div>
                            {getFormErrorMessage('alamat')}
                        </div>
                        <div className="flex flex-column gap-2 w-full">
                            <label htmlFor="telepon" className="font-semibold text-sm text-700">telepon</label>
                            <div className="p-inputgroup">
                                <InputText id="telepon" name="telepon" value={formik?.values.telepon}  onChange={formik?.handleChange} className={isFormFieldInvalid('telepon') ? 'p-invalid' : ''} />
                            </div>
                            {getFormErrorMessage('telepon')}
                        </div>
                    </div>
                    <div className="flex md:flex-row flex-column gap-2 w-full">
                        <div className="flex flex-column gap-2 w-full">
                            <label htmlFor="surel" className="font-semibold text-sm text-700">surel</label>
                            <div className="p-inputgroup">
                                <InputText id="surel" name="surel" value={formik?.values.surel}  onChange={formik?.handleChange} className={isFormFieldInvalid('surel') ? 'p-invalid' : ''} />
                            </div>
                            {getFormErrorMessage('surel')}
                        </div>
                        <div className="flex flex-column gap-2 w-full">
                            <label htmlFor="status" className="font-semibold text-sm text-700">Status</label>
                            <div className="p-inputgroup">
                                <Dropdown id="status" name="status" value={formik?.values.status} options={[{label: "Aktif", value: "active"}, {label: "Tidak Aktif", value: "nonactive"}]} onChange={formik?.handleChange} className={isFormFieldInvalid('status') ? 'p-invalid w-full' : 'w-full'} />
                            </div>
                            {getFormErrorMessage('status')}
                        </div>
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
