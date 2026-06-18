/* eslint-disable @next/next/no-img-element */
'use client'
import React, { useContext, useEffect, useRef, useState } from 'react';
import AppMenuitem from './AppMenuitem';
import { LayoutContext } from './context/layoutcontext';
import { MenuProvider } from './context/menucontext';
import { useSession } from 'next-auth/react';
import postData from '@/lib/axios/postData';
import { InputText } from 'primereact/inputtext';
import { AppMenuItem } from '@/types';
import { Skeleton } from 'primereact/skeleton';

interface MenuState {
    searchVal: string;
    filteredMenu: AppMenuItem[];
    load: boolean;
    menu: AppMenuItem[];
}

const mailInMenu: AppMenuItem = {
    label: 'Mail In',
    icon: 'pi pi-inbox',
    to: '/correspondence/mail-in'
};

const archiveDocumentItems: AppMenuItem[] = [
    {
        label: 'Dokumen Arsip',
        icon: 'pi pi-folder-open',
        to: '/edms/archive_document'
    },
    {
        label: 'Peminjaman Arsip',
        icon: 'pi pi-share-alt',
        to: '/edms/archive_loan'
    }
];

const ensureArchiveDocumentMenu = (menu: AppMenuItem[]) => {
    const hasItem = (items: AppMenuItem[] = [], toPath: string): boolean => {
        return items.some((item) => item.to === toPath || hasItem(item.items || [], toPath));
    };

    const hasAll = archiveDocumentItems.every((reqItem) => hasItem(menu, reqItem.to || ''));
    if (hasAll) return menu;

    const archiveGroup = menu.find((item) => {
        const label = item.label?.toLowerCase();
        return label === 'arsip dokumen' || label === 'edms' || label === 'arsip';
    });

    if (archiveGroup) {
        const existingTos = (archiveGroup.items || []).map(item => item.to);
        const missingItems = archiveDocumentItems.filter(item => !existingTos.includes(item.to));
        archiveGroup.items = [...(archiveGroup.items || []), ...missingItems];
        return menu;
    }

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
    const hasMailIn = (items: AppMenuItem[] = []): boolean => {
        return items.some((item) => item.to === mailInMenu.to || hasMailIn(item.items || []));
    };

    if (hasMailIn(menu)) return menu;

    const correspondence = menu.find((item) => item.label?.toLowerCase() === 'correspondence');

    if (correspondence) {
        correspondence.items = [...(correspondence.items || []), mailInMenu];
        return menu;
    }

    return [
        ...menu,
        {
            label: 'Correspondence',
            icon: 'pi pi-envelope',
            items: [mailInMenu]
        }
    ];
};

const removeLegacyCorrespondenceMenu = (menu: AppMenuItem[]) => {
    return menu.filter((item) => item.label?.toLowerCase() !== 'korespondensi');
};

const AppMenu = () => {
    const { data: session } = useSession();
    const { layoutConfig } = useContext(LayoutContext);
    const searchRef = useRef<HTMLInputElement>(null);
    const lastPressTime = useRef<number>(0);

    const [state, setState] = useState<MenuState>({
        searchVal: "",
        filteredMenu: [],
        load: true,
        menu: []
    });

    useEffect(() => {
        if (session?.user) {
            getMenu(session.user.uniqueId || '');
        }
    }, [session]);

    const getMenu = async (uniqueId: string) => {
        setState(prev => ({ ...prev, load: true }));
        try {
            const { data: vaData } = await postData('/setup/nav/user-data', { UniqueId: uniqueId });

            if (!vaData?.data) {
                throw new Error('Invalid menu data');
            }

            const normalizedMenu = ensureArchiveDocumentMenu(
                ensureCorrespondenceMenu(
                    removeLegacyCorrespondenceMenu(JSON.parse(JSON.stringify(vaData.data)))
                )
            );
            const menu: AppMenuItem[] = JSON.parse(JSON.stringify(normalizedMenu));
            const menu2: AppMenuItem[] = JSON.parse(JSON.stringify(normalizedMenu));

            setState(prev => ({
                ...prev,
                filteredMenu: menu2,
                menu: menu
            }));
        } catch (error) {
            console.error("Error loading menu:", error);
            setState(prev => ({
                ...prev,
                filteredMenu: [],
                menu: []
            }));
        } finally {
            setState(prev => ({ ...prev, load: false }));
        }
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.key.toLowerCase() === "f") {
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

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    const searchMenuByLabel = (
        menu: AppMenuItem[] | undefined,
        keyword: string,
        parentIndexes: number[] = []
    ): AppMenuItem[] => {
        if (!Array.isArray(menu) || menu.length === 0) return [];

        const lowerKeyword = keyword?.toLowerCase() || "";

        if (!lowerKeyword.trim()) {
            return menu.map((item, idx) => {
                const newItem: AppMenuItem = {
                    ...item,
                    indexPath: [...parentIndexes, idx],
                };

                if (item.items && item.items.length > 0) {
                    newItem.items = searchMenuByLabel(item.items, "", [...parentIndexes, idx]);
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
        setState(prev => ({ ...prev, filteredMenu: filtered }));
    }, [state.menu, state.searchVal]);

    return (
        <MenuProvider>
            <div
                style={{
                    display: "flex",
                    width: "100%",
                    justifyContent: "center",
                    alignItems: "center",
                    position: "sticky",
                    top: "0",
                    padding: "10px 0",
                    zIndex: "9999"
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
                            setState(prev => ({
                                ...prev,
                                searchVal: keyword,
                                filteredMenu: filtered
                            }));
                        }}
                        placeholder="Search..."
                    />
                </span>
            </div>
            <ul className="layout-menu">
                {state.load
                    ? [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1].map((item, i) => (
                        // 🎯 FIX WARNING KEY: Ditambahkan key unik berbasis index `i` pada wrapper <li> loading
                        <li className="my-3" key={`menu-skeleton-${i}`}>
                            <Skeleton className="py-4" />
                        </li>
                    ))
                    : state.filteredMenu?.map((item, i) => (
                        !item.separator ? (
                            <AppMenuitem
                                load={state.load}
                                item={item}
                                root={true}
                                index={i}
                                key={item.label || `menu-item-${i}`}
                            />
                        ) : (
                            <li className="menu-separator" key={`separator-${i}`}></li>
                        )
                    ))
                }
            </ul>
        </MenuProvider>
    );
};

export default AppMenu;
