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
        label: `${doc.document_number} - ${doc.document_name}`,
        value: doc.document_id
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
                <label htmlFor="document_id" className="font-semibold">Document</label>
                <Dropdown
                    id="document_id"
                    value={formik.values.document_id}
                    options={documentOptions}
                    filter
                    onChange={(e) => formik.setFieldValue('document_id', e.value)}
                    placeholder="Select a Document to Borrow"
                    className={isFormFieldInvalid('document_id') ? 'p-invalid' : ''}
                />
                {getFormErrorMessage('document_id')}
            </div>

            <div className="flex flex-column gap-2">
                <label htmlFor="borrower_name" className="font-semibold">Borrower Name</label>
                <InputText
                    id="borrower_name"
                    value={formik.values.borrower_name}
                    onChange={(e) => formik.setFieldValue('borrower_name', e.target.value)}
                    className={isFormFieldInvalid('borrower_name') ? 'p-invalid' : ''}
                    placeholder="Enter borrower's full name"
                />
                {getFormErrorMessage('borrower_name')}
            </div>

            <div className="flex flex-column gap-2">
                <label htmlFor="expected_return_date" className="font-semibold">Expected Return Date</label>
                <InputText
                    id="expected_return_date"
                    type="date"
                    value={formik.values.expected_return_date}
                    onChange={(e) => formik.setFieldValue('expected_return_date', e.target.value)}
                    className={isFormFieldInvalid('expected_return_date') ? 'p-invalid' : ''}
                />
                {getFormErrorMessage('expected_return_date')}
            </div>

            <div className="flex flex-column gap-2">
                <label htmlFor="purpose" className="font-semibold">Purpose</label>
                <InputTextarea
                    id="purpose"
                    rows={4}
                    value={formik.values.purpose}
                    onChange={(e) => formik.setFieldValue('purpose', e.target.value)}
                    className={isFormFieldInvalid('purpose') ? 'p-invalid' : ''}
                    placeholder="E.g., Auditing, legal review, verification..."
                />
                {getFormErrorMessage('purpose')}
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
