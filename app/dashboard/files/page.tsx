import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { getRootFolders, getChildFolders, getFilesByFolder, getFolderById } from '@/lib/db/queries';
import { FileExplorer } from '@/components/features/FileExplorer';

interface PageProps {
    searchParams: Promise<{ folder?: string }>;
}

export default async function FilesPage({ searchParams }: PageProps) {
    const session = await getServerSession(authOptions);
    const userId = Number(session?.user?.id);
    const userRole = session?.user?.role || 'employee';

    const params = await searchParams;
    const folderId = params.folder ? Number(params.folder) : null;

    // フォルダ取得
    let folders;
    if (folderId) {
        folders = getChildFolders(folderId);
    } else {
        folders = getRootFolders(userId, userRole);
    }

    // ファイル取得
    const files = getFilesByFolder(folderId);

    // パンくずリスト作成
    const breadcrumbs: Array<{ id: number | null; name: string }> = [
        { id: null, name: 'ホーム' }
    ];

    if (folderId) {
        const buildBreadcrumbs = (id: number) => {
            const folder = getFolderById(id);
            if (folder) {
                if (folder.parent_id) {
                    buildBreadcrumbs(folder.parent_id);
                }
                breadcrumbs.push({ id: folder.id, name: folder.name });
            }
        };
        buildBreadcrumbs(folderId);
    }

    return (
        <>
            <header className="main-header">
                <h1>📁 ファイル管理</h1>
            </header>

            <div className="main-body">
                <FileExplorer
                    initialFolders={folders}
                    initialFiles={files}
                    currentFolderId={folderId}
                    breadcrumbs={breadcrumbs}
                />
            </div>
        </>
    );
}
