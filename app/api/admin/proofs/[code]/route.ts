import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { config } from '@/lib/config';
import archiver from 'archiver';
import path from 'path';
import fs from 'fs';

export async function GET(req: Request, { params }: { params: { code: string } }) {
  try {
    const { searchParams } = new URL(req.url);
    const adminPassword = searchParams.get('adminPassword');
    const download = searchParams.get('download');

    // Verify admin password
    if (adminPassword !== config.adminPassword) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { code } = params;
    const proofs = db.prepare('SELECT * FROM proofs WHERE codeOrSession = ?').all(code) as any[];

    if (download === 'zip') {
      // Create zip archive
      const archive = archiver('zip', { zlib: { level: 9 } });
      const buffers: Buffer[] = [];

      archive.on('data', (chunk) => buffers.push(chunk));

      for (const proof of proofs) {
        const filePath = path.join(process.cwd(), 'public', proof.filePath);
        if (fs.existsSync(filePath)) {
          archive.file(filePath, { name: path.basename(proof.filePath) });
        }
      }

      await archive.finalize();

      const buffer = Buffer.concat(buffers);

      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'application/zip',
          'Content-Disposition': `attachment; filename="proofs-${code}.zip"`,
        },
      });
    }

    return NextResponse.json({ proofs });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
