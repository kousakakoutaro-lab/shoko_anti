import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth/auth-options';
import { getAllUsers, getAllDepartments } from '@/lib/db/queries';
import { getRoleDisplayName } from '@/lib/auth/permissions';

export default async function AdminUsersPage() {
    const session = await getServerSession(authOptions);

    // 管理者のみアクセス可能
    if (session?.user?.role !== 'admin') {
        redirect('/dashboard');
    }

    const users = getAllUsers();
    const departments = getAllDepartments();

    const getDepartmentName = (deptId: number | null) => {
        if (!deptId) return '-';
        const dept = departments.find(d => d.id === deptId);
        return dept?.name || '-';
    };

    return (
        <>
            <header className="main-header">
                <h1>👥 ユーザー管理</h1>
            </header>

            <div className="main-body">
                <div className="card">
                    <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2>登録ユーザー一覧</h2>
                        <span className="badge badge-primary">{users.length}名</span>
                    </div>
                    <div className="card-body" style={{ padding: 0 }}>
                        <div className="table-container">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>名前</th>
                                        <th>メールアドレス</th>
                                        <th>役職</th>
                                        <th>部署</th>
                                        <th>登録日</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr key={user.id}>
                                            <td>{user.id}</td>
                                            <td style={{ fontWeight: 500 }}>{user.name}</td>
                                            <td style={{ color: 'var(--text-secondary)' }}>{user.email}</td>
                                            <td>
                                                <span className={`badge ${user.role === 'admin' ? 'badge-danger' :
                                                        user.role === 'manager' ? 'badge-warning' : 'badge-primary'
                                                    }`}>
                                                    {getRoleDisplayName(user.role)}
                                                </span>
                                            </td>
                                            <td>{getDepartmentName(user.department_id)}</td>
                                            <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                                                {new Date(user.created_at).toLocaleDateString('ja-JP')}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="card" style={{ marginTop: '24px' }}>
                    <div className="card-header">
                        <h2>💡 ユーザー管理について</h2>
                    </div>
                    <div className="card-body">
                        <div style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                            <p><strong>社長/経営層:</strong> 全てのデータにアクセス可能、ユーザー管理が可能</p>
                            <p><strong>管理職:</strong> 自分と部下のデータにアクセス可能</p>
                            <p><strong>一般社員:</strong> 自分のデータのみアクセス可能</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
