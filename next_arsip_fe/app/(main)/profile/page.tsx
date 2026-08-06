'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useFormik } from 'formik';
import { Toast } from 'primereact/toast';
import { useSession } from 'next-auth/react';
import ProfileForm from './components/display/form';
import apiGetData from '@/lib/axios/getData';
import putData from '@/lib/axios/putData';
import { showError, showSuccess } from '@/lib/tools/generalTools';
import { apiEndpointGet, apiEndpointUpdate } from './endpoints';

const ProfilePage = () => {
    const { data: session, update } = useSession();
    const toast = useRef<Toast>(null);
    const [state, setState] = useState({
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
                formik.setValues({
                    nama_lengkap: profile.nama_lengkap || '',
                    nama_pengguna: profile.nama_pengguna || '',
                    telepon: profile.telepon || '',
                    surel: profile.surel || '',
                    kata_sandi: ''
                });
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
        initialValues: {
            nama_lengkap: '',
            nama_pengguna: '',
            telepon: '',
            surel: '',
            kata_sandi: ''
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
            if (data.kata_sandi && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^a-zA-Z0-9]).{8,}$/.test(data.kata_sandi)) {
                errors.kata_sandi = 'Kata sandi minimal 8 karakter dan mengandung huruf besar, huruf kecil, angka, dan karakter spesial.';
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

                if (values.kata_sandi) {
                    payload.kata_sandi = values.kata_sandi;
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

                    <div className="w-full xl:w-9 mt-4">
                        <ProfileForm formik={formik} state={state} setState={setState} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
