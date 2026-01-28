import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth/auth-options';
import { getAllDepartments, getUsersByDepartment } from '@/lib/db/queries';

export default async function AdminDepartmentsPage() {
    const session = await getServerSession(authOptions);

    // 管理者のみアクセス可能
    if (session?.user?.role !== 'admin') {
        redirect('/dashboard');
    }

    const departments = getAllDepartments();

    return (
        <>
            <header className="main-header">
                <h1>🏢 部署管理</h1>
            </header>

            <div className="main-body">
                <div className="dashboard-grid">
                    {departments.map((dept) => {
                        const members = getUsersByDepartment(dept.id);
                        return (
                            <div key={dept.id} className="card">
                                <div className="card-header">
                                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        🏢 {dept.name}
                                    </h2>
                                </div>
                                <div className="card-body">
                                    <div style={{ marginBottom: '16px' }}>
                                        <span className="badge badge-primary">{members.length}名</span>
                                    </div>

                                    {members.length === 0 ? (
                                        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                                            所属メンバーがいません
                                        </p>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            {members.map((member) => (
                                                <div
                                                    key={member.id}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        padding: '8px 12px',
                                                        background: 'var(--bg-secondary)',
                                                        borderRadius: 'var(--border-radius)',
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            width: '32px',
                                                            height: '32px',
                                                            background: member.role === 'manager' ? 'var(--color-warning)' : 'var(--color-primary)',
                                                            borderRadius: '50%',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            color: 'white',
                                                            fontWeight: 600,
                                                            fontSize: '14px',
                                                        }}
                                                    >
                                                        {member.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 500, fontSize: '14px' }}>{member.name}</div>
                                                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                                            {member.role === 'manager' ? '部長' : 'メンバー'}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {departments.length === 0 && (
                    <div className="empty-state">
                        <div className="empty-state-icon">🏢</div>
                        <h3>部署がありません</h3>
                        <p>部署を登録してください</p>
                    </div>
                )}
            </div>
        </>
    );
}
