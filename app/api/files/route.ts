import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { createFile, getFilesByFolder } from '@/lib/db/queries';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

// ファイル一覧取得
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const folderId = searchParams.get('folderId');

        const files = getFilesByFolder(folderId ? Number(folderId) : null);
        return NextResponse.json({ files });
    } catch (error) {
        console.error('Get files error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// ファイルアップロード
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = Number(session.user.id);
        const formData = await request.formData();
        const uploadedFiles = formData.getAll('files') as File[];
        const folderId = formData.get('folderId') as string | null;

        if (uploadedFiles.length === 0) {
            return NextResponse.json({ error: 'No files provided' }, { status: 400 });
        }

        // アップロードディレクトリ作成
        await mkdir(UPLOAD_DIR, { recursive: true });

        const savedFiles = [];

        for (const file of uploadedFiles) {
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            // ユニークなファイル名生成
            const ext = path.extname(file.name);
            const uniqueName = `${uuidv4()}${ext}`;
            const filePath = path.join(UPLOAD_DIR, uniqueName);

            // ファイル保存
            await writeFile(filePath, buffer);

            // DB登録
            const fileId = createFile(
                uniqueName,
                file.name,
                filePath,
                file.type || null,
                file.size,
                folderId ? Number(folderId) : null,
                userId
            );

            savedFiles.push({
                id: fileId,
                name: uniqueName,
                original_name: file.name,
                mime_type: file.type,
                size: file.size,
                created_at: new Date().toISOString(),
            });
        }

        return NextResponse.json({ files: savedFiles });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}
