'use client'

import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Divider } from "primereact/divider";
import { Dropdown } from "primereact/dropdown";
import { FormProps, initValue } from "../interfaces";

const Form = ({
    state,
    setState,
    formik,
}: FormProps) => {

    const isFormFieldInvalid = (name: keyof initValue) => !!(formik?.touched[name] && formik?.errors[name]);

    const getFormErrorMessage = (name: keyof initValue) => {
        return isFormFieldInvalid(name)
            ? <small className="p-error flex align-items-center gap-1 mt-1"><i className="pi pi-exclamation-circle text-xs" />{formik?.errors[name]}</small>
            : <small className="p-error">&nbsp;</small>;
    };

    return (
        <Dialog
            visible={state.add || state.edit}
            header={
                <div className="flex align-items-center gap-2">
                    <i className={`pi ${state.edit ? 'pi-pencil' : 'pi-file-plus'} text-primary`} />
                    <span className="font-bold text-900">{state.edit ? 'Edit Dokumen Arsip' : 'Tambah Dokumen Arsip'}</span>
                </div>
            }
            modal
            style={{ width: '44rem', maxWidth: '95vw' }}
            onHide={() => { setState((p) => ({ ...p, add: false, edit: false })); formik?.resetForm(); }}
            pt={{ header: { className: 'border-bottom-1 surface-border pb-3' } }}
        >
            <form onSubmit={formik?.handleSubmit} className="flex gap-1 flex-column pt-3 text-sm">

                <div className="grid mb-2">
                    <div className="col-12 md:col-6 flex flex-column gap-1">
                        <label htmlFor="kode_klasifikasi" className="font-semibold text-sm text-900">
                            Klasifikasi Arsip <span className="text-red-500">*</span>
                        </label>
                        <Dropdown
                            id="kode_klasifikasi"
                            value={formik.values.kode_klasifikasi}
                            options={state.classifications.map((item: any) => ({
                                label: `${item.kode_klasifikasi} - ${item.nama_klasifikasi}`,
                                value: item.kode_klasifikasi
                            }))}
                            onChange={(e) => {
                                formik.setFieldValue('kode_klasifikasi', e.value);
                                formik.setFieldValue('kode_kategori_dokumen', '');
                            }}
                            placeholder="Pilih Klasifikasi"
                            className={`w-full ${isFormFieldInvalid('kode_klasifikasi') ? 'p-invalid' : ''}`}
                            filter
                        />
                        {getFormErrorMessage('kode_klasifikasi')}
                    </div>
                    <div className="col-12 md:col-6 flex flex-column gap-1">
                        <label htmlFor="kode_jenis_dokumen" className="font-semibold text-sm text-900">
                            Jenis Dokumen <span className="text-red-500">*</span>
                        </label>
                        <Dropdown
                            id="kode_jenis_dokumen"
                            value={formik.values.kode_jenis_dokumen}
                            options={state.documentTypes.map((item: any) => ({
                                label: `${item.kode_jenis_dokumen} - ${item.nama_jenis_dokumen}`,
                                value: item.kode_jenis_dokumen
                            }))}
                            onChange={(e) => formik.setFieldValue('kode_jenis_dokumen', e.value)}
                            placeholder="Pilih Jenis Dokumen"
                            className={`w-full ${isFormFieldInvalid('kode_jenis_dokumen') ? 'p-invalid' : ''}`}
                            filter
                        />
                        {getFormErrorMessage('kode_jenis_dokumen')}
                    </div>
                </div>

                <div className="grid mb-2">
                    <div className="col-12 md:col-6 flex flex-column gap-1">
                        <label htmlFor="kode_kategori_dokumen" className="font-semibold text-sm text-900">
                            Kategori Dokumen <span className="text-red-500">*</span>
                        </label>
                        <Dropdown
                            id="kode_kategori_dokumen"
                            value={formik.values.kode_kategori_dokumen}
                            options={state.categories
                                .filter((item: any) => item.kode_klasifikasi === formik.values.kode_klasifikasi)
                                .map((item: any) => ({
                                    label: `${item.kode_kategori_dokumen} - ${item.nama_kategori_dokumen}`,
                                    value: item.kode_kategori_dokumen
                                }))}
                            onChange={(e) => formik.setFieldValue('kode_kategori_dokumen', e.value)}
                            placeholder={formik.values.kode_klasifikasi ? "Pilih Kategori" : "Pilih Klasifikasi Terlebih Dahulu"}
                            disabled={!formik.values.kode_klasifikasi}
                            className={`w-full ${isFormFieldInvalid('kode_kategori_dokumen') ? 'p-invalid' : ''}`}
                            filter
                        />
                        {getFormErrorMessage('kode_kategori_dokumen')}
                    </div>
                    <div className="col-12 md:col-6 flex flex-column gap-1">
                        <label htmlFor="kode_tingkat_kerahasiaan" className="font-semibold text-sm text-900">
                            Tingkat Kerahasiaan <span className="text-red-500">*</span>
                        </label>
                        <Dropdown
                            id="kode_tingkat_kerahasiaan"
                            value={formik.values.kode_tingkat_kerahasiaan}
                            options={state.confidentialities.map((item: any) => ({
                                label: item.nama_tingkat_kerahasiaan,
                                value: item.kode_tingkat_kerahasiaan
                            }))}
                            onChange={(e) => formik.setFieldValue('kode_tingkat_kerahasiaan', e.value)}
                            placeholder="Pilih Kerahasiaan"
                            className={`w-full ${isFormFieldInvalid('kode_tingkat_kerahasiaan') ? 'p-invalid' : ''}`}
                        />
                        {getFormErrorMessage('kode_tingkat_kerahasiaan')}
                    </div>
                </div>

                <div className="flex flex-column gap-1 mb-3">
                    <label htmlFor="nomor_dokumen" className="font-semibold text-sm text-900">
                        Nomor Dokumen <span className="text-red-500">*</span>
                    </label>
                    <InputText
                        id="nomor_dokumen"
                        value={formik.values.nomor_dokumen}
                        onChange={(e) => formik.setFieldValue('nomor_dokumen', e.target.value)}
                        className={`w-full ${isFormFieldInvalid('nomor_dokumen') ? 'p-invalid' : ''}`}
                        placeholder="Contoh: DOC-2024-001"
                    />
                    {getFormErrorMessage('nomor_dokumen')}
                </div>

                <div className="flex flex-column gap-1 mb-3">
                    <label htmlFor="nama_dokumen" className="font-semibold text-sm text-900">
                        Nama Dokumen <span className="text-red-500">*</span>
                    </label>
                    <InputText
                        id="nama_dokumen"
                        value={formik.values.nama_dokumen}
                        onChange={(e) => formik.setFieldValue('nama_dokumen', e.target.value)}
                        className={`w-full ${isFormFieldInvalid('nama_dokumen') ? 'p-invalid' : ''}`}
                        placeholder="Masukkan nama lengkap dokumen"
                    />
                    {getFormErrorMessage('nama_dokumen')}
                </div>

                <div className="grid mb-2">
                    <div className="col-12 md:col-6 flex flex-column gap-1">
                        <label htmlFor="tanggal" className="font-semibold text-sm text-900">
                            Tanggal Dokumen <span className="text-red-500">*</span>
                        </label>
                        <InputText
                            id="tanggal"
                            type="date"
                            value={formik.values.tanggal}
                            onChange={(e) => formik.setFieldValue('tanggal', e.target.value)}
                            className={`w-full ${isFormFieldInvalid('tanggal') ? 'p-invalid' : ''}`}
                        />
                        {getFormErrorMessage('tanggal')}
                    </div>
                    <div className="col-12 md:col-6 flex flex-column gap-1">
                        <label htmlFor="tanggal_kedaluwarsa" className="font-semibold text-sm text-900">
                            Tanggal Kedaluwarsa <span className="text-color-secondary font-normal">(Opsional)</span>
                        </label>
                        <InputText
                            id="tanggal_kedaluwarsa"
                            type="date"
                            value={formik.values.tanggal_kedaluwarsa}
                            onChange={(e) => formik.setFieldValue('tanggal_kedaluwarsa', e.target.value)}
                            className="w-full"
                        />
                        {getFormErrorMessage('tanggal_kedaluwarsa')}
                    </div>
                </div>

                <div className="grid mb-2">
                    <div className="col-12 md:col-6 flex flex-column gap-1">
                        <label htmlFor="tanggal_transaksi" className="font-semibold text-sm text-900">
                            Tanggal Transaksi <span className="text-color-secondary font-normal">(Opsional)</span>
                        </label>
                        <InputText
                            id="tanggal_transaksi"
                            type="date"
                            value={formik.values.tanggal_transaksi}
                            onChange={(e) => formik.setFieldValue('tanggal_transaksi', e.target.value)}
                            className="w-full"
                        />
                        {getFormErrorMessage('tanggal_transaksi')}
                    </div>
                    <div className="col-12 md:col-6 flex flex-column gap-1">
                        <label htmlFor="lokasi_fisik" className="font-semibold text-sm text-900">
                            Lokasi Fisik <span className="text-color-secondary font-normal">(Opsional)</span>
                        </label>
                        <InputText
                            id="lokasi_fisik"
                            value={formik.values.lokasi_fisik}
                            onChange={(e) => formik.setFieldValue('lokasi_fisik', e.target.value)}
                            placeholder="Contoh: Rak A, Baris 2"
                            className="w-full"
                        />
                        {getFormErrorMessage('lokasi_fisik')}
                    </div>
                </div>



                <div className="flex flex-column gap-1 mb-3">
                    <label htmlFor="nama_pic" className="font-semibold text-sm text-900">
                        Nama PIC <span className="text-red-500">*</span>
                    </label>
                    <InputText
                        id="nama_pic"
                        value={formik.values.nama_pic}
                        disabled
                        className="w-full bg-gray-100"
                        placeholder="Mengambil data dari session..."
                    />
                    {getFormErrorMessage('nama_pic')}
                </div>

                <Divider className="my-2" />

                <div className="flex justify-content-end gap-2">
                    <Button
                        type="button"
                        label="Batal"
                        icon="pi pi-times"
                        severity="secondary"
                        outlined
                        size="small"
                        onClick={() => { setState((p) => ({ ...p, add: false, edit: false })); formik.resetForm(); }}
                        disabled={state.load}
                    />
                    <Button
                        type="submit"
                        label={state.edit ? 'Simpan Perubahan' : 'Simpan Dokumen'}
                        icon={state.edit ? 'pi pi-check' : 'pi pi-save'}
                        size="small"
                        style={{ background: 'linear-gradient(135deg, #4F46E5 0%, #3B82F6 100%)', border: 'none' }}
                        loading={state.load}
                    />
                </div>
            </form>
        </Dialog>
    );
}

export default Form
