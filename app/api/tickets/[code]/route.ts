import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { formatDate } from '@/lib/utils';
import { sendTelegramMessage } from '@/lib/telegram';
import { config } from '@/lib/config';

export async function GET(req: Request, { params }: { params: { code: string } }) {
  try {
    const { code } = params;
    const ticket = db.prepare('SELECT * FROM tickets WHERE code = ?').get(code);

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    return NextResponse.json(ticket);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { code: string } }) {
  try {
    const { code } = params;
    const body = await req.json();
    const { status, approved, adminPassword } = body;

    // Verify admin password
    if (adminPassword !== config.adminPassword) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const ticket: any = db.prepare('SELECT * FROM tickets WHERE code = ?').get(code);
    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    const updates: string[] = [];
    const values: any[] = [];

    if (status !== undefined) {
      updates.push('status = ?');
      values.push(status);
    }

    if (approved !== undefined) {
      updates.push('approved = ?');
      values.push(approved ? 1 : 0);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
    }

    updates.push('updatedAt = ?');
    values.push(formatDate(new Date()));
    values.push(code);

    const sql = `UPDATE tickets SET ${updates.join(', ')} WHERE code = ?`;
    db.prepare(sql).run(...values);

    // Send Telegram notification
    let message = `📝 <b>Ticket Updated</b>\n\n`;
    message += `🎟 Code: <code>${code}</code>\n`;
    message += `👤 Name: ${ticket.name}\n`;
    message += `📱 Phone: ${ticket.phone}\n`;
    if (status) message += `📊 Status: ${status}\n`;
    if (approved !== undefined) message += `✅ Approved: ${approved ? 'Yes' : 'No'}\n`;
    message += `📅 Time: ${new Date().toLocaleString()}`;

    await sendTelegramMessage(message);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { code: string } }) {
  try {
    const { code } = params;
    const body = await req.json();
    const { adminPassword } = body;

    // Verify admin password
    if (adminPassword !== config.adminPassword) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const ticket: any = db.prepare('SELECT * FROM tickets WHERE code = ?').get(code);
    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // Delete ticket
    db.prepare('DELETE FROM tickets WHERE code = ?').run(code);

    // Delete associated proofs
    db.prepare('DELETE FROM proofs WHERE codeOrSession = ?').run(code);

    // Send Telegram notification
    await sendTelegramMessage(`
🗑 <b>Ticket Deleted</b>

🎟 Code: <code>${code}</code>
👤 Name: ${ticket.name}
📱 Phone: ${ticket.phone}
📅 Time: ${new Date().toLocaleString()}
    `);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
