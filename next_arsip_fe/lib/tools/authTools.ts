import NextAuth, { CredentialsSignin, Session, User } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { cookies } from 'next/headers';
import { JWT } from 'next-auth/jwt';
import { SignJWT } from 'jose';

const authOptions = {
    providers: [
        CredentialsProvider({
            name: 'credentials',
            credentials: {
                userData: { label: 'User Data', type: 'text' }
            },
            async authorize(credentials): Promise<any> {
                try {
                    if (!credentials.userData) throw new CredentialsSignin();
                    const userData = JSON.parse(credentials.userData as string);

                    // PASTIIN DATA DARI EXPRESS DIPETAKAN KE SINI
                    const activeId = userData.IdPengguna || userData.id_pengguna || userData.uniqueId || userData.uid || userData.id || userData.nama_pengguna;
                    return {
                        id: activeId,
                        IdPengguna: activeId,
                        id_pengguna: activeId,
                        uniqueId: activeId,
                        name: userData.nama_lengkap || userData.name,
                        nama_pengguna: userData.nama_pengguna,
                        id_cabang: userData.id_cabang,
                        nama_cabang: userData.nama_cabang,
                        role: userData.role || userData.roleCode,
                        roleCode: userData.roleCode,
                        roleId: userData.roleId,
                        credential: userData.credential, // Pastikan ini ada
                        remember_me: userData.remember_me
                    };
                } catch (error: any) {
                    throw new CredentialsSignin();
                }
            }
        })
    ],
    pages: {
        signIn: '/auth/login',
        error: '/auth/login',
        signOut: '/auth/login'
    },
    secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || 'random',
    session: {
        strategy: 'jwt' as const,
        maxAge: 7 * 24 * 60 * 60
    },
    callbacks: {
        async jwt({ token, user }: { token: JWT; user?: User }) {
            console.log('NextAuth Callback - jwt: entering. User present:', !!user);
            // Initial sign in
            if (user) {
                const anyUser = user as any;
                const activeId = anyUser.IdPengguna || anyUser.id_pengguna || anyUser.uniqueId || anyUser.id || anyUser.nama_pengguna;

                token.id = activeId;
                (token as any).IdPengguna = activeId;
                token.role = anyUser.role;
                (token as any).roleCode = anyUser.roleCode;
                (token as any).roleId = anyUser.roleId;
                token.uniqueId = activeId;
                token.name = anyUser.name;
                token.nama_pengguna = anyUser.nama_pengguna;
                token.remember_me = anyUser.remember_me;
                token.userCredential = anyUser.credential;
                token.id_cabang = anyUser.id_cabang;
                token.nama_cabang = anyUser.nama_cabang;

                const now = Math.floor(Date.now() / 1000);
                const expireDuration = user.remember_me ? 24 * 60 * 60 : 7 * 60 * 60;
                token.expiry = now + expireDuration;
                console.log('NextAuth Callback - jwt: initialized token for user:', token.name, 'expiry in:', expireDuration, 'seconds');
            }

            // Check if token has expired
            const now = Math.floor(Date.now() / 1000);
            if (token.expiry && now > token.expiry) {
                console.log('NextAuth Callback - jwt: Token has expired! expiry:', token.expiry, 'now:', now);
                return { ...token, expired: true };
            }

            return token;
        },
        async session({ session, token }: { session: Session; token: JWT }) {
            console.log('NextAuth Callback - session: entering. Token expired:', !!token.expired);
            if (token.expired) {
                throw new Error('Session telah kadaluarsa');
            }

            if (token.id) {
                // TAMBAHKAN INI BIAR IdPengguna NYAMPE KE FRONTEND
                (session.user as any).id = token.id;
                (session.user as any).IdPengguna = token.id;
                (session.user as any).uniqueId = token.uniqueId || token.id;
                session.user.id = token.id as string;
                session.user.role = token.role as string;
                (session.user as any).roleCode = (token as any).roleCode;
                (session.user as any).roleId = (token as any).roleId;
                session.user.name = token.name as string;
                (session.user as any).nama_pengguna = token.nama_pengguna as string;
                (session.user as any).id_cabang = token.id_cabang;
                (session.user as any).nama_cabang = token.nama_cabang;
                console.log('NextAuth Callback - session: set session user role:', session.user.role, 'name:', session.user.name);
            }

            if (token.expiry) {
                const expiryDate = new Date((token.expiry as number) * 1000);
                session.expires = expiryDate.toISOString();
            }

            return session;
        },
        async signIn({ user: user }: { user: User }) {
            try {
                const anyUser = user as any;
                const cookieStore = cookies();
                const maxAge = anyUser.remember_me ? 60 * 60 * 24 : 60 * 60 * 7;

                const secret = new TextEncoder().encode(process.env.USER_KEY);
                const activeId = anyUser.IdPengguna || anyUser.id_pengguna || anyUser.uniqueId || user.id || anyUser.nama_pengguna;
                const jwtPayload = {
                    IdPengguna: activeId,
                    id_pengguna: activeId,
                    uid: activeId,
                    uniqueId: activeId,
                    name: user.name,
                    nama_pengguna: anyUser.nama_pengguna
                };

                // _A2R selalu dibuat — ini yang dipakai middleware untuk auth
                const token = await new SignJWT(jwtPayload)
                    .setProtectedHeader({ alg: 'HS512' })
                    .setExpirationTime(anyUser.remember_me ? '1d' : '7h')
                    .sign(secret);

                cookieStore.set({
                    name: '_A2R',
                    value: token,
                    httpOnly: false,
                    secure: false,
                    sameSite: 'lax',
                    path: '/',
                    maxAge
                });

                // _A2F hanya dibuat jika backend mengirim credential
                if (anyUser.credential) {
                    cookieStore.set({
                        name: '_A2F',
                        value: anyUser.credential,
                        httpOnly: false,
                        secure: false,
                        sameSite: 'lax',
                        path: '/',
                        maxAge
                    });
                }

                return true;
            } catch (error) {
                console.error('Error setting cookie:', error);
                return false;
            }
        }
    },
    events: {
        async signOut() {
            try {
                const cookieStore = cookies();
                cookieStore.delete('_A2F');
                cookieStore.delete('_A2R');
            } catch (error) {
                console.error('Error deleting cookie:', error);
            }
        }
    },
    debug: process.env.NODE_ENV === 'development'
};

const { handlers, auth } = NextAuth(authOptions);

export { authOptions, handlers, auth };
