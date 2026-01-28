import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { getUserByEmail } from '@/lib/db/queries';
import { initializeDatabase, seedDatabase } from '@/lib/db/schema';

// データベース初期化
try {
    initializeDatabase();
    seedDatabase();
} catch (error) {
    console.error('Database initialization error:', error);
}

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'メールアドレス', type: 'email' },
                password: { label: 'パスワード', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const user = getUserByEmail(credentials.email);
                if (!user) {
                    return null;
                }

                const isValid = bcrypt.compareSync(credentials.password, user.password_hash);
                if (!isValid) {
                    return null;
                }

                return {
                    id: String(user.id),
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    departmentId: user.department_id,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.departmentId = user.departmentId;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;
                session.user.departmentId = token.departmentId as number | null;
            }
            return session;
        },
    },
    pages: {
        signIn: '/login',
    },
    session: {
        strategy: 'jwt',
    },
    secret: process.env.NEXTAUTH_SECRET || 'shoko-system-secret-key-dev',
};
