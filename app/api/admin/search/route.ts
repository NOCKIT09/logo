import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { config } from '@/lib/config';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') || '';
    const adminPassword = searchParams.get('adminPassword');

    // Verify admin password
    if (adminPassword !== config.adminPassword) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let tickets;
    if (q) {
      tickets = db.prepare(`
        SELECT * FROM tickets 
        WHERE phone LIKE ? OR code LIKE ? OR name LIKE ?
        ORDER BY createdAt DESC
      `).all(`%${q}%`, `%${q}%`, `%${q}%`);
    } else {
      tickets = db.prepare('SELECT * FROM tickets ORDER BY createdAt DESC LIMIT 100').all();
    }

    return NextResponse.json({ tickets });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
