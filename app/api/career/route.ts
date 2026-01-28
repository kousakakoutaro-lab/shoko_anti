import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { createCareerRecord, getViewableCareerRecords, getUserById } from '@/lib/db/queries';

// キャリア記録一覧取得
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const currentUser = getUserById(Number(session.user.id));
        if (!currentUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const records = getViewableCareerRecords(currentUser);
        return NextResponse.json({ records });
    } catch (error) {
        console.error('Get career records error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// キャリア記録登録
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = Number(session.user.id);
        const { category, title, description, recordDate, expiryDate } = await request.json();

        if (!category || !title || !recordDate) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const recordId = createCareerRecord(
            userId,
            category,
            title,
            description || null,
            recordDate,
            expiryDate || null,
            null // attachment_path
        );

        return NextResponse.json({
            record: {
                id: recordId,
                user_id: userId,
                category,
                title,
                description,
                record_date: recordDate,
                expiry_date: expiryDate,
                created_at: new Date().toISOString(),
            },
        });
    } catch (error) {
        console.error('Create career record error:', error);
        return NextResponse.json({ error: 'Failed to create record' }, { status: 500 });
    }
}
