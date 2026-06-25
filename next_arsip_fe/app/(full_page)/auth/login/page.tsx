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
            nama_pengguna: '',
            kata_sandi: '',
            remember_me: false
        },
        validate: (data: LoginFormik) => {
            const errors = {} as LoginFormik;

            if (!data.nama_pengguna) {
                errors.nama_pengguna = 'nama_pengguna tidak boleh kosong';
            }

            if (!data.kata_sandi) {
                errors.kata_sandi = 'kata_sandi tidak boleh kosong';
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

<<<<<<< HEAD
    const handleUnavailableAction = (message: string) => {
        showError(toast, message);
    };

    const nama_penggunaInvalid = !!(formik.touched.nama_pengguna && formik.errors.nama_pengguna);
    const kata_sandiInvalid = !!(formik.touched.kata_sandi && formik.errors.kata_sandi);
=======
    const usernameInvalid = !!(formik.touched.username && formik.errors.username);
    const passwordInvalid = !!(formik.touched.password && formik.errors.password);
>>>>>>> main

    return (
        <>
            <Toast ref={toast} />
<<<<<<< HEAD
            <main className="login-shell">
                <section className="login-card" aria-label="Login DocArchive">
                    <aside className="login-brand-panel">
                        <div className="brand-mark">
                            <span className="brand-icon" aria-hidden="true">
                                <i className="pi pi-inbox" />
                            </span>
                            <span>DocArchive</span>
                        </div>

                        <div className="brand-copy">
                            <p className="brand-kicker">Enterprise document control</p>
                            <h1>Secure, Scale, and Search.</h1>
                            <p>Kelola arsip dan buku tamu dalam satu ruang kerja yang cepat, presisi, dan siap untuk kebutuhan operasional harian.</p>
                        </div>

                        <div className="archive-preview" aria-hidden="true">
                            <Image src="/login.svg" alt="" fill priority sizes="420px" className="archive-preview-image" />
                        </div>

                        <div className="security-card">
                            <div className="security-icon" aria-hidden="true">
                                <i className="pi pi-shield" />
                            </div>
                            <div className="security-copy">
                                <strong>Enterprise Security</strong>
                                <span>AES-256 protection active</span>
                            </div>
                            <div className="security-meter" aria-hidden="true">
                                <span />
                            </div>
                        </div>
                    </aside>

                    <section className="login-form-panel">
                        <div className="form-heading">
                            <span className="form-eyebrow">Protected workspace</span>
                            <h2>Welcome back</h2>
                            <p>Masukkan kredensial akun untuk membuka dashboard arsip.</p>
                        </div>

                        <form className="login-form" onSubmit={formik.handleSubmit} noValidate>
                            <div className="field-group">
                                <label htmlFor="nama_pengguna">nama_pengguna</label>
                                <span className={`input-shell ${nama_penggunaInvalid ? 'is-invalid' : ''}`}>
                                    <i className="pi pi-user" aria-hidden="true" />
                                    <InputText
                                        id="nama_pengguna"
                                        name="nama_pengguna"
                                        value={formik.values.nama_pengguna}
                                        onChange={(e) => formik.setFieldValue('nama_pengguna', e.target.value)}
                                        onBlur={formik.handleBlur}
                                        placeholder="masukkan nama_pengguna"
                                        disabled={state.load}
                                        aria-invalid={nama_penggunaInvalid}
                                        aria-describedby={nama_penggunaInvalid ? 'nama_pengguna-error' : undefined}
                                    />
                                </span>
                                {nama_penggunaInvalid && (
                                    <small id="nama_pengguna-error" className="field-error">
                                        {formik.errors.nama_pengguna}
                                    </small>
                                )}
                            </div>

                            <div className="field-group">
                                <div className="label-row">
                                    <label htmlFor="kata_sandi">kata_sandi</label>
                                    <button type="button" className="link-button" onClick={() => handleUnavailableAction('Fitur lupa kata_sandi belum tersedia di sistem ini.')}>
                                        Lupa kata_sandi?
                                    </button>
                                </div>
                                <span className={`input-shell kata_sandi-shell ${kata_sandiInvalid ? 'is-invalid' : ''}`}>
                                    <i className="pi pi-lock" aria-hidden="true" />
                                    <Password
                                        inputId="kata_sandi"
                                        name="kata_sandi"
                                        value={formik.values.kata_sandi}
                                        onChange={(e) => formik.setFieldValue('kata_sandi', e.target.value)}
                                        onBlur={formik.handleBlur}
                                        toggleMask
                                        feedback={false}
                                        placeholder="masukkan kata_sandi"
                                        disabled={state.load}
                                        inputClassName="kata_sandi-input"
                                        aria-invalid={kata_sandiInvalid}
                                        aria-describedby={kata_sandiInvalid ? 'kata_sandi-error' : undefined}
                                    />
                                </span>
                                {kata_sandiInvalid && (
                                    <small id="kata_sandi-error" className="field-error">
                                        {formik.errors.kata_sandi}
                                    </small>
                                )}
                            </div>

                            <div className="form-options">
                                <div className="remember-row">
                                    <Checkbox inputId="remember_me" checked={Boolean(formik.values.remember_me)} onChange={(e) => formik.setFieldValue('remember_me', Boolean(e.checked))} disabled={state.load} />
                                    <label htmlFor="remember_me">Ingat saya selama 30 hari</label>
                                </div>
                            </div>

                            <Button loading={state.load} disabled={state.load} type="submit" className="signin-button">
                                <i className="pi pi-sign-in" aria-hidden="true" />
                                <span>Masuk ke DocArchive</span>
                            </Button>

                            <div className="divider">
                                <span>atau lanjutkan dengan</span>
                            </div>

                            <Button type="button" className="sso-button" onClick={() => handleUnavailableAction('SSO belum dikonfigurasi untuk proyek ini.')}>
                                <i className="pi pi-sitemap" aria-hidden="true" />
                                <span>Masuk dengan SSO</span>
                            </Button>
                        </form>

                        <nav className="login-links" aria-label="Login links">
                            <button type="button" onClick={() => handleUnavailableAction('Privacy policy belum tersedia.')}>
                                Privacy Policy
                            </button>
                            <button type="button" onClick={() => handleUnavailableAction('Terms of service belum tersedia.')}>
                                Terms of Service
                            </button>
                            <button type="button" onClick={() => handleUnavailableAction('Hubungi administrator sistem untuk bantuan akses.')}>
                                Support
                            </button>
                        </nav>
                    </section>
                </section>
            </main>

            <style jsx global>{`
                .login-shell {
                    --login-primary: #3525cd;
                    --login-primary-bright: #4f46e5;
                    --login-primary-soft: #e2dfff;
                    --login-surface: #f8f9ff;
                    --login-surface-low: #eff4ff;
                    --login-surface-card: #ffffff;
                    --login-text: #0b1c30;
                    --login-muted: #545f73;
                    --login-outline: #c7c4d8;
                    --login-outline-strong: #777587;
                    --login-success: #4edea3;
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: clamp(1rem, 2.5vw, 2rem);
                    color: var(--login-text);
                    background: radial-gradient(circle at 75% 80%, rgba(0, 83, 56, 0.12), transparent 28rem), radial-gradient(circle at 16% 10%, rgba(79, 70, 229, 0.13), transparent 24rem), linear-gradient(135deg, #f8f9ff 0%, #f8fafc 100%);
                    font-family:
                        Inter,
                        ui-sans-serif,
                        system-ui,
                        -apple-system,
                        BlinkMacSystemFont,
                        'Segoe UI',
                        sans-serif;
                    position: relative;
                    overflow: hidden;
                }

                .login-shell::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background-image: radial-gradient(rgba(79, 70, 229, 0.18) 0.8px, transparent 0.8px);
                    background-size: 22px 22px;
                    opacity: 0.45;
                    pointer-events: none;
                }

                .login-card {
                    width: min(100%, 1040px);
                    min-height: min(620px, calc(100vh - 2rem));
                    display: grid;
                    grid-template-columns: minmax(0, 1fr) minmax(420px, 0.94fr);
                    background: var(--login-surface-card);
                    border: 1px solid rgba(199, 196, 216, 0.65);
                    border-radius: 2rem;
                    box-shadow: 0 32px 90px rgba(79, 70, 229, 0.2);
                    overflow: hidden;
                    position: relative;
                    z-index: 1;
                }

                .login-brand-panel {
                    min-height: 100%;
                    padding: clamp(1.75rem, 3vw, 2.75rem);
                    color: #ffffff;
                    background: linear-gradient(160deg, rgba(53, 37, 205, 0.95), rgba(79, 70, 229, 0.95)), #3525cd;
                    position: relative;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    gap: 1.4rem;
                }

                .login-brand-panel::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(90deg, rgba(255, 255, 255, 0.12) 1px, transparent 1px), linear-gradient(0deg, rgba(255, 255, 255, 0.09) 1px, transparent 1px);
                    background-size: 54px 54px;
                    opacity: 0.15;
                }

                .brand-mark,
                .brand-copy,
                .archive-preview,
                .security-card {
                    position: relative;
                    z-index: 1;
                }

                .brand-mark {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.875rem;
                    font-size: clamp(1.5rem, 2vw, 2rem);
                    font-weight: 800;
                    letter-spacing: 0;
                    text-shadow: 0 1px 0 rgba(15, 0, 105, 0.28);
                }

                .brand-icon {
                    width: 3rem;
                    height: 3rem;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--login-primary);
                    background: #ffffff;
                    border-radius: 1rem;
                    box-shadow: 0 16px 30px rgba(15, 0, 105, 0.22);
                }

                .brand-icon .pi {
                    font-size: 1.25rem;
                }

                .brand-copy {
                    max-width: 560px;
                    margin-top: clamp(0.25rem, 1.8vh, 1rem);
                }

                .brand-kicker {
                    margin: 0 0 1rem;
                    color: #c3c0ff;
                    font-size: 0.75rem;
                    font-weight: 800;
                    letter-spacing: 0.1em;
                    text-transform: uppercase;
                }

                .brand-copy h1 {
                    margin: 0;
                    max-width: 500px;
                    color: #ffffff;
                    font-size: clamp(2.2rem, 4vw, 3.55rem);
                    line-height: 1.02;
                    font-weight: 800;
                    letter-spacing: 0;
                }

                .brand-copy p:not(.brand-kicker) {
                    margin: 1.4rem 0 0;
                    max-width: 520px;
                    color: rgba(255, 255, 255, 0.88);
                    font-size: clamp(0.95rem, 1.25vw, 1.12rem);
                    line-height: 1.55;
                    font-weight: 500;
                }

                .archive-preview {
                    flex: 1;
                    min-height: 145px;
                    margin: 0 -1.5rem;
                    border-radius: 1.5rem;
                    opacity: 0.22;
                    filter: saturate(0.85);
                }

                .archive-preview-image {
                    object-fit: contain;
                    object-position: center;
                }

                .security-card {
                    display: grid;
                    grid-template-columns: 3.5rem 1fr;
                    gap: 0.9rem 1rem;
                    align-items: center;
                    width: min(100%, 470px);
                    padding: 1.05rem 1.2rem;
                    border: 1px solid rgba(255, 255, 255, 0.22);
                    border-radius: 1.25rem;
                    background: rgba(255, 255, 255, 0.11);
                    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12);
                    backdrop-filter: blur(12px);
                }

                .security-icon {
                    grid-row: span 2;
                    width: 3.5rem;
                    height: 3.5rem;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 999px;
                    color: #ffffff;
                    background: rgba(255, 255, 255, 0.18);
                }

                .security-icon .pi {
                    font-size: 1.35rem;
                }

                .security-copy {
                    display: flex;
                    flex-direction: column;
                    gap: 0.25rem;
                }

                .security-copy strong {
                    font-size: 0.98rem;
                    font-weight: 800;
                }

                .security-copy span {
                    color: rgba(255, 255, 255, 0.82);
                    font-size: 0.86rem;
                    font-weight: 500;
                }

                .security-meter {
                    grid-column: 1 / -1;
                    height: 0.5rem;
                    border-radius: 999px;
                    background: rgba(255, 255, 255, 0.16);
                    overflow: hidden;
                }

                .security-meter span {
                    display: block;
                    width: 74%;
                    height: 100%;
                    border-radius: inherit;
                    background: linear-gradient(90deg, #67f4b7, var(--login-success));
                }

                .login-form-panel {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    padding: clamp(2rem, 4vw, 3.5rem);
                    background: rgba(255, 255, 255, 0.96);
                }

                .form-heading {
                    margin-bottom: 1.75rem;
                }

                .form-eyebrow {
                    display: inline-flex;
                    margin-bottom: 0.75rem;
                    color: var(--login-primary);
                    font-size: 0.7rem;
                    font-weight: 800;
                    letter-spacing: 0.1em;
                    text-transform: uppercase;
                }

                .form-heading h2 {
                    margin: 0;
                    color: var(--login-text);
                    font-size: clamp(1.8rem, 2.5vw, 2.2rem);
                    line-height: 1.14;
                    font-weight: 800;
                    letter-spacing: 0;
                }

                .form-heading p {
                    margin: 0.75rem 0 0;
                    max-width: 430px;
                    color: var(--login-muted);
                    font-size: 1rem;
                    line-height: 1.55;
                    font-weight: 500;
                }

                .login-form {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .field-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.55rem;
                }

                .field-group label,
                .label-row label {
                    color: #3c475a;
                    font-size: 0.75rem;
                    font-weight: 800;
                    letter-spacing: 0.06em;
                    text-transform: uppercase;
                }

                .label-row {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 1rem;
                }

                .link-button,
                .login-links button {
                    padding: 0;
                    border: 0;
                    background: transparent;
                    color: var(--login-primary);
                    cursor: pointer;
                    font: inherit;
                    font-weight: 800;
                }

                .link-button {
                    font-size: 0.8rem;
                }

                .input-shell {
                    min-height: 3.35rem;
                    display: grid;
                    grid-template-columns: 1.25rem 1fr;
                    align-items: center;
                    gap: 0.8rem;
                    padding: 0 1rem;
                    color: var(--login-outline-strong);
                    background: #eff4ff;
                    border: 1px solid var(--login-outline);
                    border-radius: 0.85rem;
                    transition:
                        border-color 160ms ease,
                        box-shadow 160ms ease,
                        background 160ms ease;
                }

                .input-shell:focus-within {
                    background: #ffffff;
                    border-color: var(--login-primary);
                    box-shadow: 0 0 0 3px rgba(53, 37, 205, 0.16);
                }

                .input-shell.is-invalid {
                    border-color: #ba1a1a;
                    box-shadow: 0 0 0 3px rgba(186, 26, 26, 0.1);
                }

                .input-shell > .pi {
                    font-size: 1.1rem;
                }

                .input-shell .p-inputtext,
                .input-shell .p-kata_sandi,
                .input-shell .p-inputwrapper,
                .input-shell .p-icon-field,
                .input-shell .kata_sandi-input {
                    width: 100%;
                }

                .input-shell .p-kata_sandi,
                .input-shell .p-inputwrapper,
                .input-shell .p-icon-field {
                    display: flex;
                    align-items: center;
                    min-height: 0;
                    background: transparent !important;
                    border: 0 !important;
                    border-radius: 0 !important;
                    box-shadow: none !important;
                }

                .input-shell .p-inputtext,
                .input-shell .kata_sandi-input {
                    height: 3.1rem;
                    padding: 0;
                    color: var(--login-text);
                    background: transparent !important;
                    border: 0 !important;
                    border-radius: 0 !important;
                    box-shadow: none !important;
                    font-size: 1rem;
                    font-weight: 500;
                }

                .input-shell .p-inputtext:enabled:focus,
                .input-shell .p-inputtext:enabled:hover,
                .input-shell .kata_sandi-input:enabled:focus {
                    background: transparent !important;
                    box-shadow: none !important;
                    border: 0 !important;
                }

                .input-shell .p-inputtext::placeholder,
                .input-shell .kata_sandi-input::placeholder {
                    color: #8f93a3;
                    font-weight: 500;
                }

                .kata_sandi-shell .p-icon-field {
                    width: 100%;
                }

                .kata_sandi-shell .p-kata_sandi-input {
                    padding-right: 2.3rem !important;
                }

                .field-error {
                    color: #93000a;
                    font-size: 0.78rem;
                    font-weight: 700;
                }

                .form-options {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 1rem;
                }

                .remember-row {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.75rem;
                    color: var(--login-text);
                    font-size: 0.95rem;
                    font-weight: 500;
                }

                .remember-row label {
                    cursor: pointer;
                    text-transform: none;
                    letter-spacing: 0;
                    font-size: 0.95rem;
                    font-weight: 500;
                    color: var(--login-text);
                }

                .remember-row .p-checkbox .p-checkbox-box {
                    border-color: var(--login-outline);
                    border-radius: 0.35rem;
                }

                .remember-row .p-checkbox .p-checkbox-box.p-highlight {
                    background: var(--login-primary);
                    border-color: var(--login-primary);
                }

                .signin-button,
                .sso-button {
                    width: 100%;
                    min-height: 3.8rem;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.75rem;
                    border-radius: 0.85rem;
                    font-size: 1rem;
                    font-weight: 800;
                    transition:
                        transform 160ms ease,
                        box-shadow 160ms ease,
                        background 160ms ease;
                }

                .signin-button {
                    margin-top: 0.4rem;
                    color: #ffffff;
                    border: 0;
                    background: linear-gradient(135deg, var(--login-primary), var(--login-primary-bright));
                    box-shadow: 0 18px 34px rgba(53, 37, 205, 0.28);
                }

                .signin-button:enabled:hover,
                .sso-button:enabled:hover {
                    transform: translateY(-2px);
                }

                .signin-button:enabled:hover {
                    background: linear-gradient(135deg, #2f20b8, var(--login-primary-bright));
                    box-shadow: 0 22px 42px rgba(53, 37, 205, 0.34);
                }

                .signin-button .p-button-label,
                .sso-button .p-button-label {
                    display: none;
                }

                .divider {
                    display: grid;
                    grid-template-columns: 1fr auto 1fr;
                    align-items: center;
                    gap: 1rem;
                    color: #6f7280;
                    font-size: 0.78rem;
                    font-weight: 700;
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                    margin: 0.7rem 0 0.05rem;
                }

                .divider::before,
                .divider::after {
                    content: '';
                    height: 1px;
                    background: #e4e7f1;
                }

                .sso-button {
                    color: #3c475a;
                    background: #ffffff;
                    border: 1px solid var(--login-outline);
                    box-shadow: none;
                    font-weight: 700;
                }

                .sso-button:enabled:hover {
                    color: var(--login-primary);
                    border-color: var(--login-primary);
                    background: #f8f9ff;
                }

                .login-links {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: clamp(1rem, 2vw, 2rem);
                    margin-top: 2rem;
                    flex-wrap: wrap;
                }

                .login-links button {
                    color: #6f7280;
                    font-size: 0.86rem;
                    font-weight: 500;
                }

                .login-links button:hover,
                .link-button:hover {
                    color: var(--login-primary-bright);
                }

                @media (max-width: 980px) {
                    .login-card {
                        grid-template-columns: 1fr;
                        min-height: auto;
                    }

                    .login-brand-panel {
                        min-height: 420px;
                    }

                    .archive-preview {
                        display: none;
                    }

                    .security-card {
                        margin-top: auto;
                    }
                }

                @media (max-width: 640px) {
                    .login-shell {
                        align-items: stretch;
                        padding: 1rem;
                    }

                    .login-card {
                        border-radius: 1.5rem;
                    }

                    .login-brand-panel {
                        min-height: 330px;
                        padding: 1.5rem;
                    }

                    .brand-copy {
                        margin-top: 0;
                    }

                    .brand-copy h1 {
                        max-width: 340px;
                    }

                    .brand-copy p:not(.brand-kicker) {
                        margin-top: 1rem;
                        font-size: 0.96rem;
                    }

                    .security-card {
                        grid-template-columns: 2.75rem 1fr;
                        padding: 1rem;
                    }

                    .security-icon {
                        width: 2.75rem;
                        height: 2.75rem;
                    }

                    .login-form-panel {
                        padding: 1.5rem;
                    }

                    .form-heading {
                        margin-bottom: 1.5rem;
                    }

                    .input-shell,
                    .signin-button,
                    .sso-button {
                        min-height: 3.7rem;
                    }

                    .login-links {
                        margin-top: 1.75rem;
                    }
                }
            `}</style>
=======
            <LoginView
                formik={formik}
                isLoading={state.load}
                usernameInvalid={usernameInvalid}
                passwordInvalid={passwordInvalid}
                fontVariable={inter.variable}
            />
>>>>>>> main
        </>
    );
};

export default LoginPage;
