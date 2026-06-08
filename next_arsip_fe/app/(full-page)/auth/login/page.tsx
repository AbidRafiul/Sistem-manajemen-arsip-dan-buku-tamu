'use client'

import { useFormik } from "formik"
import { useRouter } from "next/navigation"
import { useRef, useState } from "react"
import { showError, showSuccess } from "../../../../lib/tools/generalTools";
import { signIn } from "next-auth/react";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Checkbox } from "primereact/checkbox"; // Tambahkan import Checkbox
import Image from "next/image";
import { classNames } from "primereact/utils";
import axios from "axios";
import { LoginFormik } from "./component/interfaces";

const LoginPage = () => {
  const router = useRouter()
  const toast = useRef(null)

  const [state, setState] = useState({
    load: false,
  })

  const formik = useFormik({
    initialValues: {
      username: '',
      password: '',
      remember_me: false
    },
    validate: (data: LoginFormik) => {
      let errors = {} as LoginFormik;

      if (!data.username) {
        errors.username = 'Username Tidak Boleh Kosong';
      }
      if (!data.password) {
        errors.password = 'Password Tidak Boleh Kosong';
      }

      return errors;
    },
    onSubmit: (data) => {
      handleSubmit(data);
    }
  });

  const handleSubmit = async (data: LoginFormik) => {
    setState(p => ({ ...p, load: true }));
    try {
      const { data: vaLogin } = await axios.post('/api/auth/login', {
        username: data.username,
        password: data.password,
        remember_me: data.remember_me ? '1' : '0',
      });

      console.log(vaLogin)

      const nAuth = await signIn('credentials', {
        userData: JSON.stringify(vaLogin.data),
        redirect: false,
      })

      if (nAuth?.error) {
        showError(toast, nAuth.error)
        return;
      }

      router.replace("/dashboard");
      router.refresh();

    } catch (error: any) {
      const e = error?.response?.data || error;
      showError(toast, e.message || 'Terjadi kesalahan coba lagi nanti');
    } finally {
      setState(p => ({ ...p, load: false }));
    }
  };


  return <>
    <Toast ref={toast} />
    <div className="flex min-h-screen">
      {/* Left Side - Form */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center bg-white">
        <div className="w-full max-w-sm p-8">
          <h3 className="text-3xl font-extrabold text-gray-800 mb-2">Selamat Datang di</h3>
          <h2 className="text-4xl font-bold mb-6">
            Standart <br />
            {/* Work <br /> */}
            Mars Intern
          </h2>

          <form onSubmit={formik.handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-600 mb-2">Username</label>
              <InputText
                className="w-full"
                value={formik.values.username}
                onChange={(e) => formik.setFieldValue('username', e.target.value)}
                placeholder="Masukkan username"
              />
              {formik.errors.username && formik.touched.username && (
                <small className="p-error">{formik.errors.username}</small>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-gray-600 mb-2">Password</label>
              <Password
                value={formik.values.password}
                onChange={(e) => formik.setFieldValue('password', e.target.value)}
                toggleMask
                feedback={false}
                placeholder="Masukkan password"
                className="w-full"
                inputClassName="w-full"
              />
              {formik.errors.password && formik.touched.password && (
                <small className="p-error">{formik.errors.password}</small>
              )}
            </div>

            {/* Remember Me Checkbox */}
            <div className="mb-6 flex items-center">
              <Checkbox
                inputId="remember_me"
                checked={formik.values.remember_me}
                onChange={(e) => formik.setFieldValue('remember_me', e.checked)}
                className="mr-2"
              />
              <label
                htmlFor="remember_me"
                className="text-gray-600 cursor-pointer select-none"
              >
                Ingat Saya
              </label>
            </div>

            <Button
              loading={state.load}
              type="submit"
              label="Sign in"
              className="w-full p-button-lg p-button-primary"
            />
          </form>
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="hidden md:flex flex-1 bg-secondary justify-center items-center p-8">
        <Image
          src="/login.svg"
          alt="Illustration"
          width={500}
          height={500}
          className="object-contain"
        />
      </div>
    </div>
  </>
}

export default LoginPage;
