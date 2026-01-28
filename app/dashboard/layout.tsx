import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth/auth-options';
import { Providers } from '@/components/Providers';
import { Sidebar } from '@/components/layout/Sidebar';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect('/login');
    }

    return (
        <Providers>
            <div className="app-layout">
                <Sidebar />
                <main className="main-content">
                    {children}
                </main>
            </div>
        </Providers>
    );
}
