'use client'

import formUpload from "@/lib/axios/formData";
import postData from "@/lib/axios/postData";
import { showError, showSuccess } from "@/lib/tools/generalTools";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Divider } from "primereact/divider";
import { Dropdown } from "primereact/dropdown";
import { FileUpload, FileUploadHandlerEvent } from "primereact/fileupload";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Message } from "primereact/message";
import { useEffect } from "react";
import { apiEndpointCreate, apiEndpointDelete, apiEndpointGet, apiEndpointUpdate, apiEndpointUpload } from "../endpoints";
import { FormProps, initValue } from "../interfaces";
import { mapIncomingLetterPayload } from "../mappers";

const statusOptions = [
    { label: "Baru", value: "baru" },
    { label: "Diproses", value: "diproses" },
    { label: "Didisposisi", value: "didisposisi" },
    { label: "Selesai", value: "selesai" },
];

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const Form = ({
    state,
    setState,
    formik,
    toast,
    getData
}: FormProps) => {
    const getIncomingLetterId = (res: any, input: initValue) =>
        res?.data?.data?.incoming_letter_id || res?.data?.data?.IncomingLetterId || input.incoming_letter_id;

    const uploadLetterFile = async (input: initValue, incomingLetterId: number | null) => {
        if (!input.letter_file || !incomingLetterId) return;
        const formData = new FormData();
        formData.append("incoming_letter_id", String(incomingLetterId));
        formData.append("File", input.letter_file);
        const uploadedBy = input.updated_by || input.created_by;
        if (uploadedBy) formData.append("uploaded_by", String(uploadedBy));
        await formUpload(apiEndpointUpload, formData, {});
    };

    const handleSave = async (input: initValue) => {
        setState((p) => ({ ...p, load: true }));
        try {
            const isEdit = Boolean(state.edit);
            const cEndPoint = isEdit ? apiEndpointUpdate : apiEndpointCreate;
            const oBody = mapIncomingLetterPayload(input, isEdit);
            const vaData = await postData(cEndPoint, oBody);
            const res = vaData.data;
            const incomingLetterId = getIncomingLetterId(vaData, input);

            if (input.letter_file) {
                try {
                    await uploadLetterFile(input, incomingLetterId);
                } catch (error: any) {
                    const e = error?.response?.data || error;
                    showError(toast, e?.message || "Surat tersimpan, tapi file gagal diupload");
                }
            }

            showSuccess(toast, res?.message || "Berhasil Menyimpan Data");
            formik.resetForm();
            setState((p) => ({ ...p, add: false, edit: false, delete: false, selectedLetters: [] }));
            await getData(apiEndpointGet);
        } catch (error: any) {
            const e = error?.response?.data || error;
            showError(toast, e?.message || "Terjadi Kesalahan");
        } finally {
            setState((p) => ({ ...p, load: false, submittedData: null }));
        }
    };

    const handleDelete = async () => {
        setState((p) => ({ ...p, load: true }));
        try {
            if (state.selectedLetters.length < 1) {
                showError(toast, "Tidak ada surat yang dipilih");
                return;
            }
            for (const letter of state.selectedLetters) {
                await postData(apiEndpointDelete, { incoming_letter_id: letter.incoming_letter_id });
            }
            showSuccess(toast, "Surat masuk berhasil dihapus");
            setState((p) => ({ ...p, selectedLetters: [], add: false, edit: false, delete: false }));
            await getData(apiEndpointGet);
        } catch (error: any) {
            const e = error?.response?.data || error;
            showError(toast, e?.message || "Terjadi Kesalahan");
        } finally {
            setState((p) => ({ ...p, load: false }));
        }
    };

    const isFormFieldInvalid = (name: keyof initValue) => Boolean(formik?.touched[name] && formik?.errors[name]);

    const getFormErrorMessage = (name: keyof initValue) => {
        return isFormFieldInvalid(name)
            ? <small className="p-error flex align-items-center gap-1 mt-1"><i className="pi pi-exclamation-circle text-xs" />{formik?.errors[name] as string}</small>
            : <small className="p-error">&nbsp;</small>;
    };

    const deleteFooterTemplate = (
        <div className="flex justify-content-end gap-2">
            <Button
                label="Batal" icon="pi pi-times" severity="secondary" outlined size="small"
                onClick={() => setState((p) => ({ ...p, add: false, edit: false, delete: false }))}
                disabled={state.load}
            />
            <Button
                label="Ya, Hapus" icon="pi pi-trash" severity="danger" size="small"
                onClick={handleDelete} loading={state.load}
            />
        </div>
    );

    useEffect(() => {
        if (state.submittedData) handleSave(state.submittedData);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.submittedData]);

    return (
        <>
            {/* ─── Add / Edit Dialog ─────────────────────────── */}
            <Dialog
                visible={state.add || state.edit}
                header={
                    <div className="flex align-items-center gap-2">
                        <i className={`pi ${state.edit ? "pi-pencil" : "pi-envelope"} text-primary`} />
                        <span className="font-bold text-900">{state.edit ? "Edit Surat Masuk" : "Tambah Surat Masuk"}</span>
                    </div>
                }
                modal
                style={{ width: "60rem", maxWidth: "95vw" }}
                onHide={() => { setState((p) => ({ ...p, add: false, edit: false, delete: false })); formik.resetForm(); }}
                pt={{ header: { className: "border-bottom-1 surface-border pb-3" } }}
            >
                <form onSubmit={formik.handleSubmit} className="flex flex-column gap-1 pt-3 text-sm">
                    <div className="grid">
                        <div className="col-12 md:col-6 flex flex-column gap-1 mb-2">
                            <label htmlFor="agenda_number" className="font-semibold text-900">Nomor Agenda <span className="text-red-500">*</span></label>
                            <InputText
                                id="agenda_number"
                                className={`w-full ${isFormFieldInvalid("agenda_number") ? "p-invalid" : ""}`}
                                value={formik.values.agenda_number}
                                onChange={(e) => formik.setFieldValue("agenda_number", e.target.value)}
                                placeholder="Contoh: AG-2024-001"
                            />
                            {getFormErrorMessage("agenda_number")}
                        </div>
                        <div className="col-12 md:col-6 flex flex-column gap-1 mb-2">
                            <label htmlFor="letter_number" className="font-semibold text-900">Nomor Surat <span className="text-red-500">*</span></label>
                            <InputText
                                id="letter_number"
                                className={`w-full ${isFormFieldInvalid("letter_number") ? "p-invalid" : ""}`}
                                value={formik.values.letter_number}
                                onChange={(e) => formik.setFieldValue("letter_number", e.target.value)}
                                placeholder="Contoh: 001/MEN/VI/2024"
                            />
                            {getFormErrorMessage("letter_number")}
                        </div>
                        <div className="col-12 md:col-6 flex flex-column gap-1 mb-2">
                            <label htmlFor="letter_date" className="font-semibold text-900">Tanggal Surat <span className="text-red-500">*</span></label>
                            <InputText
                                id="letter_date" type="date"
                                className={`w-full ${isFormFieldInvalid("letter_date") ? "p-invalid" : ""}`}
                                value={formik.values.letter_date}
                                onChange={(e) => formik.setFieldValue("letter_date", e.target.value)}
                            />
                            {getFormErrorMessage("letter_date")}
                        </div>
                        <div className="col-12 md:col-6 flex flex-column gap-1 mb-2">
                            <label htmlFor="received_date" className="font-semibold text-900">Tanggal Diterima <span className="text-red-500">*</span></label>
                            <InputText
                                id="received_date" type="date"
                                className={`w-full ${isFormFieldInvalid("received_date") ? "p-invalid" : ""}`}
                                value={formik.values.received_date}
                                onChange={(e) => formik.setFieldValue("received_date", e.target.value)}
                            />
                            {getFormErrorMessage("received_date")}
                        </div>
                        <div className="col-12 md:col-6 flex flex-column gap-1 mb-2">
                            <label htmlFor="sender_name" className="font-semibold text-900">Nama Pengirim <span className="text-red-500">*</span></label>
                            <InputText
                                id="sender_name"
                                className={`w-full ${isFormFieldInvalid("sender_name") ? "p-invalid" : ""}`}
                                value={formik.values.sender_name}
                                onChange={(e) => formik.setFieldValue("sender_name", e.target.value)}
                                placeholder="Nama pengirim surat"
                            />
                            {getFormErrorMessage("sender_name")}
                        </div>
                        <div className="col-12 md:col-6 flex flex-column gap-1 mb-2">
                            <label htmlFor="sender_institution" className="font-semibold text-900">Instansi Pengirim</label>
                            <InputText
                                id="sender_institution"
                                className="w-full"
                                value={formik.values.sender_institution}
                                onChange={(e) => formik.setFieldValue("sender_institution", e.target.value)}
                                placeholder="Nama instansi / lembaga"
                            />
                            <small className="p-error">&nbsp;</small>
                        </div>
                        <div className="col-12 flex flex-column gap-1 mb-2">
                            <label htmlFor="subject" className="font-semibold text-900">Perihal <span className="text-red-500">*</span></label>
                            <InputText
                                id="subject"
                                className={`w-full ${isFormFieldInvalid("subject") ? "p-invalid" : ""}`}
                                value={formik.values.subject}
                                onChange={(e) => formik.setFieldValue("subject", e.target.value)}
                                placeholder="Perihal / pokok isi surat"
                            />
                            {getFormErrorMessage("subject")}
                        </div>
                        <div className="col-12 flex flex-column gap-1 mb-2">
                            <label htmlFor="attachment_description" className="font-semibold text-900">Keterangan Lampiran</label>
                            <InputTextarea
                                id="attachment_description"
                                className="w-full"
                                rows={2}
                                value={formik.values.attachment_description}
                                onChange={(e) => formik.setFieldValue("attachment_description", e.target.value)}
                                placeholder="Deskripsi lampiran surat (opsional)"
                                style={{ resize: "none" }}
                            />
                            <small className="p-error">&nbsp;</small>
                        </div>

                        {/* File Upload */}
                        <div className="col-12 flex flex-column gap-1 mb-2">
                            <label className="font-semibold text-900">Upload File Surat</label>
                            <FileUpload
                                name="letter_file"
                                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                                maxFileSize={MAX_FILE_SIZE}
                                mode="basic"
                                chooseLabel={formik.values.letter_file ? formik.values.letter_file.name : "Pilih File..."}
                                chooseOptions={{ icon: "pi pi-upload" }}
                                auto={false}
                                customUpload
                                uploadHandler={(e: FileUploadHandlerEvent) => {
                                    const file = e.files[0] || null;
                                    formik.setFieldValue("letter_file", file);
                                }}
                                onSelect={(e) => {
                                    const file = e.files[0] || null;
                                    if (file && file.size > MAX_FILE_SIZE) {
                                        showError(toast, "Ukuran file maksimal 10 MB");
                                        formik.setFieldValue("letter_file", null);
                                        return;
                                    }
                                    formik.setFieldValue("letter_file", file);
                                }}
                                className="w-full"
                                pt={{ basicButton: { className: "w-full justify-content-start" } }}
                            />
                            <small className="text-color-secondary mt-1">PDF, Word, Excel, JPG, atau PNG · Maks. 10 MB</small>
                            {formik.values.letter_file && (
                                <div className="flex align-items-center gap-2 mt-1 p-2 surface-50 border-round border-1 surface-border">
                                    <i className="pi pi-file-check text-green-500" />
                                    <span className="text-xs text-900 font-semibold">{formik.values.letter_file.name}</span>
                                    <Button
                                        icon="pi pi-times" text severity="danger" size="small"
                                        className="ml-auto p-0"
                                        onClick={() => formik.setFieldValue("letter_file", null)}
                                    />
                                </div>
                            )}
                        </div>

                        {state.edit && (
                            <div className="col-12 md:col-6 flex flex-column gap-1 mb-2">
                                <label htmlFor="status" className="font-semibold text-900">Status</label>
                                <Dropdown
                                    id="status"
                                    className="w-full"
                                    value={formik.values.status}
                                    options={statusOptions}
                                    onChange={(e) => formik.setFieldValue("status", e.value)}
                                />
                                {getFormErrorMessage("status")}
                            </div>
                        )}
                    </div>

                    <Divider className="my-2" />

                    <div className="flex justify-content-end gap-2">
                        <Button
                            type="button" label="Batal" icon="pi pi-times" severity="secondary" outlined size="small"
                            onClick={() => { setState((p) => ({ ...p, add: false, edit: false })); formik.resetForm(); }}
                        />
                        <Button
                            type="submit"
                            label={state.edit ? "Simpan Perubahan" : "Simpan Surat"}
                            icon={state.edit ? "pi pi-check" : "pi pi-save"}
                            size="small"
                            style={{ background: "linear-gradient(135deg, var(--primary-color) 0%, #1d4ed8 100%)", border: "none" }}
                            loading={state.load}
                        />
                    </div>
                </form>
            </Dialog>

            {/* ─── Delete Confirmation Dialog ──────────────────── */}
            <Dialog
                header={
                    <div className="flex align-items-center gap-2">
                        <i className="pi pi-exclamation-triangle text-red-500" />
                        <span className="font-bold text-900">Konfirmasi Hapus</span>
                    </div>
                }
                visible={state.delete}
                onHide={() => setState((p) => ({ ...p, add: false, edit: false, delete: false }))}
                modal
                style={{ width: "26rem", maxWidth: "95vw" }}
                footer={deleteFooterTemplate}
                pt={{ header: { className: "border-bottom-1 surface-border pb-3" } }}
            >
                <div className="flex flex-column align-items-center text-center gap-3 py-4">
                    <div className="flex align-items-center justify-content-center border-circle bg-red-50 border-1 border-red-100" style={{ width: "4rem", height: "4rem" }}>
                        <i className="pi pi-trash text-red-500 text-2xl" />
                    </div>
                    <div>
                        <h4 className="font-bold text-900 m-0 mb-2 text-lg">
                            {state.selectedLetters.length > 1 ? `Hapus ${state.selectedLetters.length} surat?` : "Hapus surat ini?"}
                        </h4>
                        <p className="text-color-secondary text-sm m-0">
                            {state.selectedLetters.length > 1
                                ? `${state.selectedLetters.length} surat yang dipilih akan dihapus secara permanen.`
                                : <>Surat <strong>{state.selectedLetters[0]?.agenda_number || ""}</strong> akan dihapus secara permanen.</>
                            }
                        </p>
                    </div>
                </div>
            </Dialog>
        </>
    );
};

export default Form;
