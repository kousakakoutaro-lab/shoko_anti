'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError('メールアドレスまたはパスワードが正しくありません');
            } else {
                router.push('/dashboard');
                router.refresh();
            }
        } catch {
            setError('ログインに失敗しました');
        } finally {
            setLoading(false);
        }
    };

    const handleDemoLogin = async (demoEmail: string, demoPassword: string) => {
        setEmail(demoEmail);
        setPassword(demoPassword);
        setError('');
        setLoading(true);

        try {
            const result = await signIn('credentials', {
                email: demoEmail,
                password: demoPassword,
                redirect: false,
            });

            if (result?.error) {
                setError('ログインに失敗しました');
            } else {
                router.push('/dashboard');
                router.refresh();
            }
        } catch {
            setError('ログインに失敗しました');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-card">
                    <div className="login-header">
                        <div className="login-logo">📚</div>
                        <h1>社内書庫システム</h1>
                        <p>ログインしてください</p>
                    </div>

                    <div className="login-body">
                        {error && (
                            <div className="alert alert-error">{error}</div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label" htmlFor="email">
                                    メールアドレス
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    className="form-input"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="password">
                                    パスワード
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    className="form-input"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary login-button"
                                disabled={loading}
                            >
                                {loading ? 'ログイン中...' : 'ログイン'}
                            </button>
                        </form>

                        <div className="login-demo">
                            <h3>デモアカウント（クリックでログイン）</h3>
                            <div className="demo-accounts">
                                <button
                                    className="demo-account"
                                    onClick={() => handleDemoLogin('admin@example.com', 'admin123')}
                                    disabled={loading}
                                >
                                    <span className="demo-account-role">🏢 社長</span>
                                    <span className="demo-account-email">admin@example.com</span>
                                </button>
                                <button
                                    className="demo-account"
                                    onClick={() => handleDemoLogin('manager@example.com', 'manager123')}
                                    disabled={loading}
                                >
                                    <span className="demo-account-role">👔 管理職</span>
                                    <span className="demo-account-email">manager@example.com</span>
                                </button>
                                <button
                                    className="demo-account"
                                    onClick={() => handleDemoLogin('employee@example.com', 'employee123')}
                                    disabled={loading}
                                >
                                    <span className="demo-account-role">👤 一般社員</span>
                                    <span className="demo-account-email">employee@example.com</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
