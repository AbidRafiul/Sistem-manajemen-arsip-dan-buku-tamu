'use client';

import axios from 'axios';
import { useFormik } from 'formik';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Toast } from 'primereact/toast';
import { useRef, useState } from 'react';
import { showError } from '../../../../lib/tools/generalTools';
import { LoginFormik } from './component/interfaces';
import { Inter } from 'next/font/google';
import LoginView from './component/loginView';

const inter = Inter({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700', '800'],
    variable: '--font-inter'
});

const LoginPage = () => {
    const router = useRouter();
    const toast = useRef<Toast>(null);

    const [state, setState] = useState({
        load: false
    });

    const formik = useFormik<LoginFormik>({
        initialValues: {
            username: '',
            password: '',
            remember_me: false
        },
        validate: (data: LoginFormik) => {
            const errors = {} as LoginFormik;

            if (!data.username) {
                errors.username = 'Username tidak boleh kosong';
            }

            if (!data.password) {
                errors.password = 'Password tidak boleh kosong';
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
                username: data.username,
                password: data.password,
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

    const usernameInvalid = !!(formik.touched.username && formik.errors.username);
    const passwordInvalid = !!(formik.touched.password && formik.errors.password);

    return (
        <>
            <Toast ref={toast} />
            <LoginView
                formik={formik}
                isLoading={state.load}
                usernameInvalid={usernameInvalid}
                passwordInvalid={passwordInvalid}
                fontVariable={inter.variable}
            />
        </>
    );
};

export default LoginPage;