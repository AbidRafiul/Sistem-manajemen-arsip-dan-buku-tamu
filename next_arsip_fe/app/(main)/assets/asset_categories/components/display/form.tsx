'use client'

import { Dialog } from "primereact/dialog";
import { FormProps, initValue } from "../interfaces"
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { apiEndpointCreate, apiEndpointDelete, apiEndpointGet, apiEndpointUpdate } from "../endpoints";
import postData from "@/lib/axios/postData";
import { showError, showSuccess } from "@/lib/tools/generalTools";
import { useEffect } from "react";
import { InputTextarea } from "primereact/inputtextarea";

const Form = ({
    state,
    setState,
    formik,
    toast,
    getData
}: FormProps) => {


    const handleSave = async (input: initValue) => {
        setState((p) => ({ ...p, load: true }));

        try {
            const isEdit = Boolean(state.edit);

            const cEndPoint = isEdit ? apiEndpointUpdate : apiEndpointCreate;

            const oHeaders: Record<string, string> = {
                "X-Level": "1",
            };

            const oBody: Record<string, any> = {
                Name: input.Name,
                Description: input.Description,
            };

            if (isEdit) {
                oBody["Code"] = input.Code;
            }

            const vaData = await postData(cEndPoint, oBody, oHeaders);
            const res = vaData.data;

            showSuccess(toast, res.data?.message || "Berhasil Menyimpan Data");
            formik.resetForm();
            setState((p) => ({ ...p, add: false, edit: false, delete: false }));
            await getData(apiEndpointGet)
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

            if (state.selectedUsers.length < 1) {
                showError(toast, 'Tidak Ada Kategori yang Dipilih')
                return
            }

            const vaCode = state.selectedUsers.map(v => v.Code)

            const vaData = await postData(apiEndpointDelete, { Code: vaCode });
            const res = vaData.data;

            showSuccess(toast, res.data?.message || "Berhasil Menghapus Data");
            setState((p) => ({ ...p, selectedUsers: [], add: false, edit: false, delete: false }));
            await getData(apiEndpointGet)
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
                onClick={
                    () => {
                        setState((p) => ({ ...p, add: false, edit: false, delete: false }));
                    }
                }
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

    const isFormFieldInvalid = (name: keyof initValue) => !!(formik?.touched[name] && formik?.errors[name]);

    const getFormErrorMessage = (name: keyof initValue) => {
        return isFormFieldInvalid(name) ? <small className="p-error">{formik?.errors[name]}</small> : <small className="p-error">&nbsp;</small>;
    };

    useEffect(() => {
        if (state.submittedData) {
            handleSave(state.submittedData)
        }
    }, [state.submittedData])

    return <>
        <Dialog
            visible={state.add || state.edit}
            header={state.edit ? 'Ubah Kategori Aset' : 'Tambah Kategori Aset'}
            modal
            style={{ width: '50%' }}
            onHide={() => {
                setState((p) => ({ ...p, add: false, edit: false, delete: false }));
                formik?.resetForm();
            }}
        >
            <form onSubmit={formik?.handleSubmit} className="flex gap-2 flex-column">

                <div className="flex flex-column gap-2 w-full">
                    <div className="flex flex-column gap-2 w-full">
                        <label htmlFor="name">Nama Kategori</label>
                        <div className="p-inputgroup">
                            <InputText
                                id="name"
                                name="name"
                                value={formik?.values.Name}
                                style={{ padding: '1rem' }}
                                placeholder=""
                                onChange={(e) => {
                                    formik?.setFieldValue('Name', e.target.value);
                                }}
                                className={isFormFieldInvalid('Name') ? 'p-invalid' : ''}
                            />
                        </div>
                        {isFormFieldInvalid('Name') ? getFormErrorMessage('Name') : ''}
                    </div>
                    <div className="flex flex-column gap-2 w-full">
                        <label htmlFor="Description">Deskripsi</label>
                        <div className="w-full">
                            <InputTextarea
                                id="Description"
                                name="Description"
                                value={formik?.values.Description}
                                style={{ padding: '1rem', width: '100%' }}
                                rows={5}
                                maxLength={255}
                                placeholder="Masukkan deskripsi..."
                                onChange={(e) => {
                                    formik?.setFieldValue('Description', e.target.value);
                                }}
                                className={isFormFieldInvalid('Description') ? 'p-invalid' : ''}
                            />
                        </div>
                        {isFormFieldInvalid('Description') ? getFormErrorMessage('Description') : ''}
                    </div>
                </div>
                <Button type="submit" label={state?.edit ? 'Perbarui' : 'Simpan'} className="mt-2" loading={state?.load} />
            </form>
        </Dialog>

        <Dialog
            header="Konfirmasi Hapus"
            visible={state.delete}
            onHide={() => {
                setState((p) => ({ ...p, add: false, edit: false, delete: false }));
            }}
            modal
            style={{ width: "25rem" }}
            footer={deleteFooterTemplate}
        >
            <div className="flex flex-column align-items-center text-center gap-4 py-4">
                <i className="pi pi-exclamation-triangle text-red-500 text-6xl" />

                <div>
                    <h3 className="font-bold mb-2">
                        {state.selectedUsers.length > 1
                            ? `Hapus ${state.selectedUsers.length} kategori?`
                            : "Hapus kategori ini?"
                        }
                    </h3>
                    <p className="text-color-secondary">
                        {state.selectedUsers.length > 1 ? (
                            `Anda akan menghapus ${state.selectedUsers.length} kategori yang dipilih`
                        ) : (
                            <>
                                Anda akan menghapus kategori berikut: <strong>{state.selectedUsers[0]?.Code || ""}</strong>
                                {` (${state.selectedUsers[0]?.Name})`}.
                            </>
                        )}
                        <br />
                        Tindakan ini tidak dapat dibatalkan
                    </p>
                </div>
            </div>
        </Dialog>
    </>

}

export default Form