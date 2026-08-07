'use client';

import { Dialog } from 'primereact/dialog';
import { FormProps, initValue } from '../interfaces';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { useEffect } from 'react';
import { InputTextarea } from 'primereact/inputtextarea';

const Form = ({ state, setState, formik, toast, getData, handleDelete }: FormProps) => {

    const deleteFooterTemplate = (
        <div className="flex justify-content-center gap-2">
            <Button
                label="Batal"
                icon="pi pi-times"
                severity="secondary"
                outlined
                onClick={() => {
                    setState((p) => ({ ...p, add: false, edit: false, delete: false }));
                }}
                disabled={state.load}
            />
            <Button label="Ya, Hapus" icon="pi pi-trash" severity="danger" onClick={handleDelete} loading={state.load} />
        </div>
    );

    const isFormFieldInvalid = (name: keyof initValue) => !!(formik?.touched[name] && formik?.errors[name]);

    const getFormErrorMessage = (name: keyof initValue) => {
        return isFormFieldInvalid(name) ? <small className="p-error">{formik?.errors[name]}</small> : <small className="p-error">&nbsp;</small>;
    };

    // handleDelete is now passed as prop
    // handleSave logic has been moved to formik.onSubmit in page.tsx!
    // Since page.tsx triggers it on formik submit, we don't need the useEffect anymore.

    return (
        <>
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
                            <label htmlFor="Description">Description</label>
                            <div className="w-full">
                                <InputTextarea
                                    id="Description"
                                    name="Description"
                                    value={formik?.values.Description}
                                    style={{ padding: '1rem', width: '100%' }}
                                    rows={5}
                                    maxLength={255}
                                    placeholder="Description anda"
                                    onChange={(e) => {
                                        formik?.setFieldValue('Description', e.target.value);
                                    }}
                                    className={isFormFieldInvalid('Description') ? 'p-invalid' : ''}
                                />
                            </div>
                            {isFormFieldInvalid('Description') ? getFormErrorMessage('Description') : ''}
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
                style={{ width: '25rem' }}
                footer={deleteFooterTemplate}
            >
                <div className="flex flex-column align-items-center text-center gap-4 py-4">
                    <i className="pi pi-exclamation-triangle text-red-500 text-6xl" />

                    <div>
                        <h3 className="font-bold mb-2">{state.selectedUsers.length > 1 ? `Delete ${state.selectedUsers.length} units?` : 'Delete this unit?'}</h3>
                        <p className="text-color-secondary">
                            {state.selectedUsers.length > 1 ? (
                                `You are going to delete all this selected ${state.selectedUsers.length} units`
                            ) : (
                                <>
                                    You are going to delete this unit as follow : <strong>{state.selectedUsers[0]?.Code || ''}</strong>
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
    );
};

export default Form;
