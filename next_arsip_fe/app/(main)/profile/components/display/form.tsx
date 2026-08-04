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
        <form onSubmit={formik.handleSubmit} className="flex flex-column gap-3 w-full">
            <div className="flex flex-column gap-2 text-left">
                <span className="font-semibold text-xl text-900">Informasi Dasar</span>
                <span className="text-sm text-500">Perbarui informasi data diri Anda di sini.</span>
            </div>
            
            <Divider className="my-2" />

            <div className="grid">
                <div className="col-12 md:col-6 flex flex-column gap-2 text-left">
                    <label htmlFor="nama_lengkap" className="font-medium text-900">Nama Lengkap</label>
                    <InputText
                        id="nama_lengkap"
                        name="nama_lengkap"
                        value={formik.values.nama_lengkap || ''}
                        onChange={formik.handleChange}
                        className={isFormFieldInvalid('nama_lengkap') ? 'p-invalid' : ''}
                        style={{ padding: '0.75rem' }}
                    />
                    {getFormErrorMessage('nama_lengkap')}
                </div>
                
                <div className="col-12 md:col-6 flex flex-column gap-2 text-left">
                    <label htmlFor="nama_pengguna" className="font-medium text-900">Nama Pengguna (Username)</label>
                    <InputText
                        id="nama_pengguna"
                        name="nama_pengguna"
                        value={formik.values.nama_pengguna || ''}
                        onChange={formik.handleChange}
                        className={isFormFieldInvalid('nama_pengguna') ? 'p-invalid' : ''}
                        style={{ padding: '0.75rem' }}
                    />
                    {getFormErrorMessage('nama_pengguna')}
                </div>

                <div className="col-12 md:col-6 flex flex-column gap-2 text-left">
                    <label htmlFor="telepon" className="font-medium text-900">Nomor Telepon</label>
                    <InputText
                        id="telepon"
                        name="telepon"
                        keyfilter="int"
                        value={formik.values.telepon || ''}
                        onChange={formik.handleChange}
                        className={isFormFieldInvalid('telepon') ? 'p-invalid' : ''}
                        style={{ padding: '0.75rem' }}
                    />
                    {getFormErrorMessage('telepon')}
                </div>
                
                <div className="col-12 md:col-6 flex flex-column gap-2 text-left">
                    <label htmlFor="surel" className="font-medium text-900">Alamat Surel (Email)</label>
                    <InputText
                        id="surel"
                        name="surel"
                        type="email"
                        value={formik.values.surel || ''}
                        onChange={formik.handleChange}
                        className={isFormFieldInvalid('surel') ? 'p-invalid' : ''}
                        style={{ padding: '0.75rem' }}
                        placeholder="Contoh: user@email.com"
                    />
                    {getFormErrorMessage('surel')}
                </div>
            </div>

            <div className="flex flex-column gap-2 mt-4 text-left">
                <span className="font-semibold text-xl text-900">Keamanan (Ubah Kata Sandi)</span>
                <span className="text-sm text-500">Kosongkan jika Anda tidak ingin mengubah kata sandi.</span>
            </div>
            
            <Divider className="my-2" />

            <div className="grid">
                <div className="col-12 md:col-6 flex flex-column gap-2 text-left">
                    <label htmlFor="kata_sandi" className="font-medium text-900">Kata Sandi Baru</label>
                    <Password
                        id="kata_sandi"
                        name="kata_sandi"
                        value={formik.values.kata_sandi || ''}
                        onChange={formik.handleChange}
                        toggleMask
                        className={isFormFieldInvalid('kata_sandi') ? 'p-invalid w-full' : 'w-full'}
                        inputClassName="w-full"
                        inputStyle={{ padding: '0.75rem' }}
                        promptLabel="Masukkan kata sandi baru"
                        weakLabel="Lemah"
                        mediumLabel="Sedang"
                        strongLabel="Kuat"
                    />
                    {getFormErrorMessage('kata_sandi')}
                </div>
            </div>

            <div className="flex justify-content-end mt-4">
                <Button 
                    type="submit" 
                    label="Simpan Perubahan" 
                    icon="pi pi-check" 
                    loading={state.load} 
                    disabled={state.load}
                    style={{ borderRadius: '8px', padding: '0.75rem 2rem' }}
                />
            </div>
        </form>
    );
};

export default ProfileForm;
