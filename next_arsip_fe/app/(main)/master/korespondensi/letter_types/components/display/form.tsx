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
            {isFormVisible && (
                <div className="card border-round shadow-1 p-4 mb-4 fadein animation-duration-300">
                    {/* Header Banner */}
                    <div className="flex align-items-center justify-content-between mb-4 border-bottom-1 surface-border pb-3">
                        <div>
                            <h2 className="text-xl font-bold text-900 m-0">
                                {state.add ? 'Penambahan Jenis Surat Baru' : 'Ubah Data Jenis Surat'}
                            </h2>
                            <p className="text-color-secondary text-sm m-0 mt-1">
                                Daftarkan jenis surat baru lengkap dengan informasi identitas, arah surat, serta deskripsi operasional.
                            </p>
                        </div>
                        <Button
                            type="button"
                            label="Batal"
                            icon="pi pi-times"
                            className="p-button-outlined p-button-danger p-button-sm"
                            onClick={hideForm}
                        />
                    </div>

                    <form onSubmit={formik?.handleSubmit}>
                        <TabView>
                            <TabPanel header="Informasi Dasar" leftIcon="pi pi-info-circle mr-2">
                                <div className="p-3">
                                    <h4 className="font-bold text-900 mb-1">Informasi Dasar Jenis Surat</h4>
                                    <p className="text-color-secondary text-sm mb-4">Detail kode unik, nama resmi, serta arah alur jenis surat.</p>

                                    <div className="grid p-fluid">
                                        <div className="col-12 md:col-6 flex flex-column gap-2 mb-3">
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

                                        <div className="col-12 md:col-6 flex flex-column gap-2 mb-3">
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

                                        <div className="col-12 md:col-6 flex flex-column gap-2 mb-3">
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
                                    </div>
                                </div>
                            </TabPanel>

                            <TabPanel header="Keterangan & Status" leftIcon="pi pi-sliders-h mr-2">
                                <div className="p-3">
                                    <h4 className="font-bold text-900 mb-1">Pengaturan Tambahan</h4>
                                    <p className="text-color-secondary text-sm mb-4">Catatan penjelasan serta status keaktifan jenis surat.</p>

                                    <div className="grid p-fluid">
                                        <div className="col-12 flex flex-column gap-2 mb-3">
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

                                        {state.edit && (
                                            <div className="col-12 md:col-6 flex flex-column gap-2 mb-3">
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
                                    </div>
                                </div>
                            </TabPanel>
                        </TabView>

                        {/* Footer Action Buttons */}
                        <div className="flex align-items-center justify-content-between mt-5 pt-3 border-top-1 surface-border">
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
                </div>
            )}

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
