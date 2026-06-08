'use client'

import { apiEndpointGet } from './endpoints';
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { FileUpload } from "primereact/fileupload";
import { FormProps, initValue } from "./interfaces";
import postData from "@/lib/axios/postData";
import { showError, showSuccess } from "@/lib/tools/generalTools";
import { useEffect, useState } from "react";
import { apiEndpointCheckin } from "./endpoints";
import QRCode from "qrcode";

const Form = ({ state, setState, formik, toast, getData }: FormProps) => {
    const [photoFaceFile, setPhotoFaceFile] = useState<File | null>(null);
    const [photoIdentityFile, setPhotoIdentityFile] = useState<File | null>(null);
    const [photoFacePreview, setPhotoFacePreview] = useState<string | null>(null);
    const [photoIdentityPreview, setPhotoIdentityPreview] = useState<string | null>(null);
    const [successQRCode, setSuccessQRCode] = useState<string | null>(null);
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);

    const isFormFieldInvalid = (name: keyof initValue) => !!(formik?.touched[name] && formik?.errors[name]);

    const getFormErrorMessage = (name: keyof initValue) => {
        return isFormFieldInvalid(name) ? <small className="p-error">{formik?.errors[name]}</small> : <small className="p-error">&nbsp;</small>;
    };

    const resetForm = () => {
        formik.resetForm();
        setPhotoFaceFile(null);
        setPhotoIdentityFile(null);
        setPhotoFacePreview(null);
        setPhotoIdentityPreview(null);
    };

    const handleCheckin = async () => {
        formik.setFieldTouched('GuestName', true);
        formik.setFieldTouched('PhoneNumber', true);

        if (!formik.values.GuestName || !formik.values.PhoneNumber || !formik.values.VisitPurposeId) {
            showError(toast, 'GuestName, PhoneNumber dan VisitPurposeId wajib diisi');
            return;
        }

        setState((p) => ({ ...p, load: true }));

        try {
            const formData = new FormData();
            formData.append('GuestName', formik.values.GuestName);
            formData.append('PhoneNumber', formik.values.PhoneNumber);
            if (formik.values.GuestEmail) formData.append('GuestEmail', formik.values.GuestEmail);
            if (formik.values.GuestCompany) formData.append('GuestCompany', formik.values.GuestCompany);
            if (formik.values.GuestPosition) formData.append('GuestPosition', formik.values.GuestPosition);
            if (formik.values.VisitPurposeId) formData.append('VisitPurposeId', String(formik.values.VisitPurposeId));
            if (formik.values.HostUserId) formData.append('HostUserId', formik.values.HostUserId);
            if (formik.values.HostName) formData.append('HostName', formik.values.HostName);
            if (formik.values.IdentityType) formData.append('IdentityType', formik.values.IdentityType);
            if (formik.values.IdentityNumber) formData.append('IdentityNumber', formik.values.IdentityNumber);
            if (formik.values.VisitNotes) formData.append('VisitNotes', formik.values.VisitNotes);
            if (photoFaceFile) formData.append('PhotoFace', photoFaceFile);
            if (photoIdentityFile) formData.append('PhotoIdentity', photoIdentityFile);

            const response = await postData(apiEndpointCheckin, formData, { 'Content-Type': 'multipart/form-data' });
            const resData = response.data;

            if (resData?.status !== '00') {
                throw new Error(resData?.message || 'Gagal check-in tamu');
            }

            const visitCode = resData?.data?.VisitCode || '';
            const qrDataUrl = await QRCode.toDataURL(visitCode);
            setSuccessQRCode(qrDataUrl);
            setShowSuccessDialog(true);
            showSuccess(toast, 'Check-in berhasil');
            resetForm();
            setState((p) => ({ ...p, add: false }));
            await getData(apiEndpointGet);
        } catch (error: any) {
            const e = error?.response?.data || error;
            showError(toast, e?.message || error?.message || 'Terjadi Kesalahan');
        } finally {
            setState((p) => ({ ...p, load: false }));
        }
    };

    const downloadQr = () => {
        if (!successQRCode) return;
        const link = document.createElement('a');
        link.href = successQRCode;
        link.download = `qr-${formik.values.GuestName || 'visitor'}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const printCard = () => {
        if (!successQRCode) return;
        const html = `
            <html>
            <head><title>Visitor Card</title></head>
            <body style="font-family: Arial, sans-serif; padding: 32px; text-align: center;">
            <h1>Visitor Card</h1>
            <div style="margin: 24px 0;">${formik.values.GuestName || ''}</div>
            <div><img src="${successQRCode}" alt="QR" style="max-width: 240px;" /></div>
            <div style="margin-top: 16px; font-size: 1.25rem;">${formik.values.GuestName || ''}</div>
            <div style="margin-top: 8px;">${new Date().toLocaleString()}</div>
            </body>
            </html>
        `;
        const win = window.open('', '_blank');
        if (win) {
            win.document.open();
            win.document.write(html);
            win.document.close();
            win.focus();
            win.print();
        }
    };

    useEffect(() => {
        return () => {
            if (photoFacePreview) URL.revokeObjectURL(photoFacePreview);
            if (photoIdentityPreview) URL.revokeObjectURL(photoIdentityPreview);
        };
    }, [photoFacePreview, photoIdentityPreview]);

    return (
        <>
            <Dialog visible={state.add} header="Check-In Tamu Baru" modal style={{ width: '640px' }} onHide={() => setState((p) => ({ ...p, add: false }))}>
                <div className="grid grid-nogutter gap-4">
                    <div className="col-12">
                        <h3 className="font-semibold">Data Tamu</h3>
                        <div className="grid grid-nogutter gap-3">
                            <div className="col-12 md:col-6">
                                <label htmlFor="GuestName">Guest Name</label>
                                <InputText id="GuestName" value={formik.values.GuestName} onChange={(e) => formik.setFieldValue('GuestName', e.target.value)} className={isFormFieldInvalid('GuestName') ? 'p-invalid' : ''} />
                                {getFormErrorMessage('GuestName')}
                            </div>
                            <div className="col-12 md:col-6">
                                <label htmlFor="PhoneNumber">Phone Number</label>
                                <InputText id="PhoneNumber" value={formik.values.PhoneNumber} onChange={(e) => formik.setFieldValue('PhoneNumber', e.target.value)} className={isFormFieldInvalid('PhoneNumber') ? 'p-invalid' : ''} />
                                {getFormErrorMessage('PhoneNumber')}
                            </div>
                            <div className="col-12 md:col-6">
                                <label htmlFor="GuestEmail">Guest Email</label>
                                <InputText id="GuestEmail" value={formik.values.GuestEmail} onChange={(e) => formik.setFieldValue('GuestEmail', e.target.value)} />
                            </div>
                            <div className="col-12 md:col-6">
                                <label htmlFor="GuestCompany">Guest Company</label>
                                <InputText id="GuestCompany" value={formik.values.GuestCompany} onChange={(e) => formik.setFieldValue('GuestCompany', e.target.value)} />
                            </div>
                            <div className="col-12 md:col-6">
                                <label htmlFor="GuestPosition">Guest Position</label>
                                <InputText id="GuestPosition" value={formik.values.GuestPosition} onChange={(e) => formik.setFieldValue('GuestPosition', e.target.value)} />
                            </div>
                            <div className="col-12 md:col-6">
                                <label htmlFor="IdentityType">Identity Type</label>
                                <Dropdown id="IdentityType" value={formik.values.IdentityType} options={[{ label: 'KTP', value: 'ktp' }, { label: 'SIM', value: 'sim' }, { label: 'Paspor', value: 'paspor' }]} onChange={(e) => formik.setFieldValue('IdentityType', e.value)} placeholder="Select Identity" />
                            </div>
                            <div className="col-12 md:col-6">
                                <label htmlFor="IdentityNumber">Identity Number</label>
                                <InputText id="IdentityNumber" value={formik.values.IdentityNumber} onChange={(e) => formik.setFieldValue('IdentityNumber', e.target.value)} />
                            </div>
                        </div>
                    </div>

                    <div className="col-12">
                        <h3 className="font-semibold">Info Kunjungan</h3>
                        <div className="grid grid-nogutter gap-3">
                            <div className="col-12 md:col-6">
                                <label htmlFor="VisitPurposeId">Visit Purpose</label>
                                <Dropdown id="VisitPurposeId" value={formik.values.VisitPurposeId} options={state.visitPurposeData} optionLabel="Name" optionValue="Id" onChange={(e) => formik.setFieldValue('VisitPurposeId', e.value)} placeholder="Select Purpose" className={isFormFieldInvalid('VisitPurposeId') ? 'p-invalid' : ''} />
                                {getFormErrorMessage('VisitPurposeId')}
                            </div>
                            <div className="col-12 md:col-6">
                                <label htmlFor="HostUserId">Host User</label>
                                <Dropdown id="HostUserId" value={formik.values.HostUserId} options={state.hostUserData} optionLabel="Fullname" optionValue="UniqueId" onChange={(e) => formik.setFieldValue('HostUserId', e.value)} placeholder="Select Host (optional)" />
                            </div>
                            <div className="col-12 md:col-6">
                                <label htmlFor="HostName">Host Name</label>
                                <InputText id="HostName" value={formik.values.HostName} onChange={(e) => formik.setFieldValue('HostName', e.target.value)} placeholder="Manual host name" />
                            </div>
                            <div className="col-12">
                                <label htmlFor="VisitNotes">Visit Notes</label>
                                <InputTextarea id="VisitNotes" value={formik.values.VisitNotes} onChange={(e) => formik.setFieldValue('VisitNotes', e.target.value)} rows={4} />
                            </div>
                        </div>
                    </div>

                    <div className="col-12">
                        <h3 className="font-semibold">Upload Foto</h3>
                        <div className="grid grid-nogutter gap-3">
                            <div className="col-12 md:col-6">
                                <label>Foto Tamu</label>
                                <FileUpload name="PhotoFace" accept="image/*" maxFileSize={2 * 1024 * 1024} customUpload uploadHandler={(e) => {
                                    const file = e.files[0] as File;
                                    setPhotoFaceFile(file);
                                    setPhotoFacePreview(URL.createObjectURL(file));
                                }} chooseLabel="Pilih Foto" mode="basic" />
                                {photoFacePreview && <img src={photoFacePreview} alt="preview" width={120} height={120} style={{ borderRadius: '8px', marginTop: 10 }} />}
                            </div>
                            <div className="col-12 md:col-6">
                                <label>Foto Identitas (KTP/SIM)</label>
                                <FileUpload name="PhotoIdentity" accept="image/*" maxFileSize={2 * 1024 * 1024} customUpload uploadHandler={(e) => {
                                    const file = e.files[0] as File;
                                    setPhotoIdentityFile(file);
                                    setPhotoIdentityPreview(URL.createObjectURL(file));
                                }} chooseLabel="Pilih Foto" mode="basic" />
                                {photoIdentityPreview && <img src={photoIdentityPreview} alt="preview" width={120} height={120} style={{ borderRadius: '8px', marginTop: 10 }} />}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-content-end gap-2 mt-4">
                    <Button label="Cancel" severity="secondary" outlined onClick={() => setState((p) => ({ ...p, add: false }))} disabled={state.load} />
                    <Button label="Check-In Sekarang" severity="success" onClick={handleCheckin} loading={state.load} />
                </div>
            </Dialog>

            <Dialog visible={showSuccessDialog} header="Check-In Berhasil" modal style={{ width: '500px' }} onHide={() => setShowSuccessDialog(false)}>
                <div className="flex flex-column align-items-center gap-4">
                    <div className="text-xl font-bold">{formik.values.GuestName || 'Tamu'}</div>
                    {successQRCode && <img src={successQRCode} alt="QR Code" width={220} height={220} />}
                    <div className="text-2xl font-semibold">{formik.values.VisitPurposeId ? `Kode Visit` : 'Visit Code'}</div>
                    <div className="text-lg">{formik.values.VisitPurposeId ? '' : ''}</div>
                    <div className="flex gap-2 mt-4">
                        <Button label="Download QR" icon="pi pi-download" onClick={downloadQr} />
                        <Button label="Print Visitor Card" icon="pi pi-print" onClick={printCard} severity="help" />
                        <Button label="Tutup" icon="pi pi-times" outlined onClick={() => setShowSuccessDialog(false)} />
                    </div>
                </div>
            </Dialog>
        </>
    );
};

export default Form;
