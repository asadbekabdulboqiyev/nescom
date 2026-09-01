import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { handleApiError } from '@/lib/errors';
import { logger } from '@/lib/logger';
import type { ApiResponse } from '@/types';

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads');
const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
];

interface UploadResponse {
  url: string;
  name: string;
  size: number;
  type: string;
}

export async function POST(request: Request) {
  const start = Date.now();
  try {
    const companyId = request.headers.get('x-company-id');
    const userId = request.headers.get('x-user-id');
    if (!companyId || !userId) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'File too large (max 10MB)' },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'File type not allowed' },
        { status: 400 }
      );
    }

    await mkdir(UPLOAD_DIR, { recursive: true });

    const ext = file.name.split('.').pop() || 'bin';
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const filepath = join(UPLOAD_DIR, filename);

    const bytes = await file.arrayBuffer();
    await writeFile(filepath, Buffer.from(bytes));

    const data: UploadResponse = {
      url: `/uploads/${filename}`,
      name: file.name,
      size: file.size,
      type: file.type,
    };

    logger.info('File uploaded', {
      method: 'POST',
      path: '/api/upload',
      statusCode: 200,
      duration: Date.now() - start,
    });
    return NextResponse.json<ApiResponse<UploadResponse>>({
      success: true,
      data,
    });
  } catch (error) {
    logger.error('Upload error', { method: 'POST', path: '/api/upload', cause: error });
    return handleApiError(error);
  }
}
