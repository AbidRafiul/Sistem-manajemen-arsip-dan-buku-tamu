/* eslint-disable @next/next/no-img-element */
'use client';

import postData from '@/lib/axios/postData';
import { AppMenuItem } from '@/types';
import { useSession } from 'next-auth/react';
import { InputText } from 'primereact/inputtext';
import { Skeleton } from 'primereact/skeleton';
import React, { useEffect, useRef, useState } from 'react';
import AppMenuitem from './AppMenuitem';
import { MenuProvider } from './context/menucontext';

interface MenuState {
    searchVal: string;
    filteredMenu: AppMenuItem[];
    load: boolean;
    menu: AppMenuItem[];
}

const parseMenuPayload = (payload: any): AppMenuItem[] => {
    let menuPayload = payload?.menu ?? payload?.data ?? payload?.menus ?? payload;

    if (Array.isArray(menuPayload) && menuPayload.length === 1 && menuPayload[0]?.menu) {
        menuPayload = menuPayload[0].menu;
    }

    if (typeof menuPayload === 'string') {
        try {
            menuPayload = JSON.parse(menuPayload);
        } catch (error) {
            console.error('Gagal parsing menu dari database:', error);
            return [];
        }
    }

    if (Array.isArray(menuPayload?.menu)) {
        menuPayload = menuPayload.menu;
    }

    if (Array.isArray(menuPayload?.data)) {
        menuPayload = menuPayload.data;
    }

    if (Array.isArray(menuPayload?.menus)) {
        menuPayload = menuPayload.menus;
    }

    return Array.isArray(menuPayload) ? menuPayload : [];
};

const cloneMenu = (menu: AppMenuItem[]) => JSON.parse(JSON.stringify(menu)) as AppMenuItem[];

const mailInSubMenuItems: AppMenuItem[] = [
    {
        label: 'Dashboard',
        icon: 'pi pi-fw pi-chart-line',
        to: '/correspondence/mail_in',
        class: 'mail-in-child'
    },
    {
        label: 'Data Surat Masuk',
        icon: 'pi pi-fw pi-table',
        to: '/correspondence/mail_in/data',
        class: 'mail-in-child'
    },
    {
        label: 'Disposisi Surat',
        icon: 'pi pi-fw pi-send',
        to: '/correspondence/mail_in/disposition',
        class: 'mail-in-child'
    }
];

const normalizeMailInMenu = (menu: AppMenuItem[]): AppMenuItem[] => {
    const mailInPaths = new Set(mailInSubMenuItems.map((item) => item.to));

    return menu.map((group) => {
        if (group.label?.toUpperCase() !== 'PERSURATAN' || !Array.isArray(group.items)) {
            return group;
        }

        const existingMailInParent = group.items.find((item) => item.label?.toLowerCase() === 'surat masuk' && Array.isArray(item.items));
        const otherItems = group.items.filter((item) => !mailInPaths.has(item.to) && item !== existingMailInParent);

        const mailInParent: AppMenuItem = {
            label: 'Surat Masuk',
            icon: 'pi pi-fw pi-inbox',
            class: 'mail-in-menu',
            items: mailInSubMenuItems.map((defaultItem) => {
                const savedItem = existingMailInParent?.items?.find((item) => item.to === defaultItem.to) || group.items?.find((item) => item.to === defaultItem.to);

                return {
                    ...defaultItem,
                    ...savedItem,
                    label: defaultItem.label,
                    class: 'mail-in-child'
                };
            })
        };

        return {
            ...group,
            items: [mailInParent, ...otherItems]
        };
    });
};

const searchMenuByLabel = (menu: AppMenuItem[] | undefined, keyword: string, parentIndexes: number[] = []): AppMenuItem[] => {
    if (!Array.isArray(menu) || menu.length === 0) return [];

    const lowerKeyword = keyword?.toLowerCase() || '';

    if (!lowerKeyword.trim()) {
        return menu.map((item, idx) => {
            const newItem: AppMenuItem = {
                ...item,
                indexPath: [...parentIndexes, idx]
            };

            if (item.items && item.items.length > 0) {
                newItem.items = searchMenuByLabel(item.items, '', [...parentIndexes, idx]);
            }

            return newItem;
        });
    }

    return menu
        .map((item, idx): AppMenuItem | null => {
            const isMatch = item.label?.toLowerCase().includes(lowerKeyword);
            const childMatches = searchMenuByLabel(item.items || [], keyword, [...parentIndexes, idx]);

            if (isMatch) {
                const newItem: AppMenuItem = {
                    ...item,
                    indexPath: [...parentIndexes, idx]
                };

                if (item.items && item.items.length > 0) {
                    newItem.items = childMatches;
                }

                return newItem;
            }

            if (childMatches.length > 0) {
                const newItem: AppMenuItem = {
                    ...item,
                    indexPath: [...parentIndexes, idx]
                };

                if (item.items && item.items.length > 0) {
                    newItem.items = childMatches;
                }

                return newItem;
            }

            return null;
        })
        .filter((item): item is AppMenuItem => item !== null);
};

const AppMenu = () => {
    const { data: session, status } = useSession();
    const searchRef = useRef<HTMLInputElement>(null);
    const lastPressTime = useRef<number>(0);

    const [state, setState] = useState<MenuState>({
        searchVal: '',
        filteredMenu: [],
        load: true,
        menu: []
    });

    const getMenu = async (nama_pengguna: string) => {
        setState((prev) => ({ ...prev, load: true }));

        try {
            const { data: vaData } = await postData('setup/nav/user-data', { nama_pengguna });
            const dbMenu = parseMenuPayload(vaData);
            const menu = normalizeMailInMenu(cloneMenu(dbMenu));

            // Fetch and store granular permissions
            try {
                const { data: permissionsRes } = await postData('setup/nav/user-permissions', { nama_pengguna });
                if (permissionsRes?.data) {
                    localStorage.setItem('rbac_permissions', JSON.stringify(permissionsRes.data));
                }
            } catch (permError) {
                console.error('Error loading permissions:', permError);
            }

            setState((prev) => ({
                ...prev,
                filteredMenu: cloneMenu(menu),
                menu
            }));
        } catch (error) {
            console.error('Error loading menu:', error);
            setState((prev) => ({
                ...prev,
                filteredMenu: [],
                menu: []
            }));
        } finally {
            setState((prev) => ({ ...prev, load: false }));
        }
    };

    useEffect(() => {
        const user = session?.user as any;

        if (status === 'loading') {
            setState((prev) => ({ ...prev, load: true }));
            return;
        }

        const nama_pengguna = String(user?.nama_pengguna || user?.kode_pengguna || '').trim();

        if (!nama_pengguna) {
            setState((prev) => ({ ...prev, filteredMenu: [], menu: [], load: false }));
            return;
        }

        getMenu(nama_pengguna);
    }, [session, status]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.key.toLowerCase() === 'f') {
                const now = Date.now();

                if (now - lastPressTime.current < 1000) {
                    lastPressTime.current = 0;
                    return;
                }

                e.preventDefault();
                lastPressTime.current = now;
                searchRef.current?.focus();
                searchRef.current?.select();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
        const filtered = searchMenuByLabel(state.menu, state.searchVal);
        setState((prev) => ({ ...prev, filteredMenu: filtered }));
    }, [state.menu, state.searchVal]);

    return (
        <MenuProvider>
            <div
                style={{
                    display: 'flex',
                    width: '100%',
                    justifyContent: 'center',
                    alignItems: 'center',
                    position: 'sticky',
                    top: '0',
                    padding: '10px 0',
                    zIndex: '9999'
                }}
            >
                <span className="block w-full p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText
                        type="search"
                        ref={searchRef}
                        className="w-full"
                        value={state.searchVal}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            setState((prev) => ({
                                ...prev,
                                searchVal: e.target.value
                            }));
                        }}
                        placeholder="Cari..."
                    />
                </span>
            </div>
            <ul className="layout-menu">
                {state.load ? (
                    [1, 1, 1, 1, 1, 1, 1, 1].map((item, i) => (
                        <li className="my-3" key={`menu-skeleton-${i}`}>
                            <Skeleton className="py-4" />
                        </li>
                    ))
                ) : state.filteredMenu.length > 0 ? (
                    state.filteredMenu.map((item, i) =>
                        !item.separator ? (
                            <AppMenuitem load={state.load} item={item} root={true} index={i} key={item.label || `menu-item-${i}`} />
                        ) : (
                            <li className="menu-separator" key={`separator-${i}`}></li>
                        )
                    )
                ) : (
                    <li className="px-3 py-2 text-sm text-color-secondary">Menu belum tersedia</li>
                )}
            </ul>
        </MenuProvider>
    );
};

export default AppMenu;
