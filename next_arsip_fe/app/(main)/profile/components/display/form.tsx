'use client';

import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';

const ProfileForm = ({ formik, state, setState }: any) => {
    const isFormFieldInvalid = (name: string) => !!(formik.touched[name] && formik.errors[name]);

    const getFormErrorMessage = (name: string) => {
        return isFormFieldInvalid(name) ? <small className="p-error">{formik.errors[name]}</small> : <small className="p-error">&nbsp;</small>;
    };

    return (
        <form onSubmit={formik.handleSubmit} className="flex flex-column gap-5 w-full">
            <div className="flex align-items-center gap-3 pb-3 border-bottom-1 surface-border">
                <div className="flex align-items-center justify-content-center bg-primary-100 border-circle" style={{ width: '3rem', height: '3rem' }}>
                    <i className="pi pi-user text-primary text-xl"></i>
                </div>
                <div className="flex flex-column gap-1 text-left">
                    <span className="font-semibold text-xl text-900">Informasi Dasar</span>
                    <span className="text-sm text-500">Perbarui informasi data diri Anda di sini.</span>
                </div>
            </div>

            <div className="grid grid-nogutter gap-4">
                <div className="col-12 md:col flex flex-column gap-2 text-left">
                    <label htmlFor="nama_lengkap" className="font-medium text-700 text-sm">Nama Lengkap</label>
                    <span className="p-input-icon-left w-full">
                        <i className="pi pi-id-card text-500" />
                        <InputText
                            id="nama_lengkap"
                            name="nama_lengkap"
                            value={formik.values.nama_lengkap || ''}
                            onChange={formik.handleChange}
                            className={`w-full p-inputtext-lg ${isFormFieldInvalid('nama_lengkap') ? 'p-invalid' : ''}`}
                            placeholder="John Doe"
                        />
                    </span>
                    {getFormErrorMessage('nama_lengkap')}
                </div>
                
                <div className="col-12 md:col flex flex-column gap-2 text-left">
                    <label htmlFor="nama_pengguna" className="font-medium text-700 text-sm">Nama Pengguna (Username)</label>
                    <span className="p-input-icon-left w-full">
                        <i className="pi pi-at text-500" />
                        <InputText
                            id="nama_pengguna"
                            name="nama_pengguna"
                            value={formik.values.nama_pengguna || ''}
                            onChange={formik.handleChange}
                            className={`w-full p-inputtext-lg ${isFormFieldInvalid('nama_pengguna') ? 'p-invalid' : ''}`}
                            placeholder="johndoe"
                        />
                    </span>
                    {getFormErrorMessage('nama_pengguna')}
                </div>
            </div>

            <div className="grid grid-nogutter gap-4">
                <div className="col-12 md:col flex flex-column gap-2 text-left">
                    <label htmlFor="telepon" className="font-medium text-700 text-sm">Nomor Telepon</label>
                    <span className="p-input-icon-left w-full">
                        <i className="pi pi-phone text-500" />
                        <InputText
                            id="telepon"
                            name="telepon"
                            keyfilter="int"
                            value={formik.values.telepon || ''}
                            onChange={formik.handleChange}
                            className={`w-full p-inputtext-lg ${isFormFieldInvalid('telepon') ? 'p-invalid' : ''}`}
                            placeholder="08123456789"
                        />
                    </span>
                    {getFormErrorMessage('telepon')}
                </div>
                
                <div className="col-12 md:col flex flex-column gap-2 text-left">
                    <label htmlFor="surel" className="font-medium text-700 text-sm">Alamat Surel (Email)</label>
                    <span className="p-input-icon-left w-full">
                        <i className="pi pi-envelope text-500" />
                        <InputText
                            id="surel"
                            name="surel"
                            type="email"
                            value={formik.values.surel || ''}
                            onChange={formik.handleChange}
                            className={`w-full p-inputtext-lg ${isFormFieldInvalid('surel') ? 'p-invalid' : ''}`}
                            placeholder="user@email.com"
                        />
                    </span>
                    {getFormErrorMessage('surel')}
                </div>
            </div>

            <div className="flex align-items-center gap-3 pt-3 pb-3 border-bottom-1 surface-border mt-3">
                <div className="flex align-items-center justify-content-center bg-primary-100 border-circle" style={{ width: '3rem', height: '3rem' }}>
                    <i className="pi pi-lock text-primary text-xl"></i>
                </div>
                <div className="flex flex-column gap-1 text-left">
                    <span className="font-semibold text-xl text-900">Keamanan</span>
                    <span className="text-sm text-500">Kosongkan jika Anda tidak ingin mengubah kata sandi.</span>
                </div>
            </div>

            <div className="grid grid-nogutter gap-4">
                <div className="col-12 md:col flex flex-column gap-2 text-left">
                    <label htmlFor="kata_sandi" className="font-medium text-700 text-sm">Kata Sandi Baru</label>
                    <Password
                        id="kata_sandi"
                        name="kata_sandi"
                        value={formik.values.kata_sandi || ''}
                        onChange={formik.handleChange}
                        toggleMask
                        className={`w-full ${isFormFieldInvalid('kata_sandi') ? 'p-invalid' : ''}`}
                        inputClassName="w-full p-inputtext-lg"
                        promptLabel="Masukkan kata sandi baru"
                        weakLabel="Lemah"
                        mediumLabel="Sedang"
                        strongLabel="Kuat"
                    />
                    {getFormErrorMessage('kata_sandi')}
                </div>
            </div>

            <div className="flex justify-content-end mt-4 pt-3 border-top-1 surface-border">
                <Button 
                    type="submit" 
                    label="Simpan Perubahan" 
                    icon="pi pi-check" 
                    loading={state.load} 
                    disabled={state.load}
                    className="p-button-primary p-button-lg shadow-2"
                    style={{ borderRadius: '8px' }}
                />
            </div>
        </form>
    );
};

export default ProfileForm;
