'use client'

import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Divider } from "primereact/divider";
import { useState } from "react";
import { FormProps, initValue } from "../interfaces";

const Form = ({
    state,
    setState,
    formik,
    toast,
    handleScan
}: FormProps) => {

    const [qrScanInput, setQrScanInput] = useState('');
    const [qrScanLoading, setQrScanLoading] = useState(false);

    const onScan = async (codeStr: string) => {
        if (handleScan) {
            setQrScanLoading(true);
            await handleScan(codeStr);
            setQrScanInput('');
            setQrScanLoading(false);
        }
    };

    const handleQrScanKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            onScan(qrScanInput);
        }
    };

    const isFormFieldInvalid = (name: keyof initValue) => !!(formik?.touched[name] && formik?.errors[name]);

    const getFormErrorMessage = (name: keyof initValue) => {
        return isFormFieldInvalid(name)
            ? <small className="p-error flex align-items-center gap-1 mt-1"><i className="pi pi-exclamation-circle text-xs" />{formik?.errors[name]}</small>
            : null;
    };

    const documentOptions = state.documents.map(doc => {
        const isBorrowed = state.data.some(loan => loan.kode_dokumen === doc.kode_dokumen && loan.status === 'borrowed');
        return {
            label: isBorrowed ? `${doc.nomor_dokumen} — ${doc.nama_dokumen} (Sedang Dipinjam)` : `${doc.nomor_dokumen} — ${doc.nama_dokumen}`,
            value: doc.kode_dokumen,
            disabled: isBorrowed
        };
    });

    return (
        <Dialog
            visible={state.add}
            header={
                <div className="flex align-items-center gap-2">
                    <i className="pi pi-file-plus text-primary" />
                    <span className="font-bold text-900">Request Peminjaman Arsip</span>
                </div>
            }
            modal
            style={{ width: '44rem', maxWidth: '95vw' }}
            onHide={() => { setState((p) => ({ ...p, add: false })); formik?.resetForm(); }}
            pt={{ header: { className: 'border-bottom-1 surface-border pb-3' } }}>
            <form onSubmit={formik?.handleSubmit} className="flex flex-column gap-2 mt-0 fadein animation-duration-300">

                <div className="flex flex-column gap-2 w-full">
                    <label htmlFor="qr_scan" className="text-sm">
                        Scan QR Code Dokumen <span className="text-color-secondary font-normal">(Opsional - Untuk Auto Select)</span>
                    </label>
                    <div className="p-inputgroup">
                        <span className="p-inputgroup-addon">
                            <i className="pi pi-qrcode" />
                        </span>
                        <InputText
                            id="qr_scan"
                            value={qrScanInput}
                            onChange={(e) => setQrScanInput(e.target.value)}
                            onKeyDown={handleQrScanKeyDown}
                            placeholder="Arahkan kursor ke sini lalu scan QR atau tempel UUID Dokumen..."
                            className="w-full text-sm"
                            disabled={qrScanLoading} />
                        {qrScanLoading ? (
                            <Button type="button" icon="pi pi-spin pi-spinner" disabled />
                        ) : (
                            <Button type="button" icon="pi pi-qrcode" onClick={() => onScan(qrScanInput)} disabled={!qrScanInput.trim()} />
                        )}
                    </div>
                    <small className="text-xs text-color-secondary">Gunakan alat pemindai (scanner) USB atau masukkan kode manual dan tekan Enter.</small>
                </div>

                <div className="flex flex-column gap-2 w-full">
                    <label htmlFor="kode_dokumen" className="text-sm">
                        Dokumen <span className="text-red-500">*</span>
                    </label>
                    <Dropdown
                        id="kode_dokumen"
                        value={formik.values.kode_dokumen}
                        options={documentOptions}
                        filter
                        filterPlaceholder="Cari dokumen..."
                        onChange={(e) => formik.setFieldValue('kode_dokumen', e.value)}
                        placeholder="Pilih dokumen yang akan dipinjam"
                        className={`w-full ${isFormFieldInvalid('kode_dokumen') ? 'p-invalid' : ''}`}
                        emptyMessage="Tidak ada dokumen tersedia"
                        emptyFilterMessage="Dokumen tidak ditemukan" />
                    {getFormErrorMessage('kode_dokumen')}
                </div>

                <div className="flex flex-column gap-2 w-full">
                    <label htmlFor="nama_peminjam" className="text-sm">
                        Nama Peminjam <span className="text-red-500">*</span>
                    </label>
                    <InputText
                        id="nama_peminjam"
                        value={formik.values.nama_peminjam}
                        onChange={(e) => formik.setFieldValue('nama_peminjam', e.target.value)}
                        className={`w-full ${isFormFieldInvalid('nama_peminjam') ? 'p-invalid' : ''}`}
                        placeholder="Masukkan nama lengkap peminjam" />
                    {getFormErrorMessage('nama_peminjam')}
                </div>

                <div className="flex flex-column gap-2 w-full">
                    <label htmlFor="tanggal_pengembalian" className="text-sm">
                        Rencana Tanggal Pengembalian <span className="text-red-500">*</span>
                    </label>
                    <InputText
                        id="tanggal_pengembalian"
                        type="date"
                        value={formik.values.tanggal_pengembalian}
                        onChange={(e) => formik.setFieldValue('tanggal_pengembalian', e.target.value)}
                        className={`w-full ${isFormFieldInvalid('tanggal_pengembalian') ? 'p-invalid' : ''}`} />
                    {getFormErrorMessage('tanggal_pengembalian')}
                </div>

                <div className="flex flex-column gap-2 w-full">
                    <label htmlFor="keperluan" className="text-sm">
                        Keperluan <span className="text-red-500">*</span>
                    </label>
                    <InputTextarea
                        id="keperluan"
                        rows={4}
                        value={formik.values.keperluan}
                        onChange={(e) => formik.setFieldValue('keperluan', e.target.value)}
                        className={`w-full ${isFormFieldInvalid('keperluan') ? 'p-invalid' : ''}`}
                        placeholder="Contoh: Audit, tinjauan hukum, verifikasi data..."
                        style={{ resize: 'none' }} />
                    {getFormErrorMessage('keperluan')}
                </div>

                <div className="mt-2">
                    <Button type="submit" label="Kirim Permintaan" className="w-full p-button-primary" loading={state?.load} disabled={state?.load} />
                </div>
            </form>
        </Dialog>
    );
}

export default Form
