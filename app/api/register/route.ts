import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { generateCode, getClientIp, hashIp, formatDate } from '@/lib/utils';
import { sendTelegramMessage } from '@/lib/telegram';
import { checkRateLimit } from '@/lib/rateLimit';
import path from 'path';
import fs from 'fs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, phone, email, deviceId, sessionId } = body;

    if (!name || !phone || !deviceId || !sessionId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Rate limiting
    const ip = getClientIp(req);
    const rateLimitKey = `register:${ip}`;
    const rateLimit = checkRateLimit(rateLimitKey);
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const ipHash = hashIp(ip);
    const userAgent = req.headers.get('user-agent') || '';

    // Check for duplicate phone
    const existingPhone = db.prepare('SELECT code FROM tickets WHERE phone = ?').get(phone);
    if (existingPhone) {
      return NextResponse.json({ error: 'Phone number already registered' }, { status: 400 });
    }

    // Check for duplicate ipHash
    const existingIp = db.prepare('SELECT code FROM tickets WHERE ipHash = ?').get(ipHash);
    if (existingIp) {
      return NextResponse.json({ error: 'Registration already exists from this location' }, { status: 400 });
    }

    // Check for duplicate deviceId
    const existingDevice = db.prepare('SELECT code FROM tickets WHERE deviceId = ?').get(deviceId);
    if (existingDevice) {
      return NextResponse.json({ error: 'Registration already exists from this device' }, { status: 400 });
    }

    // Generate unique code
    let code = generateCode();
    let attempts = 0;
    while (db.prepare('SELECT id FROM tickets WHERE code = ?').get(code) && attempts < 10) {
      code = generateCode();
      attempts++;
    }

    const now = formatDate(new Date());

    // Create ticket
    const stmt = db.prepare(`
      INSERT INTO tickets (name, phone, email, code, status, approved, createdAt, updatedAt, ipHash, deviceId, userAgent)
      VALUES (?, ?, ?, ?, 'active', 0, ?, ?, ?, ?, ?)
    `);
    stmt.run(name, phone, email || null, code, now, now, ipHash, deviceId, userAgent);

    // Move proofs from sessionId to code
    const oldUploadDir = path.join(process.cwd(), 'public', 'uploads', sessionId);
    const newUploadDir = path.join(process.cwd(), 'public', 'uploads', code);

    if (fs.existsSync(oldUploadDir)) {
      fs.renameSync(oldUploadDir, newUploadDir);

      // Update proof records
      const updateStmt = db.prepare('UPDATE proofs SET codeOrSession = ? WHERE codeOrSession = ?');
      updateStmt.run(code, sessionId);

      // Update file paths
      const proofs = db.prepare('SELECT id, filePath FROM proofs WHERE codeOrSession = ?').all(code) as any[];
      for (const proof of proofs) {
        const newPath = proof.filePath.replace(`/uploads/${sessionId}/`, `/uploads/${code}/`);
        db.prepare('UPDATE proofs SET filePath = ? WHERE id = ?').run(newPath, proof.id);
      }
    }

    // Send Telegram notification
    await sendTelegramMessage(`
🎫 <b>New Registration</b>

👤 Name: ${name}
📱 Phone: ${phone}
${email ? `📧 Email: ${email}\n` : ''}🎟 Code: <code>${code}</code>
📅 Time: ${new Date().toLocaleString()}
    `);

    return NextResponse.json({ success: true, code });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: error.message || 'Registration failed' }, { status: 500 });
  }
}
