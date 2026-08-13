"use client";
import React from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';
import { Dropdown } from 'primereact/dropdown';
import { InputTextarea } from 'primereact/inputtextarea';
import { FormProps, initValue } from '../interfaces';

const Form = ({ state, setState, formik }: FormProps) => {
    const isFormFieldInvalid = (name: keyof initValue) => !!(formik.touched[name] && formik.errors[name]);

    const getFormErrorMessage = (name: keyof initValue) => {
        return isFormFieldInvalid(name)
            ? <small className="p-error flex align-items-center gap-1 mt-1"><i className="pi pi-exclamation-circle text-xs" />{formik.errors[name] as string}</small>
            : <small className="p-error">&nbsp;</small>;
    };

    const actionOptions = [
        { label: 'Musnahkan (Destroy)', value: 'destroy' },
        { label: 'Tinjau Kembali (Review)', value: 'review' }
    ];

    return (
        <Dialog
            visible={state.add || state.edit}
            header={
                <div className="flex align-items-center gap-2">
                    <i className={`pi ${state.edit ? 'pi-pencil' : 'pi-plus-circle'} text-primary`} />
                    <span className="font-bold text-900">{state.edit ? 'Edit Jadwal Retensi' : 'Tambah Jadwal Retensi'}</span>
                </div>
            }
            modal
            style={{ width: '40rem', maxWidth: '95vw' }}
            onHide={() => { setState((p) => ({ ...p, add: false, edit: false })); formik.resetForm(); }}
            pt={{ header: { className: 'border-bottom-1 surface-border pb-3' } }}>
            <form onSubmit={formik.handleSubmit} className="flex flex-column gap-4 mt-2 fadein animation-duration-300">
                
                <div className="flex flex-column gap-1 mb-2">
                    <label htmlFor="kode_retensi" className="font-semibold text-sm text-900">
                        Kode Retensi <span className="text-red-500">*</span>
                    </label>
                    <InputText
                        id="kode_retensi"
                        value={formik.values.kode_retensi}
                        onChange={(e) => formik.setFieldValue('kode_retensi', e.target.value.toUpperCase())}
                        className={`w-full ${isFormFieldInvalid('kode_retensi') ? 'p-invalid' : ''}`}
                        placeholder="Contoh: RET-ADM-05" />
                    {getFormErrorMessage('kode_retensi')}
                </div>

                <div className="flex flex-column gap-1 mb-2">
                    <label htmlFor="nama_retensi" className="font-semibold text-sm text-900">
                        Nama Jadwal Retensi <span className="text-red-500">*</span>
                    </label>
                    <InputText
                        id="nama_retensi"
                        value={formik.values.nama_retensi}
                        onChange={(e) => formik.setFieldValue('nama_retensi', e.target.value)}
                        className={`w-full ${isFormFieldInvalid('nama_retensi') ? 'p-invalid' : ''}`}
                        placeholder="Contoh: Retensi Administrasi 5 Tahun" />
                    {getFormErrorMessage('nama_retensi')}
                </div>

                <div className="grid mb-2">
                    <div className="col-12 md:col-6 flex flex-column gap-1">
                        <label htmlFor="kode_kategori_dokumen" className="font-semibold text-sm text-900">
                            Kategori Dokumen <span className="text-red-500">*</span>
                        </label>
                        <Dropdown
                            id="kode_kategori_dokumen"
                            value={formik.values.kode_kategori_dokumen}
                            options={state.categories.map((item: any) => ({
                                label: `${item.kode_kategori_dokumen} - ${item.nama_kategori_dokumen}`,
                                value: item.kode_kategori_dokumen
                            }))}
                            onChange={(e) => formik.setFieldValue('kode_kategori_dokumen', e.value)}
                            placeholder="Pilih Kategori Dokumen"
                            className={`w-full ${isFormFieldInvalid('kode_kategori_dokumen') ? 'p-invalid' : ''}`}
                            filter />
                        {getFormErrorMessage('kode_kategori_dokumen')}
                    </div>
                    <div className="col-12 md:col-6 flex flex-column gap-1">
                        <label htmlFor="tahun_retensi" className="font-semibold text-sm text-900">
                            Masa Retensi (Tahun) <span className="text-red-500">*</span>
                        </label>
                        <InputText
                            id="tahun_retensi"
                            type="number"
                            value={formik.values.tahun_retensi === '' ? '' : String(formik.values.tahun_retensi)}
                            onChange={(e) => formik.setFieldValue('tahun_retensi', e.target.value === '' ? '' : Number(e.target.value))}
                            className={`w-full ${isFormFieldInvalid('tahun_retensi') ? 'p-invalid' : ''}`}
                            placeholder="Contoh: 5"
                            min={0} />
                        {getFormErrorMessage('tahun_retensi')}
                    </div>
                </div>

                <div className="flex flex-column gap-1 mb-2">
                    <label htmlFor="tindakan_retensi" className="font-semibold text-sm text-900">
                        Tindakan Akhir Retensi <span className="text-red-500">*</span>
                    </label>
                    <Dropdown
                        id="tindakan_retensi"
                        value={formik.values.tindakan_retensi}
                        options={actionOptions}
                        onChange={(e) => formik.setFieldValue('tindakan_retensi', e.value)}
                        placeholder="Pilih Tindakan Akhir"
                        className={`w-full ${isFormFieldInvalid('tindakan_retensi') ? 'p-invalid' : ''}`} />
                    {getFormErrorMessage('tindakan_retensi')}
                </div>

                <div className="flex flex-column gap-1 mb-3">
                    <label htmlFor="deskripsi" className="font-semibold text-sm text-900">
                        Deskripsi
                    </label>
                    <InputTextarea
                        id="deskripsi"
                        value={formik.values.deskripsi}
                        onChange={(e) => formik.setFieldValue('deskripsi', e.target.value)}
                        rows={3}
                        className="w-full"
                        placeholder="Keterangan mengenai jadwal retensi..." />
                </div>

                <Divider className="my-2" />

                <div className="flex mt-4 pt-3 border-top-1 surface-border">
                    
                    <div className="flex mt-4 pt-3 border-top-1 surface-border">
                        
                        <Button type="submit" label={state?.edit ? 'Perbarui' : 'Simpan'} icon="pi pi-check" className=" w-full" loading={state?.load} disabled={state?.load} />
                    </div>
                </div>
            </form>
        </Dialog>
    );
};
export default Form;
