import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getClientIp, hashIp, formatDate } from '@/lib/utils';
import { sendTelegramMessage } from '@/lib/telegram';
import { checkRateLimit } from '@/lib/rateLimit';
import { config } from '@/lib/config';

interface Prize {
  id: number;
  title: string;
  type: string;
  description: string;
  imageUrl: string;
  quantity: number;
  weight: number;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { code, deviceId } = body;

    if (!code || !deviceId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Rate limiting
    const ip = getClientIp(req);
    const rateLimitKey = `redeem:${ip}`;
    const rateLimit = checkRateLimit(rateLimitKey);
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const ipHash = hashIp(ip);

    // Check ticket exists
    const ticket: any = db.prepare('SELECT * FROM tickets WHERE code = ?').get(code);
    if (!ticket) {
      return NextResponse.json({ error: 'Invalid ticket code' }, { status: 404 });
    }

    // Check if already used
    if (ticket.status !== 'active') {
      return NextResponse.json({ error: `Ticket already ${ticket.status}` }, { status: 400 });
    }

    // Check if approved
    if (!ticket.approved) {
      return NextResponse.json({
        error: 'not_approved',
        message: "You can't redeem this ticket until it's approved by the team. Please wait up to 1 hours."
      }, { status: 403 });
    }

    // Get available prizes
    const prizes = db.prepare('SELECT * FROM prizes WHERE quantity != 0').all() as Prize[];
    if (prizes.length === 0) {
      return NextResponse.json({ error: 'No prizes available' }, { status: 500 });
    }

    // Separate vouchers and products
    const vouchers = prizes.filter(p => p.type === 'voucher');
    const products = prizes.filter(p => p.type === 'product');

    let selectedPrize: Prize;

    // Weighted random selection with product probability cap
    const productChance = Math.random();
    const shouldTryProduct = productChance < config.productMaxProbability && products.length > 0;

    if (shouldTryProduct) {
      // Try to select a product
      const totalProductWeight = products.reduce((sum, p) => sum + p.weight, 0);
      let random = Math.random() * totalProductWeight;
      selectedPrize = products[0];

      for (const product of products) {
        random -= product.weight;
        if (random <= 0) {
          selectedPrize = product;
          break;
        }
      }

      // If product quantity is exhausted, fallback to voucher
      if (selectedPrize.quantity === 0) {
        selectedPrize = selectFromVouchers(vouchers);
      }
    } else {
      // Select voucher
      selectedPrize = selectFromVouchers(vouchers);
    }

    // Update prize quantity
    if (selectedPrize.quantity > 0) {
      db.prepare('UPDATE prizes SET quantity = quantity - 1 WHERE id = ?').run(selectedPrize.id);
    }

    // Create redemption record
    const prizeSnapshot = JSON.stringify(selectedPrize);
    const now = formatDate(new Date());
    const redemptionStmt = db.prepare(`
      INSERT INTO redemptions (ticketCode, prizeId, prizeSnapshotJson, phone, ipHash, deviceId, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    redemptionStmt.run(code, selectedPrize.id, prizeSnapshot, ticket.phone, ipHash, deviceId, now);

    // Mark ticket as used
    db.prepare('UPDATE tickets SET status = ?, updatedAt = ? WHERE code = ?').run('used', now, code);

    // Send Telegram notification
    const isProduct = selectedPrize.type === 'product';
    await sendTelegramMessage(`
${isProduct ? '🎁 <b>PRODUCT WIN!</b>' : '🎟 <b>Ticket Redeemed</b>'}

👤 Name: ${ticket.name}
📱 Phone: ${ticket.phone}
🎟 Code: <code>${code}</code>
🏆 Prize: ${selectedPrize.title} (${selectedPrize.type.toUpperCase()})
📅 Time: ${new Date().toLocaleString()}
    `);

    return NextResponse.json({
      success: true,
      prize: selectedPrize,
    });
  } catch (error: any) {
    console.error('Redeem error:', error);
    return NextResponse.json({ error: error.message || 'Redemption failed' }, { status: 500 });
  }
}

function selectFromVouchers(vouchers: Prize[]): Prize {
  if (vouchers.length === 0) {
    throw new Error('No vouchers available');
  }

  const totalWeight = vouchers.reduce((sum, v) => sum + v.weight, 0);
  let random = Math.random() * totalWeight;

  for (const voucher of vouchers) {
    random -= voucher.weight;
    if (random <= 0) {
      return voucher;
    }
  }

  return vouchers[0];
}
