// app/(main)/setup/menu/components/display/table.tsx
import React from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Divider } from 'primereact/divider';
import { Tag } from 'primereact/tag';
import { State, initValueMenu } from '../interfaces';
import { usePermissions } from '@/hooks/usePermissions';

interface TableProps {
    state: State;
    setState: React.Dispatch<React.SetStateAction<State>>;
    formik: any;
    getData: (endpoint: string) => void;
    handleDelete: () => void;
    handleSave: (data: initValueMenu) => void;
    toast: any;
}

const Table = ({ state, setState, formik, handleDelete, getData }: TableProps) => {
    const permissions = usePermissions();
    const { canCreate, canUpdate, canDelete } = usePermissions();
    
    // Header tabel hanya untuk search
    const renderHeader = () => {
        return (
            <div className="flex flex-wrap align-items-center justify-content-between gap-2">
                <span className="text-xl font-bold">Manajemen Menu Navigasi</span>
                <div className="flex gap-2">
                    <span className="p-input-icon-left">
                        <i className="pi pi-search" />
                        <InputText 
                            value={state.searchVal} 
                            onChange={(e) => setState(p => ({ ...p, searchVal: e.target.value }))} 
                            placeholder="Cari menu..." 
                        />
                    </span>
                </div>
            </div>
        );
    };

    // Tombol Aksi (Edit) di setiap baris
    const actionBodyTemplate = (rowData: any) => {
        return (
            <div className="flex gap-2 justify-content-center">
                {canUpdate && (
                    <Button 
                        icon="pi pi-pencil" 
                        rounded 
                        outlined 
                        severity="warning"
                        className="p-button-sm"
                        onClick={() => {
                            // Isi formik dengan data baris yang diklik
                            formik.setValues({
                                id_menu: rowData.id_menu,
                                kode_menu: rowData.kode_menu,
                                nama_menu: rowData.nama_menu,
                                jalur_menu: rowData.jalur_menu || '',
                                ikon_menu: rowData.ikon_menu || '',
                                urutan: rowData.urutan,
                                status_aktif: rowData.status_aktif,
                                id_menu_induk: rowData.id_menu_induk || '',
                                // Kalau backend ngirim array id_peran, taruh di sini
                                id_peran: rowData.id_peran || [] 
                            });
                            setState(p => ({ ...p, edit: true }));
                        }} 
                    />
                )}
                {canDelete && (
                    <Button 
                        icon="pi pi-trash" 
                        rounded 
                        outlined 
                        severity="danger" 
                        className="p-button-sm"
                        onClick={() => setState((p) => ({ ...p, selectedData: [rowData], delete: true }))} 
                    />
                )}
            </div>
        );
    };

    // Render Ikon biar kelihatan visualnya
    const iconBodyTemplate = (rowData: any) => {
        return rowData.ikon_menu ? <i className={rowData.ikon_menu} style={{ fontSize: '1.2rem', color: '#6366f1' }}></i> : '-';
    };

    // Render Status
    const statusBodyTemplate = (rowData: any) => {
        const isActive = rowData.status_aktif === 1 || rowData.status_aktif === 'active';
        return <Tag value={isActive ? 'AKTIF' : 'TIDAK AKTIF'} severity={isActive ? 'success' : 'danger'} className="text-sm" />;
    };

    return (
        <div className="card">
            <div className="flex justify-content-between items-start mb-4">
                <div>
                    <h3 className="text-2xl font-semibold">Manajemen Menu Navigasi</h3>
                </div>
            </div>

            <div className="flex flex-row flex-wrap items-center gap-2 mb-4">
                {canCreate && (
                    <>
                        <Button 
                            size="small"
                            label="Baru" 
                            icon="pi pi-plus" 
                            outlined
                            severity="success" 
                            onClick={() => {
                                formik.resetForm();
                                setState(p => ({ ...p, add: true, selectedData: [] }));
                            }} 
                        />
                        <Divider layout="vertical" />
                    </>
                )}
                {canDelete && (
                    <>
                        <Button 
                            size="small"
                            label={`Hapus${state.selectedData.length > 0 ? ` (${state.selectedData.length})` : ''}`}
                            icon="pi pi-trash" 
                            outlined
                            severity="danger" 
                            onClick={() => setState(p => ({ ...p, delete: true }))} 
                            disabled={!state.selectedData || state.selectedData.length === 0} 
                        />
                        <Divider layout="vertical" />
                    </>
                )}
                <Button 
                    size="small" 
                    label="Muat Ulang" 
                    icon="pi pi-refresh" 
                    outlined 
                    onClick={() => getData('/setup/menu/data')} 
                    loading={state.load} 
                />
            </div>

            <DataTable 
                value={state.data} 
                selection={state.selectedData} 
                onSelectionChange={(e) => setState(p => ({ ...p, selectedData: e.value }))}
                dataKey="id_menu" 
                paginator 
                rows={10} 
                rowsPerPageOptions={[5, 10, 25]}
                globalFilter={state.searchVal}
                header={renderHeader()}
                emptyMessage="Tidak ada data menu ditemukan."
                loading={state.load}
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                currentPageReportTemplate="Menampilkan {first} - {last} dari {totalRecords} data"
            >
                <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
                <Column field="kode_menu" header="Kode Menu" sortable></Column>
                <Column field="nama_menu" header="Nama Menu" sortable></Column>
                <Column field="jalur_menu" header="URL (Jalur)"></Column>
                <Column body={iconBodyTemplate} header="Ikon" align="center"></Column>
                <Column field="urutan" header="Urutan" sortable align="center"></Column>
                <Column body={statusBodyTemplate} header="Status"></Column>
                <Column body={actionBodyTemplate} exportable={false} header="Aksi" style={{ minWidth: '8rem', textAlign: 'center' }}></Column>
            </DataTable>
        </div>
    );
};

export default Table;