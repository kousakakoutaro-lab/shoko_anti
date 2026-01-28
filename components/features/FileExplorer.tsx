'use client';

import { useState, useRef } from 'react';
import { useSession } from 'next-auth/react';

interface FileExplorerProps {
    initialFolders: Array<{
        id: number;
        name: string;
        folder_type: string;
    }>;
    initialFiles: Array<{
        id: number;
        original_name: string;
        mime_type: string | null;
        created_at: string;
    }>;
    currentFolderId: number | null;
    breadcrumbs: Array<{ id: number | null; name: string }>;
}

export function FileExplorer({
    initialFolders,
    initialFiles,
    currentFolderId,
    breadcrumbs
}: FileExplorerProps) {
    const { data: session } = useSession();
    const [folders, setFolders] = useState(initialFolders);
    const [files, setFiles] = useState(initialFiles);
    const [uploading, setUploading] = useState(false);
    const [showNewFolder, setShowNewFolder] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const getFileIcon = (mimeType: string | null) => {
        if (!mimeType) return '📄';
        if (mimeType.startsWith('image/')) return '🖼️';
        if (mimeType.includes('pdf')) return '📕';
        if (mimeType.includes('word') || mimeType.includes('document')) return '📘';
        if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📗';
        if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return '📙';
        return '📄';
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const uploadFiles = e.target.files;
        if (!uploadFiles || uploadFiles.length === 0) return;

        setUploading(true);
        const formData = new FormData();

        for (let i = 0; i < uploadFiles.length; i++) {
            formData.append('files', uploadFiles[i]);
        }

        if (currentFolderId) {
            formData.append('folderId', String(currentFolderId));
        }

        try {
            const res = await fetch('/api/files', {
                method: 'POST',
                body: formData,
            });

            if (res.ok) {
                const data = await res.json();
                setFiles((prev) => [...data.files, ...prev]);
            } else {
                alert('アップロードに失敗しました');
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('アップロードに失敗しました');
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleCreateFolder = async () => {
        if (!newFolderName.trim()) return;

        try {
            const res = await fetch('/api/folders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newFolderName,
                    parentId: currentFolderId,
                }),
            });

            if (res.ok) {
                const data = await res.json();
                setFolders((prev) => [...prev, data.folder]);
                setNewFolderName('');
                setShowNewFolder(false);
            } else {
                alert('フォルダの作成に失敗しました');
            }
        } catch (error) {
            console.error('Create folder error:', error);
            alert('フォルダの作成に失敗しました');
        }
    };

    const handleDownload = async (fileId: number, fileName: string) => {
        try {
            const res = await fetch(`/api/files/${fileId}`);
            if (res.ok) {
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            }
        } catch (error) {
            console.error('Download error:', error);
            alert('ダウンロードに失敗しました');
        }
    };

    return (
        <div className="file-explorer">
            {/* ツールバー */}
            <div className="file-toolbar">
                <div className="breadcrumb">
                    {breadcrumbs.map((crumb, index) => (
                        <span key={crumb.id ?? 'root'}>
                            {index > 0 && <span className="breadcrumb-separator"> / </span>}
                            <a
                                href={crumb.id ? `/dashboard/files?folder=${crumb.id}` : '/dashboard/files'}
                                className={`breadcrumb-item ${index === breadcrumbs.length - 1 ? 'active' : ''}`}
                            >
                                {crumb.name}
                            </a>
                        </span>
                    ))}
                </div>

                <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
                    <button
                        className="btn btn-secondary"
                        onClick={() => setShowNewFolder(true)}
                    >
                        📁 新規フォルダ
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                    >
                        {uploading ? '⏳ アップロード中...' : '📤 アップロード'}
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        onChange={handleUpload}
                        style={{ display: 'none' }}
                    />
                </div>
            </div>

            {/* 新規フォルダモーダル */}
            {showNewFolder && (
                <div className="modal-overlay" onClick={() => setShowNewFolder(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>新規フォルダ</h2>
                            <button className="modal-close" onClick={() => setShowNewFolder(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label className="form-label">フォルダ名</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={newFolderName}
                                    onChange={(e) => setNewFolderName(e.target.value)}
                                    placeholder="フォルダ名を入力"
                                    autoFocus
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowNewFolder(false)}>
                                キャンセル
                            </button>
                            <button className="btn btn-primary" onClick={handleCreateFolder}>
                                作成
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ファイル一覧 */}
            {folders.length === 0 && files.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">📂</div>
                    <h3>フォルダは空です</h3>
                    <p>ファイルをアップロードするか、新しいフォルダを作成してください</p>
                </div>
            ) : (
                <div className="file-grid">
                    {/* フォルダ */}
                    {folders.map((folder) => (
                        <a
                            key={`folder-${folder.id}`}
                            href={`/dashboard/files?folder=${folder.id}`}
                            className="file-item"
                        >
                            <div className="file-icon folder-icon">📁</div>
                            <div className="file-name">{folder.name}</div>
                        </a>
                    ))}

                    {/* ファイル */}
                    {files.map((file) => (
                        <div
                            key={`file-${file.id}`}
                            className="file-item"
                            onClick={() => handleDownload(file.id, file.original_name)}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="file-icon">{getFileIcon(file.mime_type)}</div>
                            <div className="file-name">{file.original_name}</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
