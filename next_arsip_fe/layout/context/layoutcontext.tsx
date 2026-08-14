'use client'
import React, { useState, createContext } from 'react';
import { LayoutState, ChildContainerProps, LayoutConfig, LayoutContextProps } from '@/types';
import { useSession } from 'next-auth/react';

export const LayoutContext = React.createContext({} as LayoutContextProps);

export const LayoutProvider = ({ children }: ChildContainerProps) => {
    const { data: session } = useSession();

    const [layoutConfig, setLayoutConfig] = useState<LayoutConfig>({
        ripple: false,
        inputStyle: 'outlined',
        menuMode: 'static',
        colorScheme: 'light',
        theme: 'lara-light-blue',
        scale: 14
    });

    const [layoutState, setLayoutState] = useState<LayoutState>({
        staticMenuDesktopInactive: false,
        overlayMenuActive: false,
        profileSidebarVisible: false,
        configSidebarVisible: false,
        staticMenuMobileActive: false,
        menuHoverActive: false,
        globalFilter: {
            id_cabang: null,
            id_departemen: null,
            id_divisi: null,
            id_unit_kerja: null,
            nama_cabang: null
        }
    });

    const onMenuToggle = () => {
        if (isOverlay()) {
            setLayoutState((prevLayoutState) => ({ ...prevLayoutState, overlayMenuActive: !prevLayoutState.overlayMenuActive }));
        }

        if (isDesktop()) {
            // Do nothing on desktop, cannot toggle sidebar!
            return;
        } else {
            setLayoutState((prevLayoutState) => ({ ...prevLayoutState, staticMenuMobileActive: !prevLayoutState.staticMenuMobileActive }));
        }
    };

    const [isLoaded, setIsLoaded] = useState(false);

    // Load filter from localStorage on mount
    React.useEffect(() => {
        const savedFilter = localStorage.getItem('globalFilter');
        if (savedFilter) {
            try {
                setLayoutState(prev => ({ ...prev, globalFilter: JSON.parse(savedFilter) }));
            } catch (e) {}
        } else if ((session?.user as any)?.nama_cabang) {
            setLayoutState(prev => ({
                ...prev,
                globalFilter: {
                    ...prev.globalFilter,
                    id_cabang: (session?.user as any).id_cabang as number,
                    nama_cabang: (session?.user as any).nama_cabang as string
                }
            }));
        }
        setIsLoaded(true);
    }, [(session?.user as any)?.nama_cabang, (session?.user as any)?.id_cabang]);

    // Save filter to localStorage on change
    React.useEffect(() => {
        if (isLoaded && layoutState.globalFilter) {
            localStorage.setItem('globalFilter', JSON.stringify(layoutState.globalFilter));
        }
    }, [layoutState.globalFilter, isLoaded]);

    const showProfileSidebar = () => {
        setLayoutState((prevLayoutState) => ({ ...prevLayoutState, profileSidebarVisible: !prevLayoutState.profileSidebarVisible }));
    };

    const isOverlay = () => {
        return layoutConfig.menuMode === 'overlay';
    };

    const isDesktop = () => {
        return window.innerWidth > 991;
    };

    const value: LayoutContextProps = {
        layoutConfig,
        setLayoutConfig,
        layoutState,
        setLayoutState,
        onMenuToggle,
        showProfileSidebar
    };

    return <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>;
};
