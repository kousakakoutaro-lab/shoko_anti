import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { getFileById, getUserById } from '@/lib/db/queries';
import { canViewFile } from '@/lib/auth/permissions';
import { readFile } from 'fs/promises';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// ファイルダウンロード
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const fileId = Number(id);
        const file = getFileById(fileId);

        if (!file) {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }

        // 権限チェック
        const currentUser = getUserById(Number(session.user.id));
        if (!currentUser || !canViewFile(currentUser, file.uploaded_by)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // ファイル読み込み
        const fileBuffer = await readFile(file.file_path);

        // レスポンス
        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': file.mime_type || 'application/octet-stream',
                'Content-Disposition': `attachment; filename="${encodeURIComponent(file.original_name)}"`,
            },
        });
    } catch (error) {
        console.error('Download error:', error);
        return NextResponse.json({ error: 'Download failed' }, { status: 500 });
    }
}
