import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import turkeyLocations from '@/data/turkey-locations.json';
import { testAccount as testConfigAccount } from '@/lib/config';

export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + '_dp_salt_2024').digest('hex');
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

let dbInstance: Database.Database | null = null;

export function getDb(): Database.Database {
  if (dbInstance) {
    return dbInstance;
  }

  const dbDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const dbPath = path.join(dbDir, 'donanimpazar.sqlite');
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  // Initialize tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS provinces (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS districts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      province_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      FOREIGN KEY(province_id) REFERENCES provinces(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      province TEXT NOT NULL,
      district TEXT NOT NULL,
      rating REAL DEFAULT 5.0,
      deals_count INTEGER DEFAULT 0,
      member_since TEXT NOT NULL,
      verified INTEGER DEFAULT 1,
      is_test_account INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS listings (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      price_try INTEGER NOT NULL,
      price_usd INTEGER NOT NULL,
      province TEXT NOT NULL,
      district TEXT NOT NULL,
      condition TEXT NOT NULL,
      date TEXT NOT NULL,
      cover TEXT NOT NULL,
      images_json TEXT NOT NULL,
      description TEXT NOT NULL,
      specs_json TEXT NOT NULL,
      seller_id TEXT NOT NULL,
      seller_name TEXT NOT NULL,
      seller_rating REAL,
      seller_deals INTEGER,
      seller_since TEXT,
      is_test_listing INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      listing_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      UNIQUE(user_id, listing_id)
    );

    CREATE TABLE IF NOT EXISTS cart_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      listing_id TEXT NOT NULL,
      custom_price_try INTEGER,
      custom_price_usd INTEGER,
      added_at TEXT NOT NULL,
      UNIQUE(user_id, listing_id)
    );
  `);

  // Seed provinces & districts if empty
  const countRow = db.prepare('SELECT COUNT(*) as count FROM provinces').get() as { count: number };
  if (countRow.count === 0) {
    const insertProvince = db.prepare('INSERT INTO provinces (id, name) VALUES (?, ?)');
    const insertDistrict = db.prepare('INSERT INTO districts (province_id, name) VALUES (?, ?)');

    const seedTransaction = db.transaction(() => {
      for (const prov of turkeyLocations) {
        insertProvince.run(prov.id, prov.name);
        for (const dist of prov.districts) {
          insertDistrict.run(prov.id, dist);
        }
      }
    });
    seedTransaction();
  }

  // Seed test account if not exists or update password hash
  const testAccount = db.prepare('SELECT id, password_hash FROM users WHERE is_test_account = 1 OR email = ?').get(testConfigAccount.email) as { id: string; password_hash: string } | undefined;
  const hashedTestPassword = hashPassword(testConfigAccount.password || 'test1234');
  if (!testAccount) {
    db.prepare(`
      INSERT INTO users (id, name, email, password_hash, province, district, rating, deals_count, member_since, verified, is_test_account)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'usr_test_local',
      testConfigAccount.name || 'Test Kullanıcısı',
      testConfigAccount.email || 'test@donanimpazar.com',
      hashedTestPassword,
      testConfigAccount.city || 'İstanbul',
      'Kadıköy',
      5.0,
      12,
      '2024',
      1,
      1
    );
  } else if (testAccount.password_hash !== hashedTestPassword) {
    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hashedTestPassword, testAccount.id);
  }

  // Seed test listing if not exists
  const testListing = db.prepare('SELECT id FROM listings WHERE id = ?').get('test-item-1');
  if (!testListing) {
    db.prepare(`
      INSERT INTO listings (
        id, title, category, price_try, price_usd, province, district, condition, date,
        cover, images_json, description, specs_json, seller_id, seller_name, seller_rating, seller_deals, seller_since, is_test_listing
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'test-item-1',
      'Test İlanı — Örnek Donanım Ürünü (Test Amaçlıdır)',
      'gpu',
      12500,
      360,
      'İstanbul',
      'Kadıköy',
      'Kutulu / Faturalı',
      'Bugün',
      '/images/listings/test-item/cover.svg',
      JSON.stringify(['/images/listings/test-item/cover.svg']),
      'Bu ilan gerçek çalışma ortamında sistem ve sepet akışını test etmek için oluşturulmuş örnek bir test ilanıdır.',
      JSON.stringify({
        'Durum': 'Kutulu / Faturalı',
        'Garanti': '1 Yıl Kalan',
        'Kargo': 'Ücretsiz Kargo'
      }),
      'usr_test_local',
      'Test Satıcısı',
      5.0,
      1,
      '2024',
      1
    );
  }

  dbInstance = db;
  return dbInstance;
}
