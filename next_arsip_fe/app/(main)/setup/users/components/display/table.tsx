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

const Table = ({ state, setState, formik, getData, toast, setDataRekap, setNavBar, navBar, getNav }: TableProps) => {
    const headerTemplate = (
        <div className="flex flex-wrap align-items-center justify-content-between gap-2">
            <span className="text-xl font-bold">Users Management</span>

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
                        placeholder="Search users..."
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

        return <Tag value={rowData.Role} severity={roleColors[rowData.Role] || 'info'} className="text-sm" />;
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
                    getNav?.(rowData?.userId || '');
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
                        <h3 className="text-2xl font-semibold">User Management</h3>
                    </div>
                </div>

                <div className="flex flex-row flex-wrap items-center gap-2 mb-4">
                    <Button
                        size="small"
                        label="New"
                        icon="pi pi-plus"
                        outlined
                        severity="success"
                        onClick={() => {
                            setState((p) => ({ ...p, selectedUser: [], add: true }));
                        }}
                    />
                    {/* <Divider layout="vertical" /> */}
                    <Button
                        size="small"
                        label="Print"
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
                                        CreatedAt: formatDateCalendar(v.CreatedAt)
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
                        label={`Delete${state.selectedUsers.length > 0 ? ` (${state.selectedUsers.length})` : ''}`}
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
                    <Button size="small" label="Refresh" icon="pi pi-refresh" outlined onClick={() => getData(apiEndpointGet)} loading={state.load} />
                </div>

                <DataTable
                    value={state.data}
                    paginator
                    selectionMode={'multiple'}
                    rows={10}
                    header={headerTemplate}
                    globalFilterFields={['Fullname', 'Username', 'Telp', 'Role']}
                    filters={state.filters}
                    loading={state.load}
                    selection={state.selectedUsers}
                    onSelectionChange={(e) => setState((p) => ({ ...p, selectedUsers: e.value }))}
                    dataKey="UserId"
                    emptyMessage="Data Kosong"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    currentPageReportTemplate="Menampilkan {first} - {last} dari {totalRecords} data"
                >
                    <Column selectionMode="multiple" headerStyle={{ width: '3rem' }} />
                    <Column field="UserId" header="UserId"></Column>
                    <Column field="Fullname" header="Name"></Column>
                    <Column field="Username" header="Username"></Column>
                    <Column field="Telp" header="Phone"></Column>
                    <Column field="Role" body={roleBodyTemplate} header="Role"></Column>
                    <Column
                        field="Status"
                        body={(rowData) => {
                            // Karena di DB nilainya 'active' (string), bukan '1'
                            const isActive = rowData.Status === 'active';
                            return <Tag value={isActive ? 'Active' : 'Inactive'} severity={isActive ? 'success' : 'danger'} className="text-sm" />;
                        }}
                        header="Status"
                    ></Column>
                    <Column field="CreatedAt" sortable body={(rowData) => formatDateCalendar(rowData.CreatedAt)} header="Datetime"></Column>
                    <Column headerStyle={{ textAlign: 'center' }} header="Action" body={actionBodyTemplate}></Column>
                </DataTable>
            </div>

            <Form getData={getData} toast={toast} state={state} setState={setState} formik={formik} />
        </>
    );
};

export default Table;
