'use client'

import React from "react";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { Divider } from "primereact/divider";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Tag } from "primereact/tag";
import { Toast } from "primereact/toast";
import { formatDateCalendar } from "@/lib/tools/dateTools";
import { DetailData, VersionData } from "../../../../components/interfaces";

interface TableProps {
    load: boolean;
    detailData: DetailData | null;
    newVersionFile: File | null;
    setNewVersionFile: (file: File | null) => void;
    changeNotes: string;
    setChangeNotes: (notes: string) => void;
    approveDialogVisible: boolean;
    setApproveDialogVisible: (visible: boolean) => void;
    rejectDialogVisible: boolean;
    setRejectDialogVisible: (visible: boolean) => void;
    rejectNotes: string;
    setRejectNotes: (notes: string) => void;
    selectedVersionId: number | null;
    setSelectedVersionId: (id: number | null) => void;
    canApproveVersion: boolean;
    highestVersionNumber: number;
    uploadVersion: () => Promise<void>;
    downloadVersion: (version: VersionData) => Promise<void>;
    rollbackVersion: (version: VersionData) => Promise<void>;
    approveVersion: (versionId: number, status: 'approved' | 'rejected', notes?: string) => Promise<void>;
    submitRejection: () => Promise<void>;
    fetchDocumentDetail: () => Promise<void>;
    router: any;
    toast: React.RefObject<Toast>;
}

const Table: React.FC<TableProps> = ({
    load,
    detailData,
    newVersionFile,
    setNewVersionFile,
    changeNotes,
    setChangeNotes,
    approveDialogVisible,
    setApproveDialogVisible,
    rejectDialogVisible,
    setRejectDialogVisible,
    rejectNotes,
    setRejectNotes,
    selectedVersionId,
    setSelectedVersionId,
    canApproveVersion,
    highestVersionNumber,
    uploadVersion,
    downloadVersion,
    rollbackVersion,
    approveVersion,
    submitRejection,
    fetchDocumentDetail,
    router,
    toast
}) => {
    const selectedVersion = (detailData?.versions || []).find(
        (version) => version.id_versi === selectedVersionId,
    );

    const closeApproveDialog = () => {
        setApproveDialogVisible(false);
        setSelectedVersionId(null);
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
                            onClick={() => {
                                setSelectedVersionId(rowData.id_versi);
                                setApproveDialogVisible(true);
                            }}
                        />
                        <Button
                            icon="pi pi-times"
                            rounded
                            outlined
                            severity="danger"
                            className="p-button-sm"
                            tooltip="Tolak Versi"
                            onClick={() => {
                                setSelectedVersionId(rowData.id_versi);
                                setRejectNotes('');
                                setRejectDialogVisible(true);
                            }}
                        />
                    </>
                )}
            </div>
        );
    };

    const approveDialogFooter = (
        <div className="flex justify-content-end gap-2 mt-3">
            <Button
                label="Batal"
                icon="pi pi-times"
                outlined
                severity="secondary"
                onClick={closeApproveDialog}
                disabled={load}
                className="p-button-sm font-semibold"
            />
            <Button
                label="Ya, Setujui"
                icon="pi pi-check"
                severity="success"
                loading={load}
                disabled={!selectedVersionId}
                onClick={async () => {
                    if (!selectedVersionId) return;
                    await approveVersion(selectedVersionId, 'approved');
                    closeApproveDialog();
                }}
                className="p-button-sm font-semibold"
            />
        </div>
    );

    const rejectDialogFooter = (
        <div className="flex justify-content-end gap-2 mt-3">
            <Button
                label="Batal"
                icon="pi pi-times"
                outlined
                severity="secondary"
                onClick={() => setRejectDialogVisible(false)}
                className="p-button-sm font-semibold"
            />
            <Button
                label="Tolak Versi"
                icon="pi pi-check"
                severity="danger"
                onClick={submitRejection}
                disabled={!rejectNotes.trim()}
                className="p-button-sm font-semibold"
            />
        </div>
    );

    return (
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

            <Dialog
                header={
                    <div className="flex align-items-center gap-2">
                        <i className="pi pi-check-circle text-green-500 text-xl" />
                        <span className="font-bold">Setujui Versi Dokumen</span>
                    </div>
                }
                visible={approveDialogVisible}
                style={{ width: '450px', maxWidth: '95vw' }}
                modal
                footer={approveDialogFooter}
                closable={!load}
                onHide={closeApproveDialog}
            >
                <div className="flex flex-column gap-3 pt-2">
                    <div className="p-3 border-round-lg border-1 bg-green-50 border-green-100">
                        <div className="flex align-items-start gap-3">
                            <i className="pi pi-file-check text-green-600 text-2xl mt-1" />
                            <div>
                                <div className="font-semibold text-900 mb-1">
                                    Konfirmasi Persetujuan
                                </div>
                                <p className="m-0 text-sm text-color-secondary line-height-3">
                                    Apakah Anda yakin ingin menyetujui versi{' '}
                                    <strong className="text-900">
                                        V{selectedVersion?.nomor_versi || '-'}
                                    </strong>{' '}
                                    untuk dokumen{' '}
                                    <strong className="text-900">
                                        {detailData?.document?.nama_dokumen || '-'}
                                    </strong>?
                                </p>
                            </div>
                        </div>
                    </div>
                    <small className="text-color-secondary">
                        Status versi akan berubah menjadi disetujui dan tercatat pada riwayat dokumen.
                    </small>
                </div>
            </Dialog>

            <Dialog
                header="Tolak Versi Dokumen"
                visible={rejectDialogVisible}
                style={{ width: '450px' }}
                modal
                className="p-fluid"
                footer={rejectDialogFooter}
                onHide={() => setRejectDialogVisible(false)}
            >
                <div className="flex flex-column gap-3">
                    <div className="flex align-items-center gap-2 text-red-600 font-semibold mb-2">
                        <i className="pi pi-exclamation-triangle text-2xl"></i>
                        <span>Tindakan ini tidak dapat dibatalkan</span>
                    </div>
                    <p className="text-sm text-color-secondary m-0">
                        Harap berikan alasan yang jelas mengapa Anda menolak versi dokumen ini. Alasan ini akan disimpan di riwayat persetujuan dokumen.
                    </p>
                    <div className="field mt-2">
                        <label htmlFor="alasan" className="block text-sm font-semibold mb-2 text-color">
                            Alasan Penolakan <span className="text-red-500">*</span>
                        </label>
                        <InputTextarea
                            id="alasan"
                            value={rejectNotes}
                            onChange={(e) => setRejectNotes(e.target.value)}
                            required
                            rows={5}
                            autoResize
                            placeholder="Contoh: File dokumen buram atau data tidak sesuai dengan draft awal."
                            className="w-full text-sm"
                        />
                    </div>
                </div>
            </Dialog>
        </div>
    );
};

export default Table;
