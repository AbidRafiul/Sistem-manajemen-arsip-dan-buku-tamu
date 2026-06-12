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
                <label htmlFor="DocumentNumber">Document Number</label>
                <InputText
                    id="DocumentNumber"
                    value={formik.values.DocumentNumber}
                    onChange={(e) => formik.setFieldValue('DocumentNumber', e.target.value)}
                    className={isFormFieldInvalid('DocumentNumber') ? 'p-invalid' : ''}
                />
                {getFormErrorMessage('DocumentNumber')}
            </div>

            <div className="flex flex-column gap-2">
                <label htmlFor="DocumentName">Document Name</label>
                <InputText
                    id="DocumentName"
                    value={formik.values.DocumentName}
                    onChange={(e) => formik.setFieldValue('DocumentName', e.target.value)}
                    className={isFormFieldInvalid('DocumentName') ? 'p-invalid' : ''}
                />
                {getFormErrorMessage('DocumentName')}
            </div>

            <div className="grid">
                <div className="col-12 md:col-6 flex flex-column gap-2">
                    <label htmlFor="DocumentDate">Document Date</label>
                    <InputText
                        id="DocumentDate"
                        type="date"
                        value={formik.values.DocumentDate}
                        onChange={(e) => formik.setFieldValue('DocumentDate', e.target.value)}
                        className={isFormFieldInvalid('DocumentDate') ? 'p-invalid' : ''}
                    />
                    {getFormErrorMessage('DocumentDate')}
                </div>

                <div className="col-12 md:col-6 flex flex-column gap-2">
                    <label htmlFor="ExpiredDate">Expired Date</label>
                    <InputText
                        id="ExpiredDate"
                        type="date"
                        value={formik.values.ExpiredDate}
                        onChange={(e) => formik.setFieldValue('ExpiredDate', e.target.value)}
                    />
                    {getFormErrorMessage('ExpiredDate')}
                </div>
            </div>

            <div className="flex flex-column gap-2">
                <label htmlFor="PicName">PIC Name</label>
                <InputText
                    id="PicName"
                    value={formik.values.PicName}
                    onChange={(e) => formik.setFieldValue('PicName', e.target.value)}
                    className={isFormFieldInvalid('PicName') ? 'p-invalid' : ''}
                />
                {getFormErrorMessage('PicName')}
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
