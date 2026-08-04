'use client';

import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { FilterMatchMode } from 'primereact/api';
import { Toast } from 'primereact/toast';
import { useFormik } from 'formik';
import getDataRequest from '@/lib/axios/getData';
import postData from '@/lib/axios/postData';
import putData from '@/lib/axios/putData';
import deleteData from '@/lib/axios/deleteData';
import { showError, showSuccess } from '@/lib/tools/generalTools';
import Table from './components/display/table';
import Form from './components/display/form';
import { initValue, State } from './components/interfaces';

const initialValues: initValue = {
  id: '',
  id_template: null,
  kode_template: '',
  nama_template: '',
  jenis_surat_id: null,
  deskripsi: '',
  isi_template: '',
  status: 'active',
  created_by: null,
  updated_by: null,
};

const apiEndpoint = '/master/surat/template-surat';

const mapTemplateSuratRow = (row: any) => ({
  ...row,
  id: row.id_template || row.id,
});

const Page = () => {
  const toast = useRef<Toast>(null);
  const { data: session } = useSession();

  const [state, setState] = useState<State>({
    load: false,
    data: [],
    add: false,
    edit: false,
    delete: false,
    selectedData: [],
    searchVal: '',
    filters: { global: { value: null, matchMode: FilterMatchMode.CONTAINS } },
    session: null,
    letterTypes: [],
    previewVisible: false,
    previewContent: '',
  });

  const formik = useFormik({
    initialValues,
    validate: (data: initValue) => {
      const errors: Partial<Record<keyof initValue, string>> = {};
      if (!data.kode_template) errors.kode_template = 'Kode template wajib diisi';
      if (!data.nama_template) errors.nama_template = 'Nama template wajib diisi';
      if (!data.isi_template) errors.isi_template = 'Isi template wajib diisi';
      return errors;
    },
    onSubmit: async (data) => {
      await handleSave(data);
    },
  });

  const getData = async () => {
    setState((p) => ({ ...p, load: true }));
    try {
      const res = await getDataRequest(apiEndpoint);
      setState((p) => ({ ...p, data: (res.data?.data || []).map(mapTemplateSuratRow) }));
    } catch (error: any) {
      showError(toast, error?.response?.data?.message || 'Terjadi Kesalahan');
    } finally {
      setState((p) => ({ ...p, load: false }));
    }
  };

  const fetchLetterTypes = async () => {
    try {
      const res = await getDataRequest('/correspondence/letter-type-management');
      setState((p) => ({ ...p, letterTypes: res.data?.data || [] }));
    } catch (error: any) {
      showError(toast, error?.response?.data?.message || 'Jenis surat gagal diambil');
    }
  };

  const handleSave = async (input: initValue) => {
    setState((p) => ({ ...p, load: true }));
    try {
      const body = {
        kode_template: input.kode_template,
        nama_template: input.nama_template,
        jenis_surat_id: input.jenis_surat_id || null,
        deskripsi: input.deskripsi,
        isi_template: input.isi_template,
        status: input.status,
        created_by: session?.user?.IdPengguna || session?.user?.id || null,
        updated_by: session?.user?.IdPengguna || session?.user?.id || null,
      };

      if (input.id) {
        await putData(`${apiEndpoint}/${input.id}`, body);
        showSuccess(toast, 'Template surat berhasil diperbarui');
      } else {
        await postData(apiEndpoint, body);
        showSuccess(toast, 'Template surat berhasil disimpan');
      }

      formik.resetForm();
      setState((p) => ({ ...p, add: false, edit: false }));
      await getData();
    } catch (error: any) {
      showError(toast, error?.response?.data?.message || 'Terjadi Kesalahan');
    } finally {
      setState((p) => ({ ...p, load: false }));
    }
  };

  const handleDelete = async () => {
    if (state.selectedData.length < 1) return;
    setState((p) => ({ ...p, load: true }));
    try {
      for (const item of state.selectedData) {
        await deleteData(`${apiEndpoint}/${item.id_template || item.id}`);
      }
      showSuccess(toast, 'Template surat berhasil dinonaktifkan');
      setState((p) => ({ ...p, selectedData: [], delete: false }));
      await getData();
    } catch (error: any) {
      showError(toast, error?.response?.data?.message || 'Terjadi Kesalahan');
    } finally {
      setState((p) => ({ ...p, load: false }));
    }
  };

  useEffect(() => {
    if (session) {
      setState((prev) => ({ ...prev, session }));
    }
    getData();
    fetchLetterTypes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  return (
    <>
      <Toast ref={toast} position="top-right" />
      <Table state={state} setState={setState} formik={formik} getData={getData} handleDelete={handleDelete} />
      <Form state={state} setState={setState} formik={formik} handleDelete={handleDelete} />
    </>
  );
};

export default Page;
