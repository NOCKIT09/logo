import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = path.join(process.cwd(), 'data', 'event.db');

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

// Initialize schema
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

export default db;
