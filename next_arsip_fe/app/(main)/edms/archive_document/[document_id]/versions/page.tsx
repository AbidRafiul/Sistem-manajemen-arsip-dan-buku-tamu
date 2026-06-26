'use client'

import fileDownload from "@/lib/axios/fileDownload";
import formUpload from "@/lib/axios/formData";
import getData from "@/lib/axios/getData";
import postData from "@/lib/axios/postData";
import { formatDateCalendar } from "@/lib/tools/dateTools";
import { showError, showSuccess } from "@/lib/tools/generalTools";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Divider } from "primereact/divider";
import { InputText } from "primereact/inputtext";
import { Tag } from "primereact/tag";
import { Toast } from "primereact/toast";
import { useEffect, useMemo, useRef, useState } from "react";
import {
    apiEndpointDocumentDetail,
    apiEndpointVersionApprove,
    apiEndpointVersionDownload,
    apiEndpointVersionRollback,
    apiEndpointVersionUpload,
} from "../../components/endpoints";
import { DetailData, VersionData } from "../../components/interfaces";

const Page = () => {
    const toast = useRef<Toast>(null);
    const router = useRouter();
    const params = useParams();
    const { data: session } = useSession();
    const documentId = Number(Array.isArray(params.document_id) ? params.document_id[0] : params.document_id);

    const [load, setLoad] = useState(false);
    const [detailData, setDetailData] = useState<DetailData | null>(null);
    const [newVersionFile, setNewVersionFile] = useState<File | null>(null);
    const [changeNotes, setChangeNotes] = useState('');

    const sessionUser = session?.user as any;
    const roleKey = String(sessionUser?.role || sessionUser?.roleCode || '').toLowerCase();
    const roleId = Number(sessionUser?.roleId || 0);
    const canApproveVersion = ['superadmin', 'administrator', 'admin', 'adm', 'pimpinan', 'pmn'].includes(roleKey) || [1, 2].includes(roleId);

    const highestVersionNumber = useMemo(() => {
        return Math.max(...(detailData?.versions || []).map((version) => version.nomor_versi), 0);
    }, [detailData?.versions]);

    const fetchDocumentDetail = async () => {
        if (!documentId) return;

        setLoad(true);
        try {
            const res = await getData(apiEndpointDocumentDetail, { id_dokumen: documentId });
            setDetailData(res.data.data || null);
        } catch (error: any) {
            const e = error?.response?.data || error;
            showError(toast, e?.message || 'Gagal mengambil detail dokumen');
        } finally {
            setLoad(false);
        }
    };

    const uploadVersion = async () => {
        if (!documentId || !newVersionFile || !changeNotes.trim()) return;

        setLoad(true);
        try {
            const formData = new FormData();
            formData.append("id_dokumen", String(documentId));
            formData.append("catatan_perubahan", changeNotes.trim());
            formData.append("file", newVersionFile);

            const res = await formUpload(apiEndpointVersionUpload, formData, {});
            showSuccess(toast, res.data?.message || 'Versi dokumen berhasil diupload');
            setNewVersionFile(null);
            setChangeNotes('');
            await fetchDocumentDetail();
        } catch (error: any) {
            const e = error?.response?.data || error;
            showError(toast, e?.message || 'Gagal mengupload versi dokumen');
        } finally {
            setLoad(false);
        }
    };

    const downloadVersion = async (version: VersionData) => {
        setLoad(true);
        try {
            const res = await fileDownload(apiEndpointVersionDownload, { id_versi: version.id_versi });
            const parts = version.file_path.split('.');
            const ext = parts.length > 1 ? parts.pop() : 'pdf';
            const fileName = `${detailData?.document?.nomor_dokumen || 'doc'}_V${version.nomor_versi}.${ext}`;
            const blob = new Blob([res.data]);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            showSuccess(toast, 'File berhasil diunduh');
        } catch (error: any) {
            const e = error?.response?.data || error;
            showError(toast, e?.message || 'Gagal mengunduh file');
        } finally {
            setLoad(false);
        }
    };

    const rollbackVersion = async (version: VersionData) => {
        if (!confirm(`Apakah Anda yakin ingin melakukan rollback ke V${version.nomor_versi}?`)) return;

        setLoad(true);
        try {
            const res = await postData(apiEndpointVersionRollback, {
                id_dokumen: documentId,
                id_versi: version.id_versi,
            });
            showSuccess(toast, res.data?.message || 'Rollback versi berhasil');
            await fetchDocumentDetail();
        } catch (error: any) {
            const e = error?.response?.data || error;
            showError(toast, e?.message || 'Gagal melakukan rollback');
        } finally {
            setLoad(false);
        }
    };

    const approveVersion = async (versionId: number, status: 'approved' | 'rejected') => {
        const notes = status === 'rejected' ? prompt('Masukkan alasan penolakan:') : '';
        if (notes === null) return;

        setLoad(true);
        try {
            const res = await postData(apiEndpointVersionApprove, {
                id_versi: versionId,
                status_persetujuan: status,
                catatan_persetujuan: notes || '',
            });
            showSuccess(toast, res.data?.message || `Versi berhasil ${status}`);
            await fetchDocumentDetail();
        } catch (error: any) {
            const e = error?.response?.data || error;
            showError(toast, e?.message || 'Gagal memproses approval versi');
        } finally {
            setLoad(false);
        }
    };

    const versionStatusTemplate = (rowData: VersionData) => {
        const status = rowData.status_persetujuan || 'pending';
        let severity: 'success' | 'danger' | 'warning' | 'info' = 'warning';
        if (status === 'approved') severity = 'success';
        if (status === 'rejected') severity = 'danger';
        return <Tag value={status === 'approved' ? 'Disetujui' : status === 'rejected' ? 'Ditolak' : 'Pending'} severity={severity} />;
    };

    const versionActionTemplate = (rowData: VersionData) => {
        const isLatest = rowData.nomor_versi === highestVersionNumber;
        const status = rowData.status_persetujuan || 'pending';

        return (
            <div className="flex gap-2 justify-content-center">
                <Button
                    icon="pi pi-download"
                    rounded
                    outlined
                    severity="secondary"
                    className="p-button-sm"
                    tooltip="Unduh File"
                    onClick={() => downloadVersion(rowData)}
                />
                {status === 'approved' && !isLatest && (
                    <Button
                        icon="pi pi-replay"
                        rounded
                        outlined
                        severity="warning"
                        className="p-button-sm"
                        tooltip="Rollback ke versi ini"
                        onClick={() => rollbackVersion(rowData)}
                    />
                )}
                {status === 'pending' && canApproveVersion && (
                    <>
                        <Button
                            icon="pi pi-check"
                            rounded
                            outlined
                            severity="success"
                            className="p-button-sm"
                            tooltip="Setujui Versi"
                            onClick={() => approveVersion(rowData.id_versi, 'approved')}
                        />
                        <Button
                            icon="pi pi-times"
                            rounded
                            outlined
                            severity="danger"
                            className="p-button-sm"
                            tooltip="Tolak Versi"
                            onClick={() => approveVersion(rowData.id_versi, 'rejected')}
                        />
                    </>
                )}
            </div>
        );
    };

    useEffect(() => {
        fetchDocumentDetail();
    }, [documentId]);

    return (
        <div className="p-4">
            <Toast ref={toast} position="top-right" />
            <div className="card p-5">
                <div className="flex flex-column md:flex-row md:align-items-center justify-content-between gap-3 mb-4">
                    <div>
                        <Button
                            type="button"
                            icon="pi pi-arrow-left"
                            label="Kembali"
                            text
                            className="p-0 mb-2"
                            onClick={() => router.push('/edms/archive_document')}
                        />
                        <h3 className="text-2xl font-bold text-color mb-1">Versi Dokumen</h3>
                        <span className="text-color-secondary text-sm">
                            {detailData?.document?.nomor_dokumen || '-'} - {detailData?.document?.nama_dokumen || '-'}
                        </span>
                    </div>
                    <Button
                        size="small"
                        label="Muat Ulang"
                        icon="pi pi-refresh"
                        outlined
                        loading={load}
                        onClick={fetchDocumentDetail}
                    />
                </div>

                <div className="grid text-sm mb-3">
                    <div className="col-12 md:col-3">
                        <div className="text-color-secondary mb-1 font-semibold">Nomor Dokumen</div>
                        <div className="font-semibold text-color">{detailData?.document?.nomor_dokumen || '-'}</div>
                    </div>
                    <div className="col-12 md:col-3">
                        <div className="text-color-secondary mb-1 font-semibold">PIC</div>
                        <div className="text-color">{detailData?.document?.nama_pic || '-'}</div>
                    </div>
                    <div className="col-12 md:col-3">
                        <div className="text-color-secondary mb-1 font-semibold">Tanggal Dokumen</div>
                        <div className="text-color">{detailData?.document?.tanggal ? formatDateCalendar(detailData.document.tanggal, 'yyyy-MM-dd') : '-'}</div>
                    </div>
                    <div className="col-12 md:col-3">
                        <div className="text-color-secondary mb-1 font-semibold">Tanggal Kedaluwarsa</div>
                        <div className="text-color">{detailData?.document?.tanggal_kedaluwarsa ? formatDateCalendar(detailData.document.tanggal_kedaluwarsa, 'yyyy-MM-dd') : '-'}</div>
                    </div>
                </div>

                <Divider />

                <div className="border-1 border-dashed surface-border p-4 flex flex-column gap-3 surface-50 mb-4">
                    <div className="font-semibold text-lg text-color mb-1">Unggah Versi Baru</div>
                    <div className="flex flex-column md:flex-row gap-3 align-items-end">
                        <div className="flex-1 w-full">
                            <label className="block text-color-secondary mb-1 text-sm font-semibold">Pilih File</label>
                            <input
                                type="file"
                                className="p-inputtext w-full text-sm"
                                onChange={(e) => setNewVersionFile(e.target.files?.[0] || null)}
                            />
                        </div>
                        <div className="flex-1 w-full">
                            <label className="block text-color-secondary mb-1 text-sm font-semibold">Catatan Perubahan</label>
                            <InputText
                                className="w-full text-sm"
                                placeholder="Contoh: Memperbarui konten, memperbaiki typo..."
                                value={changeNotes}
                                onChange={(e) => setChangeNotes(e.target.value)}
                            />
                        </div>
                        <Button
                            label="Unggah"
                            icon="pi pi-upload"
                            size="small"
                            disabled={!newVersionFile || !changeNotes.trim() || load}
                            loading={load}
                            onClick={uploadVersion}
                        />
                    </div>
                </div>

                <DataTable
                    value={detailData?.versions || []}
                    loading={load}
                    rows={10}
                    paginator
                    emptyMessage="Belum ada versi dokumen"
                    className="text-sm"
                    dataKey="id_versi"
                >
                    <Column field="nomor_versi" header="Versi" sortable />
                    <Column field="catatan_perubahan" header="Catatan Perubahan" />
                    <Column field="diunggah_oleh" header="Diunggah Oleh" body={(rowData: VersionData) => rowData.diunggah_oleh || '-'} />
                    <Column field="status_persetujuan" header="Status" body={versionStatusTemplate} />
                    <Column field="disetujui_oleh" header="Disetujui/Ditolak Oleh" body={(rowData: VersionData) => rowData.disetujui_oleh || '-'} />
                    <Column field="created_at" header="Tanggal Dibuat" body={(rowData: VersionData) => formatDateCalendar(rowData.created_at)} />
                    <Column headerStyle={{ textAlign: 'center' }} header="Aksi" body={versionActionTemplate} style={{ width: '14rem' }} />
                </DataTable>
            </div>
        </div>
    );
};

export default Page;
