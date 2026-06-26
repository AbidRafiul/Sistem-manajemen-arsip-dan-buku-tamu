import 'next-auth';
import 'next-auth/jwt';
import { UserRole } from './layout';

declare module 'next-auth' {
    interface User {
        id?: string;
        IdPengguna?: string | number;
        role?: string;
        roleCode?: string;
        roleId?: string | number;
        uniqueId?: string;
        nama_pengguna?: string;
        username?: string;
        remember_me?: boolean;
        credential?: string;
    }

    interface Session {
        user: {
            id?: string;
            IdPengguna?: string | number;
            role?: string;
            roleCode?: string;
            roleId?: string | number;
            uniqueId?: string;
            nama_pengguna?: string;
            name?: string;
            username?: string;
            email?: string;
            image?: string;
            credential?: string;
        };
        expires: string;
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id?: string;
        IdPengguna?: string | number;
        role?: string;
        roleCode?: string;
        roleId?: string | number;
        uniqueId?: string;
        nama_pengguna?: string;
        username?: string;
        remember_me?: boolean;
        expiry?: number;
        expired?: boolean;
        userCredential?: string;
    }
}

export interface UserCredential {
    uniqueId: string
    username: string
    fullname: string
    role: UserRole
}

export interface A2FPayload {
    uniqueId: string,
    username: string,
    fullname: string,
    role: string,
}
