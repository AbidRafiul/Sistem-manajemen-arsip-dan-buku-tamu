import React from 'react';
import AppConfig from '../../layout/AppConfig';
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

export default function SimpleLayout({ children }: RootLayoutProps) {
    return (
        <>
            {children}
            {/* <AppConfig simple /> */}
        </>
    );
}
