import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { config } from '@/lib/config';
import { formatDate } from '@/lib/utils';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const adminPassword = searchParams.get('adminPassword');

    // Verify admin password
    if (adminPassword !== config.adminPassword) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const prizes = db.prepare('SELECT * FROM prizes ORDER BY createdAt DESC').all();
    return NextResponse.json({ prizes });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, type, description, imageUrl, quantity, weight, adminPassword } = body;

    // Verify admin password
    if (adminPassword !== config.adminPassword) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!title || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const stmt = db.prepare(`
      INSERT INTO prizes (title, type, description, imageUrl, quantity, weight, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      title,
      type,
      description || null,
      imageUrl || null,
      quantity !== undefined ? quantity : -1,
      weight !== undefined ? weight : 1.0,
      formatDate(new Date())
    );

    return NextResponse.json({ success: true, id: result.lastInsertRowid });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
