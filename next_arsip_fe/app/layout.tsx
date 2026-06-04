import { LayoutProvider } from '../layout/context/layoutcontext';
import { PrimeReactProvider } from 'primereact/api';
import 'primereact/resources/primereact.css';
import 'primeflex/primeflex.css';
import 'primeicons/primeicons.css';
import '../styles/layout/layout.scss';
import '../styles/demo/Demos.scss';
import { useState } from 'react';
import { SessionProvider } from 'next-auth/react';
import NextTopLoader from 'nextjs-toploader';
import { RootLayoutProps } from '@/types/layout';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Standart',
    description: 'Dashboard Standart',
    robots: { index: false, follow: false },
    viewport: { initialScale: 1, width: 'device-width' },
    // openGraph: {
    //     type: 'website',
    //     title: 'PrimeReact SAKAI-REACT',
    //     url: 'https://sakai.primereact.org/',
    //     description: 'The ultimate collection of design-agnostic, flexible and accessible React UI Components.',
    //     images: ['https://www.primefaces.org/static/social/sakai-react.png'],
    //     ttl: 604800
    // },
    icons: {
        icon: '/favicon.ico'
    },
};


export default function RootLayout({ children }: RootLayoutProps) {
    return (
        <html lang="id" suppressHydrationWarning>
            <head>
                <link
                    id="theme-css"
                    href={`/themes/lara-light-blue/theme.css`}
                    rel="stylesheet"
                />
            </head>
            <body suppressHydrationWarning>
                <SessionProvider>
                    <PrimeReactProvider>
                        <LayoutProvider>
                            <NextTopLoader />
                            {children}
                            {/* <AppConfig /> */}
                        </LayoutProvider>
                    </PrimeReactProvider>
                </SessionProvider>
            </body>
        </html>
    );
}
