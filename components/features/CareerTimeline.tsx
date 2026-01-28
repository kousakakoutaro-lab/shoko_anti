'use client';

import { getCategoryDisplayName, getCategoryIcon } from '@/lib/auth/permissions';

interface CareerRecord {
    id: number;
    user_id: number;
    user_name?: string;
    category: string;
    title: string;
    description: string | null;
    record_date: string;
    expiry_date: string | null;
    created_at: string;
}

interface CareerTimelineProps {
    records: CareerRecord[];
    showUserName?: boolean;
}

export function CareerTimeline({ records, showUserName = false }: CareerTimelineProps) {
    if (records.length === 0) {
        return (
            <div className="empty-state">
                <div className="empty-state-icon">📊</div>
                <h3>キャリア記録がありません</h3>
                <p>新しいキャリア記録を登録してください</p>
            </div>
        );
    }

    // 年ごとにグループ化
    const groupedRecords = records.reduce((acc, record) => {
        const year = new Date(record.record_date).getFullYear();
        if (!acc[year]) {
            acc[year] = [];
        }
        acc[year].push(record);
        return acc;
    }, {} as Record<number, CareerRecord[]>);

    const years = Object.keys(groupedRecords)
        .map(Number)
        .sort((a, b) => b - a);

    return (
        <div>
            {years.map((year) => (
                <div key={year} style={{ marginBottom: '32px' }}>
                    <h3 style={{
                        fontSize: '18px',
                        fontWeight: 600,
                        marginBottom: '16px',
                        color: 'var(--text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <span style={{
                            background: 'var(--color-primary)',
                            color: 'white',
                            padding: '4px 12px',
                            borderRadius: '12px',
                            fontSize: '14px'
                        }}>
                            {year}年
                        </span>
                    </h3>

                    <div className="timeline">
                        {groupedRecords[year].map((record) => (
                            <div key={record.id} className="timeline-item">
                                <div className="timeline-marker">
                                    {getCategoryIcon(record.category)}
                                </div>
                                <div className="timeline-content">
                                    <div className="timeline-date">
                                        {new Date(record.record_date).toLocaleDateString('ja-JP', {
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                        {showUserName && record.user_name && (
                                            <span style={{ marginLeft: '8px', color: 'var(--color-primary)' }}>
                                                - {record.user_name}
                                            </span>
                                        )}
                                    </div>
                                    <div className="timeline-title">
                                        <span className="badge badge-primary" style={{ marginRight: '8px' }}>
                                            {getCategoryDisplayName(record.category)}
                                        </span>
                                        {record.title}
                                    </div>
                                    {record.description && (
                                        <div className="timeline-description">{record.description}</div>
                                    )}
                                    {record.expiry_date && (
                                        <div style={{
                                            marginTop: '8px',
                                            fontSize: '12px',
                                            color: new Date(record.expiry_date) < new Date() ? 'var(--color-danger)' : 'var(--color-warning)'
                                        }}>
                                            ⏱️ 有効期限: {new Date(record.expiry_date).toLocaleDateString('ja-JP')}
                                            {new Date(record.expiry_date) < new Date() && ' (期限切れ)'}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
