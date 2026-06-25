'use client'

import { Dialog } from "primereact/dialog";
import { FormProps, initValue } from "../interfaces"
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { apiEndpointCreate, apiEndpointGet, } from "../endpoints";
import postData from "@/lib/axios/postData";
import { showError, showSuccess } from "@/lib/tools/generalTools";
import { useEffect, useRef } from "react";
import formUpload from "@/lib/axios/formData";
import { Toolbar } from "primereact/toolbar";
import { ProgressBar } from "primereact/progressbar";
import { InputTextarea } from "primereact/inputtextarea";

const Form = ({
    state,
    setState,
    formik,
    toast,
    getData
}: FormProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

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
            const oHeaders = {
                "X-Level": "1",
            };

            const formData = new FormData();

            const { msLogoPerusahaan, ...rest } = input;

            const key = Object.keys(rest);
            const keterangan = Object.values(rest);

            formData.append("Kode", JSON.stringify(key));
            formData.append("Keterangan", JSON.stringify(keterangan));

            if (msLogoPerusahaan) {
                formData.append("msLogoPerusahaan", msLogoPerusahaan);
            }

            const vaData = await formUpload(
                apiEndpointCreate,
                formData,
                oHeaders
            );

            const res = vaData.data;

            showSuccess(
                toast,
                res.data?.message || "Konfigurasi berhasil disimpan"
            );

            formik.resetForm();
            setState((p) => ({
                ...p,
                add: false,
                edit: false,
                approval: false,
                delete: false,
            }));

            await getData(apiEndpointGet);

        } catch (error: any) {
            const e = error?.response?.data || error;
            showError(
                toast,
                e?.message || "Terjadi kesalahan yang tidak terduga"
            );
        } finally {
            setState((p) => ({ ...p, load: false, submittedData: null }));
        }
    };

    const onFileSelect = (event: any) => {
        const file = event?.target?.files[0];
        if (!file) return;

        if (file.size > 1024 * 1024) { // 1MB
            formik.setFieldValue("msLogoPerusahaan", null);
            return showError(toast, "File tidak boleh lebih dari 1MB.");
        }

        // langsung simpan file object ke formik
        formik.setFieldValue("msLogoPerusahaan", file);
        setState(p => ({ ...p, imgPrev: URL.createObjectURL(file) }))
    };

    const konfigurasiFooter = (
        <>
            <Button
                type="submit"
                label="Simpan"
                icon="pi pi-check"
                className="p-button-text"
                onClick={() => formik.handleSubmit()}
            />
        </>
    );



    const isFormFieldInvalid = (name: keyof initValue) => !!(formik?.touched[name] && formik?.errors[name]);

    const getFormErrorMessage = (name: keyof initValue) => {
        return isFormFieldInvalid(name) ? <small className="p-error">{formik?.errors[name]}</small> : <small className="p-error">&nbsp;</small>;
    };
    useEffect(() => {
        return () => {
            if (state.imgPrev) URL.revokeObjectURL(state.imgPrev);
        };
    }, [state.imgPrev]);

    useEffect(() => {
        if (state.submittedData) {
            handleSave(state.submittedData)
        }
    }, [state.submittedData])

    useEffect(() => {
        getData(apiEndpointGet);
    }, []);

    return <>
        <div className="grid crud-demo">
            <div className="col-12">
                <div className="card">
                    <h4>Konfigurasi Sistem</h4>
                    <hr />
                    {state.load && (
                        <ProgressBar mode="indeterminate" style={{ height: "6px" }} />
                    )}

                    <div className="flex flex-column sm:flex-row gap-3">
                        <div className="p-image-preview-container" style={{ width: '250px', height: '250px', borderRadius: '6px' }}>
                            <img src={state.imgPrev ? state.imgPrev : '/layout/images/profile.png'} alt="logo_perusahaan" style={{ width: '100%', height: '250px', objectFit: 'cover', objectPosition: 'center', borderRadius: '6px' }} />
                            <div className="p-image-preview-indicator" style={{
                                borderRadius: '6px',
                            }}
                                onClick={() => fileInputRef.current?.click()}>
                                <i className="pi pi-pencil"></i>
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                id="fileInput"
                                accept="image/*"
                                style={{ display: 'none' }}
                                onChange={onFileSelect}
                            />
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
                                {/* <div className="flex flex-column gap-2 w-full">
                                    <label htmlFor="msEmailPerusahaan">Email Perusahaan</label>
                                    <div className="p-inputgroup">
                                        <InputText
                                            style={{ width: '100%' }}
                                            id="msEmailPerusahaan"
                                            name="msEmailPerusahaan"
                                            value={formik.values.msEmailPerusahaan}
                                            onChange={(e) => {
                                                formik.setFieldValue('msEmailPerusahaan', e.target.value);
                                            }}
                                            className={isFormFieldInvalid('msEmailPerusahaan') ? 'p-invalid' : ''}
                                        />
                                    </div>
                                    {isFormFieldInvalid('msEmailPerusahaan') ? getFormErrorMessage('msEmailPerusahaan') : ''}
                                </div> */}
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
                                        rows={2} cols={30}
                                    />
                                </div>
                                {isFormFieldInvalid('msAlamatPerusahaan') ? getFormErrorMessage('msAlamatPerusahaan') : ''}
                            </div>
                            <div className='flex gap-2'>
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

}

export default Form