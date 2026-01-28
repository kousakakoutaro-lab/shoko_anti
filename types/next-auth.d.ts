import 'next-auth';

declare module 'next-auth' {
    interface User {
        id: string;
        role: string;
        departmentId: number | null;
    }

    interface Session {
        user: {
            id: string;
            name?: string | null;
            email?: string | null;
            image?: string | null;
            role: string;
            departmentId: number | null;
        };
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id: string;
        role: string;
        departmentId: number | null;
    }
}
