'use client'

import formUpload from "@/lib/axios/formData";
import postData from "@/lib/axios/postData";
import { showError, showSuccess } from "@/lib/tools/generalTools";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
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
    const getIncomingLetterId = (res: any, input: initValue) => {
        return res?.data?.data?.incoming_letter_id
            || res?.data?.data?.IncomingLetterId
            || input.incoming_letter_id;
    };

    const uploadLetterFile = async (input: initValue, incomingLetterId: number | null) => {
        if (!input.letter_file || !incomingLetterId) return;

        const formData = new FormData();
        formData.append("incoming_letter_id", String(incomingLetterId));
        formData.append("File", input.letter_file);

        const uploadedBy = input.updated_by || input.created_by;
        if (uploadedBy) {
            formData.append("uploaded_by", String(uploadedBy));
        }

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

    const deleteFooterTemplate = (
        <div className="flex justify-content-center gap-2">
            <Button
                label="Batal"
                icon="pi pi-times"
                severity="secondary"
                outlined
                onClick={() => setState((p) => ({ ...p, add: false, edit: false, delete: false }))}
                disabled={state.load}
            />
            <Button
                label="Ya, Hapus"
                icon="pi pi-trash"
                severity="danger"
                onClick={handleDelete}
                loading={state.load}
            />
        </div>
    );

    const isFormFieldInvalid = (name: keyof initValue) => Boolean(formik?.touched[name] && formik?.errors[name]);

    const getFormErrorMessage = (name: keyof initValue) => {
        return isFormFieldInvalid(name) ? <small className="p-error">{formik?.errors[name] as string}</small> : <small className="p-error">&nbsp;</small>;
    };

    useEffect(() => {
        if (state.submittedData) {
            handleSave(state.submittedData);
        }
    }, [state.submittedData]);

    return (
        <>
            <Dialog
                visible={state.add || state.edit}
                header={state.edit ? "Edit Surat Masuk" : "Tambah Surat Masuk"}
                modal
                style={{ width: "60rem", maxWidth: "95vw" }}
                onHide={() => {
                    setState((p) => ({ ...p, add: false, edit: false, delete: false }));
                    formik.resetForm();
                }}
            >
                <form onSubmit={formik.handleSubmit} className="flex gap-3 flex-column">
                    <div className="grid">
                        <div className="col-12 md:col-6">
                            <label htmlFor="agenda_number">Nomor Agenda</label>
                            <InputText
                                id="agenda_number"
                                className={`w-full mt-2 ${isFormFieldInvalid("agenda_number") ? "p-invalid" : ""}`}
                                value={formik.values.agenda_number}
                                onChange={(e) => formik.setFieldValue("agenda_number", e.target.value)}
                            />
                            {getFormErrorMessage("agenda_number")}
                        </div>
                        <div className="col-12 md:col-6">
                            <label htmlFor="letter_number">Nomor Surat</label>
                            <InputText
                                id="letter_number"
                                className={`w-full mt-2 ${isFormFieldInvalid("letter_number") ? "p-invalid" : ""}`}
                                value={formik.values.letter_number}
                                onChange={(e) => formik.setFieldValue("letter_number", e.target.value)}
                            />
                            {getFormErrorMessage("letter_number")}
                        </div>
                        <div className="col-12 md:col-6">
                            <label htmlFor="letter_date">Tanggal Surat</label>
                            <InputText
                                id="letter_date"
                                type="date"
                                className={`w-full mt-2 ${isFormFieldInvalid("letter_date") ? "p-invalid" : ""}`}
                                value={formik.values.letter_date}
                                onChange={(e) => formik.setFieldValue("letter_date", e.target.value)}
                            />
                            {getFormErrorMessage("letter_date")}
                        </div>
                        <div className="col-12 md:col-6">
                            <label htmlFor="received_date">Tanggal Diterima</label>
                            <InputText
                                id="received_date"
                                type="date"
                                className={`w-full mt-2 ${isFormFieldInvalid("received_date") ? "p-invalid" : ""}`}
                                value={formik.values.received_date}
                                onChange={(e) => formik.setFieldValue("received_date", e.target.value)}
                            />
                            {getFormErrorMessage("received_date")}
                        </div>
                        <div className="col-12 md:col-6">
                            <label htmlFor="sender_name">Pengirim</label>
                            <InputText
                                id="sender_name"
                                className={`w-full mt-2 ${isFormFieldInvalid("sender_name") ? "p-invalid" : ""}`}
                                value={formik.values.sender_name}
                                onChange={(e) => formik.setFieldValue("sender_name", e.target.value)}
                            />
                            {getFormErrorMessage("sender_name")}
                        </div>
                        <div className="col-12">
                            <label htmlFor="subject">Perihal</label>
                            <InputText
                                id="subject"
                                className={`w-full mt-2 ${isFormFieldInvalid("subject") ? "p-invalid" : ""}`}
                                value={formik.values.subject}
                                onChange={(e) => formik.setFieldValue("subject", e.target.value)}
                            />
                            {getFormErrorMessage("subject")}
                        </div>
                        <div className="col-12">
                            <label htmlFor="attachment_description">Lampiran</label>
                            <InputTextarea
                                id="attachment_description"
                                className="w-full mt-2"
                                rows={3}
                                value={formik.values.attachment_description}
                                onChange={(e) => formik.setFieldValue("attachment_description", e.target.value)}
                            />
                            {getFormErrorMessage("attachment_description")}
                        </div>
                        <div className="col-12">
                            <label htmlFor="letter_file">Upload File Surat</label>
                            <input
                                id="letter_file"
                                type="file"
                                className="w-full mt-2 p-inputtext p-component"
                                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                                onChange={(e) => {
                                    const file = e.target.files?.[0] || null;

                                    if (file && file.size > MAX_FILE_SIZE) {
                                        e.target.value = "";
                                        formik.setFieldValue("letter_file", null);
                                        showError(toast, "Ukuran file maksimal 10 MB");
                                        return;
                                    }

                                    formik.setFieldValue("letter_file", file);
                                }}
                            />
                            <small className="text-color-secondary block mt-2">
                                PDF, Word, Excel, JPG, atau PNG maksimal 10 MB.
                            </small>
                        </div>
                        {state.edit && (
                            <div className="col-12 md:col-6">
                                <label htmlFor="status">Status</label>
                                <Dropdown
                                    id="status"
                                    className="w-full mt-2"
                                    value={formik.values.status}
                                    options={statusOptions}
                                    onChange={(e) => formik.setFieldValue("status", e.value)}
                                />
                                {getFormErrorMessage("status")}
                            </div>
                        )}
                    </div>

                    <div className="flex justify-content-end gap-2">
                        <Button
                            type="button"
                            label="Batal"
                            icon="pi pi-times"
                            severity="secondary"
                            outlined
                            onClick={() => {
                                setState((p) => ({ ...p, add: false, edit: false }));
                                formik.resetForm();
                            }}
                        />
                        <Button type="submit" label={state.edit ? "Update" : "Save"} icon="pi pi-save" loading={state.load} />
                    </div>
                </form>
            </Dialog>

            <Dialog
                header="Delete Confirm"
                visible={state.delete}
                onHide={() => setState((p) => ({ ...p, add: false, edit: false, delete: false }))}
                modal
                style={{ width: "25rem" }}
                footer={deleteFooterTemplate}
            >
                <div className="flex flex-column align-items-center text-center gap-4 py-4">
                    <i className="pi pi-exclamation-triangle text-red-500 text-6xl" />
                    <div>
                        <h3 className="font-bold mb-2">
                            {state.selectedLetters.length > 1
                                ? `Delete ${state.selectedLetters.length} surat?`
                                : "Delete this letter?"
                            }
                        </h3>
                        <p className="text-color-secondary">
                            {state.selectedLetters.length > 1 ? (
                                `You are going to delete ${state.selectedLetters.length} selected letters.`
                            ) : (
                                <>
                                    You are going to delete: <strong>{state.selectedLetters[0]?.agenda_number || ""}</strong>.
                                </>
                            )}
                            <br />
                            This action can&apos;t be undone
                        </p>
                    </div>
                </div>
            </Dialog>
        </>
    );
};

export default Form;
