'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import postData from '@/lib/axios/postData';
import { useSession } from 'next-auth/react';

interface Permissions {
    canView: boolean;
    canCreate: boolean;
    canUpdate: boolean;
    canDelete: boolean;
    canApprove: boolean;
    activeRole?: string;
}

const defaultPermissions: Permissions = {
    canView: false,
    canCreate: false,
    canUpdate: false,
    canDelete: false,
    canApprove: false
};

const getPermissionsFromStorage = (pathname: string): Permissions | null => {
    try {
        const stored = localStorage.getItem('rbac_permissions');
        if (!stored) return null;

        const permsMap = JSON.parse(stored);
        // Try exact match first
        let pagePerms = permsMap[pathname];

        // If no exact match, try to find a parent route match
        if (pagePerms === undefined) {
            const matchedKey = Object.keys(permsMap).find(key => pathname.startsWith(key) && key !== '/');
            if (matchedKey) {
                pagePerms = permsMap[matchedKey];
            }
        }

        return pagePerms || null;
    } catch (e) {
        console.error('Failed to parse rbac_permissions from localStorage', e);
        return null;
    }
};

export const usePermissions = () => {
    const pathname = usePathname();
    const { data: session } = useSession();
    const [permissions, setPermissions] = useState<Permissions>(defaultPermissions);

    useEffect(() => {
        // First try localStorage
        const storedPerms = getPermissionsFromStorage(pathname);
        if (storedPerms) {
            setPermissions(storedPerms);
            return;
        }

        // If localStorage is empty or missing for this path, fetch from API
        const user = session?.user as any;
        const namaPengguna = String(user?.nama_pengguna || user?.kode_pengguna || '').trim();

        if (!namaPengguna) {
            // No user info, keep default (all false)
            return;
        }

        const fetchPermissions = async () => {
            try {
                const { data: permissionsRes } = await postData('setup/nav/user-permissions', { nama_pengguna: namaPengguna });
                if (permissionsRes?.data) {
                    localStorage.setItem('rbac_permissions', JSON.stringify(permissionsRes.data));

                    // Now try to get permissions for this specific path
                    const freshPerms = getPermissionsFromStorage(pathname);
                    if (freshPerms) {
                        setPermissions(freshPerms);
                    }
                }
            } catch (error) {
                console.error('Error fetching permissions:', error);
            }
        };

        fetchPermissions();
    }, [pathname, session]);

    return {
        ...permissions,
        activeRole: (session?.user as any)?.role as string
    };
};
