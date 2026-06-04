'use client'

import { Dialog } from "primereact/dialog";
import { FormProps, initValue } from "../interfaces"
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { apiEndpointCreate, apiEndpointDelete, apiEndpointGet, apiEndpointGetDivision, apiEndpointUpdate } from "../endpoints";
import postData from "@/lib/axios/postData";
import { showError, showSuccess } from "@/lib/tools/generalTools";
import { useEffect } from "react";

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
            const isEdit = Boolean(input.UniqueId);

            const cEndPoint = isEdit ? apiEndpointUpdate : apiEndpointCreate;

            const oHeaders: Record<string, string> = {
                "X-Level": "1",
                "X-Credential": JSON.stringify({
                    Username: input.Username,
                    Password: input.Password,
                }),
            };

            const oBody: Record<string, any> = {
                Fullname: input.Fullname,
                Telp: input.Telp,
                Status: input.Status,
                Role: input.Role,
            };

            if (isEdit) {
                oBody["UniqueId"] = input.UniqueId;
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
                showError(toast, 'Tidak Ada User yang Dipilih')
                return
            }

            const vaUniqueId = state.selectedUsers.map(v => v.UniqueId)

            const vaData = await postData(apiEndpointDelete, { UniqueId: vaUniqueId });
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

    // useEffect(() => {
    //     fetchComponentData()
    // }, [])

    return <>
        <Dialog
            visible={state.add || state.edit}
            header={state.edit ? 'Edit Data User' : 'Tambah Data User'}
            modal
            style={{ width: '70%' }}
            onHide={() => {
                setState((p) => ({ ...p, add: false, edit: false, delete: false }));
                formik?.resetForm();
            }}
        >
            <form onSubmit={formik?.handleSubmit} className="flex gap-2 flex-column">

                <div className="flex md:flex-row flex-column gap-2 w-full">
                    <div className="flex flex-column gap-2 w-full">
                        <label htmlFor="name">Name</label>
                        <div className="p-inputgroup">
                            <InputText
                                id="name"
                                name="name"
                                value={formik?.values.Fullname}
                                style={{ padding: '1rem' }}
                                placeholder="Fullname"
                                onChange={(e) => {
                                    formik?.setFieldValue('Fullname', e.target.value);
                                }}
                                className={isFormFieldInvalid('Fullname') ? 'p-invalid' : ''}
                            />
                        </div>
                        {isFormFieldInvalid('Fullname') ? getFormErrorMessage('Fullname') : ''}
                    </div>
                    <div className="flex flex-column gap-2 w-full">
                        <label htmlFor="Username">Username</label>
                        <div className="p-inputgroup">
                            <InputText
                                id="Username"
                                name="Username"
                                value={formik?.values.Username}
                                style={{ padding: '1rem' }}
                                placeholder="Username"
                                onChange={(e) => {
                                    formik?.setFieldValue('Username', e.target.value);
                                }}
                                className={isFormFieldInvalid('Username') ? 'p-invalid' : ''}
                            />
                        </div>
                        {isFormFieldInvalid('Username') ? getFormErrorMessage('Username') : ''}
                    </div>
                </div>

                <div className="flex md:flex-row flex-column gap-2 w-full">

                    <div className="flex flex-column gap-2 w-full">
                        <label htmlFor="Telp">Telp</label>
                        <div className="p-inputgroup">
                            <InputText
                                id="Telp"
                                name="Telp"
                                keyfilter={'int'}
                                value={formik?.values.Telp}
                                style={{ padding: '1rem' }}
                                onChange={(e) => {
                                    formik?.setFieldValue('Telp', e.target.value);
                                }}
                                placeholder="089222333444"
                                className={isFormFieldInvalid('Telp') ? 'p-invalid' : ''}
                            />
                        </div>
                        {isFormFieldInvalid('Telp') ? getFormErrorMessage('Telp') : ''}
                    </div>
                </div>



                {/* {!state?.edit && ( */}
                <div className="flex flex-column gap-2 w-full">
                    <label htmlFor="Password">Password</label>
                    <div className="p-inputgroup">
                        <Password
                            id="Password"
                            name="Password"
                            toggleMask
                            value={formik?.values.Password}
                            onChange={(e) => {
                                formik?.setFieldValue('Password', e.target.value);
                            }}
                            className={isFormFieldInvalid('Password') ? 'p-invalid' : ''}
                        />
                    </div>
                    {isFormFieldInvalid('Password') ? getFormErrorMessage('Password') : ''}
                </div>
                {/* )} */}
                {(formik.values.Role == 'superadmin' && state.edit) ? "" :

                    <div className="flex flex-column gap-2 w-full">
                        <label htmlFor="Role">Role</label>
                        <div className="p-inputgroup">
                            <Dropdown
                                id="Role"
                                name="Role"
                                options={[
                                    { label: "Admin", value: "admin" },
                                    { label: "Manager", value: "manager" },
                                    { label: "Technician", value: "technician" },
                                    { label: "Logistics", value: "logistics" },
                                    { label: "Employee", value: "employee" }
                                ]}
                                value={formik?.values.Role}
                                onChange={(e) => {
                                    formik?.setFieldValue('Role', e.value);
                                }}
                                className={isFormFieldInvalid('Role') ? 'p-invalid' : ''}
                            />
                        </div>
                        {isFormFieldInvalid('Role') ? getFormErrorMessage('Role') : ''}
                    </div>
                }
                <div className="flex flex-column gap-2 w-full">
                    <label htmlFor="Status">Status</label>
                    <div className="p-inputgroup">
                        <Dropdown
                            id="Status"
                            name="Status"
                            optionValue="kode"
                            optionLabel="label"
                            options={[
                                { kode: '0', label: 'nonactive' },
                                { kode: '1', label: 'active' },
                            ]}
                            value={formik?.values.Status}
                            onChange={(e) => {
                                formik?.setFieldValue('Status', e.value);
                            }}
                            className={isFormFieldInvalid('Status') ? 'p-invalid' : ''}
                        />
                    </div>
                    {isFormFieldInvalid('Status') ? getFormErrorMessage('Status') : ''}
                </div>
                <Button type="submit" label={state?.edit ? 'Update' : 'Save'} className="mt-2" loading={state?.load} />
            </form>
        </Dialog>

        <Dialog
            header="Confirm Delete"
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
                                You are going to delete this unit as follow : <strong>{state.selectedUsers[0]?.UniqueId || ""}</strong>
                                {`(${state.selectedUsers[0]?.Fullname})`}.
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