import React from 'react';
import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Divider } from 'primereact/divider';
import { Card } from 'primereact/card';
import { Avatar } from 'primereact/avatar';
import { Tag } from 'primereact/tag';
import Image from 'next/image';
import { FormikProps } from 'formik';
import { LoginFormik } from './interfaces';

interface LoginViewProps {
    formik: FormikProps<LoginFormik>;
    isLoading: boolean;
    namaPenggunaInvalid: boolean;
    kataSandiInvalid: boolean;
    fontVariable: string;
}

export default function LoginView({ formik, isLoading, namaPenggunaInvalid, kataSandiInvalid, fontVariable }: LoginViewProps) {
    return (
        <main
            className={`${fontVariable} min-h-screen grid grid-nogutter m-0 p-0`}
            style={{ background: '#FFFFFF', fontFamily: 'var(--font-inter), sans-serif' }}
        >
            {/* Left Side: Form Container */}
            <section
                className="col-12 md:col-6 lg:col-5 flex align-items-center justify-content-center p-5 md:p-8"
                aria-label="Login Sistem Arsip & Buku Tamu"
                style={{ background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)' }}
            >
                <Card
                    className="w-full border-none shadow-none"
                    style={{ maxWidth: '420px', background: 'transparent' }}
                    pt={{ body: { style: { padding: 0 } }, content: { style: { padding: 0 } } }}
                >
                    {/* Brand Logo Header */}
                    <div className="flex align-items-center gap-3 mb-6">
                        <Avatar
                            icon="pi pi-shield"
                            size="large"
                            shape="square"
                            style={{
                                width: '3rem',
                                height: '3rem',
                                borderRadius: '14px',
                                background: 'linear-gradient(135deg, #4F46E5 0%, #3B82F6 100%)',
                                color: '#FFFFFF',
                                boxShadow: '0 10px 20px rgba(79, 70, 229, 0.25)'
                            }}
                        />
                        <div className="flex flex-column">
                            <span className="font-bold text-xl text-900" style={{ lineHeight: '1.1', letterSpacing: '-0.02em' }}>
                                Arsipku
                            </span>
                            <span
                                className="text-color-secondary text-xs font-semibold uppercase mt-1"
                                style={{ fontSize: '0.65rem', letterSpacing: '0.08em' }}
                            >
                                Sistem Arsip &amp; Buku Tamu
                            </span>
                        </div>
                    </div>

                    <Divider className="mb-5" style={{ borderColor: '#EEF2F6' }} />

                    {/* Heading Section */}
                    <header className="mb-5">
                        <Tag
                            value="PORTAL INTERNAL"
                            rounded
                            className="mb-3"
                            style={{
                                background: 'rgba(79, 70, 229, 0.1)',
                                color: '#4F46E5',
                                fontSize: '0.65rem',
                                fontWeight: 700,
                                letterSpacing: '0.06em',
                                padding: '0.35rem 0.75rem'
                            }}
                        />
                        <h1 className="text-3xl font-extrabold m-0 mb-2 text-900" style={{ fontWeight: 800, lineHeight: '1.2', letterSpacing: '-0.02em' }}>
                            Selamat Datang Kembali
                        </h1>
                        <p className="text-color-secondary m-0 text-sm font-normal" style={{ lineHeight: '1.6' }}>
                            Masuk untuk mengelola arsip dokumen dan buku tamu instansi Anda secara aman dan terstruktur.
                        </p>
                    </header>

                    {/* Login Form */}
                    <form className="flex flex-column gap-4" onSubmit={formik.handleSubmit} noValidate>
                        {/* Username Input */}
                        <div className="flex flex-column gap-2">
                            <label htmlFor="nama_pengguna" className="font-semibold text-900 text-sm">
                                Nama Pengguna
                            </label>
                            <span className="p-input-icon-left w-full">
                                <i className="pi pi-user text-color-secondary" />
                                <InputText
                                    id="nama_pengguna"
                                    name="nama_pengguna"
                                    value={formik.values.nama_pengguna}
                                    onChange={(e) => formik.setFieldValue('nama_pengguna', e.target.value)}
                                    onBlur={formik.handleBlur}
                                    placeholder="Masukkan nama pengguna"
                                    disabled={isLoading}
                                    className={`w-full ${namaPenggunaInvalid ? 'p-invalid' : ''}`}
                                    style={{ height: '50px', borderRadius: '10px' }}
                                    aria-invalid={namaPenggunaInvalid}
                                    aria-describedby={namaPenggunaInvalid ? 'nama_pengguna-error' : undefined}
                                />
                            </span>
                            {namaPenggunaInvalid && (
                                <small id="nama_pengguna-error" className="p-error block mt-1">
                                    {formik.errors.nama_pengguna}
                                </small>
                            )}
                        </div>

                        {/* Password Input */}
                        <div className="flex flex-column gap-2">
                            <label htmlFor="kata_sandi" className="font-semibold text-900 text-sm">
                                Kata Sandi
                            </label>
                            <span className="p-input-icon-left w-full">
                                <i className="pi pi-lock text-color-secondary" />
                                <Password
                                    inputId="kata_sandi"
                                    name="kata_sandi"
                                    value={formik.values.kata_sandi}
                                    onChange={(e) => formik.setFieldValue('kata_sandi', e.target.value)}
                                    onBlur={formik.handleBlur}
                                    toggleMask
                                    feedback={false}
                                    placeholder="Masukkan kata sandi"
                                    disabled={isLoading}
                                    className="w-full"
                                    inputClassName={`w-full ${kataSandiInvalid ? 'p-invalid' : ''}`}
                                    inputStyle={{ height: '50px', borderRadius: '10px' }}
                                    style={{ width: '100%' }}
                                    aria-invalid={kataSandiInvalid}
                                    aria-describedby={kataSandiInvalid ? 'kata_sandi-error' : undefined}
                                />
                            </span>
                            {kataSandiInvalid && (
                                <small id="kata_sandi-error" className="p-error block mt-1">
                                    {formik.errors.kata_sandi}
                                </small>
                            )}
                        </div>

                        {/* Remember Me */}
                        <div className="flex align-items-center gap-2 mt-1">
                            <Checkbox
                                inputId="remember_me"
                                checked={Boolean(formik.values.remember_me)}
                                onChange={(e) => formik.setFieldValue('remember_me', Boolean(e.checked))}
                                disabled={isLoading}
                            />
                            <label htmlFor="remember_me" className="text-color-secondary text-sm select-none cursor-pointer font-medium">
                                Ingat Saya
                            </label>
                        </div>

                        {/* Sign In Button */}
                        <Button
                            loading={isLoading}
                            disabled={isLoading}
                            type="submit"
                            label="Masuk"
                            icon="pi pi-sign-in"
                            className="w-full mt-2 font-semibold p-ripple"
                            style={{
                                height: '50px',
                                borderRadius: '10px',
                                fontSize: '1rem',
                                background: 'linear-gradient(135deg, #4F46E5 0%, #3B82F6 100%)',
                                border: 'none',
                                boxShadow: '0 8px 18px rgba(79, 70, 229, 0.28)'
                            }}
                        />
                    </form>

                    <p className="text-center text-color-secondary text-xs mt-5 mb-0">
                        &copy; {new Date().getFullYear()} Arsipku — Sistem Arsip &amp; Buku Tamu
                    </p>
                </Card>
            </section>

            {/* Right Side: Document Illustration */}
            <section
                className="hidden md:flex md:col-6 lg:col-7 align-items-center justify-content-center p-6 border-left-1"
                style={{ background: 'radial-gradient(circle at 50% 50%, rgba(79, 70, 229, 0.05) 0%, #F8FAFC 100%)', borderColor: '#EEF2F6' }}
                aria-hidden="true"
            >
                <div className="w-full max-w-50rem flex align-items-center justify-content-center p-4">
                    <Image
                        src="/login.svg"
                        alt="Illustration"
                        width={900}
                        height={900}
                        style={{ width: '100%', height: 'auto', maxHeight: '640px' }}
                        className="object-contain"
                    />
                </div>
            </section>
        </main>
    );
}
