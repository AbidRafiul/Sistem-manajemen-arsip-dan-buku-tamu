'use client';

import { DataTable } from 'primereact/datatable';
import { RoleColors, TableProps, TableData } from '../interfaces';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { formatDateCalendar } from '@/lib/tools/dateTools';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';
import { apiEndpointGet } from '../endpoints';
import { useEffect } from 'react';
import Form from './form';
import { usePermissions } from '@/hooks/usePermissions';

const Table = ({ state, setState, formik, getData, toast, setDataRekap, setNavBar, navBar, getNav, handleSave, handleDelete }: TableProps) => {
    const permissions = usePermissions();
    const headerTemplate = (
        <div className="flex flex-wrap align-items-center justify-content-between gap-2">
            <span className="text-xl font-bold">Manajemen Pengguna</span>

            <div className="flex gap-2">
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText
                        value={state.searchVal}
                        onChange={(e) => {
                            const value = e.target.value;
                            let _filters = { ...state.filters };
                            _filters['global'].value = value;
                            setState((p) => ({ ...p, searchVal: value, filters: _filters }));
                        }}
                        placeholder="Cari pengguna..."
                    />
                </span>
            </div>
        </div>
    );

    const roleBodyTemplate = (rowData: TableData) => {
        const roleColors: RoleColors = {
            superadmin: 'danger',
            Pimpinan: 'warning',
            Sekretaris: 'info',
            'Staff Arsip': 'success',
            'Staff Umum': 'success',
            Resepsionis: 'info',
            Auditor: 'warning'
        };

        const roleStr = String(rowData.role);
        return <Tag value={roleStr} severity={roleColors[roleStr as keyof RoleColors] || 'info'} className="text-sm" />;
    };

    const actionBodyTemplate = (rowData: TableData) => (
        <div className="flex gap-2">
            <Button
                icon="pi pi-pencil"
                rounded
                outlined
                className="p-button-sm"
                onClick={() => {
                    formik.setValues((p) => ({
                        ...p,
                        ...rowData
                    }));

                    setState((p) => ({ ...p, add: false, delete: false, edit: true }));
                }}
                tooltip="Edit"
            />
            <Button icon="pi pi-trash" rounded outlined severity="danger" className="p-button-sm" onClick={() => setState((p) => ({ ...p, delete: true, selectedUsers: [rowData] }))} tooltip="Delete" />
            <Button
                icon="pi pi-wrench"
                onClick={() => {
                    getNav?.(rowData?.id_pengguna || '');
                }}
                severity="warning"
                outlined
                rounded
                loading={navBar?.load}
            />
        </div>
    );

    useEffect(() => {
        getData(apiEndpointGet);
    }, []);

    return (
        <>
            <div className="card">
                <div className="flex justify-content-between items-start mb-4">
                    <div>
                        <h3 className="text-2xl font-semibold">Manajemen Pengguna</h3>
                    </div>
                </div>

                <div className="flex flex-row flex-wrap items-center gap-2 mb-4">
                    <Button
                        size="small"
                        label="Baru"
                        icon="pi pi-plus"
                        outlined
                        severity="success"
                        onClick={() => {
                            setState((p) => ({ ...p, selectedUser: [], add: true }));
                        }}
                    />
                    <Button
                        size="small"
                        label="Cetak"
                        icon="pi pi-print"
                        outlined
                        onClick={() => {
                            let columnStyles = {
                                2: { halign: 'right' },
                                3: { halign: 'right' },
                                4: { halign: 'right' },
                                5: { halign: 'right' }
                            };

                            setDataRekap((p) => ({
                                ...p,
                                data: state.data.map((v) => {
                                    return {
                                        ...v,
                                        created_at: formatDateCalendar(v.created_at)
                                    };
                                }),
                                show: true,
                                adjust: true,
                                columnStyles
                            }));
                        }}
                    />
                    <Divider layout="vertical" />
                    <Button
                        size="small"
                        label={`Hapus${state.selectedUsers.length > 0 ? ` (${state.selectedUsers.length})` : ''}`}
                        icon="pi pi-trash"
                        severity="danger"
                        outlined
                        onClick={() => {
                            if (state.selectedUsers.length < 1) {
                                setState((p) => ({ ...p, selectedUser: [], delete: false }));
                                return;
                            }

                            setState((p) => ({ ...p, delete: true }));
                        }}
                        disabled={state.selectedUsers.length === 0}
                    />
                    <Divider layout="vertical" />
                    <Button size="small" label="Muat Ulang" icon="pi pi-refresh" outlined onClick={() => getData(apiEndpointGet)} loading={state.load} />
                </div>

                <DataTable
                    value={state.data}
                    paginator
                    selectionMode={'multiple'}
                    rows={10}
                    header={headerTemplate}
                    globalFilterFields={['nama_lengkap', 'nama_pengguna', 'telepon', 'role']}
                    filters={state.filters}
                    loading={state.load}
                    selection={state.selectedUsers}
                    onSelectionChange={(e) => setState((p) => ({ ...p, selectedUsers: e.value }))}
                    dataKey="id_pengguna"
                    emptyMessage="Data Kosong"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    currentPageReportTemplate="Menampilkan {first} - {last} dari {totalRecords} data"
                >
                    <Column selectionMode="multiple" headerStyle={{ width: '3rem' }} />
                    <Column field="id_pengguna" header="IdPengguna"></Column>
                    <Column field="nama_lengkap" header="Name"></Column>
                    <Column field="nama_pengguna" header="nama_pengguna"></Column>
                    <Column field="telepon" header="Phone"></Column>
                    <Column field="role" body={roleBodyTemplate} header="Role"></Column>
                    <Column
                        field="status"
                        body={(rowData) => {
                            // Karena di DB nilainya 'active' (string), bukan '1'
                            const isActive = rowData.status === 'active';
                            return <Tag value={isActive ? 'Aktif' : 'Tidak Aktif'} severity={isActive ? 'success' : 'danger'} className="text-sm" />;
                        }}
                        header="Status"
                    ></Column>
                    <Column field="created_at" sortable body={(rowData) => formatDateCalendar(rowData.created_at)} header="Tanggal & Waktu"></Column>
                    <Column headerStyle={{ textAlign: 'center' }} header="Aksi" body={actionBodyTemplate}></Column>
                </DataTable>
            </div>

            <Form getData={getData} toast={toast} state={state} setState={setState} formik={formik} handleSave={handleSave} handleDelete={handleDelete} />
        </>
    );
};

export default Table;
