/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { InputText } from 'primereact/inputtext';
import { Skeleton } from 'primereact/skeleton';
import postData from '@/lib/axios/postData';
import { AppMenuItem } from '@/types';
import AppMenuitem from './AppMenuitem';
import { MenuProvider } from './context/menucontext';

interface MenuState {
    searchVal: string;
    filteredMenu: AppMenuItem[];
    load: boolean;
    menu: AppMenuItem[];
}

const parseMenuPayload = (payload: any): AppMenuItem[] => {
    let menuPayload = payload?.data ?? payload?.menu ?? payload;

    if (Array.isArray(menuPayload) && menuPayload.length === 1 && menuPayload[0]?.menu) {
        menuPayload = menuPayload[0].menu;
    }

    if (menuPayload?.menu) {
        menuPayload = menuPayload.menu;
    }

    if (typeof menuPayload === 'string') {
        try {
            menuPayload = JSON.parse(menuPayload);
        } catch (error) {
            console.error('Gagal parsing menu dari database:', error);
            return [];
        }
    }

    if (Array.isArray(menuPayload?.data)) {
        menuPayload = menuPayload.data;
    }

    if (Array.isArray(menuPayload?.menus)) {
        menuPayload = menuPayload.menus;
    }

    return Array.isArray(menuPayload) ? menuPayload : [];
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

    useEffect(() => {
        const user = session?.user as any;

<<<<<<< Updated upstream
    return [
        ...menu,
        {
            label: 'ARSIP DOKUMEN',
            icon: 'pi pi-folder',
            items: archiveDocumentItems
        }
    ];
};

const ensureCorrespondenceMenu = (menu: AppMenuItem[]) => {
    const cleanMailInItems = (items: AppMenuItem[] = []): AppMenuItem[] => {
        return items
            .filter((item) => {
                const label = item.label?.toLowerCase();
                const path = item.to || '';
                return label !== 'mail in' && !path.startsWith('/correspondence/mail_in');
            })
            .map((item) => {
                const childItems = cleanMailInItems(item.items || []);
                const nextItem = { ...item };

                if (childItems.length > 0) {
                    nextItem.items = childItems;
                } else {
                    delete nextItem.items;
                }

                return nextItem;
            });
    };

    const correspondence = menu.find((item) => {
        const label = item.label?.toLowerCase();
        return label === 'correspondence' || label === 'korespondensi';
    });

    if (correspondence) {
        correspondence.items = [...cleanMailInItems(correspondence.items || []), mailInMenu];
        return menu;
    }

    return [
        ...menu,
        {
            label: 'Korespondensi',
            icon: 'pi pi-envelope',
            items: [mailInMenu]
        }
    ];
};

const ensureGuestBookMenu = (menu: AppMenuItem[]) => {
    const hasItem = (items: AppMenuItem[] = [], toPath: string): boolean => {
        return items.some((item) => item.to === toPath || hasItem(item.items || [], toPath));
    };

    const hasAll = guestBookItems.every((reqItem) => hasItem(menu, reqItem.to || ''));
    if (hasAll) return menu;

    const guestBookGroup = menu.find((item) => {
        const label = item.label?.toLowerCase();
        return label === 'buku tamu' || label === 'guest book';
    });

    if (guestBookGroup) {
        const existingTos = (guestBookGroup.items || []).map(item => item.to);
        const missingItems = guestBookItems.filter(item => !existingTos.includes(item.to));
        guestBookGroup.items = [...(guestBookGroup.items || []), ...missingItems];
        return menu;
    }

    return [
        ...menu,
        {
            label: 'BUKU TAMU',
            icon: 'pi pi-id-card',
            items: guestBookItems
        }
    ];
};

const removeLegacyCorrespondenceMenu = (menu: AppMenuItem[]) => {
    return menu.filter((item) => item.label?.toLowerCase() !== 'korespondensi');
};

    const AppMenu = () => {
        // HAPUS DUMMY, PAKAI SESSION ASLI DARI NEXT-AUTH
        const { data: session } = useSession();

        const { layoutConfig } = useContext(LayoutContext);
        const searchRef = useRef<HTMLInputElement>(null);
        const lastPressTime = useRef<number>(0);

        const [state, setState] = useState<MenuState>({
            searchVal: '',
            filteredMenu: [],
            load: true,
            menu: []
        });

        //  AMBIL UserId DARI SESSION UNTUK DIKIRIM KE BACKEND
        useEffect(() => {
            const user = session?.user as any;

            if (user) {
                // Kita log untuk memastikan UserId sudah ada
                console.log('ISI SESSION USER:', user);

                // Gunakan UserId (sesuai yang kita pasang di session tadi)
                const activeId = user.UserId || user.id;

                if (activeId) {
                    getMenu(activeId);
                }
            }
        }, [session]);

       const getMenu = async (userId: string | number) => {
=======
        if (status === 'loading') {
>>>>>>> Stashed changes
            setState((prev) => ({ ...prev, load: true }));
            return;
        }

        if (!user) {
            setState((prev) => ({ ...prev, filteredMenu: [], menu: [], load: false }));
            return;
        }

        const activeRole = user.role || user.roleCode || user.roleId;

        if (activeRole) {
            getMenu({
                Role: user.role,
                RoleCode: user.roleCode,
                RoleId: user.roleId,
                UserId: user.UserId || user.id
            });
        } else {
            setState((prev) => ({ ...prev, filteredMenu: [], menu: [], load: false }));
        }
    }, [session, status]);

    const getMenu = async (payload: Record<string, string | number | undefined>) => {
        setState((prev) => ({ ...prev, load: true }));
        try {
            const { data: vaData } = await postData('setup/nav/base-data', payload);
            const dbMenu = parseMenuPayload(vaData);
            const menu: AppMenuItem[] = JSON.parse(JSON.stringify(dbMenu));
            const menu2: AppMenuItem[] = JSON.parse(JSON.stringify(dbMenu));

            setState((prev) => ({
                ...prev,
                filteredMenu: menu2,
                menu: menu
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
                } else if (childMatches.length > 0) {
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
                            const keyword = e.target.value;
                            const filtered = searchMenuByLabel(state.menu, keyword);
                            setState((prev) => ({
                                ...prev,
                                searchVal: keyword,
                                filteredMenu: filtered
                            }));
                        }}
                        placeholder="Cari..."
                    />
                </span>
            </div>
            <ul className="layout-menu">
                {state.load
                    ? [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1].map((item, i) => (
                          <li className="my-3" key={`menu-skeleton-${i}`}>
                              <Skeleton className="py-4" />
                          </li>
                      ))
                    : state.filteredMenu?.map((item, i) =>
                          !item.separator ? (
                              <AppMenuitem load={state.load} item={item} root={true} index={i} key={item.label || `menu-item-${i}`} />
                          ) : (
                              <li className="menu-separator" key={`separator-${i}`}></li>
                          )
                      )}
            </ul>
        </MenuProvider>
    );
};

export default AppMenu;
