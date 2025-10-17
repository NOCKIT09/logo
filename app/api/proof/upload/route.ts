import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import db from '@/lib/db';
import { formatDate } from '@/lib/utils';

export async function POST(req: Request) {
  try {
    // Parse form data using Next.js built-in FormData API
    const formData = await req.formData();
    const sessionId = formData.get('sessionId') as string;
    const platform = formData.get('platform') as string;
    const file = formData.get('file') as File;

    if (!sessionId || !platform || !file) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!['instagram', 'youtube', 'facebook'].includes(platform)) {
      return NextResponse.json({ error: 'Invalid platform' }, { status: 400 });
    }

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only images allowed' }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 });
    }

    // Save file
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', sessionId);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const ext = path.extname(file.name);
    const filename = `${platform}${ext}`;
    const filePath = path.join(uploadDir, filename);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    fs.writeFileSync(filePath, buffer);

    // Save to database
    const relativeFilePath = `/uploads/${sessionId}/${filename}`;
    const stmt = db.prepare(
      'INSERT INTO proofs (codeOrSession, platform, filePath, createdAt) VALUES (?, ?, ?, ?)'
    );
    stmt.run(sessionId, platform, relativeFilePath, formatDate(new Date()));

    return NextResponse.json({ success: true, filePath: relativeFilePath });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 });
  }
}
