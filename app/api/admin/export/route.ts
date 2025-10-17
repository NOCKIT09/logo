import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { config } from '@/lib/config';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const adminPassword = searchParams.get('adminPassword');

    // Verify admin password
    if (adminPassword !== config.adminPassword) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tickets = db.prepare('SELECT * FROM tickets ORDER BY createdAt DESC').all() as any[];

    // Generate CSV
    const headers = ['ID', 'Name', 'Phone', 'Email', 'Code', 'Status', 'Approved', 'Created At', 'IP Hash', 'Device ID'];
    const rows = tickets.map(t => [
      t.id,
      t.name,
      t.phone,
      t.email || '',
      t.code,
      t.status,
      t.approved ? 'Yes' : 'No',
      t.createdAt,
      t.ipHash,
      t.deviceId,
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="tickets-${Date.now()}.csv"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
