'use client'

import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Divider } from "primereact/divider";
import { useState } from "react";
import getData from "@/lib/axios/getData";
import { showError, showSuccess } from "@/lib/tools/generalTools";
import { FormProps, initValue } from "../interfaces";

const Form = ({
    state,
    setState,
    formik,
    toast,
}: FormProps) => {

    const [qrScanInput, setQrScanInput] = useState('');
    const [qrScanLoading, setQrScanLoading] = useState(false);

    const handleScan = async (codeStr: string) => {
        const cleanCode = codeStr.trim();
        if (!cleanCode) return;

        setQrScanLoading(true);
        try {
            const res = await getData(`/arsip-dokumen/qr/scan?qr_code=${encodeURIComponent(cleanCode)}`);
            if (res.data?.status === 'success' && res.data?.data?.document) {
                const doc = res.data.data.document;
                
                // Cek apakah dokumen sedang dipinjam
                const isBorrowed = state.data.some(loan => loan.kode_dokumen === doc.kode_dokumen && loan.status === 'borrowed');
                if (isBorrowed) {
                    showError(toast, `Dokumen ${doc.nomor_dokumen} sedang dipinjam dan tidak dapat dipilih`);
                } else {
                    formik?.setFieldValue('kode_dokumen', doc.kode_dokumen);
                    showSuccess(toast, `Dokumen ${doc.nomor_dokumen} terpilih`);
                    setQrScanInput('');
                }
            } else {
                showError(toast, res.data?.message || 'Dokumen tidak ditemukan');
            }
        } catch (error: any) {
            const msg = error.response?.data?.message || error.message || 'QR Code tidak terdaftar';
            showError(toast, msg);
        } finally {
            setQrScanLoading(false);
        }
    };

    const handleQrScanKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleScan(qrScanInput);
        }
    };

    const isFormFieldInvalid = (name: keyof initValue) => !!(formik?.touched[name] && formik?.errors[name]);

    const getFormErrorMessage = (name: keyof initValue) => {
        return isFormFieldInvalid(name)
            ? <small className="p-error flex align-items-center gap-1 mt-1"><i className="pi pi-exclamation-circle text-xs" />{formik?.errors[name]}</small>
            : <small className="p-error">&nbsp;</small>;
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
            pt={{ header: { className: 'border-bottom-1 surface-border pb-3' } }}
        >
            <form onSubmit={formik?.handleSubmit} className="flex flex-column gap-1 pt-3">

                <div className="flex flex-column gap-1 mb-3">
                    <label htmlFor="qr_scan" className="font-semibold text-sm text-900">
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
                            disabled={qrScanLoading}
                        />
                        {qrScanLoading ? (
                            <Button type="button" icon="pi pi-spin pi-spinner" disabled />
                        ) : (
                            <Button type="button" icon="pi pi-qrcode" onClick={() => handleScan(qrScanInput)} />
                        )}
                    </div>
                    <small className="text-xs text-color-secondary">Gunakan alat pemindai (scanner) USB atau masukkan kode manual dan tekan Enter.</small>
                </div>

                <div className="flex flex-column gap-1 mb-3">
                    <label htmlFor="kode_dokumen" className="font-semibold text-sm text-900">
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
                        emptyFilterMessage="Dokumen tidak ditemukan"
                    />
                    {getFormErrorMessage('kode_dokumen')}
                </div>

                <div className="flex flex-column gap-1 mb-3">
                    <label htmlFor="nama_peminjam" className="font-semibold text-sm text-900">
                        Nama Peminjam <span className="text-red-500">*</span>
                    </label>
                    <InputText
                        id="nama_peminjam"
                        value={formik.values.nama_peminjam}
                        onChange={(e) => formik.setFieldValue('nama_peminjam', e.target.value)}
                        className={`w-full ${isFormFieldInvalid('nama_peminjam') ? 'p-invalid' : ''}`}
                        placeholder="Masukkan nama lengkap peminjam"
                    />
                    {getFormErrorMessage('nama_peminjam')}
                </div>

                <div className="flex flex-column gap-1 mb-3">
                    <label htmlFor="tanggal_pengembalian" className="font-semibold text-sm text-900">
                        Rencana Tanggal Pengembalian <span className="text-red-500">*</span>
                    </label>
                    <InputText
                        id="tanggal_pengembalian"
                        type="date"
                        value={formik.values.tanggal_pengembalian}
                        onChange={(e) => formik.setFieldValue('tanggal_pengembalian', e.target.value)}
                        className={`w-full ${isFormFieldInvalid('tanggal_pengembalian') ? 'p-invalid' : ''}`}
                    />
                    {getFormErrorMessage('tanggal_pengembalian')}
                </div>

                <div className="flex flex-column gap-1 mb-3">
                    <label htmlFor="keperluan" className="font-semibold text-sm text-900">
                        Keperluan <span className="text-red-500">*</span>
                    </label>
                    <InputTextarea
                        id="keperluan"
                        rows={4}
                        value={formik.values.keperluan}
                        onChange={(e) => formik.setFieldValue('keperluan', e.target.value)}
                        className={`w-full ${isFormFieldInvalid('keperluan') ? 'p-invalid' : ''}`}
                        placeholder="Contoh: Audit, tinjauan hukum, verifikasi data..."
                        style={{ resize: 'none' }}
                    />
                    {getFormErrorMessage('keperluan')}
                </div>

                <Divider className="my-2" />

                <div className="flex justify-content-end gap-2">
                    <Button
                        type="button"
                        label="Batal"
                        icon="pi pi-times"
                        severity="secondary"
                        outlined
                        size="small"
                        onClick={() => { setState((p) => ({ ...p, add: false })); formik.resetForm(); }}
                        disabled={state.load}
                    />
                    <Button
                        type="submit"
                        label="Ajukan Peminjaman"
                        icon="pi pi-send"
                        size="small"
                        style={{ background: 'linear-gradient(135deg, #4F46E5 0%, #3B82F6 100%)', border: 'none' }}
                        loading={state.load}
                    />
                </div>
            </form>
        </Dialog>
    );
}

export default Form
