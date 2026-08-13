'use client';

import React, { useState, useRef } from 'react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { ProgressBar } from 'primereact/progressbar';
import { Tag } from 'primereact/tag';
import * as XLSX from 'xlsx';
import postData from '@/lib/axios/postData';

export interface ExcelColumn {
    field: string;
    header: string;
    required?: boolean;
    example?: string | number;
    type?: 'string' | 'number' | 'boolean';
}

export interface ExcelBulkActionProps {
    title: string;
    columns: ExcelColumn[];
    data: any[];
    apiEndpointCreate: string;
    onSuccess: () => void;
    toast?: any;
    customPayloadMap?: (row: Record<string, any>) => Record<string, any>;
    customExportMap?: (data: any[]) => any[];
}

const ExcelBulkAction: React.FC<ExcelBulkActionProps> = ({
    title,
    columns,
    data,
    apiEndpointCreate,
    onSuccess,
    toast,
    customPayloadMap,
    customExportMap
}) => {
    const [visible, setVisible] = useState(false);
    const [parsedRows, setParsedRows] = useState<any[]>([]);
    const [isImporting, setIsImporting] = useState(false);
    const [progress, setProgress] = useState({ current: 0, total: 0, success: 0, fail: 0 });
    const [errors, setErrors] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // 1. Export Data to Excel
    const handleExport = () => {
        if (!data || data.length === 0) {
            toast?.current?.show({ severity: 'warn', summary: 'Peringatan', detail: 'Tidak ada data untuk diekspor.' });
            return;
        }

        const sourceData = customExportMap ? customExportMap(data) : data;
        const exportRows = sourceData.map((item, idx) => {
            const row: Record<string, any> = { No: idx + 1 };
            columns.forEach((col) => {
                let val = item[col.field];
                if (val === undefined || val === null) val = '';
                row[col.header] = val;
            });
            return row;
        });

        const ws = XLSX.utils.json_to_sheet(exportRows);

        // Auto fit column width
        const colWidths = [{ wch: 6 }, ...columns.map(col => ({ wch: Math.max(col.header.length + 6, 20) }))];
        ws['!cols'] = colWidths;

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Data');

        const fileName = `Export_${title.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`;
        XLSX.writeFile(wb, fileName);

        toast?.current?.show({ severity: 'success', summary: 'Export Sukses', detail: `Berhasil mengunduh file ${fileName}` });
    };

    // 2. Download Official Excel Template
    const handleDownloadTemplate = () => {
        const templateRow: Record<string, any> = {};
        columns.forEach((col) => {
            const headerName = `${col.header}${col.required ? ' *' : ''}`;
            templateRow[headerName] = col.example !== undefined ? col.example : '';
        });

        const ws = XLSX.utils.json_to_sheet([templateRow]);
        const colWidths = columns.map(col => ({ wch: Math.max((col.header.length + 8), 24) }));
        ws['!cols'] = colWidths;

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Template');

        const fileName = `Template_Import_${title.replace(/\s+/g, '_')}.xlsx`;
        XLSX.writeFile(wb, fileName);

        toast?.current?.show({ severity: 'info', summary: 'Template Diunduh', detail: 'Silakan isi data sesuai format kolom pada template.' });
    };

    // 3. Handle File Upload and Parse Excel/CSV
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const bstr = evt.target?.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsName = wb.SheetNames[0];
                const ws = wb.Sheets[wsName];
                const rawData: any[] = XLSX.utils.sheet_to_json(ws);

                if (!rawData || rawData.length === 0) {
                    toast?.current?.show({ severity: 'warn', summary: 'Kosong', detail: 'File Excel tidak berisi data.' });
                    return;
                }

                // Map Excel headers back to payload fields
                const mappedData = rawData.map((row) => {
                    const item: Record<string, any> = {};
                    columns.forEach((col) => {
                        const headerReq = `${col.header} *`;
                        const headerNorm = col.header;
                        let val = row[headerReq] !== undefined ? row[headerReq] : (row[headerNorm] !== undefined ? row[headerNorm] : (row[col.field] !== undefined ? row[col.field] : null));

                        if (val !== null && val !== undefined && val !== '') {
                            if (col.type === 'number') {
                                const num = Number(val);
                                item[col.field] = isNaN(num) ? val : num;
                            } else if (col.type === 'boolean') {
                                item[col.field] = String(val).toLowerCase() === 'true' || String(val) === '1' || String(val).toLowerCase() === 'aktif';
                            } else {
                                item[col.field] = String(val).trim();
                            }
                        }
                    });

                    return customPayloadMap ? customPayloadMap(item) : item;
                });

                setParsedRows(mappedData);
                setProgress({ current: 0, total: mappedData.length, success: 0, fail: 0 });
                setErrors([]);
            } catch (err) {
                toast?.current?.show({ severity: 'error', summary: 'Error File', detail: 'Gagal membaca file. Pastikan format valid (.xlsx, .xls, .csv).' });
            }
        };
        reader.readAsBinaryString(file);
    };

    // 4. Run Sequential Bulk Import with Live Progress
    const handleBulkImport = async () => {
        if (parsedRows.length === 0) return;

        setIsImporting(true);
        let succ = 0;
        let fail = 0;
        const errList: string[] = [];

        for (let i = 0; i < parsedRows.length; i++) {
            const row = parsedRows[i];
            try {
                await postData(apiEndpointCreate, row);
                succ++;
            } catch (e: any) {
                fail++;
                const msg = e?.response?.data?.message || e.message || 'Gagal menyimpan ke database';
                const idLabel = row[columns[0]?.field] || row[columns[1]?.field] || `Baris #${i + 1}`;
                errList.push(`Baris #${i + 1} (${idLabel}): ${msg}`);
            }
            setProgress({ current: i + 1, total: parsedRows.length, success: succ, fail: fail });
            setErrors([...errList]);
        }

        setIsImporting(false);

        if (succ > 0) {
            toast?.current?.show({
                severity: 'success',
                summary: 'Bulk Import Selesai',
                detail: `Berhasil mengimpor ${succ} data! (${fail} gagal)`
            });
            onSuccess();
        } else if (fail > 0) {
            toast?.current?.show({
                severity: 'error',
                summary: 'Bulk Import Gagal',
                detail: `Semua ${fail} data gagal diimpor. Periksa daftar error.`
            });
        }
    };

    const progressPercent = progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0;

    return (
        <React.Fragment>
            <div className="flex align-items-center gap-2">
                <Button
                    label="Import Excel"
                    icon="pi pi-cloud-upload"
                    severity="info"
                    outlined
                    onClick={() => { setParsedRows([]); setErrors([]); setVisible(true); }}
                    tooltip={`Import bulk data ${title} dari Excel/CSV`}
                    tooltipOptions={{ position: 'top' }}
                />
                <Button
                    label="Export Excel"
                    icon="pi pi-file-excel"
                    severity="success"
                    outlined
                    onClick={handleExport}
                    disabled={!data || data.length === 0}
                    tooltip={`Export data ${title} ke Excel (.xlsx)`}
                    tooltipOptions={{ position: 'top' }}
                />
            </div>

            <Dialog
                visible={visible}
                onHide={() => !isImporting && setVisible(false)}
                header={`Bulk Import ${title} dari Excel / CSV`}
                style={{ width: '55rem' }}
                modal
                className="p-fluid"
                closable={!isImporting}
            >
                <div className="flex flex-column gap-4">
                    {/* Step 1: Download Template */}
                    <div className="p-3 bg-blue-50 border-round-lg border-1 border-blue-200">
                        <div className="flex align-items-center justify-content-between flex-wrap gap-2">
                            <div>
                                <h6 className="m-0 font-bold text-blue-900 text-sm mb-1"><i className="pi pi-step-forward mr-2"></i>Langkah 1: Unduh Template Resmi</h6>
                                <span className="text-xs text-blue-700 block">Gunakan template Excel resmi ini. Kolom bertanda tanda bintang (*) wajib diisi.</span>
                            </div>
                            <Button
                                type="button"
                                label="Unduh Template (.xlsx)"
                                icon="pi pi-download"
                                severity="success"
                                size="small"
                                onClick={handleDownloadTemplate}
                                className="w-auto py-1 px-3 text-xs shadow-1"
                            />
                        </div>
                    </div>

                    {/* Step 2: Upload File */}
                    <div className="p-3 bg-50 border-round-lg border-1 border-200">
                        <h6 className="m-0 font-bold text-700 text-sm mb-2"><i className="pi pi-step-forward mr-2"></i>Langkah 2: Pilih File Excel / CSV yang Sudah Diisi</h6>
                        <div className="flex align-items-center gap-3">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".xlsx, .xls, .csv"
                                onChange={handleFileUpload}
                                className="hidden"
                            />
                            <Button
                                type="button"
                                label="Pilih File Excel/CSV..."
                                icon="pi pi-folder-open"
                                severity="secondary"
                                outlined
                                onClick={() => fileInputRef.current?.click()}
                                className="w-auto py-2 px-3 text-xs"
                                disabled={isImporting}
                            />
                            {parsedRows.length > 0 && (
                                <Tag severity="success" value={`${parsedRows.length} Baris Siap Diimpor`} icon="pi pi-check" className="text-xs px-3 py-1" />
                            )}
                        </div>
                    </div>

                    {/* Step 3: Preview Data & Import */}
                    {parsedRows.length > 0 && (
                        <div>
                            <div className="flex align-items-center justify-content-between mb-2">
                                <h6 className="m-0 font-bold text-700 text-sm"><i className="pi pi-step-forward mr-2"></i>Langkah 3: Review & Mulai Import</h6>
                                <span className="text-xs text-500">Menampilkan pratinjau data (maksimal 5 baris per halaman)</span>
                            </div>

                            <DataTable value={parsedRows} paginator rows={5} className="p-datatable-sm border-round border-1 border-200 mb-3" emptyMessage="Data kosong">
                                <Column header="No" body={(_, opts) => opts.rowIndex + 1} style={{ width: '3rem' }} />
                                {columns.map((col) => (
                                    <Column key={col.field} field={col.field} header={col.header} style={{ maxWidth: '12rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} />
                                ))}
                            </DataTable>

                            {/* Progress Bar during/after import */}
                            {(isImporting || progress.current > 0) && (
                                <div className="p-3 bg-100 border-round-lg mb-3 border-1 border-300">
                                    <div className="flex justify-content-between text-xs font-semibold mb-1">
                                        <span>Proses: {progress.current} / {progress.total} baris ({progressPercent}%)</span>
                                        <div className="flex gap-2">
                                            <span className="text-green-600">Sukses: {progress.success}</span>
                                            <span className="text-red-600">Gagal: {progress.fail}</span>
                                        </div>
                                    </div>
                                    <ProgressBar value={progressPercent} style={{ height: '8px' }} showValue={false} />
                                </div>
                            )}

                            {/* Error List if any */}
                            {errors.length > 0 && (
                                <div className="p-3 bg-red-50 border-round-lg border-1 border-red-300 max-h-10rem overflow-auto">
                                    <span className="text-xs font-bold text-red-900 block mb-1"><i className="pi pi-exclamation-triangle mr-1"></i>Daftar Gagal ({errors.length} baris):</span>
                                    <ul className="m-0 pl-3 text-xs text-red-800 flex flex-column gap-1">
                                        {errors.map((err, idx) => (
                                            <li key={idx}>{err}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <div className="flex justify-content-end gap-2 mt-3">
                                <Button
                                    type="button"
                                    label="Batal"
                                    icon="pi pi-times"
                                    severity="secondary"
                                    outlined
                                    onClick={() => setVisible(false)}
                                    disabled={isImporting}
                                    className="w-auto px-4"
                                />
                                <Button
                                    type="button"
                                    label={isImporting ? `Mengimpor (${progress.current}/${progress.total})...` : "Mulai Sekarang"}
                                    icon="pi pi-check"
                                    severity="success"
                                    onClick={handleBulkImport}
                                    disabled={isImporting || parsedRows.length === 0}
                                    loading={isImporting}
                                    className="w-auto px-4 font-bold shadow-2"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </Dialog>
        </React.Fragment>
    );
};

export default ExcelBulkAction;
