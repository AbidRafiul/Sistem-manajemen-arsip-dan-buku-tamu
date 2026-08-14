'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useFormik } from 'formik';
import { Toast } from 'primereact/toast';
import { useSession } from 'next-auth/react';
import ProfileForm from './components/display/form';
import apiGetData from '@/lib/axios/getData';
import putData from '@/lib/axios/putData';
import { showError, showSuccess } from '@/lib/tools/generalTools';
import { apiEndpointGet, apiEndpointUpdate } from './components/endpoints';

const ProfilePage = () => {
    const { data: session, update } = useSession();
    const toast = useRef<Toast>(null);
    const [state, setState] = useState<{ load: boolean; initialData: any }>({
        load: false,
        initialData: null
    });

    const getProfileData = async () => {
        setState((p) => ({ ...p, load: true }));
        try {
            const res = await apiGetData(apiEndpointGet);
            const profile = res?.data?.data;
            if (profile) {
                setState((p) => ({ ...p, initialData: profile }));
            }
        } catch (error: any) {
            showError(toast, error?.message || 'Gagal memuat profil');
        } finally {
            setState((p) => ({ ...p, load: false }));
        }
    };

    useEffect(() => {
        getProfileData();
    }, []);

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            nama_lengkap: (state.initialData as any)?.nama_lengkap || '',
            nama_pengguna: (state.initialData as any)?.nama_pengguna || '',
            telepon: (state.initialData as any)?.telepon || '',
            surel: (state.initialData as any)?.surel || '',
            sandi_lama: '',
            sandi_baru: '',
            validasi_sandi_baru: ''
        },
        validate: (data: any) => {
            let errors: any = {};
            if (!data.nama_lengkap) errors.nama_lengkap = 'Nama Lengkap wajib diisi.';
            if (!data.nama_pengguna) errors.nama_pengguna = 'Username wajib diisi.';
            if (!data.telepon) {
                errors.telepon = 'Nomor telepon wajib diisi.';
            } else if (!/^[0-9]+$/.test(data.telepon)) {
                errors.telepon = 'Harus berupa angka.';
            }
            if (data.surel && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(data.surel)) {
                errors.surel = 'Format email tidak valid.';
            }
            if (data.sandi_lama && !data.sandi_baru) {
                errors.sandi_baru = 'Sandi baru wajib diisi jika sandi lama diisi.';
            }
            if (data.sandi_baru && !data.sandi_lama) {
                errors.sandi_lama = 'Sandi lama wajib diisi untuk mengubah sandi.';
            }
            if (data.sandi_baru && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^a-zA-Z0-9]).{8,}$/.test(data.sandi_baru)) {
                errors.sandi_baru = 'Kata sandi minimal 8 karakter dan mengandung huruf besar, huruf kecil, angka, dan karakter spesial.';
            }
            if (data.sandi_baru && data.sandi_baru !== data.validasi_sandi_baru) {
                errors.validasi_sandi_baru = 'Validasi sandi tidak cocok dengan sandi baru.';
            }
            
            // Check if username changed but no old password provided
            if (state.initialData?.nama_pengguna !== data.nama_pengguna && !data.sandi_lama) {
                errors.sandi_lama = 'Sandi lama wajib diisi untuk verifikasi perubahan nama pengguna.';
            }

            return errors;
        },
        onSubmit: async (values) => {
            setState((p) => ({ ...p, load: true }));
            try {
                const payload: any = {
                    nama_lengkap: values.nama_lengkap,
                    nama_pengguna: values.nama_pengguna,
                    telepon: values.telepon,
                    surel: values.surel
                };

                if (values.sandi_baru) {
                    payload.sandi_lama = values.sandi_lama;
                    payload.sandi_baru = values.sandi_baru;
                } else if (values.sandi_lama) {
                    payload.sandi_lama = values.sandi_lama;
                }

                const response = await putData(apiEndpointUpdate, payload);
                showSuccess(toast, response.data?.message || 'Profil berhasil diperbarui');
                
                // Refresh session if username or name changed
                if (session) {
                    await update({
                        ...session,
                        user: {
                            ...session.user,
                            name: values.nama_lengkap,
                            nama_pengguna: values.nama_pengguna
                        }
                    });
                }
                
                // Refresh data to reset password field
                getProfileData();
            } catch (error: any) {
                showError(toast, error?.response?.data?.message || error?.message || 'Gagal memperbarui profil');
            } finally {
                setState((p) => ({ ...p, load: false }));
            }
        }
    });

    return (
        <div className="grid">
            <Toast ref={toast} />
            <div className="col-12">
                <div className="card">
                    <div className="flex flex-column mb-5 text-left pb-4 border-bottom-1 surface-border">
                        <span className="font-bold text-3xl text-900 mb-2" style={{ letterSpacing: '-0.5px' }}>Profil Saya</span>
                        <span className="text-color-secondary text-lg">Kelola informasi pribadi dan keamanan akun Anda.</span>
                    </div>

                    <div className="w-full mt-4">
                        <ProfileForm formik={formik} state={state} setState={setState} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
