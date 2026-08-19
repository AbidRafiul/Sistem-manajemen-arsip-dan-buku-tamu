'use client';

import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { TabView, TabPanel } from 'primereact/tabview';
import { useMemo } from 'react';

const statusOptions = [
  { label: 'Aktif', value: 'active' },
  { label: 'Nonaktif', value: 'inactive' },
];

const placeholderOptions = [
  '{{nomor_surat}}',
  '{{nomor_agenda}}',
  '{{tanggal_surat}}',
  '{{tanggal_kirim}}',
  '{{nama_jenis_surat}}',
  '{{tujuan}}',
  '{{instansi_tujuan}}',
  '{{perihal}}',
  '{{media_pengiriman}}',
  '{{isi_surat}}',
  '{{nama_pengirim}}',
  '{{jabatan}}',
];

const defaultReplyTemplate = `Nomor    : {{nomor_surat}}
Lampiran : -
Perihal  : {{perihal}}

Kepada Yth.
{{tujuan}}
{{instansi_tujuan}}
di Tempat

Dengan hormat,

{{isi_surat}}

Demikian surat ini kami sampaikan. Atas perhatian dan kerja samanya kami ucapkan terima kasih.

Hormat kami,


{{nama_pengirim}}
{{jabatan}}`;

const Form = ({ state, setState, formik, handleDelete }: any) => {
  const isFormVisible = state.add || state.edit;
  const letterTypeOptions = (state.letterTypes || [])
    .filter((item: any) => item.status === 'active' || item.jenis_surat_id === formik.values.jenis_surat_id)
    .map((item: any) => ({ label: item.nama_jenis_surat, value: item.jenis_surat_id }));

  const previewText = useMemo(() => {
    return (formik.values.isi_template || '').trim() || 'Isi template akan muncul di sini';
  }, [formik.values.isi_template]);

  const hideForm = () => {
    setState((p: any) => ({ ...p, add: false, edit: false, delete: false }));
    formik.resetForm();
  };

  const insertPlaceholder = (placeholder: string) => {
    const currentValue = formik.values.isi_template || '';
    formik.setFieldValue('isi_template', `${currentValue}${currentValue ? '\n' : ''}${placeholder}`);
  };

  const applyDefaultReplyTemplate = () => {
    formik.setFieldValue('isi_template', defaultReplyTemplate);
  };

  const isFormFieldInvalid = (name: string) => !!(formik?.touched && formik.touched[name] && formik?.errors && formik.errors[name]);

  return (
    <>
      {isFormVisible && (
        <div className="card border-round shadow-1 p-4 mb-4 fadein animation-duration-300">
          {/* Header Banner */}
          <div className="flex align-items-center justify-content-between mb-4 border-bottom-1 surface-border pb-3">
            <div>
              <h2 className="text-xl font-bold text-900 m-0">
                {state.add ? 'Penambahan Template Surat Baru' : 'Ubah Data Template Surat'}
              </h2>
              <p className="text-color-secondary text-sm m-0 mt-1">
                Atur konfigurasi template surat lengkap dengan variabel placeholder dan editor isi surat.
              </p>
            </div>
            <Button
              type="button"
              label="Batal"
              icon="pi pi-times"
              className="p-button-outlined p-button-danger p-button-sm"
              onClick={hideForm}
            />
          </div>

          <form onSubmit={formik.handleSubmit}>
            <TabView>
              <TabPanel header="Informasi Dasar" leftIcon="pi pi-info-circle mr-2">
                <div className="p-3">
                  <h4 className="font-bold text-900 mb-1">Informasi Identitas Template</h4>
                  <p className="text-color-secondary text-sm mb-4">Kode unik, nama template, dan asosiasi jenis surat.</p>

                  <div className="grid p-fluid">
                    <div className="col-12 md:col-6 flex flex-column gap-2 mb-3">
                      <label htmlFor="kode_template" className="font-semibold text-sm">KODE TEMPLATE *</label>
                      <InputText
                        id="kode_template"
                        name="kode_template"
                        value={formik.values.kode_template}
                        onChange={formik.handleChange}
                        className={isFormFieldInvalid('kode_template') ? 'p-invalid' : ''}
                        placeholder="Contoh: TPL-UND-01"
                      />
                    </div>

                    <div className="col-12 md:col-6 flex flex-column gap-2 mb-3">
                      <label htmlFor="nama_template" className="font-semibold text-sm">NAMA TEMPLATE *</label>
                      <InputText
                        id="nama_template"
                        name="nama_template"
                        value={formik.values.nama_template}
                        onChange={formik.handleChange}
                        className={isFormFieldInvalid('nama_template') ? 'p-invalid' : ''}
                        placeholder="Contoh: Template Undangan Resmi"
                      />
                    </div>

                    <div className="col-12 md:col-6 flex flex-column gap-2 mb-3">
                      <label htmlFor="jenis_surat_id" className="font-semibold text-sm">JENIS SURAT</label>
                      <Dropdown
                        id="jenis_surat_id"
                        name="jenis_surat_id"
                        value={formik.values.jenis_surat_id}
                        options={letterTypeOptions}
                        onChange={(e) => formik.setFieldValue('jenis_surat_id', e.value)}
                        placeholder="Pilih jenis surat"
                      />
                    </div>

                    <div className="col-12 md:col-6 flex flex-column gap-2 mb-3">
                      <label htmlFor="status" className="font-semibold text-sm">STATUS KEAKTIFAN *</label>
                      <Dropdown
                        id="status"
                        name="status"
                        value={formik.values.status}
                        options={statusOptions}
                        onChange={formik.handleChange}
                      />
                    </div>

                    <div className="col-12 flex flex-column gap-2 mb-3">
                      <label htmlFor="deskripsi" className="font-semibold text-sm">DESKRIPSI</label>
                      <InputText
                        id="deskripsi"
                        name="deskripsi"
                        value={formik.values.deskripsi}
                        onChange={formik.handleChange}
                        placeholder="Keterangan peruntukan template"
                      />
                    </div>
                  </div>
                </div>
              </TabPanel>

              <TabPanel header="Editor Isi & Placeholder" leftIcon="pi pi-file-edit mr-2">
                <div className="p-3">
                  <h4 className="font-bold text-900 mb-1">Editor Isi Surat</h4>
                  <p className="text-color-secondary text-sm mb-4">Gunakan placeholder variabel untuk menghasilkan konten surat dinamis.</p>

                  <div className="flex flex-column gap-3">
                    <div className="flex flex-column gap-2">
                      <label className="font-semibold text-sm">PLACEHOLDER VARIABEL</label>
                      <div className="flex flex-wrap gap-2">
                        {placeholderOptions.map((item) => (
                          <Button
                            key={item}
                            type="button"
                            size="small"
                            outlined
                            className="p-button-secondary p-button-sm"
                            onClick={() => insertPlaceholder(item)}
                            label={item}
                          />
                        ))}
                        <Button
                          type="button"
                          size="small"
                          severity="info"
                          icon="pi pi-file-edit"
                          label="Susunan Balasan Standard"
                          onClick={applyDefaultReplyTemplate}
                        />
                      </div>
                    </div>

                    <div className="flex flex-column gap-2 mt-2">
                      <label htmlFor="isi_template" className="font-semibold text-sm">ISI TEMPLATE SURAT *</label>
                      <InputTextarea
                        id="isi_template"
                        name="isi_template"
                        rows={10}
                        value={formik.values.isi_template}
                        onChange={formik.handleChange}
                        className={isFormFieldInvalid('isi_template') ? 'p-invalid' : ''}
                        autoResize
                      />
                    </div>

                    <div className="surface-50 border-round p-3 border-1 surface-border mt-2">
                      <div className="font-semibold text-sm mb-2 text-900 flex align-items-center gap-2">
                        <i className="pi pi-eye text-primary" />
                        <span>Pratinjau Hasil Template</span>
                      </div>
                      <pre className="m-0 text-sm line-height-3 surface-card p-3 border-round border-1 surface-border" style={{ whiteSpace: 'pre-wrap', fontFamily: "Georgia, 'Times New Roman', serif" }}>
                        {previewText}
                      </pre>
                    </div>
                  </div>
                </div>
              </TabPanel>
            </TabView>

            {/* Footer Actions */}
            <div className="flex align-items-center justify-content-between mt-5 pt-3 border-top-1 surface-border">
              <Button
                type="button"
                label="Kembali ke Daftar"
                icon="pi pi-arrow-left"
                className="p-button-outlined p-button-secondary"
                onClick={hideForm}
              />
              <Button
                type="submit"
                label={state?.edit ? 'Perbarui Data' : 'Simpan Data'}
                icon="pi pi-check"
                className="p-button-primary px-4"
                loading={state?.load}
                disabled={state?.load}
              />
            </div>
          </form>
        </div>
      )}

      <Dialog
        header="Preview Template"
        visible={state.previewVisible}
        onHide={() => setState((p: any) => ({ ...p, previewVisible: false, previewContent: '' }))}
        modal
        style={{ width: '42rem', maxWidth: '95vw' }}
      >
        <pre
          className="m-0 p-3 surface-50 border-round border-1 surface-border text-sm line-height-3"
          style={{ whiteSpace: 'pre-wrap', fontFamily: "Georgia, 'Times New Roman', serif" }}
        >
          {state.previewContent}
        </pre>
      </Dialog>

      <Dialog
        header="Konfirmasi Nonaktifkan"
        visible={state.delete}
        onHide={hideForm}
        modal
        style={{ width: '25rem' }}
        footer={(
          <div className="flex justify-content-center gap-2">
            <Button type="button" label="Batal" icon="pi pi-times" className="p-button-outlined p-button-secondary" onClick={hideForm} />
            <Button type="button" label="Nonaktifkan" icon="pi pi-check" severity="danger" loading={state.load} onClick={handleDelete} />
          </div>
        )}
      >
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
