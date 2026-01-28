import { CareerForm } from '@/components/features/CareerForm';
import { Providers } from '@/components/Providers';

export default function NewCareerPage() {
    return (
        <Providers>
            <header className="main-header">
                <h1>📝 キャリア記録を登録</h1>
            </header>

            <div className="main-body">
                <div className="card" style={{ maxWidth: '700px' }}>
                    <div className="card-header">
                        <h2>新規キャリア記録</h2>
                    </div>
                    <div className="card-body">
                        <CareerForm />
                    </div>
                </div>
            </div>
        </Providers>
    );
}
