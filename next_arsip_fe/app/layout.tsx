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
import { Metadata, Viewport } from 'next';


export const viewport: Viewport = {
    initialScale: 1,
    width: 'device-width'
};

export const metadata: Metadata = {
    title: 'Standart',
    description: 'Dashboard Standart',
    robots: { index: false, follow: false },
    openGraph: {
        type: 'website',
        title: 'PrimeReact SAKAI-REACT',
        url: 'https://sakai.primereact.org/',
        description: 'The ultimate collection of design-agnostic, flexible and accessible React UI Components.',
        images: ['https://www.primefaces.org/static/social/sakai-react.png'],
        ttl: 604800
    },
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
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
            </head>
            <body suppressHydrationWarning style={{ fontFamily: "'Inter', sans-serif" }}>
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
