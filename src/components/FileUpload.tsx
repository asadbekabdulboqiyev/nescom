'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, X, FileText, Image, File } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UploadedFile {
  url: string;
  name: string;
  size: number;
  type: string;
}

interface FileUploadProps {
  onUpload?: (file: UploadedFile) => void;
  onRemove?: (url: string) => void;
  files?: UploadedFile[];
  className?: string;
  compact?: boolean;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileIcon(type: string) {
  if (type.startsWith('image/')) return Image;
  if (type === 'application/pdf') return FileText;
  return File;
}

export function FileUpload({
  onUpload,
  onRemove,
  files = [],
  className,
  compact,
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    async (fileList: FileList) => {
      for (const file of Array.from(fileList)) {
        setUploading(true);
        try {
          const formData = new FormData();
          formData.append('file', file);
          const res = await fetch('/api/upload', {
            method: 'POST',
            credentials: 'include',
            body: formData,
          });
          if (!res.ok) throw new Error('Upload failed');
          const json = await res.json();
          const payload = json.data ?? json;
          onUpload?.(payload);
        } catch {
          // silently fail
        } finally {
          setUploading(false);
        }
      }
    },
    [onUpload]
  );

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setDragActive(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setDragActive(false);
  }

  if (compact) {
    return (
      <div className={cn('relative', className)}>
        <input
          ref={inputRef}
          type="file"
          multiple
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
          aria-label="Upload file"
        />
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          aria-label="Upload file"
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
        >
          <Upload className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === '') {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        aria-label="Drop files here or click to upload"
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 transition-colors',
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
        )}
      >
        <Upload
          className={cn('h-8 w-8', dragActive ? 'text-blue-500' : 'text-slate-400')}
          aria-hidden="true"
        />
        <div className="text-center">
          <p className="text-sm font-medium text-slate-700">
            {uploading ? 'Uploading...' : 'Drop files here or click to upload'}
          </p>
          <p className="text-xs text-slate-400">Images, PDFs, documents up to 10MB</p>
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        multiple
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
        className="hidden"
        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
        aria-hidden="true"
        tabIndex={-1}
      />

      {files.length > 0 && (
        <div className="space-y-2" role="list" aria-label="Uploaded files">
          {files.map((f, i) => {
            const Icon = fileIcon(f.type);
            return (
              <div
                key={i}
                role="listitem"
                className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2"
              >
                <Icon className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700 truncate">{f.name}</p>
                  <p className="text-xs text-slate-400">{formatSize(f.size)}</p>
                </div>
                {onRemove && (
                  <button
                    onClick={() => onRemove(f.url)}
                    aria-label={`Remove ${f.name}`}
                    className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
                  >
                    <X className="h-3 w-3" aria-hidden="true" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
