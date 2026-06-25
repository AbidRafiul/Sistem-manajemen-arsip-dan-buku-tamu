'use client'

import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
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
            <form onSubmit={formik?.handleSubmit} className="flex flex-column gap-1 pt-3 text-sm">

                <div className="flex flex-column gap-1 mb-3">
                    <label htmlFor="document_number" className="font-semibold text-sm text-900">
                        Nomor Dokumen <span className="text-red-500">*</span>
                    </label>
                    <InputText
                        id="document_number"
                        value={formik.values.document_number}
                        onChange={(e) => formik.setFieldValue('document_number', e.target.value)}
                        className={`w-full ${isFormFieldInvalid('document_number') ? 'p-invalid' : ''}`}
                        placeholder="Contoh: DOC-2024-001"
                    />
                    {getFormErrorMessage('document_number')}
                </div>

                <div className="flex flex-column gap-1 mb-3">
                    <label htmlFor="document_name" className="font-semibold text-sm text-900">
                        Nama Dokumen <span className="text-red-500">*</span>
                    </label>
                    <InputText
                        id="document_name"
                        value={formik.values.document_name}
                        onChange={(e) => formik.setFieldValue('document_name', e.target.value)}
                        className={`w-full ${isFormFieldInvalid('document_name') ? 'p-invalid' : ''}`}
                        placeholder="Masukkan nama lengkap dokumen"
                    />
                    {getFormErrorMessage('document_name')}
                </div>

                <div className="grid mb-2">
                    <div className="col-12 md:col-6 flex flex-column gap-1">
                        <label htmlFor="document_date" className="font-semibold text-sm text-900">
                            Tanggal Dokumen <span className="text-red-500">*</span>
                        </label>
                        <InputText
                            id="document_date"
                            type="date"
                            value={formik.values.document_date}
                            onChange={(e) => formik.setFieldValue('document_date', e.target.value)}
                            className={`w-full ${isFormFieldInvalid('document_date') ? 'p-invalid' : ''}`}
                        />
                        {getFormErrorMessage('document_date')}
                    </div>
                    <div className="col-12 md:col-6 flex flex-column gap-1">
                        <label htmlFor="expired_date" className="font-semibold text-sm text-900">
                            Tanggal Kedaluwarsa <span className="text-color-secondary font-normal">(Opsional)</span>
                        </label>
                        <InputText
                            id="expired_date"
                            type="date"
                            value={formik.values.expired_date}
                            onChange={(e) => formik.setFieldValue('expired_date', e.target.value)}
                            className="w-full"
                        />
                        {getFormErrorMessage('expired_date')}
                    </div>
                </div>

                <div className="flex flex-column gap-1 mb-3">
                    <label htmlFor="pic_name" className="font-semibold text-sm text-900">
                        Nama PIC <span className="text-red-500">*</span>
                    </label>
                    <InputText
                        id="pic_name"
                        value={formik.values.pic_name}
                        onChange={(e) => formik.setFieldValue('pic_name', e.target.value)}
                        className={`w-full ${isFormFieldInvalid('pic_name') ? 'p-invalid' : ''}`}
                        placeholder="Masukkan nama penanggung jawab dokumen"
                    />
                    {getFormErrorMessage('pic_name')}
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
