'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const categories = [
    { value: 'certificate', label: '資格取得', icon: '🏆' },
    { value: 'training', label: '研修受講', icon: '📚' },
    { value: 'skill', label: 'スキル習得', icon: '💡' },
    { value: 'rank', label: '昇進/昇格', icon: '📈' },
    { value: 'evaluation', label: '評価', icon: '📋' },
];

export function CareerForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        category: 'certificate',
        title: '',
        description: '',
        recordDate: new Date().toISOString().split('T')[0],
        expiryDate: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/career', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    category: formData.category,
                    title: formData.title,
                    description: formData.description || null,
                    recordDate: formData.recordDate,
                    expiryDate: formData.expiryDate || null,
                }),
            });

            if (res.ok) {
                router.push('/dashboard/career');
                router.refresh();
            } else {
                alert('登録に失敗しました');
            }
        } catch (error) {
            console.error('Submit error:', error);
            alert('登録に失敗しました');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="form-group">
                <label className="form-label">カテゴリ *</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '8px' }}>
                    {categories.map((cat) => (
                        <label
                            key={cat.value}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '12px',
                                border: `2px solid ${formData.category === cat.value ? 'var(--color-primary)' : 'var(--border-color)'}`,
                                borderRadius: 'var(--border-radius)',
                                cursor: 'pointer',
                                background: formData.category === cat.value ? 'var(--color-primary-light)' : 'var(--bg-primary)',
                                transition: 'all var(--transition-fast)',
                            }}
                        >
                            <input
                                type="radio"
                                name="category"
                                value={cat.value}
                                checked={formData.category === cat.value}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                style={{ display: 'none' }}
                            />
                            <span style={{ fontSize: '20px' }}>{cat.icon}</span>
                            <span style={{ fontSize: '13px', fontWeight: 500 }}>{cat.label}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="form-group">
                <label className="form-label" htmlFor="title">タイトル *</label>
                <input
                    id="title"
                    type="text"
                    className="form-input"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="例: 日商簿記2級"
                    required
                />
            </div>

            <div className="form-group">
                <label className="form-label" htmlFor="description">説明</label>
                <textarea
                    id="description"
                    className="form-input"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="詳細な説明を入力してください"
                    style={{ resize: 'vertical' }}
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                    <label className="form-label" htmlFor="recordDate">取得日/実施日 *</label>
                    <input
                        id="recordDate"
                        type="date"
                        className="form-input"
                        value={formData.recordDate}
                        onChange={(e) => setFormData({ ...formData, recordDate: e.target.value })}
                        required
                    />
                </div>

                <div className="form-group">
                    <label className="form-label" htmlFor="expiryDate">有効期限</label>
                    <input
                        id="expiryDate"
                        type="date"
                        className="form-input"
                        value={formData.expiryDate}
                        onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    />
                </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => router.back()}
                >
                    キャンセル
                </button>
                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                >
                    {loading ? '登録中...' : '登録する'}
                </button>
            </div>
        </form>
    );
}
