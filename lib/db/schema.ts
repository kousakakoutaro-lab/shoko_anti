import Database from 'better-sqlite3';
import path from 'path';
import bcrypt from 'bcryptjs';

const dbPath = path.join(process.cwd(), 'database.sqlite');

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
  }
  return db;
}

export function initializeDatabase() {
  const db = getDb();

  // 部署テーブル
  db.exec(`
    CREATE TABLE IF NOT EXISTS departments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      parent_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (parent_id) REFERENCES departments(id)
    )
  `);

  // ユーザーテーブル
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'employee')),
      department_id INTEGER,
      manager_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (department_id) REFERENCES departments(id),
      FOREIGN KEY (manager_id) REFERENCES users(id)
    )
  `);

  // フォルダテーブル
  db.exec(`
    CREATE TABLE IF NOT EXISTS folders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      parent_id INTEGER,
      owner_id INTEGER,
      folder_type TEXT NOT NULL CHECK (folder_type IN ('personal', 'department', 'company')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (parent_id) REFERENCES folders(id),
      FOREIGN KEY (owner_id) REFERENCES users(id)
    )
  `);

  // ファイルテーブル
  db.exec(`
    CREATE TABLE IF NOT EXISTS files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      original_name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      mime_type TEXT,
      size INTEGER,
      folder_id INTEGER,
      uploaded_by INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (folder_id) REFERENCES folders(id),
      FOREIGN KEY (uploaded_by) REFERENCES users(id)
    )
  `);

  // キャリア記録テーブル
  db.exec(`
    CREATE TABLE IF NOT EXISTS career_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      category TEXT NOT NULL CHECK (category IN ('skill', 'rank', 'training', 'certificate', 'evaluation')),
      title TEXT NOT NULL,
      description TEXT,
      record_date DATE NOT NULL,
      expiry_date DATE,
      attachment_path TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // 会社書類テーブル
  db.exec(`
    CREATE TABLE IF NOT EXISTS company_documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      file_path TEXT NOT NULL,
      version INTEGER DEFAULT 1,
      uploaded_by INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (uploaded_by) REFERENCES users(id)
    )
  `);

  console.log('Database initialized successfully');
}

export function seedDatabase() {
  const db = getDb();

  // デモデータが既に存在するかチェック
  const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get('admin@example.com');
  if (existingUser) {
    console.log('Demo data already exists, skipping seed');
    return;
  }

  // 部署を作成
  const insertDept = db.prepare('INSERT INTO departments (name, parent_id) VALUES (?, ?)');
  const salesDept = insertDept.run('営業部', null);
  const devDept = insertDept.run('開発部', null);
  const hrDept = insertDept.run('人事部', null);

  // ユーザーを作成
  const insertUser = db.prepare(`
    INSERT INTO users (email, password_hash, name, role, department_id, manager_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const adminHash = bcrypt.hashSync('admin123', 10);
  const managerHash = bcrypt.hashSync('manager123', 10);
  const employeeHash = bcrypt.hashSync('employee123', 10);

  const admin = insertUser.run('admin@example.com', adminHash, '山田太郎（社長）', 'admin', null, null);
  const manager = insertUser.run('manager@example.com', managerHash, '鈴木一郎（部長）', 'manager', salesDept.lastInsertRowid, admin.lastInsertRowid);
  const employee = insertUser.run('employee@example.com', employeeHash, '佐藤花子', 'employee', salesDept.lastInsertRowid, manager.lastInsertRowid);

  // 開発部のスタッフも追加
  const devManager = insertUser.run('dev-manager@example.com', managerHash, '田中次郎（部長）', 'manager', devDept.lastInsertRowid, admin.lastInsertRowid);
  const devEmployee = insertUser.run('dev-employee@example.com', employeeHash, '高橋三郎', 'employee', devDept.lastInsertRowid, devManager.lastInsertRowid);

  // 会社共通フォルダを作成
  const insertFolder = db.prepare(`
    INSERT INTO folders (name, parent_id, owner_id, folder_type)
    VALUES (?, ?, ?, ?)
  `);
  
  insertFolder.run('会社共通', null, admin.lastInsertRowid, 'company');
  insertFolder.run('就業規則', 1, admin.lastInsertRowid, 'company');
  insertFolder.run('社内規程', 1, admin.lastInsertRowid, 'company');

  // 個人フォルダを作成
  const createPersonalFolder = (userId: number, userName: string) => {
    const folder = insertFolder.run(`${userName}のフォルダ`, null, userId, 'personal');
    insertFolder.run('スキルアップ記録', folder.lastInsertRowid, userId, 'personal');
    insertFolder.run('資格証明書', folder.lastInsertRowid, userId, 'personal');
  };

  createPersonalFolder(Number(employee.lastInsertRowid), '佐藤花子');
  createPersonalFolder(Number(devEmployee.lastInsertRowid), '高橋三郎');

  // キャリア記録サンプル
  const insertCareer = db.prepare(`
    INSERT INTO career_records (user_id, category, title, description, record_date)
    VALUES (?, ?, ?, ?, ?)
  `);

  insertCareer.run(employee.lastInsertRowid, 'certificate', '日商簿記2級', '日本商工会議所主催の簿記検定2級に合格', '2025-06-15');
  insertCareer.run(employee.lastInsertRowid, 'training', '新入社員研修', '2週間の新入社員向け基礎研修を受講', '2024-04-01');
  insertCareer.run(employee.lastInsertRowid, 'rank', '正社員登用', '試用期間終了、正社員として登用', '2024-07-01');
  
  insertCareer.run(devEmployee.lastInsertRowid, 'certificate', '基本情報技術者', 'IPA 基本情報技術者試験に合格', '2025-04-20');
  insertCareer.run(devEmployee.lastInsertRowid, 'skill', 'TypeScript習得', '社内プロジェクトでTypeScriptを習得', '2025-08-01');

  console.log('Demo data seeded successfully');
}
