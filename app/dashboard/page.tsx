import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { authOptions } from '@/lib/auth/auth-options';
import { getRecentFiles, getCareerRecordsByUser, getUserById } from '@/lib/db/queries';
import { getRoleDisplayName, getCategoryDisplayName, getCategoryIcon } from '@/lib/auth/permissions';

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);
    const userId = Number(session?.user?.id);
    const userRole = session?.user?.role || 'employee';
    const user = getUserById(userId);

    const recentFiles = getRecentFiles(userId, userRole, 5);
    const careerRecords = getCareerRecordsByUser(userId).slice(0, 3);

    return (
        <>
            <header className="main-header">
                <h1>ダッシュボード</h1>
            </header>

            <div className="main-body">
                {/* 統計カード */}
                <div className="dashboard-grid" style={{ marginBottom: '32px' }}>
                    <div className="stat-card">
                        <div className="stat-icon blue">📁</div>
                        <div className="stat-content">
                            <h3>{recentFiles.length}</h3>
                            <p>最近のファイル</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon green">📈</div>
                        <div className="stat-content">
                            <h3>{careerRecords.length}</h3>
                            <p>キャリア記録</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon purple">👤</div>
                        <div className="stat-content">
                            <h3>{getRoleDisplayName(userRole)}</h3>
                            <p>あなたの役職</p>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    {/* 最近のファイル */}
                    <div className="card">
                        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2>📁 最近のファイル</h2>
                            <Link href="/dashboard/files" className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>
                                すべて見る →
                            </Link>
                        </div>
                        <div className="card-body">
                            {recentFiles.length === 0 ? (
                                <div className="empty-state" style={{ padding: '40px 20px' }}>
                                    <div className="empty-state-icon">📄</div>
                                    <h3>ファイルがありません</h3>
                                    <p>ファイルをアップロードしてください</p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {recentFiles.map((file) => (
                                        <div
                                            key={file.id}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '12px',
                                                padding: '12px',
                                                background: 'var(--bg-secondary)',
                                                borderRadius: 'var(--border-radius)',
                                            }}
                                        >
                                            <span style={{ fontSize: '24px' }}>📄</span>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {file.original_name}
                                                </div>
                                                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                                    {new Date(file.created_at).toLocaleDateString('ja-JP')}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* キャリア記録 */}
                    <div className="card">
                        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2>📈 キャリア記録</h2>
                            <Link href="/dashboard/career" className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>
                                すべて見る →
                            </Link>
                        </div>
                        <div className="card-body">
                            {careerRecords.length === 0 ? (
                                <div className="empty-state" style={{ padding: '40px 20px' }}>
                                    <div className="empty-state-icon">📊</div>
                                    <h3>記録がありません</h3>
                                    <p>キャリア記録を登録してください</p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {careerRecords.map((record) => (
                                        <div
                                            key={record.id}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '12px',
                                                padding: '12px',
                                                background: 'var(--bg-secondary)',
                                                borderRadius: 'var(--border-radius)',
                                            }}
                                        >
                                            <span style={{ fontSize: '24px' }}>{getCategoryIcon(record.category)}</span>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {record.title}
                                                </div>
                                                <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', gap: '8px' }}>
                                                    <span className="badge badge-primary">{getCategoryDisplayName(record.category)}</span>
                                                    <span>{new Date(record.record_date).toLocaleDateString('ja-JP')}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* お知らせ */}
                <div className="card" style={{ marginTop: '24px' }}>
                    <div className="card-header">
                        <h2>📢 お知らせ</h2>
                    </div>
                    <div className="card-body">
                        <div style={{ padding: '12px', background: 'var(--color-primary-light)', borderRadius: 'var(--border-radius)', marginBottom: '12px' }}>
                            <div style={{ fontWeight: 500, marginBottom: '4px' }}>社内書庫システムへようこそ！</div>
                            <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                                このシステムでは、ファイルの管理やキャリア記録の管理ができます。
                                サイドバーのメニューから各機能にアクセスしてください。
                            </div>
                        </div>
                        {userRole === 'admin' && (
                            <div style={{ padding: '12px', background: '#fef3c7', borderRadius: 'var(--border-radius)' }}>
                                <div style={{ fontWeight: 500, marginBottom: '4px' }}>【管理者向け】</div>
                                <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                                    管理者メニューからユーザー管理や部署管理が可能です。
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
