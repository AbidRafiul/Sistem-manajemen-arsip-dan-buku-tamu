"use client";
import React, { useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Divider } from 'primereact/divider';
import { Tag } from 'primereact/tag';
import { TableProps } from '../interfaces';
import { apiEndpointGet } from '../endpoints';

const Table = ({ state, setState, formik, handleDelete, getData }: TableProps) => {
    const renderHeader = () => {
        return (
            <div className="flex flex-wrap align-items-center justify-content-between gap-3">
                <span className="text-xl font-bold">Daftar Klasifikasi Arsip</span>
                <div className="flex gap-2">
                    <span className="p-input-icon-left">
                        <i className="pi pi-search" />
                        <InputText value={state.searchVal} onChange={(e) => {
                            const value = e.target.value;
                            let _filters = { ...state.filters };
                            _filters['global'].value = value;
                            setState(p => ({ ...p, searchVal: value, filters: _filters }));
                        }} placeholder="Cari..." />
                    </span>
                </div>
            </div>
        );
    };

    const actionBodyTemplate = (rowData: any) => {
        return (
            <div className="flex gap-2 justify-content-center">
                <Button type="button" icon="pi pi-pencil" outlined onClick={() => { formik.setValues((p: any) => ({ ...p, ...rowData })); setState(p => ({ ...p, edit: true, add: false })); }} tooltip="Edit" tooltipOptions={{ position: 'top' }} />
                <Button type="button" icon="pi pi-trash" outlined severity="danger" onClick={() => setState((p) => ({ ...p, selectedData: [rowData], delete: true }))} tooltip="Hapus" tooltipOptions={{ position: 'top' }} />
            </div>
        );
    };

    const statusBodyTemplate = (rowData: any) => {
        const isActive = rowData.status === 'active';
        return (
                            <div className="flex justify-content-center">
                                {isActive ? (
                                    <div className="bg-green-500 flex align-items-center justify-content-center" style={{ width: '24px', height: '24px', borderRadius: '4px' }}>
                                        <i className="pi pi-check text-white" style={{ fontSize: '0.8rem' }}></i>
                                    </div>
                                ) : (
                                    <div className="bg-red-500 flex align-items-center justify-content-center" style={{ width: '24px', height: '24px', borderRadius: '4px' }}>
                                        <i className="pi pi-times text-white" style={{ fontSize: '0.8rem' }}></i>
                                    </div>
                                )}
                            </div>
                        );
    };

    useEffect(() => {
        getData(apiEndpointGet);
    }, []);

    return (
        <div className="card shadow-2 border-1 surface-border border-round-xl p-4 bg-white">
            <div className="flex flex-column gap-2 mb-6 px-1">
                <h3 className="text-2xl font-semibold m-0 text-900">Data Master Klasifikasi Arsip</h3>
                <div className="text-sm text-600">
                    Kelola kode klasifikasi arsip untuk penomoran surat, dokumen dinas, dan pengarsipan sistematis.
                </div>
            </div>

            <div className="flex justify-content-between align-items-center w-full mb-3 px-1">
                <div className="flex flex-row flex-wrap align-items-center gap-2">

                <Button type="button" size="small" label="Tambah" icon="pi pi-plus" outlined onClick={() => {
                    formik.resetForm();
                    setState(p => ({ ...p, add: true, selectedData: [] }));
                }} />
                <Divider layout="vertical" className="hidden md:inline" />
                <Button type="button" size="small" label={"Hapus" + (state.selectedData.length> 0 ? " (" + state.selectedData.length + ")" : "")} icon="pi pi-trash" outlined severity="danger" onClick={() => setState(p => ({ ...p, delete: true }))} disabled={state.selectedData.length === 0} />
                <Divider layout="vertical" className="hidden md:inline" />
                <Button type="button" size="small" label="Refresh" icon="pi pi-refresh" outlined onClick={() => getData(apiEndpointGet)} loading={state.load} />
                                </div>
                <div className="flex align-items-center gap-3 surface-50 p-2 border-round text-sm w-fit ml-auto" style={{ border: '1px solid var(--surface-200)' }}>
                    <div className="flex align-items-center gap-2 font-semibold text-600">
                        <i className="pi pi-info-circle"></i> KETERANGAN STATUS:
                    </div>
                    <div className="flex align-items-center gap-2 ml-2">
                        <div className="bg-green-500 flex align-items-center justify-content-center" style={{ width: '18px', height: '18px', borderRadius: '3px' }}>
                            <i className="pi pi-check text-white" style={{ fontSize: '0.6rem' }}></i>
                        </div>
                        <span className="text-700 font-medium text-xs">Aktif</span>
                    </div>
                    <div className="flex align-items-center gap-2 ml-2">
                        <div className="bg-red-500 flex align-items-center justify-content-center" style={{ width: '18px', height: '18px', borderRadius: '3px' }}>
                            <i className="pi pi-times text-white" style={{ fontSize: '0.6rem' }}></i>
                        </div>
                        <span className="text-700 font-medium text-xs">Tidak Aktif</span>
                    </div>
                </div>
                
                </div>

            
                <DataTable value={state.data} selection={state.selectedData} onSelectionChange={(e) => setState(p => ({ ...p, selectedData: e.value }))} dataKey="id_klasifikasi" paginator rows={10} rowsPerPageOptions={[5, 10, 25]} globalFilterFields={["kode_klasifikasi","nama_klasifikasi","deskripsi","status"]} filters={state.filters} header={renderHeader()} emptyMessage="Tidak ada data ditemukan." loading={state.load} paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown" currentPageReportTemplate="Menampilkan {first} - {last} dari {totalRecords} data">
                <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
                <Column body={statusBodyTemplate} header=""   style={{ width: '3rem', textAlign: 'center' }}></Column>
                    <Column field="kode_klasifikasi" header="Kode Klasifikasi" sortable className="font-semibold text-primary"></Column>
                <Column field="nama_klasifikasi" header="Nama Klasifikasi" sortable></Column>
                <Column field="deskripsi" header="Deskripsi" sortable></Column>
                
                <Column body={actionBodyTemplate} exportable={false} align="center" header="Aksi" style={{ minWidth: '8rem', textAlign: 'center' }}></Column>
            </DataTable>
        </div>
    );
};
export default Table;
