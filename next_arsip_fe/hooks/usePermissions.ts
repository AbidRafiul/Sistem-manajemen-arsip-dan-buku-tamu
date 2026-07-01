'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Permissions {
    canView: boolean;
    canCreate: boolean;
    canUpdate: boolean;
    canDelete: boolean;
    canApprove: boolean;
}

const defaultPermissions: Permissions = {
    canView: false,
    canCreate: false,
    canUpdate: false,
    canDelete: false,
    canApprove: false
};

export const usePermissions = () => {
    const pathname = usePathname();
    const [permissions, setPermissions] = useState<Permissions>(defaultPermissions);

    useEffect(() => {
        try {
            const stored = localStorage.getItem('rbac_permissions');
            if (stored) {
                const permsMap = JSON.parse(stored);
                // Try exact match first
                let pagePerms = permsMap[pathname];

                // If no exact match, try to find a parent route match (e.g. /setup/users matches /setup/users)
                if (pagePerms === undefined) {
                    const matchedKey = Object.keys(permsMap).find(key => pathname.startsWith(key) && key !== '/');
                    if (matchedKey) {
                        pagePerms = permsMap[matchedKey];
                    }
                }

                if (pagePerms) {
                    setPermissions(pagePerms);
                } else {
                    // if it's a superadmin or something without explicit permission, maybe we don't block them?
                    // actually, let's block them if not found to be safe, or fallback to default
                }
            }
        } catch (e) {
            console.error('Failed to parse rbac_permissions from localStorage', e);
        }
    }, [pathname]);

    return permissions;
};
