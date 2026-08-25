'use client';

import { usePermissions } from '@/hooks/usePermissions';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { Divider } from 'primereact/divider';
import { InputText } from 'primereact/inputtext';
import { Tag } from 'primereact/tag';
import { useEffect } from 'react';
import { State } from '../interfaces';
import Form from './form';

const Table = ({ state, setState, formik, getData, handleDelete }: any) => {
  const { canCreate, canUpdate, canDelete } = usePermissions();

  useEffect(() => {
    getData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);



  const renderHeader = () => (
    <div className="flex flex-wrap align-items-center justify-content-between gap-3">
      <span className="text-xl font-bold">Daftar Template Surat</span>
      <span className="p-input-icon-left">
        <i className="pi pi-search" />
        <InputText
          value={state.searchVal}
          onChange={(e) => {
            const value = e.target.value;
            const filters = { ...state.filters } as any;
            filters.global.value = value;
            setState((p: State) => ({ ...p, searchVal: value, filters }));
          }}
          placeholder="Cari template..." />
      </span>
    </div>
  );

  const statusTemplate = (rowData: any) => {
    const active = rowData.status === 'active';
    return (
                            <div className="flex justify-content-center">
                                {active ? (
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

  const actionTemplate = (rowData: any) => (
    <div className="flex gap-2 justify-content-center">
      <Button type="button" icon="pi pi-eye" outlined severity="info" size="small" tooltip="Preview" tooltipOptions={{ position: 'top' }} onClick={() => {
        setState((p: State) => ({ ...p, previewVisible: true, previewContent: rowData.isi_template || '' }));
      }} />
      {canUpdate && <Button type="button" icon="pi pi-pencil" outlined size="small" tooltip="Edit" tooltipOptions={{ position: 'top' }} onClick={() => {
        formik.setValues({
          id: rowData.id_template || rowData.id,
          id_template: rowData.id_template || rowData.id,
          kode_template: rowData.kode_template,
          nama_template: rowData.nama_template,
          jenis_surat_id: rowData.jenis_surat_id || null,
          deskripsi: rowData.deskripsi || '',
          isi_template: rowData.isi_template || '',
          status: rowData.status || 'active',
          created_by: rowData.created_by,
          updated_by: rowData.updated_by,
        });
        setState((p: State) => ({ ...p, edit: true, add: false }));
      }} />}
      {canDelete && <Button type="button" icon="pi pi-trash" outlined severity="danger" size="small" tooltip="Nonaktifkan" tooltipOptions={{ position: 'top' }} onClick={() => setState((p: State) => ({ ...p, selectedData: [rowData], delete: true }))} />}
    </div>
  );



  return (
    <div className="card shadow-2 border-round-lg p-4 bg-white">
      <div className="flex justify-content-between align-items-center mb-3">
        <div>
          <h3 className="text-2xl font-bold m-0 text-900">Master Template Surat</h3>
          <p className="text-sm text-600 mt-1">Kelola template surat resmi yang dapat dipakai berulang kali untuk surat keluar.</p>
        </div>
      </div>

      <div className="flex justify-content-between align-items-center w-full mb-3 px-1">
                <div className="flex flex-row flex-wrap align-items-center gap-2">

        {canCreate && <Button type="button" size="small" label="Tambah" icon="pi pi-plus" outlined onClick={() => {
          formik.resetForm();
          setState((p: State) => ({ ...p, add: true, selectedData: [] }));
        }} />}
        {canCreate && <Divider layout="vertical" className="hidden md:inline" />}
        {canDelete && <Button type="button" size="small" label={state.selectedData.length> 0 ? `Nonaktifkan (${state.selectedData.length})` : 'Nonaktifkan'} icon="pi pi-trash" outlined severity="danger" onClick={() => setState((p: State) => ({ ...p, delete: true }))} disabled={state.selectedData.length === 0} />}
        {canDelete && <Divider layout="vertical" className="hidden md:inline" />}
        <Button type="button" size="small" label="Refresh" icon="pi pi-refresh" outlined onClick={() => getData()} loading={state.load} />
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

      
                <DataTable value={state.data} selection={state.selectedData} onSelectionChange={(e) => setState((p: State) => ({ ...p, selectedData: e.value }))} dataKey="id" paginator rows={10} rowsPerPageOptions={[5, 10, 25]} globalFilterFields={['kode_template', 'nama_template', 'status']} filters={state.filters} header={renderHeader()} emptyMessage="Tidak ada data ditemukan." loading={state.load} paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown" currentPageReportTemplate="Menampilkan {first} - {last} dari {totalRecords} data">
        {canDelete && <Column selectionMode="multiple" headerStyle={{ width: '3rem' }} />}
        <Column body={statusTemplate} header=""    style={{ width: '3rem', textAlign: 'center' }} />
                    <Column field="kode_template" header="Kode Template" sortable />
        <Column field="nama_template" header="Nama Template" sortable />
        <Column field="nama_jenis_surat" header="Jenis Surat" />
        
        <Column field="updated_at" header="Tanggal Update" body={(rowData: any) => rowData.updated_at ? new Date(rowData.updated_at).toLocaleDateString('id-ID') : '-'} />
        <Column body={actionTemplate} header="Aksi" style={{ minWidth: '10rem', textAlign: 'center' }} />
      </DataTable>

      <Dialog 
        header="Preview Template Surat" 
        visible={state.previewVisible} 
        onHide={() => setState((p: State) => ({ ...p, previewVisible: false, previewContent: '' }))}
        style={{ width: '50vw' }}
        breakpoints={{ '960px': '75vw', '641px': '100vw' }}
        maximizable
      >
        <div className="bg-white border-round p-3 border-1 surface-border mt-2">
          <pre className="m-0 text-sm text-700" style={{ whiteSpace: 'pre-wrap', fontFamily: "Georgia, 'Times New Roman', serif" }}>
            {state.previewContent || 'Tidak ada isi template.'}
          </pre>
        </div>
      </Dialog>
    </div>
  );
};

export default Table;
