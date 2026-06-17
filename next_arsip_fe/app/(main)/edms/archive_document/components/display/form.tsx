'use client'

import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { FormProps, initValue } from "../interfaces";

const Form = ({
    state,
    setState,
    formik,
}: FormProps) => {

    const isFormFieldInvalid = (name: keyof initValue) => !!(formik?.touched[name] && formik?.errors[name]);

    const getFormErrorMessage = (name: keyof initValue) => {
        return isFormFieldInvalid(name) ? <small className="p-error">{formik?.errors[name]}</small> : <small className="p-error">&nbsp;</small>;
    };

    return <Dialog
        visible={state.add || state.edit}
        header={state.edit ? "Edit Archive Document" : "Add Archive Document"}
        modal
        style={{ width: '42rem', maxWidth: '95vw' }}
        onHide={() => {
            setState((p) => ({ ...p, add: false, edit: false }));
            formik?.resetForm();
        }}
    >
        <form onSubmit={formik?.handleSubmit} className="flex flex-column gap-3">
            <div className="flex flex-column gap-2">
                <label htmlFor="document_number">Document Number</label>
                <InputText
                    id="document_number"
                    value={formik.values.document_number}
                    onChange={(e) => formik.setFieldValue('document_number', e.target.value)}
                    className={isFormFieldInvalid('document_number') ? 'p-invalid' : ''}
                />
                {getFormErrorMessage('document_number')}
            </div>

            <div className="flex flex-column gap-2">
                <label htmlFor="document_name">Document Name</label>
                <InputText
                    id="document_name"
                    value={formik.values.document_name}
                    onChange={(e) => formik.setFieldValue('document_name', e.target.value)}
                    className={isFormFieldInvalid('document_name') ? 'p-invalid' : ''}
                />
                {getFormErrorMessage('document_name')}
            </div>

            <div className="grid">
                <div className="col-12 md:col-6 flex flex-column gap-2">
                    <label htmlFor="document_date">Document Date</label>
                    <InputText
                        id="document_date"
                        type="date"
                        value={formik.values.document_date}
                        onChange={(e) => formik.setFieldValue('document_date', e.target.value)}
                        className={isFormFieldInvalid('document_date') ? 'p-invalid' : ''}
                    />
                    {getFormErrorMessage('document_date')}
                </div>

                <div className="col-12 md:col-6 flex flex-column gap-2">
                    <label htmlFor="expired_date">Expired Date</label>
                    <InputText
                        id="expired_date"
                        type="date"
                        value={formik.values.expired_date}
                        onChange={(e) => formik.setFieldValue('expired_date', e.target.value)}
                    />
                    {getFormErrorMessage('expired_date')}
                </div>
            </div>

            <div className="flex flex-column gap-2">
                <label htmlFor="pic_name">PIC Name</label>
                <InputText
                    id="pic_name"
                    value={formik.values.pic_name}
                    onChange={(e) => formik.setFieldValue('pic_name', e.target.value)}
                    className={isFormFieldInvalid('pic_name') ? 'p-invalid' : ''}
                />
                {getFormErrorMessage('pic_name')}
            </div>

            <div className="flex justify-content-end gap-2 mt-2">
                <Button
                    type="button"
                    label="Cancel"
                    icon="pi pi-times"
                    severity="secondary"
                    outlined
                    onClick={() => {
                        setState((p) => ({ ...p, add: false, edit: false }));
                        formik.resetForm();
                    }}
                    disabled={state.load}
                />
                <Button
                    type="submit"
                    label={state.edit ? "Update" : "Save"}
                    icon="pi pi-save"
                    loading={state.load}
                />
            </div>
        </form>
    </Dialog>
}

export default Form
