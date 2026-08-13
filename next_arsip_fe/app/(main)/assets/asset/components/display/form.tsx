'use client';

import { Dialog } from 'primereact/dialog';
import { FormProps, initValue } from '../interfaces';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { InputTextarea } from 'primereact/inputtextarea';

const Form = ({ state, setState, formik, toast, getData, handleDelete }: FormProps) => {

    const deleteFooterTemplate = (
        <div className="flex justify-content-center gap-2">
            <Button label="Batal"
                icon="pi pi-times"
                severity="secondary"
                outlined
                onClick={() => {
                    setState((p: any) => ({ ...p, add: false, edit: false, delete: false }));
                }}
                disabled={state.load} />
            <Button label="Ya, Hapus" icon="pi pi-trash" severity="danger" onClick={handleDelete} loading={state.load} />
        </div>
    );

    const isFormFieldInvalid = (name: keyof initValue) => !!(formik?.touched[name] && formik?.errors[name]);

    const getFormErrorMessage = (name: keyof initValue) => {
        return isFormFieldInvalid(name) ? <small className="p-error">{formik?.errors[name]}</small> : <small className="p-error">&nbsp;</small>;
    };


    return (
        <>
            <Dialog
                visible={state.add || state.edit}
                header={state.edit ? 'Edit' : 'Add New'}
                modal
                style={{ width: '50%' }}
                onHide={() => {
                    setState((p: any) => ({ ...p, add: false, edit: false, delete: false }));
                    formik?.resetForm();
                }}>
                <form onSubmit={formik?.handleSubmit} className="flex flex-column gap-4 mt-2 fadein animation-duration-300">
                    <div className="flex flex-column gap-2 w-full">
                        <div className="flex flex-column gap-2 w-full">
                            <label htmlFor="code" className="font-semibold text-sm text-700">Code</label>
                            <div className="p-inputgroup">
                                <InputText
                                    id="code"
                                    name="code"
                                    disabled={state.edit}
                                    value={formik?.values.Code}
                                    
                                    placeholder=""
                                    onChange={(e) => {
                                        if (state.edit) return;
                                        formik?.setFieldValue('Code', e.target.value);
                                    }}
                                    className={isFormFieldInvalid('Code') ? 'p-invalid' : ''} />
                            </div>
                            {isFormFieldInvalid('Code') ? getFormErrorMessage('Code') : ''}
                        </div>
                        <div className="flex flex-column gap-2 w-full">
                            <label htmlFor="name" className="font-semibold text-sm text-700">Name</label>
                            <div className="p-inputgroup">
                                <InputText
                                    id="name"
                                    name="name"
                                    value={formik?.values.Name}
                                    
                                    placeholder=""
                                    onChange={(e) => {
                                        formik?.setFieldValue('Name', e.target.value);
                                    }}
                                    className={isFormFieldInvalid('Name') ? 'p-invalid' : ''} />
                            </div>
                            {isFormFieldInvalid('Name') ? getFormErrorMessage('Name') : ''}
                        </div>
                        <div className="flex flex-column gap-2 w-full">
                            <label htmlFor="Location" className="font-semibold text-sm text-700">Location</label>
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
                                    className={isFormFieldInvalid('Location') ? 'p-invalid' : ''} />
                            </div>
                            {isFormFieldInvalid('Location') ? getFormErrorMessage('Location') : ''}
                        </div>
                        <div className="flex flex-column gap-2 w-full">
                            <label htmlFor="Type" className="font-semibold text-sm text-700">Type</label>
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
                                    className={isFormFieldInvalid('Type') ? 'p-invalid' : ''} />
                            </div>
                            {isFormFieldInvalid('Type') ? getFormErrorMessage('Type') : ''}
                        </div>
                        <div className="flex flex-column gap-2 w-full">
                            <label htmlFor="Status" className="font-semibold text-sm text-700">Status</label>
                            <div className="p-inputgroup">
                                <Dropdown
                                    id="Status"
                                    name="Status"
                                    value={formik?.values.Status}
                                    options={[
                                        { label: 'Operational', value: 'operational' },
                                        { label: 'Maintenance', value: 'maintenance' },
                                        { label: 'Down', value: 'down' }
                                    ]}
                                    onChange={(e) => {
                                        formik?.setFieldValue('Status', e.value);
                                    }}
                                    className={isFormFieldInvalid('Status') ? 'p-invalid' : ''} />
                            </div>
                            {isFormFieldInvalid('Status') ? getFormErrorMessage('Status') : ''}
                        </div>
                    </div>

                    <div className="flex gap-2 flex-column md:flex-row w-full">
                        <div className="flex flex-column gap-2 w-full">
                            <label htmlFor="CategoryCode" className="font-semibold text-sm text-700">Category</label>
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
                                    className={isFormFieldInvalid('CategoryCode') ? 'p-invalid' : ''} />
                            </div>
                            {isFormFieldInvalid('CategoryCode') ? getFormErrorMessage('CategoryCode') : ''}
                        </div>
                        <div className="flex flex-column gap-2 w-full">
                            <label htmlFor="DivisionCode" className="font-semibold text-sm text-700">Division</label>
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
                                    className={isFormFieldInvalid('DivisionCode') ? 'p-invalid' : ''} />
                            </div>
                            {isFormFieldInvalid('DivisionCode') ? getFormErrorMessage('DivisionCode') : ''}
                        </div>
                    </div>
                    <div className="flex flex-column gap-2 w-full">
                        <label htmlFor="name" className="font-semibold text-sm text-700">Nama Aset</label>
                        <div className="p-inputgroup">
                            <InputText
                                id="name"
                                name="name"
                                value={formik?.values.Name}
                                
                                placeholder=""
                                onChange={(e) => {
                                    formik?.setFieldValue('Name', e.target.value);
                                }}
                                className={isFormFieldInvalid('Name') ? 'p-invalid' : ''} />
                        </div>
                        {isFormFieldInvalid('Name') ? getFormErrorMessage('Name') : ''}
                    </div>
                    <div className="flex flex-column gap-2 w-full">
                        <label htmlFor="Location" className="font-semibold text-sm text-700">Lokasi</label>
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
                                className={isFormFieldInvalid('Location') ? 'p-invalid' : ''} />
                        </div>
                        {isFormFieldInvalid('Location') ? getFormErrorMessage('Location') : ''}
                    </div>
                    <div className="flex flex-column gap-2 w-full">
                        <label htmlFor="Type" className="font-semibold text-sm text-700">Tipe</label>
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
                                className={isFormFieldInvalid('Type') ? 'p-invalid' : ''} />
                        </div>
                        {isFormFieldInvalid('Type') ? getFormErrorMessage('Type') : ''}
                    </div>
                    <div className="flex flex-column gap-2 w-full">
                        <label htmlFor="Status" className="font-semibold text-sm text-700">Status</label>
                        <div className="p-inputgroup">
                            <Dropdown
                                id="Status"
                                name="Status"
                                value={formik?.values.Status}
                                options={[
                                    { label: 'Operasional', value: 'operational' },
                                    { label: 'Pemeliharaan', value: 'maintenance' },
                                    { label: 'Rusak', value: 'down' },
                                ]}
                                onChange={(e) => {
                                    formik?.setFieldValue('Status', e.value);
                                }}
                                className={isFormFieldInvalid('Status') ? 'p-invalid' : ''} />
                        </div>
                        {isFormFieldInvalid('Status') ? getFormErrorMessage('Status') : ''}
                    </div>
                </form>
            </Dialog>
        </>
    );
};

export default Form;
