'use client';

import { FormProps, initValue } from '../interfaces';
import { InputText } from 'primereact/inputtext';

import { Button } from 'primereact/button';
import { showError } from '@/lib/tools/generalTools';
import { useEffect, useRef } from 'react';
import { Toolbar } from 'primereact/toolbar';
import { ProgressBar } from 'primereact/progressbar';
import { InputTextarea } from 'primereact/inputtextarea';

const Form = ({ state, setState, formik, toast, getData }: FormProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchComponentData = async () => {
        setState((p) => ({ ...p, load: true }));

        try {
        } catch (error: any) {
            const e = error?.response?.data || error;
            showError(toast, e?.message || 'Terjadi Kesalahan');
        } finally {
            setState((p) => ({ ...p, load: false }));
        }
    };

    // API call dipindahkan ke page.tsx

    const onFileSelect = (event: any) => {
        const file = event?.target?.files[0];
        if (!file) return;

        if (file.size > 1024 * 1024) {
            // 1MB
            formik.setFieldValue('msLogoPerusahaan', null);
            return showError(toast, 'File tidak boleh lebih dari 1MB.');
        }

        // langsung simpan file object ke formik
        formik.setFieldValue('msLogoPerusahaan', file);
        setState((p) => ({ ...p, imgPrev: URL.createObjectURL(file) }));
    };

    const konfigurasiFooter = (
        <>
            <Button type="submit" label="Simpan" icon="pi pi-check" className="p-button-text" onClick={() => formik.handleSubmit()} />
        </>
    );

    const isFormFieldInvalid = (name: keyof initValue) => !!(formik?.touched[name] && formik?.errors[name]);

    const getFormErrorMessage = (name: keyof initValue) => {
        return isFormFieldInvalid(name) ? <small className="p-error">{formik?.errors[name] as string}</small> : <small className="p-error">&nbsp;</small>;
    };
    useEffect(() => {
        return () => {
            if (state.imgPrev) URL.revokeObjectURL(state.imgPrev);
        };
    }, [state.imgPrev]);

    // Initial load getData (apiEndpointGet has been passed from parent, or handled in parent)
    // Wait, getData expects apiEndpoint. Since we removed apiEndpointGet here, we should 
    // let parent handle the initial data fetching, or pass apiEndpointGet as prop? 
    // Actually, parent can just do getData() inside useEffect!

    return (
        <>
            <div className="grid crud-demo">
                <div className="col-12">
                    <div className="card">
                        <h4>Konfigurasi Sistem</h4>
                        <hr />
                        {state.load && <ProgressBar mode="indeterminate" style={{ height: '6px' }} />}

                        <div className="flex flex-column sm:flex-row gap-3">
                            <div className="p-image-preview-container" style={{ width: '250px', height: '250px', borderRadius: '6px' }}>
                                <img src={state.imgPrev ? state.imgPrev : '/layout/images/profile.png'} alt="logo_perusahaan" style={{ width: '100%', height: '250px', objectFit: 'cover', objectPosition: 'center', borderRadius: '6px' }} />
                                <div
                                    className="p-image-preview-indicator"
                                    style={{
                                        borderRadius: '6px'
                                    }}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <i className="pi pi-pencil"></i>
                                </div>
                                <input type="file" ref={fileInputRef} id="fileInput" accept="image/*" style={{ display: 'none' }} onChange={onFileSelect} />
                            </div>
                            <div className="flex flex-column w-full gap-2">
                                <div className="flex gap-2 w-full">
                                    <div className="flex flex-column gap-2 w-full">
                                        <label htmlFor="msNamaPerusahaan">Nama Perusahaan</label>
                                        <div className="p-inputgroup">
                                            <InputText
                                                style={{ width: '100%' }}
                                                id="msNamaPerusahaan"
                                                name="msNamaPerusahaan"
                                                value={formik.values.msNamaPerusahaan}
                                                onChange={(e) => {
                                                    formik.setFieldValue('msNamaPerusahaan', e.target.value);
                                                }}
                                                className={isFormFieldInvalid('msNamaPerusahaan') ? 'p-invalid' : ''}
                                            />
                                        </div>
                                        {isFormFieldInvalid('msNamaPerusahaan') ? getFormErrorMessage('msNamaPerusahaan') : ''}
                                    </div>

                                </div>

                                <div className="flex flex-column gap-2 w-full">
                                    <label htmlFor="msAlamatPerusahaan">Alamat Perusahaan</label>
                                    <div className="p-inputgroup">
                                        <InputTextarea
                                            autoResize
                                            value={formik.values.msAlamatPerusahaan}
                                            onChange={(e) => {
                                                formik.setFieldValue('msAlamatPerusahaan', e.target.value);
                                            }}
                                            rows={2}
                                            cols={30}
                                        />
                                    </div>
                                    {isFormFieldInvalid('msAlamatPerusahaan') ? getFormErrorMessage('msAlamatPerusahaan') : ''}
                                </div>
                                <div className="flex gap-2">
                                    <div className="flex flex-column gap-2 w-full">
                                        <label htmlFor="msKotaPerusahaan">Kota Perusahaan</label>
                                        <div className="p-inputgroup">
                                            <InputText
                                                style={{ width: '100%' }}
                                                id="msKotaPerusahaan"
                                                name="msKotaPerusahaan"
                                                value={formik.values.msKotaPerusahaan}
                                                onChange={(e) => {
                                                    formik.setFieldValue('msKotaPerusahaan', e.target.value);
                                                }}
                                                className={isFormFieldInvalid('msKotaPerusahaan') ? 'p-invalid' : ''}
                                            />
                                        </div>
                                        {isFormFieldInvalid('msKotaPerusahaan') ? getFormErrorMessage('msKotaPerusahaan') : ''}
                                    </div>
                                    <div className="flex flex-column gap-2 w-full">
                                        <label htmlFor="msTeleponPerusahaan">Telepon Perusahaan</label>
                                        <div className="p-inputgroup">
                                            <InputText
                                                style={{ width: '100%' }}
                                                id="msTeleponPerusahaan"
                                                name="msTeleponPerusahaan"
                                                value={formik.values.msTeleponPerusahaan}
                                                onChange={(e) => {
                                                    const value = e.target.value.replace(/[^0-9]/g, '');
                                                    formik.setFieldValue('msTeleponPerusahaan', value);
                                                }}
                                                className={isFormFieldInvalid('msTeleponPerusahaan') ? 'p-invalid' : ''}
                                            />
                                        </div>
                                        {isFormFieldInvalid('msTeleponPerusahaan') ? getFormErrorMessage('msTeleponPerusahaan') : ''}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <div className="flex flex-column gap-2 w-full">
                                        <label htmlFor="msNamaPimpinan">Pimpinan Utama</label>
                                        <div className="p-inputgroup">
                                            <InputText
                                                style={{ width: '100%' }}
                                                id="msNamaPimpinan"
                                                name="msNamaPimpinan"
                                                value={formik.values.msNamaPimpinan}
                                                onChange={(e) => {
                                                    formik.setFieldValue('msNamaPimpinan', e.target.value);
                                                }}
                                                className={isFormFieldInvalid('msNamaPimpinan') ? 'p-invalid' : ''}
                                            />
                                        </div>
                                        {isFormFieldInvalid('msNamaPimpinan') ? getFormErrorMessage('msNamaPimpinan') : ''}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Toolbar className="mb-4" end={konfigurasiFooter}></Toolbar>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Form;
