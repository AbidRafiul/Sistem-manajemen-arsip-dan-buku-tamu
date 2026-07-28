'use client';

import { DataTable } from 'primereact/datatable';
import { RoleColors, TableProps, TableData } from '../interfaces';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { formatDateCalendar } from '@/lib/tools/dateTools';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';
import { apiEndpointGet, apiEndpointCreate } from '../endpoints';
import { useContext, useEffect } from 'react';
import Form from './form';
import { usePermissions } from '@/hooks/usePermissions';
import { LayoutContext } from '@/layout/context/layoutcontext';
import ExcelBulkAction from '@/app/components/excel_components/ExcelBulkAction';

const Table = ({ state, setState, formik, getData, toast, setDataRekap, setNavBar, navBar, getNav, handleSave, handleDelete }: TableProps) => {
    const permissions = usePermissions();
    const { layoutState } = useContext(LayoutContext);
    const cabangName = (layoutState.globalFilter as any)?.nama_cabang;
    const titleSuffix = cabangName ? ` - ${cabangName}` : (permissions?.activeRole?.toUpperCase() === 'SUPERADMIN' ? ' Pusat' : '');
    const headerTemplate = (
        <div className="flex flex-wrap align-items-center justify-content-between gap-2">
            <span className="text-xl font-bold">Manajemen Pengguna{titleSuffix}</span>

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
            {permissions.canUpdate && (
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
            )}
            {permissions.canDelete && (
                <Button icon="pi pi-trash" rounded outlined severity="danger" className="p-button-sm" onClick={() => setState((p) => ({ ...p, delete: true, selectedUsers: [rowData] }))} tooltip="Delete" />
            )}
            {/* {permissions.canApprove && (
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
            )} */}
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

                <div className="flex flex-row flex-wrap items-center justify-content-between gap-2 mb-4">
                    <div className="flex flex-row flex-wrap items-center gap-2">
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

                    <div className="flex flex-row flex-wrap items-center gap-2">
                        <ExcelBulkAction
                            title="Data Pengguna"
                            data={state.data}
                            columns={[
                                { field: 'nama_lengkap', header: 'Nama Lengkap', required: true, example: 'Budi Santoso' },
                                { field: 'nama_pengguna', header: 'Username', required: true, example: 'budi.s' },
                                { field: 'telepon', header: 'Telepon', required: true, example: '081234567890' },
                                { field: 'kata_sandi', header: 'Kata Sandi', required: true, example: 'Rahasia@123' },
                                { field: 'peran_role', header: 'Peran / Role', required: true, example: 'Staff Arsip' },
                                { field: 'nama_cabang', header: 'Nama / Kode Cabang', required: true, example: 'Pusat Jakarta' },
                                { field: 'nama_departemen', header: 'Nama / Kode Departemen', required: true, example: 'Departemen Kearsipan & Umum' },
                                { field: 'nama_divisi', header: 'Nama / Kode Divisi', required: true, example: 'Divisi Arsip Aktif' },
                                { field: 'nama_unit_kerja', header: 'Nama / Kode Unit Kerja', required: true, example: 'Unit Pengolahan Arsip' },
                                { field: 'nama_jabatan', header: 'Nama / Kode Posisi', required: true, example: 'Administrator Pusat' },
                                { field: 'status', header: 'Status', required: true, example: 'active' }
                            ]}
                            apiEndpointCreate={apiEndpointCreate}
                            onSuccess={() => getData(apiEndpointGet)}
                            toast={toast}
                            customExportMap={(data) => data.map((item) => {
                                const branch = state.masterData?.branches?.find((b: any) => String(b.id_cabang) === String(item.id_cabang));
                                const dept = state.masterData?.departments?.find((d: any) => String(d.id_departemen) === String(item.id_departemen));
                                const div = state.masterData?.divisions?.find((d: any) => String(d.id_divisi) === String(item.id_divisi));
                                const workUnit = state.masterData?.workUnits?.find((w: any) => String(w.id_unit_kerja) === String(item.id_unit_kerja));
                                const position = state.masterData?.positions?.find((p: any) => String(p.id_jabatan) === String(item.id_jabatan));
                                return {
                                    ...item,
                                    peran_role: item.role,
                                    nama_cabang: branch ? branch.nama_cabang : item.id_cabang,
                                    nama_departemen: dept ? dept.nama_departemen : item.id_departemen,
                                    nama_divisi: div ? div.nama_divisi : item.id_divisi,
                                    nama_unit_kerja: workUnit ? workUnit.nama_unit_kerja : item.id_unit_kerja,
                                    nama_jabatan: position ? position.nama_jabatan : item.id_jabatan
                                };
                            })}
                            customPayloadMap={(item) => {
                                const branch = state.masterData?.branches?.find((b: any) => 
                                    String(b.nama_cabang || '').toLowerCase() === String(item.nama_cabang || '').toLowerCase() || 
                                    String(b.kode_cabang || '').toLowerCase() === String(item.nama_cabang || '').toLowerCase() ||
                                    String(b.id_cabang) === String(item.nama_cabang)
                                );
                                const dept = state.masterData?.departments?.find((d: any) => 
                                    String(d.nama_departemen || '').toLowerCase() === String(item.nama_departemen || '').toLowerCase() || 
                                    String(d.kode_departemen || '').toLowerCase() === String(item.nama_departemen || '').toLowerCase() ||
                                    String(d.id_departemen) === String(item.nama_departemen)
                                );
                                const div = state.masterData?.divisions?.find((d: any) => 
                                    String(d.nama_divisi || '').toLowerCase() === String(item.nama_divisi || '').toLowerCase() || 
                                    String(d.kode_divisi || '').toLowerCase() === String(item.nama_divisi || '').toLowerCase() ||
                                    String(d.id_divisi) === String(item.nama_divisi)
                                );
                                const workUnit = state.masterData?.workUnits?.find((w: any) => 
                                    String(w.nama_unit_kerja || '').toLowerCase() === String(item.nama_unit_kerja || '').toLowerCase() || 
                                    String(w.kode_unit_kerja || '').toLowerCase() === String(item.nama_unit_kerja || '').toLowerCase() ||
                                    String(w.id_unit_kerja) === String(item.nama_unit_kerja)
                                );
                                const position = state.masterData?.positions?.find((p: any) => 
                                    String(p.nama_jabatan || '').toLowerCase() === String(item.nama_jabatan || '').toLowerCase() || 
                                    String(p.kode_jabatan || '').toLowerCase() === String(item.nama_jabatan || '').toLowerCase() ||
                                    String(p.id_jabatan) === String(item.nama_jabatan)
                                );
                                const role = state.masterData?.roles?.find((r: any) => 
                                    String(r.nama_peran || '').toLowerCase() === String(item.peran_role || '').toLowerCase() ||
                                    String(r.id_peran) === String(item.peran_role)
                                );

                                return {
                                    ...item,
                                    id_cabang: branch ? branch.id_cabang : (isNaN(Number(item.nama_cabang)) ? item.nama_cabang : Number(item.nama_cabang)),
                                    id_departemen: dept ? dept.id_departemen : (isNaN(Number(item.nama_departemen)) ? item.nama_departemen : Number(item.nama_departemen)),
                                    id_divisi: div ? div.id_divisi : (isNaN(Number(item.nama_divisi)) ? item.nama_divisi : Number(item.nama_divisi)),
                                    id_unit_kerja: workUnit ? workUnit.id_unit_kerja : (isNaN(Number(item.nama_unit_kerja)) ? item.nama_unit_kerja : Number(item.nama_unit_kerja)),
                                    id_jabatan: position ? position.id_jabatan : (isNaN(Number(item.nama_jabatan)) ? item.nama_jabatan : Number(item.nama_jabatan)),
                                    id_peran: role ? role.id_peran : (isNaN(Number(item.peran_role)) ? item.peran_role : Number(item.peran_role))
                                };
                            }}
                        />
                    </div>
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
                    <Column headerStyle={{ textAlign: 'center' }} align="center" header="Aksi" body={actionBodyTemplate}></Column>
                </DataTable>
            </div>

            <Form getData={getData} toast={toast} state={state} setState={setState} formik={formik} handleSave={handleSave} handleDelete={handleDelete} />
        </>
    );
};

export default Table;
