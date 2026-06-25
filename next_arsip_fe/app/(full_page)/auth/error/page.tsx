/* eslint-disable @next/next/no-img-element */
'use client';
import { useRouter } from 'next/navigation';
import React from 'react';
import { Button } from 'primereact/button';

const ErrorPage = () => {
    const router = useRouter();

    return (
        <div className="surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden">
            <div className="flex flex-column align-items-center justify-content-center">
                <img src="/demo/images/error/logo-error.svg" alt="Sakai logo" className="mb-5 w-6rem flex-shrink-0" />
                <div className="card w-full py-8 px-5 sm:px-8 flex flex-column align-items-center">
                    <div className="flex justify-content-center align-items-center bg-primary border-circle" style={{ height: '3.2rem', width: '3.2rem' }}>
                        <i className="pi pi-fw pi-exclamation-circle text-2xl text-primary-contrast"></i>
                    </div>
                    <h1 className="text-900 font-bold text-5xl mb-2">Error Occured</h1>
                    <div className="text-600 mb-5">Something went wrong.</div>
                    <img src="/demo/images/error/asset-error.svg" alt="Error" className="mb-5" width="80%" />
                    <Button icon="pi pi-arrow-left" label="Go to Dashboard" text onClick={() => router.push('/')} />
                </div>
            </div>
        </div>
    );
};

export default ErrorPage;
