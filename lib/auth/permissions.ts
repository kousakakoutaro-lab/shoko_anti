import { User, getAllSubordinateIds } from '@/lib/db/queries';

// 権限チェック: ファイル閲覧可能か
export function canViewFile(currentUser: User, fileOwnerId: number): boolean {
    // 管理者は全て閲覧可能
    if (currentUser.role === 'admin') return true;

    // 自分のファイルは閲覧可能
    if (fileOwnerId === currentUser.id) return true;

    // 管理職は部下のファイルを閲覧可能
    if (currentUser.role === 'manager') {
        const subordinateIds = getAllSubordinateIds(currentUser.id);
        return subordinateIds.includes(fileOwnerId);
    }

    return false;
}

// 権限チェック: フォルダ閲覧可能か
export function canViewFolder(currentUser: User, folder: { owner_id: number | null; folder_type: string }): boolean {
    // 会社フォルダは全員閲覧可能
    if (folder.folder_type === 'company') return true;

    // 管理者は全て閲覧可能
    if (currentUser.role === 'admin') return true;

    // オーナーがいない場合
    if (folder.owner_id === null) return currentUser.role === 'admin';

    // 自分のフォルダは閲覧可能
    if (folder.owner_id === currentUser.id) return true;

    // 管理職は部下のフォルダを閲覧可能
    if (currentUser.role === 'manager') {
        const subordinateIds = getAllSubordinateIds(currentUser.id);
        return subordinateIds.includes(folder.owner_id);
    }

    return false;
}

// 権限チェック: キャリア記録閲覧可能か
export function canViewCareerRecord(currentUser: User, recordOwnerId: number): boolean {
    // 管理者は全て閲覧可能
    if (currentUser.role === 'admin') return true;

    // 自分の記録は閲覧可能
    if (recordOwnerId === currentUser.id) return true;

    // 管理職は部下の記録を閲覧可能
    if (currentUser.role === 'manager') {
        const subordinateIds = getAllSubordinateIds(currentUser.id);
        return subordinateIds.includes(recordOwnerId);
    }

    return false;
}

// 権限チェック: 会社書類を管理できるか
export function canManageCompanyDocuments(currentUser: User): boolean {
    return currentUser.role === 'admin';
}

// 権限チェック: ユーザー管理できるか
export function canManageUsers(currentUser: User): boolean {
    return currentUser.role === 'admin';
}

// 権限チェック: ファイルアップロード可能か
export function canUploadFile(currentUser: User, folderId: number | null, folder: { owner_id: number | null; folder_type: string } | null): boolean {
    // フォルダなしの場合（ルート）
    if (!folder) return currentUser.role === 'admin';

    // 会社フォルダへのアップロードは管理者のみ
    if (folder.folder_type === 'company') return currentUser.role === 'admin';

    // 自分のフォルダにはアップロード可能
    if (folder.owner_id === currentUser.id) return true;

    // 管理者は全てにアップロード可能
    if (currentUser.role === 'admin') return true;

    return false;
}

// ロール表示名
export function getRoleDisplayName(role: string): string {
    switch (role) {
        case 'admin': return '社長/経営層';
        case 'manager': return '管理職';
        case 'employee': return '一般社員';
        default: return role;
    }
}

// カテゴリ表示名
export function getCategoryDisplayName(category: string): string {
    switch (category) {
        case 'skill': return 'スキル習得';
        case 'rank': return '昇進/昇格';
        case 'training': return '研修受講';
        case 'certificate': return '資格取得';
        case 'evaluation': return '評価';
        default: return category;
    }
}

// カテゴリアイコン
export function getCategoryIcon(category: string): string {
    switch (category) {
        case 'skill': return '💡';
        case 'rank': return '📈';
        case 'training': return '📚';
        case 'certificate': return '🏆';
        case 'evaluation': return '📋';
        default: return '📄';
    }
}
