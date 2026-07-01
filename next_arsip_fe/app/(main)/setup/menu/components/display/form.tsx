// app/(main)/setup/menu/components/display/form.tsx
import React from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { MultiSelect } from 'primereact/multiselect';
import { State } from '../interfaces';

interface FormProps {
    state: State;
    setState: React.Dispatch<React.SetStateAction<State>>;
    formik: any;
    toast: any;
    getData: (endpoint: string) => void;
    handleSave: (data: any) => void;
    handleDelete: () => void;
}

const Form = ({ state, setState, formik, toast, getData, handleSave, handleDelete }: FormProps) => {
    
    const hideDialog = () => {
        formik.resetForm();
        setState(p => ({ ...p, add: false, edit: false }));
    };

    const isFormFieldInvalid = (name: string) => !!(formik.touched[name] && formik.errors[name]);
    const getFormErrorMessage = (name: string) => {
        return isFormFieldInvalid(name) ? <small className="p-error">{formik.errors[name]}</small> : <small className="p-error">&nbsp;</small>;
    };

    const footerDialog = (
        <div className="flex justify-content-center gap-2 w-full">
            <Button label="Simpan" icon="pi pi-check" onClick={() => formik.handleSubmit()} loading={state.load} disabled={state.load} className="w-full" />
        </div>
    );

    const statusOptions = [
        { label: 'Aktif', value: 1 },
        { label: 'Tidak Aktif', value: 0 }
    ];

    return (
        <>
        <Dialog 
            visible={state.add || state.edit} 
            style={{ width: '70%' }} 
            header={state.edit ? "Edit Menu" : "Tambah Menu Baru"} 
            modal 
            footer={footerDialog} 
            onHide={hideDialog}
        >
            <form onSubmit={formik.handleSubmit} className="flex gap-2 flex-column mt-2">
                <div className="flex md:flex-row flex-column gap-2 w-full">
                    <div className="flex flex-column gap-2 w-full">
                        <label htmlFor="kode_menu" className="font-bold">Kode Menu</label>
                        <div className="p-inputgroup">
                            <InputText 
                                id="kode_menu" 
                                name="kode_menu" 
                                value={formik.values.kode_menu} 
                                style={{ padding: '1rem' }}
                                onChange={formik.handleChange} 
                                className={isFormFieldInvalid('kode_menu') ? 'p-invalid' : ''} 
                            />
                        </div>
                        {getFormErrorMessage('kode_menu')}
                    </div>

                    <div className="flex flex-column gap-2 w-full">
                        <label htmlFor="nama_menu" className="font-bold">Nama Menu</label>
                        <div className="p-inputgroup">
                            <InputText 
                                id="nama_menu" 
                                name="nama_menu" 
                                value={formik.values.nama_menu} 
                                style={{ padding: '1rem' }}
                                onChange={formik.handleChange} 
                                className={isFormFieldInvalid('nama_menu') ? 'p-invalid' : ''} 
                            />
                        </div>
                        {getFormErrorMessage('nama_menu')}
                    </div>
                </div>

                <div className="flex md:flex-row flex-column gap-2 w-full">
                    <div className="flex flex-column gap-2 w-full">
                        <label htmlFor="jalur_menu" className="font-bold">URL (Jalur)</label>
                        <div className="p-inputgroup">
                            <InputText 
                                id="jalur_menu" 
                                name="jalur_menu" 
                                value={formik.values.jalur_menu} 
                                style={{ padding: '1rem' }}
                                onChange={formik.handleChange} 
                                placeholder="Contoh: /dashboard"
                            />
                        </div>
                    </div>

                    <div className="flex flex-column gap-2 w-full">
                        <label htmlFor="ikon_menu" className="font-bold">Ikon (PrimeIcons)</label>
                        <div className="p-inputgroup">
                            <InputText 
                                id="ikon_menu" 
                                name="ikon_menu" 
                                value={formik.values.ikon_menu} 
                                style={{ padding: '1rem' }}
                                onChange={formik.handleChange} 
                                placeholder="Contoh: pi pi-home"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex md:flex-row flex-column gap-2 w-full">
                    <div className="flex flex-column gap-2 w-full">
                        <label htmlFor="id_menu_induk" className="font-bold">Induk Menu (Kosongkan jika ini menu utama)</label>
                        <div className="p-inputgroup">
                            <Dropdown 
                                id="id_menu_induk" 
                                name="id_menu_induk" 
                                value={formik.values.id_menu_induk} 
                                options={((state as any).masterData?.parentMenus || []).filter((m: any) => !m.id_menu_induk || !m.jalur_menu)} 
                                optionLabel="nama_menu" 
                                optionValue="id_menu" 
                                onChange={(e) => formik.setFieldValue('id_menu_induk', e.value)}
                                placeholder="Pilih Induk Menu" 
                                filter
                                showClear
                                className="w-full"
                            />
                        </div>
                    </div>

                    <div className="flex flex-column gap-2 w-full">
                        <label htmlFor="id_peran" className="font-bold">Hak Akses Peran</label>
                        <div className="p-inputgroup">
                            <MultiSelect 
                                id="id_peran" 
                                name="id_peran" 
                                value={formik.values.id_peran} 
                                options={(state as any).masterData?.roles || []} 
                                optionLabel="nama_peran" 
                                optionValue="id_peran" 
                                onChange={(e) => formik.setFieldValue('id_peran', e.value)}
                                placeholder="Pilih Peran yang Boleh Akses" 
                                display="chip"
                                filter
                                className="w-full"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex md:flex-row flex-column gap-2 w-full">
                    <div className="flex flex-column gap-2 w-full">
                        <label htmlFor="urutan" className="font-bold">Urutan Tampil</label>
                        <div className="p-inputgroup">
                            <InputNumber 
                                id="urutan" 
                                value={formik.values.urutan} 
                                onValueChange={(e) => formik.setFieldValue('urutan', e.value)} 
                                min={0} 
                                className="w-full"
                            />
                        </div>
                        {getFormErrorMessage('urutan')}
                    </div>

                    <div className="flex flex-column gap-2 w-full">
                        <label htmlFor="status_aktif" className="font-bold">Status</label>
                        <div className="p-inputgroup">
                            <Dropdown 
                                id="status_aktif" 
                                name="status_aktif" 
                                value={formik.values.status_aktif} 
                                options={statusOptions} 
                                onChange={formik.handleChange} 
                                className="w-full"
                            />
                        </div>
                    </div>
                </div>
            </form>
        </Dialog>

        <Dialog visible={state.delete} style={{ width: '450px' }} header="Konfirmasi" modal onHide={() => setState(p => ({ ...p, delete: false }))}
            footer={
                <div className="flex justify-content-end gap-2">
                    <Button label="Batal" icon="pi pi-times" outlined onClick={() => setState(p => ({ ...p, delete: false }))} />
                    <Button label="Hapus" icon="pi pi-check" severity="danger" onClick={handleDelete} loading={state.load} />
                </div>
            }>
            <div className="flex align-items-center justify-content-center">
                <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                {state.selectedData && (
                    <span>
                        Apakah Anda yakin ingin menghapus <b>{state.selectedData.length}</b> menu yang dipilih?
                    </span>
                )}
            </div>
        </Dialog>
        </>
    );
};

export default Form;