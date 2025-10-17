import db from '../lib/db';
import { formatDate } from '../lib/utils';

const samplePrizes = [
  {
    title: '₹100 Voucher',
    type: 'voucher',
    description: 'Store voucher worth ₹100. Valid at all locations.',
    imageUrl: '',
    quantity: -1,
    weight: 40.0,
  },
  {
    title: '₹200 Voucher',
    type: 'voucher',
    description: 'Store voucher worth ₹200. Valid at all locations.',
    imageUrl: '',
    quantity: -1,
    weight: 30.0,
  },
  {
    title: '₹500 Voucher',
    type: 'voucher',
    description: 'Store voucher worth ₹500. Valid at all locations.',
    imageUrl: '',
    quantity: -1,
    weight: 20.0,
  },
  {
    title: '₹1000 Voucher',
    type: 'voucher',
    description: 'Store voucher worth ₹1000. Valid at all locations.',
    imageUrl: '',
    quantity: -1,
    weight: 9.0,
  },
  {
    title: 'Premium Product',
    type: 'product',
    description: 'Exclusive premium product. Visit our store for verification and collection.',
    imageUrl: '',
    quantity: 5,
    weight: 1.0,
  },
];

const stmt = db.prepare(`
  INSERT INTO prizes (title, type, description, imageUrl, quantity, weight, createdAt)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

for (const prize of samplePrizes) {
  stmt.run(
    prize.title,
    prize.type,
    prize.description,
    prize.imageUrl,
    prize.quantity,
    prize.weight,
    formatDate(new Date())
  );
}

console.log('✓ Sample prizes added to database');
