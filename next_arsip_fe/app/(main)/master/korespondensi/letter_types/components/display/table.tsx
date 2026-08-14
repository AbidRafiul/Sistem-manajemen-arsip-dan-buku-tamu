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

const directionLabels: Record<string, string> = {
    incoming: 'Masuk',
    outgoing: 'Keluar',
    both: 'Masuk & Keluar'
};

const Table = ({ state, setState, formik, getData }: TableProps) => {
    const renderHeader = () => {
        return (
            <div className="flex flex-wrap align-items-center justify-content-between gap-3">
                <span className="text-xl font-bold">Daftar Jenis Surat</span>
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText value={state.searchVal} onChange={(e) => {
                        const value = e.target.value;
                        const filters = { ...state.filters };
                        filters.global.value = value;
                        setState((p) => ({ ...p, searchVal: value, filters }));
                    }} placeholder="Cari..." />
                </span>
            </div>
        );
    };

    const actionBodyTemplate = (rowData: any) => {
        return (
            <div className="flex gap-2 justify-content-center">
                <Button type="button" icon="pi pi-pencil" outlined onClick={() => {
                    formik.setValues((p: any) => ({ ...p, ...rowData }));
                    setState((p) => ({ ...p, edit: true, add: false }));
                }} tooltip="Edit" tooltipOptions={{ position: 'top' }} />
                <Button type="button" icon="pi pi-trash" outlined severity="danger" onClick={() => setState((p) => ({ ...p, selectedData: [rowData], delete: true }))} tooltip="Hapus" tooltipOptions={{ position: 'top' }} />
            </div>
        );
    };

    const directionBodyTemplate = (rowData: any) => {
        const value = rowData.arah_surat || '';
        return <Tag value={directionLabels[value] || value} severity={value === 'outgoing' ? 'warning' : value === 'both' ? 'info' : 'success'} className="text-sm" />;
    };

    const statusBodyTemplate = (rowData: any) => {
        const isActive = rowData.status === 'active';
        return <Tag value={isActive ? 'Aktif' : 'Tidak Aktif'} severity={isActive ? 'success' : 'danger'} className="text-sm" />;
    };

    useEffect(() => {
        getData(apiEndpointGet);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="card shadow-2 border-round-lg p-4 bg-white">
            <div className="flex justify-content-between align-items-center mb-3">
                <div>
                    <h3 className="text-2xl font-bold m-0 text-900">Manajemen Jenis Surat</h3>
                    <p className="text-sm text-600 mt-1">Kelola jenis surat untuk klasifikasi surat masuk dan surat keluar.</p>
                </div>
            </div>

            <div className="flex flex-row flex-wrap align-items-center gap-2 mb-3">
                <Button type="button" size="small" label="Tambah" icon="pi pi-plus" outlined severity="success" onClick={() => {
                    formik.resetForm();
                    setState((p) => ({ ...p, add: true, selectedData: [] }));
                }} />
                <Divider layout="vertical" className="hidden md:inline" />
                <Button type="button" size="small" label={"Hapus" + (state.selectedData.length> 0 ? " (" + state.selectedData.length + ")" : "")} icon="pi pi-trash" outlined severity="danger" onClick={() => setState((p) => ({ ...p, delete: true }))} disabled={state.selectedData.length === 0} />
                <Divider layout="vertical" className="hidden md:inline" />
                <Button type="button" size="small" label="Refresh" icon="pi pi-refresh" outlined onClick={() => getData(apiEndpointGet)} loading={state.load} />
            </div>

            <DataTable value={state.data} selection={state.selectedData} onSelectionChange={(e) => setState((p) => ({ ...p, selectedData: e.value }))} dataKey="jenis_surat_id" paginator rows={10} rowsPerPageOptions={[5, 10, 25]} globalFilterFields={["kode_jenis_surat", "nama_jenis_surat", "arah_surat", "deskripsi", "status"]} filters={state.filters} header={renderHeader()} emptyMessage="Tidak ada data ditemukan." loading={state.load} paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown" currentPageReportTemplate="Menampilkan {first} - {last} dari {totalRecords} data">
                <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
                <Column field="kode_jenis_surat" header="Kode Jenis" sortable className="font-semibold text-primary"></Column>
                <Column field="nama_jenis_surat" header="Nama Jenis Surat" sortable></Column>
                <Column body={directionBodyTemplate} header="Arah Surat" sortable sortField="arah_surat" style={{ width: '12rem' }}></Column>
                <Column field="deskripsi" header="Deskripsi" sortable></Column>
                <Column body={statusBodyTemplate} header="Status" style={{ width: '10rem' }}></Column>
                <Column body={actionBodyTemplate} exportable={false} header="Aksi" style={{ minWidth: '8rem', textAlign: 'center' }}></Column>
            </DataTable>
        </div>
    );
};

export default Table;
