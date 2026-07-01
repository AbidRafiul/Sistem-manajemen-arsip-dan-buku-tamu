"use client";
import { usePermissions } from '@/hooks/usePermissions';
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
    const permissions = usePermissions();
    const { canCreate, canUpdate, canDelete, canApprove } = usePermissions();
    
    const renderHeader = () => {
        return (
            <div className="flex flex-wrap align-items-center justify-content-between gap-2">
                <span className="text-xl font-bold">Manajemen Divisi</span>
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
                {canUpdate && <Button icon="pi pi-pencil" rounded outlined severity="warning" className="p-button-sm" onClick={() => { formik.setValues((p) => ({ ...p, ...rowData })); setState(p => ({ ...p, edit: true, add: false })); }} tooltip="Edit" tooltipOptions={{ position: 'top' }} />}
                
                    {canDelete && <Button icon="pi pi-trash" rounded outlined severity="danger" className="p-button-sm" onClick={() => setState((p) => ({ ...p, selectedData: [rowData], delete: true }))} tooltip="Delete" tooltipOptions={{ position: 'top' }} />}
            </div>
        );
    };

    const statusBodyTemplate = (rowData: any) => {
        const isActive = rowData.status === 'active';
        return <Tag value={isActive ? 'Aktif' : 'Tidak Aktif'} severity={isActive ? 'success' : 'danger'} className="text-sm" />;
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        getData(apiEndpointGet);
    }, []);

    const parentBodyTemplate = (rowData: any) => {
        const parent = state.masterData?.find((d: any) => d.id_cabang === rowData.id_cabang);
        return parent ? parent.nama_cabang : rowData.id_cabang;
    };

    return (
        <div className="card">
            <div className="flex justify-content-between items-start mb-4">
                <div>
                    <h3 className="text-2xl font-semibold">Manajemen Divisi</h3>
                </div>
            </div>

            <div className="flex flex-row flex-wrap items-center gap-2 mb-4">
                
                    {canCreate && (
                    <Button size="small" label="Baru" icon="pi pi-plus" outlined severity="success" onClick={() => {
                    formik.resetForm();
                    setState(p => ({ ...p, add: true, selectedData: [] }));
                }} />
                )}
                <Divider layout="vertical" />
                {canDelete && (
                <Button size="small" label={"Hapus" + (state.selectedData.length > 0 ? " (" + state.selectedData.length + ")" : "")} icon="pi pi-trash" outlined severity="danger" onClick={() => setState(p => ({ ...p, delete: true }))} disabled={state.selectedData.length === 0} />
                )}
                <Divider layout="vertical" />
                <Button size="small" label="Muat Ulang" icon="pi pi-refresh" outlined onClick={() => getData(apiEndpointGet)} loading={state.load} />
            </div>

            <DataTable value={state.data} selection={state.selectedData} onSelectionChange={(e) => setState(p => ({ ...p, selectedData: e.value }))} dataKey="id_divisi" paginator rows={10} rowsPerPageOptions={[5, 10, 25]} globalFilterFields={["id_cabang","kode_divisi","nama_divisi","deskripsi","status"]} filters={state.filters} header={renderHeader()} emptyMessage="Tidak ada data ditemukan." loading={state.load} paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown" currentPageReportTemplate="Menampilkan {first} - {last} dari {totalRecords} data">
                <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
                <Column body={parentBodyTemplate} header="Cabang" sortable></Column>
                <Column field="kode_divisi" header="Kode" sortable></Column>
                <Column field="nama_divisi" header="Nama Divisi" sortable></Column>
                <Column field="deskripsi" header="Deskripsi" sortable></Column>
                <Column body={statusBodyTemplate} header="Status"></Column>
                <Column body={actionBodyTemplate} exportable={false} header="Aksi" style={{ minWidth: '8rem', textAlign: 'center' }}></Column>
            </DataTable>
        </div>
    );
};
export default Table;
