/* eslint-disable @next/next/no-img-element */


import Link from 'next/link';
import React, { forwardRef, useContext, useEffect, useRef, useState } from 'react';
import { AppTopbarRef } from '@/types';
import { LayoutContext } from './context/layoutcontext';
import { signOut, useSession } from 'next-auth/react';
import { OverlayPanel } from 'primereact/overlaypanel';
import { formatDateCalendar } from '@/lib/tools/dateTools';

const AppTopbar = forwardRef<AppTopbarRef>((props, ref) => {
    const { data: session } = useSession()
    const { onMenuToggle } = useContext(LayoutContext);
    const menubuttonRef = useRef(null);
    const op = useRef<OverlayPanel>(null);
    const [realZonedTime, setRealZonedTime] = useState<String | null>("-");

    useEffect(() => {
        const timer = setInterval(() => {
            setRealZonedTime(formatDateCalendar(new Date(), "EEEE, dd MMMM yyyy HH:mm:ss", null, 'id'));
        }, 1000);

        return () => clearInterval(timer);
    }, [session]);

    const handleLogout = () => {
        signOut()
    }

    return (
        <div className="layout-topbar">
            <div className='app-shell-topbar-inner flex justify-content-between w-full align-items-center'>
                <div className='app-shell-brand-group flex align-items-center'>
                    <Link href="/" className="layout-topbar-logo">
                        <span className="app-shell-logo-mark">
                            <i className="pi pi-book"></i>
                        </span>
                        <span className="app-shell-logo-copy">
                            <strong>DocArchive</strong>
                            <small>Enterprise Records</small>
                        </span>
                    </Link>

                    <button ref={menubuttonRef} type="button" className="p-link layout-menu-button layout-topbar-button" onClick={onMenuToggle}>
                        <i className="pi pi-bars" />
                    </button>
                </div>

                <div className="app-shell-actions flex gap-2 align-items-center">
                    <div className='app-shell-clock flex align-items-center'>
                        <i className="pi pi-calendar"></i>
                        <span>{realZonedTime}</span>
                    </div>
                    <button type="button" className="p-link layout-topbar-button">
                        <i className="pi pi-bell"></i>
                        <span>Notification</span>
                    </button>
                    <button type="button" onClick={(e) => op?.current?.toggle(e)} className="p-link app-shell-profile-button">
                        <span className="app-shell-avatar">
                            {(session?.user?.name || 'SA').slice(0, 2).toUpperCase()}
                        </span>
                        <span className="app-shell-profile-copy">
                            <strong>{session?.user?.name || 'Super Admin'}</strong>
                            <small>Administrator</small>
                        </span>
                        <i className="pi pi-angle-down"></i>
                    </button>
                    <OverlayPanel ref={op}>
                        <span className="p-link app-shell-logout" onClick={() => handleLogout()}>
                            Log out
                        </span>
                    </OverlayPanel>
                </div>
            </div>
        </div>
    );
});

AppTopbar.displayName = 'AppTopbar';

export default AppTopbar;
