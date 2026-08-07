'use client';

import getDataRequest from "@/lib/axios/getData";
import postData from "@/lib/axios/postData";
import putData from "@/lib/axios/putData";
import { showError, showSuccess } from "@/lib/tools/generalTools";
import { usePermissions } from "@/hooks/usePermissions";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Tag } from "primereact/tag";
import { Toast } from "primereact/toast";
import { useSession } from "next-auth/react";
import { FilterMatchMode } from "primereact/api";
import { useEffect, useRef, useState } from "react";
import { apiEndpointCertificates } from "../components/endpoints";
import { TteCertificateForm, TteCertificatePageState, TteCertificateRow } from "../components/interfaces";
import { formatDate, statusIcon, statusTone } from "../components/utils";

const emptyForm: TteCertificateForm = {
    id_sertifikat_elektronik: null,
    id_pengguna: null,
    nama_sertifikat: "",
    alias_sertifikat: "",
    nomor_seri: "",
    subjek_sertifikat: "",
    penerbit_sertifikat: "",
    algoritma_tanda_tangan: "RSA-SHA256",
    algoritma_hash: "SHA-256",
    lokasi_keystore: "",
    berlaku_mulai: "",
    berlaku_sampai: "",
    status_sertifikat: "aktif",
};

const statusOptions = [
    { label: "Aktif", value: "aktif" },
    { label: "Nonaktif", value: "nonaktif" },
    { label: "Kedaluwarsa", value: "kedaluwarsa" },
];

const Page = () => {
    const toast = useRef<Toast>(null);
    const { data: session } = useSession();
    const permissions = usePermissions();

    const [state, setState] = useState<TteCertificatePageState>({
        load: false,
        data: [],
        filters: { global: { value: null, matchMode: FilterMatchMode.CONTAINS } },
        searchVal: "",
        dialog: false,
        editMode: false,
        formData: emptyForm,
        session: null,
    });

    const getData = async (apiEndpoint: string, payload: Record<string, any> = {}) => {
        setState((p) => ({ ...p, load: true }));
        try {
            const res = await getDataRequest(apiEndpoint, payload);
            setState((p) => ({ ...p, data: res.data?.data || [] }));
        } catch (error: any) {
            const e = error?.response?.data || error;
            showError(toast, e?.message || "Sertifikat elektronik gagal diambil");
        } finally {
            setState((p) => ({ ...p, load: false }));
        }
    };

    const refreshData = () => getData(apiEndpointCertificates, { keyword: state.searchVal || "" });

    const openCreate = () => {
        if (!permissions.canCreate) {
            showError(toast, "Anda tidak memiliki hak membuat sertifikat");
            return;
        }
        setState((p) => ({ ...p, dialog: true, editMode: false, formData: emptyForm }));
    };

    const openEdit = (row: TteCertificateRow) => {
        if (!permissions.canUpdate) {
            showError(toast, "Anda tidak memiliki hak mengubah sertifikat");
            return;
        }
        setState((p) => ({
            ...p,
            dialog: true,
            editMode: true,
            formData: {
                id_sertifikat_elektronik: row.id_sertifikat_elektronik,
                id_pengguna: row.id_pengguna || null,
                nama_sertifikat: row.nama_sertifikat || "",
                alias_sertifikat: row.alias_sertifikat || "",
                nomor_seri: row.nomor_seri || "",
                subjek_sertifikat: row.subjek_sertifikat || "",
                penerbit_sertifikat: row.penerbit_sertifikat || "",
                algoritma_tanda_tangan: row.algoritma_tanda_tangan || "RSA-SHA256",
                algoritma_hash: row.algoritma_hash || "SHA-256",
                lokasi_keystore: row.lokasi_keystore || "",
                berlaku_mulai: row.berlaku_mulai?.slice(0, 10) || "",
                berlaku_sampai: row.berlaku_sampai?.slice(0, 10) || "",
                status_sertifikat: row.status_sertifikat || "aktif",
            },
        }));
    };

    const updateForm = (key: keyof TteCertificateForm, value: any) => {
        setState((p) => ({
            ...p,
            formData: {
                ...p.formData,
                [key]: value,
            },
        }));
    };

    const saveCertificate = async () => {
        const payload = {
            ...state.formData,
            id_pengguna: state.formData.id_pengguna || null,
            berlaku_mulai: state.formData.berlaku_mulai || null,
            berlaku_sampai: state.formData.berlaku_sampai || null,
        };

        if (!payload.nama_sertifikat || !payload.nomor_seri || !payload.lokasi_keystore) {
            showError(toast, "Nama, nomor seri, dan lokasi keystore wajib diisi");
            return;
        }

        setState((p) => ({ ...p, load: true }));
        try {
            if (state.editMode && payload.id_sertifikat_elektronik) {
                await putData(`${apiEndpointCertificates}/${payload.id_sertifikat_elektronik}`, payload);
                showSuccess(toast, "Sertifikat elektronik berhasil diperbarui");
            } else {
                await postData(apiEndpointCertificates, payload);
                showSuccess(toast, "Sertifikat elektronik berhasil disimpan");
            }

            setState((p) => ({ ...p, dialog: false, formData: emptyForm, editMode: false }));
            await refreshData();
        } catch (error: any) {
            const e = error?.response?.data || error;
            showError(toast, e?.message || "Sertifikat elektronik gagal disimpan");
        } finally {
            setState((p) => ({ ...p, load: false }));
        }
    };

    const certificateTemplate = (row: TteCertificateRow) => (
        <div>
            <div className="font-semibold text-sm text-900">{row.nama_sertifikat || "-"}</div>
            <div className="text-xs text-color-secondary mt-1">{row.alias_sertifikat || row.nomor_seri || "-"}</div>
        </div>
    );

    const statusTemplate = (row: TteCertificateRow) => (
        <Tag
            value={row.status_sertifikat || "-"}
            severity={statusTone(row.status_sertifikat)}
            icon={statusIcon(row.status_sertifikat)}
        />
    );

    const actionTemplate = (row: TteCertificateRow) => (
        <Button
            icon="pi pi-pencil"
            rounded
            text
            size="small"
            tooltip="Edit"
            tooltipOptions={{ position: "top" }}
            disabled={!permissions.canUpdate}
            onClick={() => openEdit(row)}
        />
    );

    useEffect(() => {
        if (session) setState((p) => ({ ...p, session }));
    }, [session]);

    useEffect(() => {
        refreshData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="w-full">
            <Toast ref={toast} position="top-right" />
            <Card className="shadow-1 border-round-2xl border-none">
                <div className="mb-4">
                    <span className="text-primary font-bold text-xs uppercase" style={{ letterSpacing: "0.1em" }}>
                        Tanda Tangan Elektronik
                    </span>
                    <h2 className="m-0 text-900 font-extrabold text-2xl mt-1 mb-2">Sertifikat Elektronik</h2>
                    <p className="m-0 text-color-secondary text-sm font-medium">
                        Kelola metadata sertifikat internal dan lokasi keystore untuk signing provider.
                    </p>
                </div>

                <div className="flex flex-column md:flex-row md:align-items-center justify-content-between gap-2 mb-4">
                    <Button label="Tambah Sertifikat" icon="pi pi-plus" severity="success" outlined size="small" disabled={!permissions.canCreate} onClick={openCreate} />
                    <div className="flex align-items-center gap-2">
                        <span className="p-input-icon-left">
                            <i className="pi pi-search" />
                            <InputText
                                value={state.searchVal}
                                onChange={(e) => setState((p) => ({ ...p, searchVal: e.target.value }))}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") refreshData();
                                }}
                                placeholder="Cari sertifikat..."
                                className="text-sm"
                                style={{ height: "2.5rem", width: "18rem" }}
                            />
                        </span>
                        <Button icon="pi pi-filter" outlined size="small" onClick={refreshData} style={{ width: "2.5rem", height: "2.5rem" }} />
                    </div>
                </div>

                <DataTable
                    value={state.data}
                    paginator
                    rows={10}
                    rowsPerPageOptions={[10, 25, 50]}
                    loading={state.load}
                    dataKey="id_sertifikat_elektronik"
                    filters={state.filters}
                    globalFilterFields={["nama_sertifikat", "alias_sertifikat", "nomor_seri", "subjek_sertifikat", "penerbit_sertifikat"]}
                    emptyMessage="Belum ada sertifikat elektronik"
                    rowHover
                    className="text-sm"
                >
                    <Column header="Sertifikat" body={certificateTemplate} style={{ minWidth: "220px" }} />
                    <Column field="nomor_seri" header="Nomor Seri" style={{ minWidth: "160px" }} />
                    <Column field="penerbit_sertifikat" header="Penerbit" body={(r) => r.penerbit_sertifikat || "-"} style={{ minWidth: "180px" }} />
                    <Column field="nama_pengguna" header="Pengguna" body={(r) => r.nama_pengguna || r.username_pengguna || "-"} style={{ minWidth: "150px" }} />
                    <Column field="berlaku_sampai" header="Berlaku Sampai" body={(r) => formatDate(r.berlaku_sampai)} style={{ width: "140px" }} />
                    <Column field="status_sertifikat" header="Status" body={statusTemplate} style={{ width: "130px" }} />
                    <Column header="Aksi" body={actionTemplate} style={{ width: "90px", textAlign: "center" }} />
                </DataTable>
            </Card>

            <Dialog
                header={state.editMode ? "Edit Sertifikat Elektronik" : "Tambah Sertifikat Elektronik"}
                visible={state.dialog}
                modal
                style={{ width: "48rem", maxWidth: "96vw" }}
                onHide={() => setState((p) => ({ ...p, dialog: false }))}
            >
                <div className="grid pt-3">
                    {[
                        ["nama_sertifikat", "Nama Sertifikat"],
                        ["alias_sertifikat", "Alias"],
                        ["nomor_seri", "Nomor Seri"],
                        ["subjek_sertifikat", "Subjek"],
                        ["penerbit_sertifikat", "Penerbit"],
                        ["lokasi_keystore", "Lokasi Keystore"],
                    ].map(([key, label]) => (
                        <div key={key} className="col-12 md:col-6">
                            <label className="text-xs font-bold uppercase text-color-secondary mb-2 block">{label}</label>
                            <InputText
                                value={String((state.formData as any)[key] || "")}
                                onChange={(e) => updateForm(key as keyof TteCertificateForm, e.target.value)}
                                className="w-full"
                            />
                        </div>
                    ))}

                    <div className="col-12 md:col-6">
                        <label className="text-xs font-bold uppercase text-color-secondary mb-2 block">Algoritma Tanda Tangan</label>
                        <InputText value={state.formData.algoritma_tanda_tangan} onChange={(e) => updateForm("algoritma_tanda_tangan", e.target.value)} className="w-full" />
                    </div>
                    <div className="col-12 md:col-6">
                        <label className="text-xs font-bold uppercase text-color-secondary mb-2 block">Algoritma Hash</label>
                        <InputText value={state.formData.algoritma_hash} onChange={(e) => updateForm("algoritma_hash", e.target.value)} className="w-full" />
                    </div>
                    <div className="col-12 md:col-4">
                        <label className="text-xs font-bold uppercase text-color-secondary mb-2 block">Berlaku Mulai</label>
                        <InputText type="date" value={state.formData.berlaku_mulai} onChange={(e) => updateForm("berlaku_mulai", e.target.value)} className="w-full" />
                    </div>
                    <div className="col-12 md:col-4">
                        <label className="text-xs font-bold uppercase text-color-secondary mb-2 block">Berlaku Sampai</label>
                        <InputText type="date" value={state.formData.berlaku_sampai} onChange={(e) => updateForm("berlaku_sampai", e.target.value)} className="w-full" />
                    </div>
                    <div className="col-12 md:col-4">
                        <label className="text-xs font-bold uppercase text-color-secondary mb-2 block">Status</label>
                        <Dropdown value={state.formData.status_sertifikat} options={statusOptions} onChange={(e) => updateForm("status_sertifikat", e.value)} className="w-full" />
                    </div>
                </div>

                <div className="flex justify-content-end gap-2 mt-4">
                    <Button label="Batal" icon="pi pi-times" outlined severity="secondary" onClick={() => setState((p) => ({ ...p, dialog: false }))} />
                    <Button label="Simpan" icon="pi pi-save" severity="success" loading={state.load} onClick={saveCertificate} />
                </div>
            </Dialog>
        </div>
    );
};

export default Page;
