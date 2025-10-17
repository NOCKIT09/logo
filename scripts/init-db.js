const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(process.cwd(), 'data', 'event.db');
const dataDir = path.dirname(dbPath);

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

// Initialize schema (already in lib/db.ts, but included here for standalone use)
db.exec(`
  CREATE TABLE IF NOT EXISTS tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    email TEXT,
    code TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'active',
    approved INTEGER DEFAULT 0,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL,
    ipHash TEXT NOT NULL,
    deviceId TEXT NOT NULL,
    userAgent TEXT
  );

  CREATE TABLE IF NOT EXISTS proofs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codeOrSession TEXT NOT NULL,
    platform TEXT NOT NULL,
    filePath TEXT NOT NULL,
    createdAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS prizes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    type TEXT NOT NULL,
    description TEXT,
    imageUrl TEXT,
    quantity INTEGER DEFAULT -1,
    weight REAL DEFAULT 1.0,
    createdAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS redemptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticketCode TEXT NOT NULL,
    prizeId INTEGER,
    prizeSnapshotJson TEXT NOT NULL,
    phone TEXT NOT NULL,
    ipHash TEXT NOT NULL,
    deviceId TEXT NOT NULL,
    createdAt TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_tickets_phone ON tickets(phone);
  CREATE INDEX IF NOT EXISTS idx_tickets_code ON tickets(code);
  CREATE INDEX IF NOT EXISTS idx_tickets_ipHash ON tickets(ipHash);
  CREATE INDEX IF NOT EXISTS idx_tickets_deviceId ON tickets(deviceId);
  CREATE INDEX IF NOT EXISTS idx_proofs_codeOrSession ON proofs(codeOrSession);
  CREATE INDEX IF NOT EXISTS idx_redemptions_ticketCode ON redemptions(ticketCode);
`);

// Check if prizes already exist
const existingPrizes = db.prepare('SELECT COUNT(*) as count FROM prizes').get();
if (existingPrizes.count === 0) {
  console.log('Adding sample prizes...');
  
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
      new Date().toISOString()
    );
  }

  console.log('✓ Sample prizes added to database');
} else {
  console.log('✓ Database already initialized with prizes');
}

db.close();
console.log('✓ Database initialized successfully');
