'use client';

import formUpload from "@/lib/axios/formData";
import getDataRequest from "@/lib/axios/getData";
import { showError, showSuccess } from "@/lib/tools/generalTools";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Divider } from "primereact/divider";
import { FileUpload, FileUploadSelectEvent } from "primereact/fileupload";
import { InputText } from "primereact/inputtext";
import { Tag } from "primereact/tag";
import { Toast } from "primereact/toast";
import { useRef, useState } from "react";
import { apiEndpointPublicVerify, apiEndpointVerify } from "../components/endpoints";

const boolTag = (value: boolean | undefined, label: string) => (
    <Tag
        value={`${label}: ${value ? "Valid" : "Tidak Valid"}`}
        severity={value ? "success" : "danger"}
        icon={value ? "pi pi-check-circle" : "pi pi-times-circle"}
    />
);

const Page = () => {
    const toast = useRef<Toast>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [token, setToken] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    const verifyFile = async () => {
        if (!selectedFile) {
            showError(toast, "Pilih file PDF terlebih dahulu");
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append("file", selectedFile);

        try {
            const res = await formUpload(apiEndpointVerify, formData, {});
            setResult(res.data?.data || null);
            showSuccess(toast, res.data?.message || "Dokumen berhasil diverifikasi");
        } catch (error: any) {
            const e = error?.response?.data || error;
            showError(toast, e?.message || "Dokumen gagal diverifikasi");
        } finally {
            setLoading(false);
        }
    };

    const verifyToken = async () => {
        if (!token.trim()) {
            showError(toast, "Token verifikasi wajib diisi");
            return;
        }

        setLoading(true);
        try {
            const res = await getDataRequest(`${apiEndpointPublicVerify}/${encodeURIComponent(token.trim())}`);
            setResult(res.data?.data || null);
            showSuccess(toast, res.data?.message || "Token berhasil diverifikasi");
        } catch (error: any) {
            const e = error?.response?.data || error;
            showError(toast, e?.message || "Token gagal diverifikasi");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4">
            <Toast ref={toast} position="top-right" />
            <Card className="shadow-1 border-round-2xl border-none">
                <div className="mb-4">
                    <span className="text-primary font-bold text-xs uppercase" style={{ letterSpacing: "0.1em" }}>
                        Tanda Tangan Elektronik
                    </span>
                    <h2 className="m-0 text-900 font-extrabold text-2xl mt-1 mb-2">Verifikasi Dokumen</h2>
                    <p className="m-0 text-color-secondary text-sm font-medium">
                        Periksa signature kriptografis, integritas PDF, dan status sertifikat internal.
                    </p>
                </div>

                <div className="grid">
                    <div className="col-12 lg:col-6">
                        <div className="p-3 surface-50 border-1 surface-border border-round-xl h-full">
                            <div className="font-bold text-900 flex align-items-center gap-2 mb-3">
                                <i className="pi pi-file-pdf text-red-500" />
                                Upload PDF
                            </div>
                            <FileUpload
                                mode="basic"
                                name="file"
                                accept="application/pdf"
                                maxFileSize={50 * 1024 * 1024}
                                chooseLabel="Pilih PDF"
                                customUpload
                                auto={false}
                                onSelect={(e: FileUploadSelectEvent) => setSelectedFile(e.files?.[0] || null)}
                                className="mb-3"
                            />
                            <div className="text-sm text-color-secondary mb-3">
                                {selectedFile ? selectedFile.name : "Belum ada file yang dipilih"}
                            </div>
                            <Button
                                label="Verifikasi File"
                                icon="pi pi-shield"
                                severity="success"
                                loading={loading}
                                onClick={verifyFile}
                            />
                        </div>
                    </div>

                    <div className="col-12 lg:col-6">
                        <div className="p-3 surface-50 border-1 surface-border border-round-xl h-full">
                            <div className="font-bold text-900 flex align-items-center gap-2 mb-3">
                                <i className="pi pi-key text-primary" />
                                Token Verifikasi
                            </div>
                            <div className="p-input-icon-left w-full mb-3">
                                <i className="pi pi-search" />
                                <InputText
                                    value={token}
                                    onChange={(e) => setToken(e.target.value)}
                                    placeholder="Masukkan token verifikasi"
                                    className="w-full"
                                />
                            </div>
                            <Button
                                label="Verifikasi Token"
                                icon="pi pi-check"
                                outlined
                                loading={loading}
                                onClick={verifyToken}
                            />
                        </div>
                    </div>
                </div>

                {result && (
                    <>
                        <Divider />
                        <div className="p-3 border-round-xl border-1 surface-border">
                            <div className="font-bold text-900 flex align-items-center gap-2 mb-3">
                                <i className="pi pi-verified text-green-500" />
                                Hasil Verifikasi
                            </div>
                            <div className="flex flex-wrap gap-2 mb-3">
                                {boolTag(result.valid_kriptografis, "Kriptografis")}
                                {boolTag(result.valid_integritas, "Integritas")}
                                {boolTag(result.valid_sertifikat, "Sertifikat")}
                                <Tag
                                    value={`Dokumen Diubah: ${result.dokumen_diubah ? "Ya" : "Tidak"}`}
                                    severity={result.dokumen_diubah ? "danger" : "success"}
                                    icon={result.dokumen_diubah ? "pi pi-exclamation-triangle" : "pi pi-check-circle"}
                                />
                            </div>
                            <div className="grid text-sm">
                                {[
                                    { label: "Penanda Tangan", value: result.nama_penanda_tangan },
                                    { label: "Nomor Seri", value: result.nomor_seri_sertifikat },
                                    { label: "Penerbit", value: result.penerbit_sertifikat },
                                    { label: "Token", value: result.token_verifikasi },
                                    { label: "Waktu Tanda Tangan", value: result.waktu_tanda_tangan },
                                    { label: "Signature", value: result.signatures?.length ? `${result.signatures.length} signature` : result.dokumen_tertandatangan ? "Ada" : "Tidak ada" },
                                ].map((item) => (
                                    <div key={item.label} className="col-12 md:col-4">
                                        <div className="text-color-secondary text-xs font-bold uppercase mb-1">{item.label}</div>
                                        <div className="font-semibold text-900">{item.value || "-"}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </Card>
        </div>
    );
};

export default Page;
