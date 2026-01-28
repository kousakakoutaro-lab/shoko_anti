'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { getRoleDisplayName } from '@/lib/auth/permissions';

const navigation = [
    { name: 'ダッシュボード', href: '/dashboard', icon: '🏠' },
    { name: 'ファイル管理', href: '/dashboard/files', icon: '📁' },
    { name: 'キャリア記録', href: '/dashboard/career', icon: '📈' },
];

const adminNavigation = [
    { name: 'ユーザー管理', href: '/dashboard/admin/users', icon: '👥' },
    { name: '部署管理', href: '/dashboard/admin/departments', icon: '🏢' },
];

export function Sidebar() {
    const pathname = usePathname();
    const { data: session } = useSession();

    const isAdmin = session?.user?.role === 'admin';
    const userName = session?.user?.name || '';
    const userRole = session?.user?.role || '';
    const userInitial = userName.charAt(0);

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <Link href="/dashboard" className="sidebar-logo">
                    <span className="sidebar-logo-icon">📚</span>
                    <span>社内書庫</span>
                </Link>
            </div>

            <nav className="sidebar-nav">
                <div className="sidebar-section">
                    <div className="sidebar-section-title">メニュー</div>
                </div>
                {navigation.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`sidebar-link ${pathname === item.href ? 'active' : ''}`}
                    >
                        <span className="sidebar-link-icon">{item.icon}</span>
                        <span>{item.name}</span>
                    </Link>
                ))}

                {isAdmin && (
                    <>
                        <div className="sidebar-section">
                            <div className="sidebar-section-title">管理</div>
                        </div>
                        {adminNavigation.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`sidebar-link ${pathname === item.href ? 'active' : ''}`}
                            >
                                <span className="sidebar-link-icon">{item.icon}</span>
                                <span>{item.name}</span>
                            </Link>
                        ))}
                    </>
                )}
            </nav>

            <div className="sidebar-user">
                <div className="sidebar-avatar">{userInitial}</div>
                <div className="sidebar-user-info">
                    <div className="sidebar-user-name">{userName}</div>
                    <div className="sidebar-user-role">{getRoleDisplayName(userRole)}</div>
                </div>
                <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="btn btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '12px' }}
                >
                    ログアウト
                </button>
            </div>
        </aside>
    );
}
