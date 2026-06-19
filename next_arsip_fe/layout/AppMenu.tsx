    /* eslint-disable @next/next/no-img-element */
    'use client';
    import React, { useContext, useEffect, useRef, useState } from 'react';
    import AppMenuitem from './AppMenuitem';
    import { LayoutContext } from './context/layoutcontext';
    import { MenuProvider } from './context/menucontext';

    //HIDUPKAN LAGI IMPORT NEXT-AUTH
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
    label: 'Surat Masuk',
    icon: 'pi pi-inbox',
    to: '/correspondence/mail_in',
    items: [
        {
            label: 'Rekap Surat Masuk',
            icon: 'pi pi-th-large',
            to: '/correspondence/mail_in'
        },
        {
            label: 'Data Surat Masuk',
            icon: 'pi pi-envelope',
            to: '/correspondence/mail_in/data'
        },
        {
            label: 'Disposisi Surat',
            icon: 'pi pi-send',
            to: '/correspondence/mail_in/disposition'
        },
    ]
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

const guestBookItems: AppMenuItem[] = [
    {
        label: 'Monitoring Tamu',
        icon: 'pi pi-desktop',
        to: '/buku_tamu/monitoring'
    },
    {
        label: 'Registrasi Kunjungan',
        icon: 'pi pi-user-plus',
        to: '/buku_tamu/registrasi'
    },
    {
        label: 'Riwayat Tamu',
        icon: 'pi pi-list',
        to: '/buku_tamu/checkout'
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

    const correspondence = menu.find((item) => item.label?.toLowerCase() === 'correspondence');

    if (correspondence) {
        correspondence.items = [...cleanMailInItems(correspondence.items || []), mailInMenu];
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
            setState((prev) => ({ ...prev, load: true }));
            try {
                const { data: vaData } = await postData('setup/nav/user-data', { UserId: userId });
                
                // 1. Log data mentah untuk debugging di Console Browser
                console.log("🚀 MENTAHAN DARI BACKEND:", vaData);

                if (!vaData?.data) {
                    throw new Error('Data menu tidak ditemukan dari backend');
                }

                // 2. Filter Anti-Crash: Pastikan menu adalah Array
                let menuArray = vaData.data;
                
                // Kalau MySQL ngirim string, kita bongkar dulu jadi Array
                if (typeof menuArray === 'string') {
                    try {
                        menuArray = JSON.parse(menuArray);
                    } catch (e) {
                        console.error("Gagal memecah string menu dari database:", e);
                        menuArray = [];
                    }
                }

                // Pengaman ekstra: Kalau ternyata tetap bukan array, paksa jadi array kosong
                if (!Array.isArray(menuArray)) {
                    console.error("Format menu tidak valid (bukan array):", menuArray);
                    menuArray = [];
                }

                // 3. Olah data yang sudah dipastikan aman
                const normalizedMenu = ensureGuestBookMenu(ensureArchiveDocumentMenu(ensureCorrespondenceMenu(removeLegacyCorrespondenceMenu(menuArray))));
                const menu: AppMenuItem[] = JSON.parse(JSON.stringify(normalizedMenu));
                const menu2: AppMenuItem[] = JSON.parse(JSON.stringify(normalizedMenu));

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
