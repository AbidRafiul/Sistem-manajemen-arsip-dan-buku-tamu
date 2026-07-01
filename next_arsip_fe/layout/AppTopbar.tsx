/* eslint-disable @next/next/no-img-element */
'use client';

import Link from 'next/link';
import React, { forwardRef, useContext, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { AppTopbarRef } from '@/types';
import { LayoutContext } from './context/layoutcontext';
import { signOut, useSession } from 'next-auth/react';
import { OverlayPanel } from 'primereact/overlaypanel';
import { Button } from 'primereact/button';
import { Avatar } from 'primereact/avatar';
import { Badge } from 'primereact/badge';
import { Divider } from 'primereact/divider';
import { Tag } from 'primereact/tag';
import { formatDateCalendar } from '@/lib/tools/dateTools';

const AppTopbar = forwardRef<AppTopbarRef>((props, ref) => {
    const { data: session } = useSession();
    const activeRole = (session?.user as any)?.role || (session?.user as any)?.roleCode || 'Role belum terbaca';
    const { onMenuToggle } = useContext(LayoutContext);
    const menubuttonRef = useRef<HTMLButtonElement>(null);
    const op = useRef<OverlayPanel>(null);
    const notificationOp = useRef<OverlayPanel>(null);
    const [realZonedTime, setRealZonedTime] = useState<String | null>("-");

    useImperativeHandle(ref, () => ({
        menubutton: menubuttonRef.current,
        topbarmenu: null,
        topbarmenubutton: null
    }));


    useEffect(() => {
        const timer = setInterval(() => {
            setRealZonedTime(formatDateCalendar(new Date(), "EEEE, dd MMMM yyyy HH:mm:ss", null, 'id'));
        }, 1000);

        return () => clearInterval(timer);
    }, [session]);

    const handleLogout = () => {
        signOut({ callbackUrl: '/auth/login' });
    };

    return (
        <div className="layout-topbar">
            <div className="flex justify-content-between w-full align-items-center">
                {/* Brand Logo & Sidebar Toggle */}
                <div className="flex align-items-center gap-3">
                    <button ref={menubuttonRef} type="button" className="p-link layout-menu-button layout-topbar-button lg:hidden" onClick={onMenuToggle}>
                        <i className="pi pi-bars" />
                    </button>

                    <Link href="/" className="layout-topbar-logo flex align-items-center gap-2 no-underline" style={{ cursor: 'pointer', width: 'auto' }}>
                        <Avatar
                            icon="pi pi-shield"
                            shape="square"
                            style={{
                                width: '2.35rem',
                                height: '2.35rem',
                                borderRadius: '8px',
                                background: 'linear-gradient(135deg, #4F46E5 0%, #3B82F6 100%)',
                                color: '#FFFFFF',
                                boxShadow: '0 4px 10px rgba(79, 70, 229, 0.15)'
                            }}
                        />
                        <div className="flex flex-column justify-content-center">
                            <span className="font-semibold text-lg text-900" style={{ lineHeight: '1', letterSpacing: '-0.02em' }}>
                                Arsipku
                            </span>
                        </div>
                    </Link>
                </div>

                {/* Clock & User Profile */}
                <div className="flex align-items-center gap-2">
                    {/* Clock Text */}
                    <div className="hidden md:flex align-items-center gap-2 px-3 py-2 border-round-3xl mr-2" style={{ background: 'rgba(79, 70, 229, 0.08)', color: '#4F46E5' }}>
                        <i className="pi pi-clock" style={{ fontSize: '0.85rem' }}></i>
                        <span className="font-semibold text-xs">{realZonedTime}</span>
                    </div>

                    {/* Notification Bell */}
                    <div className="relative flex align-items-center">
                        <Button
                            icon="pi pi-bell"
                            rounded
                            text
                            severity="secondary"
                            onClick={(e) => notificationOp.current?.toggle(e)}
                            className="p-button-secondary mr-2"
                            style={{ 
                                width: '2.35rem', 
                                height: '2.35rem', 
                                position: 'relative',
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--text-color-secondary)'
                            }}
                            aria-label="Notifikasi"
                        >
                            <Badge 
                                severity="danger" 
                                style={{ 
                                    position: 'absolute', 
                                    top: '4px', 
                                    right: '4px', 
                                    minWidth: '8px', 
                                    height: '8px', 
                                    padding: 0 
                                }} 
                            />
                        </Button>
                        
                        {/* Notification OverlayPanel */}
                        <OverlayPanel 
                            ref={notificationOp} 
                            style={{ 
                                width: '320px', 
                                borderRadius: '12px', 
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' 
                            }}
                        >
                            <div className="flex flex-column p-1">
                                <div className="flex justify-content-between align-items-center mb-3 px-2 pt-2">
                                    <span className="font-bold text-base text-900">Notifikasi</span>
                                    <Tag value="2 Baru" severity="danger" rounded style={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem', fontWeight: 700 }} />
                                </div>
                                
                                <div className="flex flex-column gap-1">
                                    {/* Notification Item 1 */}
                                    <div className="flex align-items-start gap-3 p-2 hover:surface-hover border-round cursor-pointer transition-colors transition-duration-150">
                                        <Avatar 
                                            icon="pi pi-envelope" 
                                            shape="circle" 
                                            style={{ 
                                                background: 'rgba(79, 70, 229, 0.08)', 
                                                color: '#4F46E5', 
                                                minWidth: '2.25rem', 
                                                height: '2.25rem',
                                                fontSize: '0.9rem'
                                            }} 
                                        />
                                        <div className="flex flex-column gap-1 flex-1">
                                            <span className="text-sm font-semibold text-900">Surat Masuk Baru</span>
                                            <span className="text-xs text-600 line-height-3">Perihal: Undangan Koordinasi dari Dinas Kesehatan</span>
                                            <span className="text-400 font-medium" style={{ fontSize: '0.65rem' }}>10 menit lalu</span>
                                        </div>
                                    </div>

                                    {/* Notification Item 2 */}
                                    <div className="flex align-items-start gap-3 p-2 hover:surface-hover border-round cursor-pointer transition-colors transition-duration-150">
                                        <Avatar 
                                            icon="pi pi-user-plus" 
                                            shape="circle" 
                                            style={{ 
                                                background: 'rgba(34, 197, 94, 0.08)', 
                                                color: '#22C55E', 
                                                minWidth: '2.25rem', 
                                                height: '2.25rem',
                                                fontSize: '0.9rem'
                                            }} 
                                        />
                                        <div className="flex flex-column gap-1 flex-1">
                                            <span className="text-sm font-semibold text-900">Registrasi Tamu Baru</span>
                                            <span className="text-xs text-600 line-height-3">Bpk. Budi Santoso (PT. Tech Indo) telah check-in</span>
                                            <span className="text-400 font-medium" style={{ fontSize: '0.65rem' }}>1 jam lalu</span>
                                        </div>
                                    </div>
                                </div>

                                <Divider className="my-2" style={{ borderColor: '#F3F4F6' }} />
                                
                                <Button 
                                    label="Tandai Semua Dibaca" 
                                    text 
                                    className="w-full text-center text-xs font-semibold py-2 text-indigo-600 hover:bg-indigo-50 border-none"
                                    style={{ borderRadius: '6px', color: '#4F46E5' }}
                                />
                            </div>
                        </OverlayPanel>
                    </div>

                    {/* User Profile Card */}
                    <div
                        onClick={(e) => op?.current?.toggle(e)}

                        className="flex align-items-center gap-2 cursor-pointer hover:surface-hover transition-colors transition-duration-150 py-1 px-2 border-round"
                    >
                        <Avatar
                            label={(session?.user?.name || 'SA').slice(0, 2).toUpperCase()}
                            shape="circle"
                            style={{
                                width: '2.25rem',
                                height: '2.25rem',
                                background: 'linear-gradient(135deg, #4F46E5 0%, #3B82F6 100%)',
                                color: '#FFFFFF',
                                fontWeight: 'bold',
                                fontSize: '0.85rem',
                                boxShadow: '0 2px 6px rgba(79, 70, 229, 0.2)'
                            }}
                        />
                        <div className="flex flex-column hidden md:flex" style={{ marginRight: '0.25rem' }}>
                            <span className="font-semibold text-sm text-900" style={{ lineHeight: '1.2' }}>
                                {session?.user?.name || 'Super Admin'}
                            </span>
                            <span className="text-color-secondary font-medium" style={{ fontSize: '0.65rem' }}>
                                {activeRole}
                            </span>
                        </div>
                    </div>

                    {/* Profile OverlayPanel */}
                    <OverlayPanel ref={op} style={{ width: '240px', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}>
                        <div className="flex flex-column p-1">
                            <div className="flex align-items-center gap-3 px-2 py-2 mb-1">
                                <Avatar
                                    label={(session?.user?.name || 'SA').slice(0, 2).toUpperCase()}
                                    shape="circle"
                                    style={{ width: '2.5rem', height: '2.5rem', background: 'linear-gradient(135deg, #4F46E5 0%, #3B82F6 100%)', color: '#FFFFFF', fontWeight: 'bold' }}
                                />
                                <div className="flex flex-column">
                                    <span className="font-semibold text-sm text-900">{session?.user?.name || 'Super Admin'}</span>
                                    <span className="text-xs text-color-secondary">{activeRole}</span>
                                </div>
                            </div>

                            <Divider className="my-1" style={{ borderColor: '#F3F4F6' }} />

                            <Link href="/profile" className="flex align-items-center gap-3 text-700 no-underline hover:surface-hover transition-colors px-3 py-2 border-round" style={{ cursor: 'pointer' }}>
                                <i className="pi pi-user text-sm"></i>
                                <span className="text-sm font-medium">Profil Saya</span>
                            </Link>

                            <Link href="/setup/config" className="flex align-items-center gap-3 text-700 no-underline hover:surface-hover transition-colors px-3 py-2 border-round" style={{ cursor: 'pointer' }}>
                                <i className="pi pi-cog text-sm"></i>
                                <span className="text-sm font-medium">Pengaturan</span>
                            </Link>

                            <Divider className="my-1" style={{ borderColor: '#F3F4F6' }} />

                            <Button
                                label="Keluar"
                                icon="pi pi-sign-out"
                                severity="danger"
                                text
                                className="w-full text-left justify-content-start px-3 py-2 mt-1 font-medium text-sm hover:bg-red-50 text-red-600"
                                onClick={() => handleLogout()}
                                style={{ borderRadius: '6px' }}
                            />
                        </div>
                    </OverlayPanel>
                </div>
            </div>
        </div>
    );
});

AppTopbar.displayName = 'AppTopbar';

export default AppTopbar;
