import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { authOptions } from '@/lib/auth/auth-options';
import { getViewableCareerRecords, getUserById } from '@/lib/db/queries';
import { CareerTimeline } from '@/components/features/CareerTimeline';

export default async function CareerPage() {
    const session = await getServerSession(authOptions);
    const userId = Number(session?.user?.id);
    const userRole = session?.user?.role || 'employee';
    const currentUser = getUserById(userId);

    if (!currentUser) {
        return <div>エラー: ユーザーが見つかりません</div>;
    }

    const records = getViewableCareerRecords(currentUser);
    const showUserName = userRole !== 'employee';

    return (
        <>
            <header className="main-header">
                <h1>📈 キャリア記録</h1>
                <Link href="/dashboard/career/new" className="btn btn-primary">
                    ＋ 新規登録
                </Link>
            </header>

            <div className="main-body">
                <div className="card">
                    <div className="card-header">
                        <h2>キャリアタイムライン</h2>
                    </div>
                    <div className="card-body">
                        <CareerTimeline records={records} showUserName={showUserName} />
                    </div>
                </div>
            </div>
        </>
    );
}
