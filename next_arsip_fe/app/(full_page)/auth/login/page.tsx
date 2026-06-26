'use client';

import axios from 'axios';
import { useFormik } from 'formik';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Toast } from 'primereact/toast';
import { useRef, useState } from 'react';
import { showError } from '../../../../lib/tools/generalTools';
import { LoginFormik } from './component/interfaces';
import LoginView from './component/loginView';

const LoginPage = () => {
    const router = useRouter();
    const toast = useRef<Toast>(null);

    const [state, setState] = useState({
        load: false
    });

    const formik = useFormik<LoginFormik>({
        initialValues: {
            nama_pengguna: '',
            kata_sandi: '',
            remember_me: false
        },
        validate: (data: LoginFormik) => {
            const errors = {} as LoginFormik;

            if (!data.nama_pengguna) {
                errors.nama_pengguna = 'Username tidak boleh kosong';
            }

            if (!data.kata_sandi) {
                errors.kata_sandi = 'Password tidak boleh kosong';
            }

            return errors;
        },
        onSubmit: (data) => {
            handleSubmit(data);
        }
    });

    const handleSubmit = async (data: LoginFormik) => {
        setState((prev) => ({ ...prev, load: true }));

        try {
            const { data: vaLogin } = await axios.post('/api/auth/login', {
                nama_pengguna: data.nama_pengguna,
                kata_sandi: data.kata_sandi,
                remember_me: data.remember_me ? '1' : '0'
            });

            const nAuth = await signIn('credentials', {
                userData: JSON.stringify(vaLogin.data),
                redirect: false
            });

            if (nAuth?.error) {
                showError(toast, nAuth.error);
                return;
            }

            router.replace('/dashboard');
            router.refresh();
        } catch (error: any) {
            const e = error?.response?.data || error;
            showError(toast, e.message || 'Terjadi kesalahan coba lagi nanti');
        } finally {
            setState((prev) => ({ ...prev, load: false }));
        }
    };

    const namaPenggunaInvalid = !!(formik.touched.nama_pengguna && formik.errors.nama_pengguna);
    const kataSandiInvalid = !!(formik.touched.kata_sandi && formik.errors.kata_sandi);

    return (
        <>
            <Toast ref={toast} />
            <LoginView
                formik={formik}
                isLoading={state.load}
                namaPenggunaInvalid={namaPenggunaInvalid}
                kataSandiInvalid={kataSandiInvalid}
                fontVariable=""
            />
        </>
    );
};

export default LoginPage;