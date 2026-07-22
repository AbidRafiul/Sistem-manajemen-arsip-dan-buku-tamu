'use client';

import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { useMemo } from 'react';

const statusOptions = [
  { label: 'Aktif', value: 'active' },
  { label: 'Nonaktif', value: 'inactive' },
];

const placeholderOptions = [
  '{{nomor_surat}}',
  '{{tanggal_surat}}',
  '{{tujuan}}',
  '{{perihal}}',
  '{{isi_surat}}',
  '{{nama_pengirim}}',
  '{{jabatan}}',
];

const Form = ({ state, setState, formik, handleDelete }: any) => {
  const isDialogVisible = state.add || state.edit;
  const letterTypeOptions = (state.letterTypes || []).map((item: any) => ({ label: item.nama_jenis_surat, value: item.jenis_surat_id }));

  const previewText = useMemo(() => {
    return (formik.values.isi_template || '').trim() || 'Isi template akan muncul di sini';
  }, [formik.values.isi_template]);

  const hideDialog = () => {
    setState((p: any) => ({ ...p, add: false, edit: false, delete: false }));
    formik.resetForm();
  };

  const insertPlaceholder = (placeholder: string) => {
    const currentValue = formik.values.isi_template || '';
    formik.setFieldValue('isi_template', `${currentValue}${currentValue ? '\n' : ''}${placeholder}`);
  };

  return (
    <>
      <Dialog visible={isDialogVisible} style={{ width: '760px' }} header={state.edit ? 'Ubah Template Surat' : 'Tambah Template Surat'} modal onHide={hideDialog} className="p-fluid">
        <form onSubmit={formik.handleSubmit} className="flex gap-3 flex-column mt-3">
          <div className="grid">
            <div className="col-12 md:col-6 flex flex-column gap-2">
              <label htmlFor="kode_template" className="font-bold text-sm text-800">Kode Template</label>
              <InputText id="kode_template" name="kode_template" value={formik.values.kode_template} onChange={formik.handleChange} />
            </div>
            <div className="col-12 md:col-6 flex flex-column gap-2">
              <label htmlFor="nama_template" className="font-bold text-sm text-800">Nama Template</label>
              <InputText id="nama_template" name="nama_template" value={formik.values.nama_template} onChange={formik.handleChange} />
            </div>
            <div className="col-12 md:col-6 flex flex-column gap-2">
              <label htmlFor="jenis_surat_id" className="font-bold text-sm text-800">Jenis Surat</label>
              <Dropdown id="jenis_surat_id" name="jenis_surat_id" value={formik.values.jenis_surat_id} options={letterTypeOptions} onChange={(e) => formik.setFieldValue('jenis_surat_id', e.value)} placeholder="Pilih jenis surat" />
            </div>
            <div className="col-12 md:col-6 flex flex-column gap-2">
              <label htmlFor="status" className="font-bold text-sm text-800">Status</label>
              <Dropdown id="status" name="status" value={formik.values.status} options={statusOptions} onChange={formik.handleChange} />
            </div>
            <div className="col-12 flex flex-column gap-2">
              <label htmlFor="deskripsi" className="font-bold text-sm text-800">Deskripsi</label>
              <InputText id="deskripsi" name="deskripsi" value={formik.values.deskripsi} onChange={formik.handleChange} />
            </div>
          </div>

          <div className="flex flex-column gap-2">
            <label className="font-bold text-sm text-800">Placeholder</label>
            <div className="flex flex-wrap gap-2">
              {placeholderOptions.map((item) => (
                <Button key={item} type="button" size="small" text onClick={() => insertPlaceholder(item)} label={item} />
              ))}
            </div>
          </div>

          <div className="flex flex-column gap-2">
            <label htmlFor="isi_template" className="font-bold text-sm text-800">Editor Isi Surat</label>
            <InputTextarea id="isi_template" name="isi_template" rows={10} value={formik.values.isi_template} onChange={formik.handleChange} autoResize />
          </div>

          <div className="surface-50 border-round p-3 border-1 surface-border">
            <div className="font-semibold text-sm mb-2">Preview Singkat</div>
            <pre className="m-0 text-sm whitespace-pre-wrap">{previewText}</pre>
          </div>

          <div className="flex justify-content-end gap-2 mt-3">
            <Button type="button" label="Batal" icon="pi pi-times" severity="secondary" outlined onClick={hideDialog} />
            <Button type="submit" label={state.edit ? 'Perbarui' : 'Simpan'} icon="pi pi-check" loading={state.load} />
          </div>
        </form>
      </Dialog>

      <Dialog header="Konfirmasi Nonaktifkan" visible={state.delete} onHide={hideDialog} modal style={{ width: '25rem' }} footer={(
        <div className="flex justify-content-center gap-2">
          <Button type="button" label="Batal" icon="pi pi-times" severity="secondary" outlined onClick={hideDialog} />
          <Button type="button" label="Nonaktifkan" icon="pi pi-check" severity="danger" loading={state.load} onClick={handleDelete} />
        </div>
      )}>
        <div className="flex flex-column align-items-center text-center gap-4 py-4">
          <i className="pi pi-exclamation-triangle text-red-500 text-6xl" />
          <div>
            <h3 className="font-bold mb-2">Nonaktifkan template ini?</h3>
            <p className="text-color-secondary">Template yang dinonaktifkan tidak akan dipakai lagi untuk pembuatan surat keluar.</p>
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default Form;
