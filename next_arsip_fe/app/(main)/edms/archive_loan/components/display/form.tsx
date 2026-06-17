'use client'

import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
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

    const documentOptions = state.documents.map(doc => ({
        label: `${doc.DocumentNumber} - ${doc.DocumentName}`,
        value: doc.DocumentId
    }));

    return <Dialog
        visible={state.add}
        header="Request Archive Loan"
        modal
        style={{ width: '42rem', maxWidth: '95vw' }}
        onHide={() => {
            setState((p) => ({ ...p, add: false }));
            formik?.resetForm();
        }}
    >
        <form onSubmit={formik?.handleSubmit} className="flex flex-column gap-3">
            <div className="flex flex-column gap-2">
                <label htmlFor="DocumentId" className="font-semibold">Document</label>
                <Dropdown
                    id="DocumentId"
                    value={formik.values.DocumentId}
                    options={documentOptions}
                    filter
                    onChange={(e) => formik.setFieldValue('DocumentId', e.value)}
                    placeholder="Select a Document to Borrow"
                    className={isFormFieldInvalid('DocumentId') ? 'p-invalid' : ''}
                />
                {getFormErrorMessage('DocumentId')}
            </div>

            <div className="flex flex-column gap-2">
                <label htmlFor="BorrowerName" className="font-semibold">Borrower Name</label>
                <InputText
                    id="BorrowerName"
                    value={formik.values.BorrowerName}
                    onChange={(e) => formik.setFieldValue('BorrowerName', e.target.value)}
                    className={isFormFieldInvalid('BorrowerName') ? 'p-invalid' : ''}
                    placeholder="Enter borrower's full name"
                />
                {getFormErrorMessage('BorrowerName')}
            </div>

            <div className="flex flex-column gap-2">
                <label htmlFor="ExpectedReturnDate" className="font-semibold">Expected Return Date</label>
                <InputText
                    id="ExpectedReturnDate"
                    type="date"
                    value={formik.values.ExpectedReturnDate}
                    onChange={(e) => formik.setFieldValue('ExpectedReturnDate', e.target.value)}
                    className={isFormFieldInvalid('ExpectedReturnDate') ? 'p-invalid' : ''}
                />
                {getFormErrorMessage('ExpectedReturnDate')}
            </div>

            <div className="flex flex-column gap-2">
                <label htmlFor="Purpose" className="font-semibold">Purpose</label>
                <InputTextarea
                    id="Purpose"
                    rows={4}
                    value={formik.values.Purpose}
                    onChange={(e) => formik.setFieldValue('Purpose', e.target.value)}
                    className={isFormFieldInvalid('Purpose') ? 'p-invalid' : ''}
                    placeholder="E.g., Auditing, legal review, verification..."
                />
                {getFormErrorMessage('Purpose')}
            </div>

            <div className="flex justify-content-end gap-2 mt-2">
                <Button
                    type="button"
                    label="Cancel"
                    icon="pi pi-times"
                    severity="secondary"
                    outlined
                    onClick={() => {
                        setState((p) => ({ ...p, add: false }));
                        formik.resetForm();
                    }}
                    disabled={state.load}
                />
                <Button
                    type="submit"
                    label="Submit Request"
                    icon="pi pi-check"
                    loading={state.load}
                />
            </div>
        </form>
    </Dialog>
}

export default Form
