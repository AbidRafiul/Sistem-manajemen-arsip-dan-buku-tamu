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
        label: `${doc.document_number} — ${doc.document_name}`,
        value: doc.document_id
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
                    <label htmlFor="document_id" className="font-semibold text-sm text-900">
                        Dokumen <span className="text-red-500">*</span>
                    </label>
                    <Dropdown
                        id="document_id"
                        value={formik.values.document_id}
                        options={documentOptions}
                        filter
                        filterPlaceholder="Cari dokumen..."
                        onChange={(e) => formik.setFieldValue('document_id', e.value)}
                        placeholder="Pilih dokumen yang akan dipinjam"
                        className={`w-full ${isFormFieldInvalid('document_id') ? 'p-invalid' : ''}`}
                        emptyMessage="Tidak ada dokumen tersedia"
                        emptyFilterMessage="Dokumen tidak ditemukan"
                    />
                    {getFormErrorMessage('document_id')}
                </div>

                <div className="flex flex-column gap-1 mb-3">
                    <label htmlFor="borrower_name" className="font-semibold text-sm text-900">
                        Nama Peminjam <span className="text-red-500">*</span>
                    </label>
                    <InputText
                        id="borrower_name"
                        value={formik.values.borrower_name}
                        onChange={(e) => formik.setFieldValue('borrower_name', e.target.value)}
                        className={`w-full ${isFormFieldInvalid('borrower_name') ? 'p-invalid' : ''}`}
                        placeholder="Masukkan nama lengkap peminjam"
                    />
                    {getFormErrorMessage('borrower_name')}
                </div>

                <div className="flex flex-column gap-1 mb-3">
                    <label htmlFor="expected_return_date" className="font-semibold text-sm text-900">
                        Rencana Tanggal Pengembalian <span className="text-red-500">*</span>
                    </label>
                    <InputText
                        id="expected_return_date"
                        type="date"
                        value={formik.values.expected_return_date}
                        onChange={(e) => formik.setFieldValue('expected_return_date', e.target.value)}
                        className={`w-full ${isFormFieldInvalid('expected_return_date') ? 'p-invalid' : ''}`}
                    />
                    {getFormErrorMessage('expected_return_date')}
                </div>

                <div className="flex flex-column gap-1 mb-3">
                    <label htmlFor="purpose" className="font-semibold text-sm text-900">
                        Keperluan <span className="text-red-500">*</span>
                    </label>
                    <InputTextarea
                        id="purpose"
                        rows={4}
                        value={formik.values.purpose}
                        onChange={(e) => formik.setFieldValue('purpose', e.target.value)}
                        className={`w-full ${isFormFieldInvalid('purpose') ? 'p-invalid' : ''}`}
                        placeholder="Contoh: Audit, tinjauan hukum, verifikasi data..."
                        style={{ resize: 'none' }}
                    />
                    {getFormErrorMessage('purpose')}
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
