"use client";
import React from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { TabView, TabPanel } from 'primereact/tabview';

const directionOptions = [
    { label: 'Surat Masuk', value: 'incoming' },
    { label: 'Surat Keluar', value: 'outgoing' },
    { label: 'Masuk & Keluar', value: 'both' }
];

const Form = ({ state, setState, formik, handleDelete }: any) => {
    const isFormVisible = state.add || state.edit;
    const isFormFieldInvalid = (name: string) => !!(formik?.touched && formik.touched[name] && formik?.errors && formik.errors[name]);
    const getFormErrorMessage = (name: string) => {
        return isFormFieldInvalid(name) ? <small className="p-error">{formik.errors[name] as string}</small> : null;
    };

    const hideForm = () => {
        setState((p: any) => ({ ...p, add: false, edit: false, delete: false }));
        formik.resetForm();
    };

    const deleteFooterTemplate = (
        <div className="flex justify-content-center gap-2">
            <Button type="button" label="Batal" icon="pi pi-times" className="p-button-outlined p-button-secondary" onClick={hideForm} />
            <Button type="button" label="Ya, Hapus" icon="pi pi-trash" severity="danger" loading={state?.load} disabled={state?.load} onClick={handleDelete} />
        </div>
    );

    return (
        <>
            <Dialog 
                visible={isFormVisible} 
                onHide={hideForm}
                header={state.add ? 'Penambahan Jenis Surat Baru' : 'Ubah Data Jenis Surat'}
                modal
                style={{ width: '50vw' }}
                breakpoints={{ '960px': '75vw', '641px': '100vw' }}
            >
                <form onSubmit={formik?.handleSubmit}>
                        <div className="flex flex-column gap-2 px-3 pt-3 p-fluid">
                            <div className="flex flex-column gap-1">
                                <label htmlFor="kode_jenis_surat" className="font-semibold text-sm">KODE JENIS SURAT *</label>
                                <InputText
                                    id="kode_jenis_surat"
                                    name="kode_jenis_surat"
                                    value={formik?.values.kode_jenis_surat}
                                    onChange={formik?.handleChange}
                                    className={isFormFieldInvalid('kode_jenis_surat') ? 'p-invalid w-full' : 'w-full'}
                                    placeholder="Contoh: UND, NOTA, MEMO"
                                />
                                {getFormErrorMessage('kode_jenis_surat')}
                            </div>

                            <div className="flex flex-column gap-1">
                                <label htmlFor="nama_jenis_surat" className="font-semibold text-sm">NAMA JENIS SURAT *</label>
                                <InputText
                                    id="nama_jenis_surat"
                                    name="nama_jenis_surat"
                                    value={formik?.values.nama_jenis_surat}
                                    onChange={formik?.handleChange}
                                    className={isFormFieldInvalid('nama_jenis_surat') ? 'p-invalid w-full' : 'w-full'}
                                    placeholder="Contoh: Undangan, Nota Dinas"
                                />
                                {getFormErrorMessage('nama_jenis_surat')}
                            </div>

                            <div className="flex flex-column gap-1">
                                <label htmlFor="arah_surat" className="font-semibold text-sm">ARAH SURAT *</label>
                                <Dropdown
                                    id="arah_surat"
                                    name="arah_surat"
                                    value={formik?.values.arah_surat}
                                    options={directionOptions}
                                    onChange={formik?.handleChange}
                                    className={isFormFieldInvalid('arah_surat') ? 'p-invalid w-full' : 'w-full'}
                                />
                                {getFormErrorMessage('arah_surat')}
                            </div>

                            {state.edit && (
                                <div className="flex flex-column gap-1">
                                    <label htmlFor="status" className="font-semibold text-sm">STATUS KEAKTIFAN *</label>
                                    <Dropdown
                                        id="status"
                                        name="status"
                                        value={formik?.values.status}
                                        options={[{ label: 'Aktif', value: 'active' }, { label: 'Nonaktif', value: 'nonactive' }]}
                                        onChange={formik?.handleChange}
                                        className={isFormFieldInvalid('status') ? 'p-invalid w-full' : 'w-full'}
                                    />
                                    {getFormErrorMessage('status')}
                                </div>
                            )}

                            <div className="flex flex-column gap-1">
                                <label htmlFor="deskripsi" className="font-semibold text-sm">DESKRIPSI / KETERANGAN</label>
                                <InputText
                                    id="deskripsi"
                                    name="deskripsi"
                                    value={formik?.values.deskripsi}
                                    onChange={formik?.handleChange}
                                    className={isFormFieldInvalid('deskripsi') ? 'p-invalid w-full' : 'w-full'}
                                    placeholder="Keterangan singkat pengaplikasian jenis surat"
                                />
                                {getFormErrorMessage('deskripsi')}
                            </div>
                        </div>

                        {/* Footer Action Buttons */}
                        <div className="flex align-items-center justify-content-between mt-3 pt-3 border-top-1 surface-border">
                            <Button
                                type="button"
                                label="Kembali ke Daftar"
                                icon="pi pi-arrow-left"
                                className="p-button-outlined p-button-secondary"
                                onClick={hideForm}
                            />
                            <Button
                                type="submit"
                                label={state?.edit ? 'Perbarui Data' : 'Simpan Data'}
                                icon="pi pi-check"
                                className="p-button-primary px-4"
                                loading={state?.load}
                                disabled={state?.load}
                            />
                        </div>
                    </form>
            </Dialog>

            {/* Modal Delete Konfirmasi */}
            <Dialog header="Konfirmasi Hapus" visible={state.delete} onHide={hideForm} modal style={{ width: '25rem' }} footer={deleteFooterTemplate}>
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
