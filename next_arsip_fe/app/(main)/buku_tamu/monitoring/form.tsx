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
        return isFormFieldInvalid(name) ? <small className="p-error block mt-1">{formik?.errors[name]}</small> : null;
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
            
            // Susun data teks secara CamelCase sesuai skema database db_magang
            formData.append('GuestName', formik.values.GuestName);
            formData.append('PhoneNumber', formik.values.PhoneNumber);
            
            if (formik.values.GuestEmail) formData.append('GuestEmail', formik.values.GuestEmail);
            if (formik.values.GuestCompany) formData.append('GuestCompany', formik.values.GuestCompany);
            if (formik.values.GuestPosition) formData.append('GuestPosition', formik.values.GuestPosition);
            if (formik.values.IdentityType) formData.append('IdentityType', formik.values.IdentityType);
            if (formik.values.IdentityNumber) formData.append('IdentityNumber', formik.values.IdentityNumber);
            if (formik.values.VisitNotes) formData.append('VisitNotes', formik.values.VisitNotes);
            if (formik.values.HostName) formData.append('HostName', formik.values.HostName);

            // Kirim nilai ID relasi murni
            if (formik.values.VisitPurposeId) formData.append('VisitPurposeId', String(formik.values.VisitPurposeId));
            if (formik.values.HostUserId) formData.append('HostUserId', formik.values.HostUserId);

            // Taruh file biner foto paling bawah FormData agar Multer Backend aman
            if (photoFaceFile) formData.append('PhotoFace', photoFaceFile);
            if (photoIdentityFile) formData.append('PhotoIdentity', photoIdentityFile);

            // 🎯 JINAKKAN TYPESCRIPT DISINI: Berikan casting (any) langsung pada eksekusi fungsi postData
            const response = await (postData as any)(apiEndpointCheckin, formData);
            const resData = response?.data;

            // Pengecekan status yang longgar dan aman dari kompilasi ketat
            if (resData?.status !== '00' && resData?.status !== 200 && response?.status !== 200 && response?.status !== 204) {
                throw new Error(resData?.message || 'Gagal check-in tamu');
            }

            const visitCode = resData?.data?.VisitCode || `VST-${Date.now()}`;
            const qrDataUrl = await QRCode.toDataURL(visitCode);
            setSuccessQRCode(qrDataUrl);
            setShowSuccessDialog(true);
            showSuccess(toast, 'Check-in berhasil');
            resetForm();
            setState((p) => ({ ...p, add: false }));
            await getData(apiEndpointGet);
        } catch (error: any) {
            const e = error?.response?.data || error;
            showError(toast, e?.message || error?.message || 'Terjadi Kesalahan Server');
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
            <Dialog visible={state.add} header="Check-In Tamu Baru" modal style={{ width: '90vw', maxWidth: '800px' }} onHide={() => setState((p) => ({ ...p, add: false }))}>
                <div className="p-fluid mt-2">
                    
                    {/* ================= SECTION 1: DATA TAMU ================= */}
                    <h5 className="text-900 font-bold mb-3 border-bottom-1 surface-border pb-2 flex align-items-center">
                        <i className="pi pi-user mr-2 text-primary text-lg"></i>Data Tamu
                    </h5>
                    
                    <div className="grid p-fluid">
                        <div className="col-12 md:col-6 field mb-3">
                            <label htmlFor="GuestName" className="font-semibold block mb-2">Guest Name <span className="text-red-500">*</span></label>
                            <InputText id="GuestName" value={formik.values.GuestName} onChange={(e) => formik.setFieldValue('GuestName', e.target.value)} className={`w-full ${isFormFieldInvalid('GuestName') ? 'p-invalid' : ''}`} placeholder="Nama lengkap tamu" />
                            {getFormErrorMessage('GuestName')}
                        </div>
                        
                        <div className="col-12 md:col-6 field mb-3">
                            <label htmlFor="PhoneNumber" className="font-semibold block mb-2">Phone Number <span className="text-red-500">*</span></label>
                            <InputText id="PhoneNumber" value={formik.values.PhoneNumber} onChange={(e) => formik.setFieldValue('PhoneNumber', e.target.value)} className={`w-full ${isFormFieldInvalid('PhoneNumber') ? 'p-invalid' : ''}`} placeholder="Contoh: 081234xxxx" />
                            {getFormErrorMessage('PhoneNumber')}
                        </div>
                        
                        <div className="col-12 md:col-6 field mb-3">
                            <label htmlFor="GuestEmail" className="font-semibold block mb-2">Guest Email</label>
                            <InputText id="GuestEmail" value={formik.values.GuestEmail} onChange={(e) => formik.setFieldValue('GuestEmail', e.target.value)} className="w-full" placeholder="alamat@email.com" />
                        </div>
                        
                        <div className="col-12 md:col-6 field mb-3">
                            <label htmlFor="GuestCompany" className="font-semibold block mb-2">Guest Company</label>
                            <InputText id="GuestCompany" value={formik.values.GuestCompany} onChange={(e) => formik.setFieldValue('GuestCompany', e.target.value)} className="w-full" placeholder="Instansi / Perusahaan" />
                        </div>
                        
                        <div className="col-12 md:col-6 field mb-3">
                            <label htmlFor="GuestPosition" className="font-semibold block mb-2">Guest Position</label>
                            <InputText id="GuestPosition" value={formik.values.GuestPosition} onChange={(e) => formik.setFieldValue('GuestPosition', e.target.value)} className="w-full" placeholder="Jabatan" />
                        </div>
                        
                        <div className="col-12 md:col-6 field mb-3">
                            <div className="grid grid-nogutter gap-2">
                                <div className="col-4 p-fluid">
                                    <label htmlFor="IdentityType" className="font-semibold block mb-2">Type</label>
                                    <Dropdown id="IdentityType" value={formik.values.IdentityType} options={[{ label: 'KTP', value: 'ktp' }, { label: 'SIM', value: 'sim' }, { label: 'Paspor', value: 'paspor' }]} onChange={(e) => formik.setFieldValue('IdentityType', e.value)} placeholder="Pilih" className="w-full" />
                                </div>
                                <div className="col-7 p-fluid flex-grow-1">
                                    <label htmlFor="IdentityNumber" className="font-semibold block mb-2">Identity Number</label>
                                    <InputText id="IdentityNumber" value={formik.values.IdentityNumber} onChange={(e) => formik.setFieldValue('IdentityNumber', e.target.value)} className="w-full" placeholder="Nomor identitas" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ================= SECTION 2: INFO KUNJUNGAN ================= */}
                    <h5 className="text-900 font-bold my-3 border-bottom-1 surface-border pb-2 flex align-items-center">
                        <i className="pi pi-info-circle mr-2 text-primary text-lg"></i>Info Kunjungan
                    </h5>
                    
                    <div className="grid p-fluid">
                        <div className="col-12 md:col-6 field mb-3">
                            <label htmlFor="VisitPurposeId" className="font-semibold block mb-2">Visit Purpose <span className="text-red-500">*</span></label>
                            <Dropdown id="VisitPurposeId" value={formik.values.VisitPurposeId} options={state.visitPurposeData || []} optionLabel="VisitPurposeName" optionValue="VisitPurposeId" onChange={(e) => formik.setFieldValue('VisitPurposeId', e.value)} placeholder="Pilih Tujuan Kunjungan" className={`w-full ${isFormFieldInvalid('VisitPurposeId') ? 'p-invalid' : ''}`} />
                            {getFormErrorMessage('VisitPurposeId')}
                        </div>
                        
                        <div className="col-12 md:col-6 field mb-3">
                            <label htmlFor="HostUserId" className="font-semibold block mb-2">Host User (Pegawai yang dikunjungi)</label>
                            <Dropdown id="HostUserId" value={formik.values.HostUserId} options={state.hostUserData || []} optionLabel="Fullname" optionValue="UniqueId" onChange={(e) => formik.setFieldValue('HostUserId', e.value)} placeholder="Pilih Pegawai (Opsional)" className="w-full" />
                        </div>
                        
                        <div className="col-12 md:col-6 field mb-3">
                            <label htmlFor="HostName" className="font-semibold block mb-2">Host Name (Manual)</label>
                            <InputText id="HostName" value={formik.values.HostName} onChange={(e) => formik.setFieldValue('HostName', e.target.value)} placeholder="Ketik nama pegawai jika tidak terdaftar" className="w-full" />
                        </div>
                        
                        <div className="col-12 md:col-6 field mb-3">
                            <label htmlFor="VisitNotes" className="font-semibold block mb-2">Visit Notes</label>
                            <InputTextarea id="VisitNotes" value={formik.values.VisitNotes} onChange={(e) => formik.setFieldValue('VisitNotes', e.target.value)} rows={2} autoResize placeholder="Tambahkan catatan pendukung kunjungan..." className="w-full" />
                        </div>
                    </div>

                    {/* ================= SECTION 3: UPLOAD FOTO ================= */}
                    <h5 className="text-900 font-bold my-3 border-bottom-1 surface-border pb-2 flex align-items-center">
                        <i className="pi pi-camera mr-2 text-primary text-lg"></i>Lampiran Foto Dokumen
                    </h5>
                    
                    <div className="grid">
                        <div className="col-12 md:col-6 field mb-3">
                            <label className="font-semibold block mb-2">Foto Wajah Tamu</label>
                            <FileUpload name="PhotoFace" accept="image/*" maxFileSize={2 * 1024 * 1024} customUpload uploadHandler={(e) => {
                                const file = e.files[0] as File;
                                setPhotoFaceFile(file);
                                setPhotoFacePreview(URL.createObjectURL(file));
                            }} chooseLabel="Ambil/Pilih Foto" mode="basic" className="w-full" />
                            {photoFacePreview && (
                                <div className="mt-3 flex justify-content-start">
                                    <img src={photoFacePreview} alt="preview" width={140} height={140} style={{ borderRadius: '8px', objectFit: 'cover', border: '1px solid #dee2e6' }} />
                                </div>
                            )}
                        </div>
                        
                        <div className="col-12 md:col-6 field mb-3">
                            <label className="font-semibold block mb-2">Foto Kartu Identitas (KTP/SIM)</label>
                            <FileUpload name="PhotoIdentity" accept="image/*" maxFileSize={2 * 1024 * 1024} customUpload uploadHandler={(e) => {
                                const file = e.files[0] as File;
                                setPhotoIdentityFile(file);
                                setPhotoIdentityPreview(URL.createObjectURL(file));
                            }} chooseLabel="Scan/Pilih Dokumen" mode="basic" className="w-full" />
                            {photoIdentityPreview && (
                                <div className="mt-3 flex justify-content-start">
                                    <img src={photoIdentityPreview} alt="preview" width={140} height={140} style={{ borderRadius: '8px', objectFit: 'cover', border: '1px solid #dee2e6' }} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ================= BUTTON AKSI FOOTER ================= */}
                <div className="flex justify-content-end gap-2 mt-4 border-top-1 surface-border pt-3">
                    <Button label="Batal" icon="pi pi-times" severity="secondary" outlined onClick={() => setState((p) => ({ ...p, add: false }))} disabled={state.load} style={{ width: 'auto', minWidth: '100px' }} />
                    <Button label="Check-In Sekarang" icon="pi pi-check" severity="success" onClick={handleCheckin} loading={state.load} style={{ width: 'auto', minWidth: '160px' }} />
                </div>
            </Dialog>

            {/* ================= DIALOG SUKSES (QR CODE) ================= */}
            <Dialog visible={showSuccessDialog} header="Check-In Berhasil" modal style={{ width: '90vw', maxWidth: '500px' }} onHide={() => setShowSuccessDialog(false)}>
                <div className="flex flex-column align-items-center gap-3 text-center my-2">
                    <i className="pi pi-check-circle text-green-500 text-6xl mb-2"></i>
                    <div className="text-2xl font-bold text-900">{formik.values.GuestName || 'Tamu'}</div>
                    <div className="text-secondary font-medium mb-2">Pendaftaran kunjungan Anda telah berhasil dicatat ke dalam sistem.</div>
                    
                    {successQRCode && (
                        <div className="p-3 surface-card border-1 surface-border border-round shadow-1">
                            <img src={successQRCode} alt="QR Code" width={200} height={200} />
                        </div>
                    )}
                    
                    <div className="bg-blue-50 text-blue-700 font-bold px-4 py-2 border-round-3xl mt-2 tracking-wider text-xl">
                        KODE VISIT AKTIF
                    </div>
                    
                    <div className="flex flex-wrap justify-content-center gap-2 mt-4 w-full">
                        <Button label="Download QR" icon="pi pi-download" onClick={downloadQr} className="flex-grow-1 md:flex-grow-0" />
                        <Button label="Print Visitor Card" icon="pi pi-print" onClick={printCard} severity="help" className="flex-grow-1 md:flex-grow-0" />
                        <Button label="Tutup" icon="pi pi-times" outlined onClick={() => setShowSuccessDialog(false)} className="flex-grow-1 md:flex-grow-0" />
                    </div>
                </div>
            </Dialog>
        </>
    );
};

export default Form;