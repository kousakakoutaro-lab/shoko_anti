import { getDb } from './schema';

// 型定義
export interface User {
    id: number;
    email: string;
    password_hash: string;
    name: string;
    role: 'admin' | 'manager' | 'employee';
    department_id: number | null;
    manager_id: number | null;
    created_at: string;
}

export interface Department {
    id: number;
    name: string;
    parent_id: number | null;
    created_at: string;
}

export interface Folder {
    id: number;
    name: string;
    parent_id: number | null;
    owner_id: number | null;
    folder_type: 'personal' | 'department' | 'company';
    created_at: string;
}

export interface FileRecord {
    id: number;
    name: string;
    original_name: string;
    file_path: string;
    mime_type: string | null;
    size: number | null;
    folder_id: number | null;
    uploaded_by: number;
    created_at: string;
}

export interface CareerRecord {
    id: number;
    user_id: number;
    category: 'skill' | 'rank' | 'training' | 'certificate' | 'evaluation';
    title: string;
    description: string | null;
    record_date: string;
    expiry_date: string | null;
    attachment_path: string | null;
    created_at: string;
}

// ユーザー関連クエリ
export function getUserByEmail(email: string): User | undefined {
    const db = getDb();
    return db.prepare('SELECT * FROM users WHERE email = ?').get(email) as User | undefined;
}

export function getUserById(id: number): User | undefined {
    const db = getDb();
    return db.prepare('SELECT * FROM users WHERE id = ?').get(id) as User | undefined;
}

export function getAllUsers(): User[] {
    const db = getDb();
    return db.prepare('SELECT * FROM users ORDER BY name').all() as User[];
}

export function getUsersByDepartment(departmentId: number): User[] {
    const db = getDb();
    return db.prepare('SELECT * FROM users WHERE department_id = ?').all(departmentId) as User[];
}

export function getSubordinates(managerId: number): User[] {
    const db = getDb();
    return db.prepare('SELECT * FROM users WHERE manager_id = ?').all(managerId) as User[];
}

export function getAllSubordinateIds(managerId: number): number[] {
    const directReports = getSubordinates(managerId);
    const allIds: number[] = [];

    for (const report of directReports) {
        allIds.push(report.id);
        const subReports = getAllSubordinateIds(report.id);
        allIds.push(...subReports);
    }

    return allIds;
}

// 部署関連クエリ
export function getDepartmentById(id: number): Department | undefined {
    const db = getDb();
    return db.prepare('SELECT * FROM departments WHERE id = ?').get(id) as Department | undefined;
}

export function getAllDepartments(): Department[] {
    const db = getDb();
    return db.prepare('SELECT * FROM departments ORDER BY name').all() as Department[];
}

// フォルダ関連クエリ
export function getFolderById(id: number): Folder | undefined {
    const db = getDb();
    return db.prepare('SELECT * FROM folders WHERE id = ?').get(id) as Folder | undefined;
}

export function getRootFolders(userId: number, userRole: string): Folder[] {
    const db = getDb();

    if (userRole === 'admin') {
        // 管理者は全てのルートフォルダを見れる
        return db.prepare('SELECT * FROM folders WHERE parent_id IS NULL ORDER BY folder_type, name').all() as Folder[];
    }

    // 会社フォルダと自分のフォルダのみ
    return db.prepare(`
    SELECT * FROM folders 
    WHERE parent_id IS NULL 
    AND (folder_type = 'company' OR owner_id = ?)
    ORDER BY folder_type, name
  `).all(userId) as Folder[];
}

export function getChildFolders(parentId: number): Folder[] {
    const db = getDb();
    return db.prepare('SELECT * FROM folders WHERE parent_id = ? ORDER BY name').all(parentId) as Folder[];
}

export function createFolder(name: string, parentId: number | null, ownerId: number, folderType: string): number {
    const db = getDb();
    const result = db.prepare(`
    INSERT INTO folders (name, parent_id, owner_id, folder_type)
    VALUES (?, ?, ?, ?)
  `).run(name, parentId, ownerId, folderType);
    return Number(result.lastInsertRowid);
}

// ファイル関連クエリ
export function getFilesByFolder(folderId: number | null): FileRecord[] {
    const db = getDb();
    if (folderId === null) {
        return db.prepare('SELECT * FROM files WHERE folder_id IS NULL ORDER BY created_at DESC').all() as FileRecord[];
    }
    return db.prepare('SELECT * FROM files WHERE folder_id = ? ORDER BY created_at DESC').all(folderId) as FileRecord[];
}

export function getFileById(id: number): FileRecord | undefined {
    const db = getDb();
    return db.prepare('SELECT * FROM files WHERE id = ?').get(id) as FileRecord | undefined;
}

export function createFile(
    name: string,
    originalName: string,
    filePath: string,
    mimeType: string | null,
    size: number | null,
    folderId: number | null,
    uploadedBy: number
): number {
    const db = getDb();
    const result = db.prepare(`
    INSERT INTO files (name, original_name, file_path, mime_type, size, folder_id, uploaded_by)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(name, originalName, filePath, mimeType, size, folderId, uploadedBy);
    return Number(result.lastInsertRowid);
}

export function getRecentFiles(userId: number, userRole: string, limit: number = 10): FileRecord[] {
    const db = getDb();

    if (userRole === 'admin') {
        return db.prepare('SELECT * FROM files ORDER BY created_at DESC LIMIT ?').all(limit) as FileRecord[];
    }

    return db.prepare(`
    SELECT * FROM files WHERE uploaded_by = ? ORDER BY created_at DESC LIMIT ?
  `).all(userId, limit) as FileRecord[];
}

// キャリア記録関連クエリ
export function getCareerRecordsByUser(userId: number): CareerRecord[] {
    const db = getDb();
    return db.prepare('SELECT * FROM career_records WHERE user_id = ? ORDER BY record_date DESC').all(userId) as CareerRecord[];
}

export function getCareerRecordById(id: number): CareerRecord | undefined {
    const db = getDb();
    return db.prepare('SELECT * FROM career_records WHERE id = ?').get(id) as CareerRecord | undefined;
}

export function createCareerRecord(
    userId: number,
    category: string,
    title: string,
    description: string | null,
    recordDate: string,
    expiryDate: string | null,
    attachmentPath: string | null
): number {
    const db = getDb();
    const result = db.prepare(`
    INSERT INTO career_records (user_id, category, title, description, record_date, expiry_date, attachment_path)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(userId, category, title, description, recordDate, expiryDate, attachmentPath);
    return Number(result.lastInsertRowid);
}

export function getViewableCareerRecords(currentUser: User): CareerRecord[] {
    const db = getDb();

    if (currentUser.role === 'admin') {
        // 管理者は全員の記録を見れる
        return db.prepare(`
      SELECT cr.*, u.name as user_name
      FROM career_records cr
      JOIN users u ON cr.user_id = u.id
      ORDER BY cr.record_date DESC
    `).all() as CareerRecord[];
    }

    if (currentUser.role === 'manager') {
        // 管理職は自分と部下の記録を見れる
        const subordinateIds = getAllSubordinateIds(currentUser.id);
        const ids = [currentUser.id, ...subordinateIds];
        const placeholders = ids.map(() => '?').join(',');

        return db.prepare(`
      SELECT cr.*, u.name as user_name
      FROM career_records cr
      JOIN users u ON cr.user_id = u.id
      WHERE cr.user_id IN (${placeholders})
      ORDER BY cr.record_date DESC
    `).all(...ids) as CareerRecord[];
    }

    // 一般社員は自分の記録のみ
    return db.prepare(`
    SELECT cr.*, u.name as user_name
    FROM career_records cr
    JOIN users u ON cr.user_id = u.id
    WHERE cr.user_id = ?
    ORDER BY cr.record_date DESC
  `).all(currentUser.id) as CareerRecord[];
}
