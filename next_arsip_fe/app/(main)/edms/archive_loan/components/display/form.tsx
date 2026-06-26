'use client'

import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Divider } from "primereact/divider";
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

    const documentOptions = state.documents.map(doc => ({
        label: `${doc.nomor_dokumen} — ${doc.nama_dokumen}`,
        value: doc.kode_dokumen
    }));

    return (
        <Dialog
            visible={state.add}
            header={
                <div className="flex align-items-center gap-2">
                    <i className="pi pi-file-plus text-primary" />
                    <span className="font-bold text-900">Request Peminjaman Arsip</span>
                </div>
            }
            modal
            style={{ width: '44rem', maxWidth: '95vw' }}
            onHide={() => { setState((p) => ({ ...p, add: false })); formik?.resetForm(); }}
            pt={{ header: { className: 'border-bottom-1 surface-border pb-3' } }}
        >
            <form onSubmit={formik?.handleSubmit} className="flex flex-column gap-1 pt-3">

                <div className="flex flex-column gap-1 mb-3">
                    <label htmlFor="kode_dokumen" className="font-semibold text-sm text-900">
                        Dokumen <span className="text-red-500">*</span>
                    </label>
                    <Dropdown
                        id="kode_dokumen"
                        value={formik.values.kode_dokumen}
                        options={documentOptions}
                        filter
                        filterPlaceholder="Cari dokumen..."
                        onChange={(e) => formik.setFieldValue('kode_dokumen', e.value)}
                        placeholder="Pilih dokumen yang akan dipinjam"
                        className={`w-full ${isFormFieldInvalid('kode_dokumen') ? 'p-invalid' : ''}`}
                        emptyMessage="Tidak ada dokumen tersedia"
                        emptyFilterMessage="Dokumen tidak ditemukan"
                    />
                    {getFormErrorMessage('kode_dokumen')}
                </div>

                <div className="flex flex-column gap-1 mb-3">
                    <label htmlFor="nama_peminjam" className="font-semibold text-sm text-900">
                        Nama Peminjam <span className="text-red-500">*</span>
                    </label>
                    <InputText
                        id="nama_peminjam"
                        value={formik.values.nama_peminjam}
                        onChange={(e) => formik.setFieldValue('nama_peminjam', e.target.value)}
                        className={`w-full ${isFormFieldInvalid('nama_peminjam') ? 'p-invalid' : ''}`}
                        placeholder="Masukkan nama lengkap peminjam"
                    />
                    {getFormErrorMessage('nama_peminjam')}
                </div>

                <div className="flex flex-column gap-1 mb-3">
                    <label htmlFor="tanggal_pengembalian" className="font-semibold text-sm text-900">
                        Rencana Tanggal Pengembalian <span className="text-red-500">*</span>
                    </label>
                    <InputText
                        id="tanggal_pengembalian"
                        type="date"
                        value={formik.values.tanggal_pengembalian}
                        onChange={(e) => formik.setFieldValue('tanggal_pengembalian', e.target.value)}
                        className={`w-full ${isFormFieldInvalid('tanggal_pengembalian') ? 'p-invalid' : ''}`}
                    />
                    {getFormErrorMessage('tanggal_pengembalian')}
                </div>

                <div className="flex flex-column gap-1 mb-3">
                    <label htmlFor="keperluan" className="font-semibold text-sm text-900">
                        Keperluan <span className="text-red-500">*</span>
                    </label>
                    <InputTextarea
                        id="keperluan"
                        rows={4}
                        value={formik.values.keperluan}
                        onChange={(e) => formik.setFieldValue('keperluan', e.target.value)}
                        className={`w-full ${isFormFieldInvalid('keperluan') ? 'p-invalid' : ''}`}
                        placeholder="Contoh: Audit, tinjauan hukum, verifikasi data..."
                        style={{ resize: 'none' }}
                    />
                    {getFormErrorMessage('keperluan')}
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
                        onClick={() => { setState((p) => ({ ...p, add: false })); formik.resetForm(); }}
                        disabled={state.load}
                    />
                    <Button
                        type="submit"
                        label="Ajukan Peminjaman"
                        icon="pi pi-send"
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
