'use client'

import postData from "@/lib/axios/postData";
import { showError, showSuccess } from "@/lib/tools/generalTools";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { useEffect } from "react";
import { apiEndpointCreate, apiEndpointDelete, apiEndpointGet, apiEndpointUpdate } from "../endpoints";
import { FormProps, initValue } from "../interfaces";

const statusOptions = [
    { label: "Baru", value: "baru" },
    { label: "Diproses", value: "diproses" },
    { label: "Didisposisi", value: "didisposisi" },
    { label: "Selesai", value: "selesai" },
];

const Form = ({
    state,
    setState,
    formik,
    toast,
    getData
}: FormProps) => {
    const nullableNumber = (value: number | null) => value || null;

    const handleSave = async (input: initValue) => {
        setState((p) => ({ ...p, load: true }));

        try {
            const isEdit = Boolean(state.edit);
            const cEndPoint = isEdit ? apiEndpointUpdate : apiEndpointCreate;

            const oBody: Record<string, any> = {
                AgendaNumber: input.AgendaNumber,
                LetterNumber: input.LetterNumber,
                LetterDate: input.LetterDate,
                ReceivedDate: input.ReceivedDate,
                SenderName: input.SenderName,
                SenderInstitution: input.SenderInstitution || null,
                Subject: input.Subject,
                AttachmentDescription: input.AttachmentDescription || null,
                LetterTypeId: nullableNumber(input.LetterTypeId),
                DocumentTypeId: nullableNumber(input.DocumentTypeId),
                ArchiveClassificationId: nullableNumber(input.ArchiveClassificationId),
                ConfidentialityLevelId: nullableNumber(input.ConfidentialityLevelId),
            };

            if (isEdit) {
                oBody.IncomingLetterId = input.IncomingLetterId;
                oBody.Status = input.Status;
                oBody.UpdatedBy = nullableNumber(input.UpdatedBy);
            } else {
                oBody.CreatedBy = nullableNumber(input.CreatedBy);
                oBody.UpdatedBy = nullableNumber(input.UpdatedBy);
            }

            const vaData = await postData(cEndPoint, oBody);
            const res = vaData.data;

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
                await postData(apiEndpointDelete, { IncomingLetterId: letter.IncomingLetterId });
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
                            <label htmlFor="AgendaNumber">Nomor Agenda</label>
                            <InputText
                                id="AgendaNumber"
                                className={`w-full mt-2 ${isFormFieldInvalid("AgendaNumber") ? "p-invalid" : ""}`}
                                value={formik.values.AgendaNumber}
                                onChange={(e) => formik.setFieldValue("AgendaNumber", e.target.value)}
                            />
                            {getFormErrorMessage("AgendaNumber")}
                        </div>
                        <div className="col-12 md:col-6">
                            <label htmlFor="LetterNumber">Nomor Surat</label>
                            <InputText
                                id="LetterNumber"
                                className={`w-full mt-2 ${isFormFieldInvalid("LetterNumber") ? "p-invalid" : ""}`}
                                value={formik.values.LetterNumber}
                                onChange={(e) => formik.setFieldValue("LetterNumber", e.target.value)}
                            />
                            {getFormErrorMessage("LetterNumber")}
                        </div>
                        <div className="col-12 md:col-6">
                            <label htmlFor="LetterDate">Tanggal Surat</label>
                            <InputText
                                id="LetterDate"
                                type="date"
                                className={`w-full mt-2 ${isFormFieldInvalid("LetterDate") ? "p-invalid" : ""}`}
                                value={formik.values.LetterDate}
                                onChange={(e) => formik.setFieldValue("LetterDate", e.target.value)}
                            />
                            {getFormErrorMessage("LetterDate")}
                        </div>
                        <div className="col-12 md:col-6">
                            <label htmlFor="ReceivedDate">Tanggal Diterima</label>
                            <InputText
                                id="ReceivedDate"
                                type="date"
                                className={`w-full mt-2 ${isFormFieldInvalid("ReceivedDate") ? "p-invalid" : ""}`}
                                value={formik.values.ReceivedDate}
                                onChange={(e) => formik.setFieldValue("ReceivedDate", e.target.value)}
                            />
                            {getFormErrorMessage("ReceivedDate")}
                        </div>
                        <div className="col-12 md:col-6">
                            <label htmlFor="SenderName">Pengirim</label>
                            <InputText
                                id="SenderName"
                                className={`w-full mt-2 ${isFormFieldInvalid("SenderName") ? "p-invalid" : ""}`}
                                value={formik.values.SenderName}
                                onChange={(e) => formik.setFieldValue("SenderName", e.target.value)}
                            />
                            {getFormErrorMessage("SenderName")}
                        </div>
                        <div className="col-12 md:col-6">
                            <label htmlFor="SenderInstitution">Instansi Pengirim</label>
                            <InputText
                                id="SenderInstitution"
                                className="w-full mt-2"
                                value={formik.values.SenderInstitution}
                                onChange={(e) => formik.setFieldValue("SenderInstitution", e.target.value)}
                            />
                            {getFormErrorMessage("SenderInstitution")}
                        </div>
                        <div className="col-12">
                            <label htmlFor="Subject">Perihal</label>
                            <InputText
                                id="Subject"
                                className={`w-full mt-2 ${isFormFieldInvalid("Subject") ? "p-invalid" : ""}`}
                                value={formik.values.Subject}
                                onChange={(e) => formik.setFieldValue("Subject", e.target.value)}
                            />
                            {getFormErrorMessage("Subject")}
                        </div>
                        <div className="col-12">
                            <label htmlFor="AttachmentDescription">Keterangan Lampiran</label>
                            <InputTextarea
                                id="AttachmentDescription"
                                className="w-full mt-2"
                                rows={3}
                                value={formik.values.AttachmentDescription}
                                onChange={(e) => formik.setFieldValue("AttachmentDescription", e.target.value)}
                            />
                            {getFormErrorMessage("AttachmentDescription")}
                        </div>
                        <div className="col-12 md:col-3">
                            <label htmlFor="LetterTypeId">Letter Type ID</label>
                            <InputNumber
                                inputId="LetterTypeId"
                                className="w-full mt-2"
                                value={formik.values.LetterTypeId}
                                onValueChange={(e) => formik.setFieldValue("LetterTypeId", e.value || null)}
                                useGrouping={false}
                            />
                            {getFormErrorMessage("LetterTypeId")}
                        </div>
                        <div className="col-12 md:col-3">
                            <label htmlFor="DocumentTypeId">Document Type ID</label>
                            <InputNumber
                                inputId="DocumentTypeId"
                                className="w-full mt-2"
                                value={formik.values.DocumentTypeId}
                                onValueChange={(e) => formik.setFieldValue("DocumentTypeId", e.value || null)}
                                useGrouping={false}
                            />
                            {getFormErrorMessage("DocumentTypeId")}
                        </div>
                        <div className="col-12 md:col-3">
                            <label htmlFor="ArchiveClassificationId">Archive Class ID</label>
                            <InputNumber
                                inputId="ArchiveClassificationId"
                                className="w-full mt-2"
                                value={formik.values.ArchiveClassificationId}
                                onValueChange={(e) => formik.setFieldValue("ArchiveClassificationId", e.value || null)}
                                useGrouping={false}
                            />
                            {getFormErrorMessage("ArchiveClassificationId")}
                        </div>
                        <div className="col-12 md:col-3">
                            <label htmlFor="ConfidentialityLevelId">Confidentiality ID</label>
                            <InputNumber
                                inputId="ConfidentialityLevelId"
                                className="w-full mt-2"
                                value={formik.values.ConfidentialityLevelId}
                                onValueChange={(e) => formik.setFieldValue("ConfidentialityLevelId", e.value || null)}
                                useGrouping={false}
                            />
                            {getFormErrorMessage("ConfidentialityLevelId")}
                        </div>
                        {state.edit && (
                            <div className="col-12 md:col-6">
                                <label htmlFor="Status">Status</label>
                                <Dropdown
                                    id="Status"
                                    className="w-full mt-2"
                                    value={formik.values.Status}
                                    options={statusOptions}
                                    onChange={(e) => formik.setFieldValue("Status", e.value)}
                                />
                                {getFormErrorMessage("Status")}
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
                                    You are going to delete: <strong>{state.selectedLetters[0]?.AgendaNumber || ""}</strong>.
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
