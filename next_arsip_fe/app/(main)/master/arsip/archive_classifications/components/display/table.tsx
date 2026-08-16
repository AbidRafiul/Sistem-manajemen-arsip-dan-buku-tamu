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
        return <Tag value={isActive ? 'Aktif' : 'Tidak Aktif'} severity={isActive ? 'success' : 'danger'} className="text-sm" />;
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

            <div className="flex flex-row flex-wrap align-items-center gap-2 mb-3">
                <Button type="button" size="small" label="Tambah" icon="pi pi-plus" outlined severity="primary" onClick={() => {
                    formik.resetForm();
                    setState(p => ({ ...p, add: true, selectedData: [] }));
                }} />
                <Divider layout="vertical" className="hidden md:inline" />
                <Button type="button" size="small" label={"Hapus" + (state.selectedData.length> 0 ? " (" + state.selectedData.length + ")" : "")} icon="pi pi-trash" outlined severity="danger" onClick={() => setState(p => ({ ...p, delete: true }))} disabled={state.selectedData.length === 0} />
                <Divider layout="vertical" className="hidden md:inline" />
                <Button type="button" size="small" label="Refresh" icon="pi pi-refresh" outlined onClick={() => getData(apiEndpointGet)} loading={state.load} />
            </div>

            <DataTable value={state.data} selection={state.selectedData} onSelectionChange={(e) => setState(p => ({ ...p, selectedData: e.value }))} dataKey="id_klasifikasi" paginator rows={10} rowsPerPageOptions={[5, 10, 25]} globalFilterFields={["kode_klasifikasi","nama_klasifikasi","deskripsi","status"]} filters={state.filters} header={renderHeader()} emptyMessage="Tidak ada data ditemukan." loading={state.load} paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown" currentPageReportTemplate="Menampilkan {first} - {last} dari {totalRecords} data">
                <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
                <Column field="kode_klasifikasi" header="Kode Klasifikasi" sortable className="font-semibold text-primary"></Column>
                <Column field="nama_klasifikasi" header="Nama Klasifikasi" sortable></Column>
                <Column field="deskripsi" header="Deskripsi" sortable></Column>
                <Column body={statusBodyTemplate} header="Status" style={{ width: '10%' }}></Column>
                <Column body={actionBodyTemplate} exportable={false} align="center" header="Aksi" style={{ minWidth: '8rem', textAlign: 'center' }}></Column>
            </DataTable>
        </div>
    );
};
export default Table;
