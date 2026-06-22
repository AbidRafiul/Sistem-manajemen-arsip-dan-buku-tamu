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
                    return {
                        id: userData.UserId, // KUNCI: Pake UserId dari Express
                        UserId: userData.UserId, // Tambahkan eksplisit
                        name: userData.fullname || userData.name,
                        username: userData.username,
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
    session: {
        strategy: 'jwt' as const,
        maxAge: 7 * 24 * 60 * 60
    },
    callbacks: {
        async jwt({ token, user }: { token: JWT; user?: User }) {
            // Initial sign in
            if (user) {
                const anyUser = user as any;
                token.id = anyUser.UserId || user.id;
                token.id = user.id;
                token.role = user.role;
                (token as any).roleCode = (user as any).roleCode;
                (token as any).roleId = (user as any).roleId;
                token.uniqueId = user.uniqueId;
                token.name = user.name;
                token.username = user.username;
                token.remember_me = user.remember_me;
                token.userCredential = user.credential;

                const now = Math.floor(Date.now() / 1000);
                const expireDuration = user.remember_me ? 24 * 60 * 60 : 7 * 60 * 60;
                token.expiry = now + expireDuration;
            }

            // Check if token has expired
            const now = Math.floor(Date.now() / 1000);
            if (token.expiry && now > token.expiry) {
                return { ...token, expired: true };
            }

            return token;
        },
        async session({ session, token }: { session: Session; token: JWT }) {
            if (token.expired) {
                throw new Error('Session telah kadaluarsa');
            }

            if (token.id) {
                // TAMBAHKAN INI BIAR userId NYAMPE KE FRONTEND
                (session.user as any).id = token.id; 
                (session.user as any).UserId = token.id;
                session.user.id = token.id as string;
                session.user.role = token.role as string;
                (session.user as any).roleCode = (token as any).roleCode;
                (session.user as any).roleId = (token as any).roleId;
                session.user.name = token.name as string;
                session.user.username = token.username as string;
            }

            if (token.expiry) {
                const expiryDate = new Date((token.expiry as number) * 1000);
                session.expires = expiryDate.toISOString();
            }

            return session;
        },
        async signIn({ user: user }: { user: User }) {
            try {
                if (user.credential) {
                    const cookieStore = cookies();
                    const maxAge = user.remember_me ? 60 * 60 * 24 : 60 * 60 * 7;

                    const secret = new TextEncoder().encode(process.env.USER_KEY);
                    const payload = {
                        userId: (user as any).UserId || user.id,
                        name: user.name,
                        username: (user as any).username
                    };
                    const token = await new SignJWT(payload)
                        .setProtectedHeader({ alg: 'HS512' })
                        .setExpirationTime(user.remember_me ? '1d' : '7h')
                        .sign(secret);

                    cookieStore.set({
                        name: '_A2F',
                        value: user.credential,
                        httpOnly: false,
                        // secure: process.env.NODE_ENV === 'production',
                        secure: false,
                        sameSite: 'lax',
                        path: '/',
                        maxAge
                    });

                    cookieStore.set({
                        name: '_A2R',
                        value: token,
                        httpOnly: false,
                        // secure: process.env.NODE_ENV === 'production',
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
            } catch (error) {
                console.error('Error deleting cookie:', error);
            }
        }
    },
    debug: process.env.NODE_ENV === 'development'
};

const { handlers, auth } = NextAuth(authOptions);

export { authOptions, handlers, auth };
