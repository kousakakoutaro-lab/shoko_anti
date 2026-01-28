import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { createFolder, getFolderById, getUserById } from '@/lib/db/queries';
import { canUploadFile } from '@/lib/auth/permissions';

// フォルダ作成
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = Number(session.user.id);
        const currentUser = getUserById(userId);
        const { name, parentId } = await request.json();

        if (!name || !name.trim()) {
            return NextResponse.json({ error: 'Folder name is required' }, { status: 400 });
        }

        // 親フォルダの権限チェック
        let folderType = 'personal';
        if (parentId) {
            const parentFolder = getFolderById(parentId);
            if (!parentFolder) {
                return NextResponse.json({ error: 'Parent folder not found' }, { status: 404 });
            }

            if (!currentUser || !canUploadFile(currentUser, parentId, parentFolder)) {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }

            folderType = parentFolder.folder_type;
        }

        const folderId = createFolder(name.trim(), parentId || null, userId, folderType);

        return NextResponse.json({
            folder: {
                id: folderId,
                name: name.trim(),
                parent_id: parentId || null,
                owner_id: userId,
                folder_type: folderType,
            },
        });
    } catch (error) {
        console.error('Create folder error:', error);
        return NextResponse.json({ error: 'Failed to create folder' }, { status: 500 });
    }
}
