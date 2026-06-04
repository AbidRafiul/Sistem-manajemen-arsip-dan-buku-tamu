'use client'

import { Dialog } from "primereact/dialog";
import { FormProps, initValue } from "../interfaces"
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { apiEndpointCreate, apiEndpointDelete, apiEndpointGet, apiEndpointGetCategory, apiEndpointGetDivision, apiEndpointUpdate } from "../endpoints";
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

    const fetchComponentData = async () => {
        setState((p) => ({ ...p, load: true }));

        try {

            const { data: vaCateg } = await postData(apiEndpointGetCategory);
            const { data: vaDivision } = await postData(apiEndpointGetDivision);

            setState((p) => ({ ...p, categoryData: vaCateg.data, divisionData: vaDivision.data, selectedUsers: [], add: false, edit: false, delete: false }));
        } catch (error: any) {
            const e = error?.response?.data || error;
            showError(toast, e?.message || "Terjadi Kesalahan");
        } finally {
            setState((p) => ({ ...p, load: false }));
        }
    }

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
                Status: input.Status,
                Code: input.Code,
                Location: input.Location,
                Type: input.Type,
                CategoryCode: input.CategoryCode,
                DivisionCode: input.DivisionCode,
            };

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
                showError(toast, 'Tidak Ada User yang Dipilih')
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

    useEffect(() => {
        fetchComponentData()
    }, [])

    return <>
        <Dialog
            visible={state.add || state.edit}
            header={state.edit ? 'Edit' : 'Add New'}
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
                        <label htmlFor="code">Code</label>
                        <div className="p-inputgroup">
                            <InputText
                                id="code"
                                name="code"
                                disabled={state.edit}
                                value={formik?.values.Code}
                                style={{ padding: '1rem' }}
                                placeholder=""
                                onChange={(e) => {
                                    if (state.edit) return;
                                    formik?.setFieldValue('Code', e.target.value);
                                }}
                                className={isFormFieldInvalid('Code') ? 'p-invalid' : ''}
                            />
                        </div>
                        {isFormFieldInvalid('Code') ? getFormErrorMessage('Code') : ''}
                    </div>
                    <div className="flex flex-column gap-2 w-full">
                        <label htmlFor="name">Name</label>
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
                        <label htmlFor="Location">Location</label>
                        <div className="p-inputgroup">
                            <InputText
                                id="Location"
                                name="Location"
                                value={formik?.values.Location}
                                style={{ padding: '1rem', width: '100%' }}
                                placeholder=""
                                onChange={(e) => {
                                    formik?.setFieldValue('Location', e.target.value);
                                }}
                                className={isFormFieldInvalid('Location') ? 'p-invalid' : ''}
                            />
                        </div>
                        {isFormFieldInvalid('Location') ? getFormErrorMessage('Location') : ''}
                    </div>
                    <div className="flex flex-column gap-2 w-full">
                        <label htmlFor="Type">Type</label>
                        <div className="p-inputgroup">
                            <InputText
                                id="Type"
                                name="Type"
                                value={formik?.values.Type}
                                style={{ padding: '1rem', width: '100%' }}
                                placeholder=""
                                onChange={(e) => {
                                    formik?.setFieldValue('Type', e.target.value);
                                }}
                                className={isFormFieldInvalid('Type') ? 'p-invalid' : ''}
                            />
                        </div>
                        {isFormFieldInvalid('Type') ? getFormErrorMessage('Type') : ''}
                    </div>
                    <div className="flex flex-column gap-2 w-full">
                        <label htmlFor="Status">Status</label>
                        <div className="p-inputgroup">
                            <Dropdown
                                id="Status"
                                name="Status"
                                value={formik?.values.Status}
                                options={[
                                    { label: 'Operational', value: 'operational' },
                                    { label: 'Maintenance', value: 'maintenance' },
                                    { label: 'Down', value: 'down' },
                                ]}
                                onChange={(e) => {
                                    formik?.setFieldValue('Status', e.value);
                                }}
                                className={isFormFieldInvalid('Status') ? 'p-invalid' : ''}
                            />
                        </div>
                        {isFormFieldInvalid('Status') ? getFormErrorMessage('Status') : ''}
                    </div>
                </div>

                <div className="flex gap-2 flex-column md:flex-row w-full">
                    <div className="flex flex-column gap-2 w-full">
                        <label htmlFor="CategoryCode">Category</label>
                        <div className="p-inputgroup">
                            <Dropdown
                                id="CategoryCode"
                                name="CategoryCode"
                                value={formik?.values.CategoryCode}
                                options={state.categoryData}
                                optionLabel="Name"
                                optionValue="Code"
                                onChange={(e) => {
                                    formik?.setFieldValue('CategoryCode', e.value);
                                }}
                                className={isFormFieldInvalid('CategoryCode') ? 'p-invalid' : ''}
                            />
                        </div>
                        {isFormFieldInvalid('CategoryCode') ? getFormErrorMessage('CategoryCode') : ''}
                    </div>
                    <div className="flex flex-column gap-2 w-full">
                        <label htmlFor="DivisionCode">Division</label>
                        <div className="p-inputgroup">
                            <Dropdown
                                id="DivisionCode"
                                name="DivisionCode"
                                value={formik?.values.DivisionCode}
                                options={state.divisionData}
                                optionLabel="Name"
                                optionValue="Code"
                                onChange={(e) => {
                                    formik?.setFieldValue('DivisionCode', e.value);
                                }}
                                className={isFormFieldInvalid('DivisionCode') ? 'p-invalid' : ''}
                            />
                        </div>
                        {isFormFieldInvalid('DivisionCode') ? getFormErrorMessage('DivisionCode') : ''}
                    </div>
                </div>
                <Button type="submit" label={state?.edit ? 'Update' : 'Save'} className="mt-2" loading={state?.load} />
            </form>
        </Dialog>

        <Dialog
            header="Delete Confirm"
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
                            ? `Delete ${state.selectedUsers.length} units?`
                            : "Delete this unit?"
                        }
                    </h3>
                    <p className="text-color-secondary">
                        {state.selectedUsers.length > 1 ? (
                            `You are going to delete all this selected ${state.selectedUsers.length} units`
                        ) : (
                            <>
                                You are going to delete this unit as follow : <strong>{state.selectedUsers[0]?.Code || ""}</strong>
                                {`(${state.selectedUsers[0]?.Name})`}.
                            </>
                        )}
                        <br />
                        This action can&apos;t be undone
                    </p>
                </div>
            </div>
        </Dialog>
    </>

}

export default Form